const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const B = 'http://127.0.0.1:3100';
const CLAVE = 'derecho-procesal-rpg-save';

let ok = 0, mal = 0;
function check(nombre, cond, detalle = '') {
  if (cond) { ok++; console.log(`  ✓ ${nombre}`); }
  else { mal++; console.log(`  ✗ ${nombre} ${detalle}`); }
}

async function nuevaSesion(browser, vp, conPartida) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(B + '/', { waitUntil: 'commit' });
  await page.evaluate(([s, k, con]) => {
    localStorage.clear();
    localStorage.setItem('foro-invisible:intro-vista', '1');
    if (con) localStorage.setItem(k, JSON.stringify(s));
  }, [SAVE, CLAVE, conPartida]);
  return { ctx, page };
}

(async () => {
  const browser = await lanzar();
  const ESC = { width: 1366, height: 768 };
  const MOV = { width: 390, height: 844 };

  // ── 1. Partida rápida en escritorio ───────────────────────────────────────
  console.log('\n1. Crear una partida rápida (usuario nuevo)');
  {
    const { ctx, page } = await nuevaSesion(browser, ESC, false);
    await page.goto(B + '/', { waitUntil: 'commit' });
    await page.waitForTimeout(900);
    const cta = await page.locator('a:has-text("COMENZAR")').first();
    check('la portada ofrece una sola acción principal', await cta.isVisible());
    const t0 = Date.now();
    await cta.click();
    await page.waitForURL('**/creacion', { timeout: 8000 });
    await page.locator('#campo-nombre').fill('Prueba Rápida');
    check('se explica que la partida rápida usa la configuración recomendada',
      (await page.locator('text=/no la eliges tú/').count()) > 0);
    // v4: la partida rápida empieza el juego en un solo toque.
    await page.locator('button:has-text("PARTIDA RÁPIDA")').click();
    await page.waitForURL('**/juego', { timeout: 8000 });
    check('la partida rápida lleva directo al mapa', page.url().endsWith('/juego'));
    const seg = ((Date.now() - t0) / 1000).toFixed(1);
    const g = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state.personaje.nombre, CLAVE);
    check(`la partida queda guardada (${seg}s desde la portada)`, g === 'Prueba Rápida', `nombre=${g}`);
    await ctx.close();
  }

  // ── 2. Volver entre pasos sin perder datos ────────────────────────────────
  console.log('\n2. Personalizar y volver entre pasos');
  {
    const { ctx, page } = await nuevaSesion(browser, ESC, false);
    await page.goto(B + '/creacion', { waitUntil: 'commit' });
    await page.waitForTimeout(800);
    await page.locator('#campo-nombre').fill('Ida y Vuelta');
    await page.locator('button:has-text("Siguiente")').click();
    await page.waitForTimeout(300);
    await page.locator('text=Académico forense').click();
    await page.locator('button:has-text("Siguiente")').click();
    await page.waitForTimeout(300);
    await page.locator('text=Secretario/a del tribunal').click();
    await page.locator('button:has-text("Siguiente")').click();
    await page.waitForTimeout(400);
    const rigor = await page.evaluate(() => {
      const filas = [...document.querySelectorAll('.shell-scroll span')];
      const f = filas.find((e) => e.textContent.trim().toLowerCase() === 'rigor formal');
      return f ? f.parentElement.textContent.replace(/\s+/g, ' ') : '';
    });
    check("los atributos reflejan las elecciones", /8\/10/.test(rigor) && /\+3/.test(rigor), `rigor="${rigor}"`);
    // volver dos pasos y comprobar que el nombre sigue
    await page.locator('button:has-text("Atrás")').click();
    await page.waitForTimeout(250);
    await page.locator('button:has-text("Atrás")').click();
    await page.waitForTimeout(250);
    await page.locator('button:has-text("Atrás")').click();
    await page.waitForTimeout(350);
    const n = await page.locator('#campo-nombre').inputValue();
    check('volver atrás conserva el nombre escrito', n === 'Ida y Vuelta', `valor="${n}"`);
    await ctx.close();
  }

  // ── 3. Abrir y cancelar NO borra la partida ───────────────────────────────
  console.log('\n3. La partida existente está protegida');
  {
    const { ctx, page } = await nuevaSesion(browser, ESC, true);
    await page.goto(B + '/creacion', { waitUntil: 'commit' });
    await page.waitForTimeout(900);
    const tras = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, CLAVE);
    check('abrir creación no borra la partida', tras.personaje.nombre === 'Prueba, Ana' && tras.xp === 260);
    check('se avisa de que hay una partida en curso',
      (await page.locator('text=/Tienes una partida/').count()) > 0);
    await page.locator('a:has-text("Cancelar")').click();
    await page.waitForTimeout(700);
    const trasCancel = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, CLAVE);
    check('cancelar no borra la partida', trasCancel.xp === 260 && trasCancel.misionesCompletadas.length === 2);

    // reemplazar exige confirmación explícita
    await page.goto(B + '/creacion', { waitUntil: 'commit' });
    await page.waitForTimeout(700);
    await page.locator('#campo-nombre').fill('Intruso');
    // v4: con partida en curso, la partida rápida pide confirmación directamente.
    await page.locator('button:has-text("PARTIDA RÁPIDA")').click();
    await page.waitForTimeout(500);
    check('reemplazar abre un diálogo de confirmación',
      (await page.locator('[role="dialog"]').count()) > 0);
    const durante = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, CLAVE);
    check('con el diálogo abierto la partida SIGUE intacta', durante.personaje.nombre === 'Prueba, Ana' && durante.xp === 260);
    await page.locator('button:has-text("Conservar la actual")').click();
    await page.waitForTimeout(400);
    const trasNo = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, CLAVE);
    check('decir que no conserva la partida', trasNo.personaje.nombre === 'Prueba, Ana');
    await ctx.close();
  }

  // ── 4. La partida sobrevive recarga y navegación ──────────────────────────
  console.log('\n4. Persistencia y ausencia de destello "sin personaje"');
  {
    const { ctx, page } = await nuevaSesion(browser, ESC, true);
    const destellos = [];
    await page.goto(B + '/juego', { waitUntil: 'commit' });
    for (let i = 0; i < 14; i++) {
      const t = await page.evaluate(() => document.body.innerText);
      if (/constituye personaje|Sin compareciente/i.test(t)) destellos.push(i);
      await page.waitForTimeout(70);
    }
    check('nunca se muestra "sin personaje" con partida guardada', destellos.length === 0, `frames=${destellos}`);
    await page.reload({ waitUntil: 'commit' });
    await page.waitForTimeout(1000);
    const txt = await page.evaluate(() => document.body.innerText);
    check('tras recargar sigue la partida', txt.includes('Prueba, Ana'));
    const g = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, CLAVE);
    check('la recarga no alteró el progreso', g.xp === 260 && g.misionesCompletadas.length === 2);
    // Continuar desde la portada
    await page.goto(B + '/', { waitUntil: 'commit' });
    await page.waitForTimeout(900);
    check('la portada ofrece "Continuar partida"',
      (await page.locator('a:has-text("CONTINUAR PARTIDA")').count()) > 0);
    await page.locator('a:has-text("CONTINUAR PARTIDA")').first().click();
    await page.waitForURL('**/juego', { timeout: 8000 });
    check('continuar lleva al hub', page.url().endsWith('/juego'));
    await ctx.close();
  }

  // ── 5. Entrar a una misión y volver ───────────────────────────────────────
  console.log('\n5. Misión, Codex y expansiones');
  {
    const { ctx, page } = await nuevaSesion(browser, ESC, true);
    await page.goto(B + '/juego', { waitUntil: 'commit' });
    await page.waitForTimeout(1000);
    await page.locator('a:visible:has-text("Atender")').first().click();
    await page.waitForTimeout(1200);
    check('se entra a una misión', /\/mision\//.test(page.url()), page.url());
    await page.locator('a:visible:has-text("Mapa")').first().click();
    await page.waitForTimeout(1000);
    check('se vuelve al hub desde la misión', page.url().endsWith('/juego'), page.url());

    for (const [ruta, marca] of [['/codex','Codex'],['/mundos','Mundos'],['/reinos','Reinos'],['/civilis','Civilis'],['/procesal','Procesal']]) {
      await page.goto(B + ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(800);
      const t = await page.evaluate(() => document.body.innerText);
      check(`${ruta} sigue accesible`, t.includes(marca), `sin "${marca}"`);
    }
    await ctx.close();
  }

  // ── 6. Móvil ──────────────────────────────────────────────────────────────
  console.log('\n6. Móvil (390x844)');
  {
    const { ctx, page } = await nuevaSesion(browser, MOV, true);
    await page.goto(B + '/juego', { waitUntil: 'commit' });
    await page.waitForTimeout(1100);
    const m = await page.evaluate(() => {
      const d = document.documentElement;
      const nav = document.querySelector('.shell-nav');
      const destinos = nav ? nav.querySelectorAll('a').length : 0;
      const r = nav ? nav.getBoundingClientRect() : null;
      // v4: la acción de EVA vive en una barra propia sobre la navegación.
      const accion = document.querySelector('.hub-accion a[href]');
      const qa = accion ? accion.getBoundingClientRect() : null;
      return {
        scrollH: d.scrollWidth - d.clientWidth,
        scrollV: d.scrollHeight - d.clientHeight,
        destinos,
        navVisible: !!r && r.bottom <= d.clientHeight + 1 && r.top < d.clientHeight,
        accionVisible: !!qa && qa.top >= 0 && !!r && qa.bottom <= r.top + 1,
        accionTexto: accion ? accion.innerText : '',
        nodos: document.querySelectorAll('.flujo-nodo').length,
      };
    });
    check('sin desbordamiento horizontal', m.scrollH === 0, `scrollH=${m.scrollH}`);
    check('el documento no se desplaza', m.scrollV <= 1, `scrollV=${m.scrollV}`);
    check('navegación con 5 destinos como máximo', m.destinos > 0 && m.destinos <= 5, `destinos=${m.destinos}`);
    check('la barra inferior queda visible en pantalla', m.navVisible);
    check('la acción principal está a la vista sobre la barra', m.accionVisible, `"${m.accionTexto}"`);
    check('el mapa de flujo dibuja los 27 nodos de la campaña', m.nodos === 27, `nodos=${m.nodos}`);

    // Tocar un nodo abre su detalle con un botón para jugar.
    await page.locator('.flujo-nodo').first().click();
    await page.waitForTimeout(400);
    const hoja = await page.locator('.hoja a:has-text("misión")').count();
    check('tocar un nodo abre su detalle con acción', hoja > 0);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n══════════  ${ok} correctas · ${mal} fallidas  ══════════`);
  process.exit(mal > 0 ? 1 : 0);
})();
