const { chromium } = require('playwright');
const SAVE = require('./fixtures/save-prueba.json');
const EXP = require('./fixtures/save-expansiones.json');
const B = 'http://127.0.0.1:3100';

// JUGAR de verdad en móvil: entrar a la actividad, responder, y comprobar que
// el control que hace AVANZAR aparece y es alcanzable. El estado inicial ya se
// medía antes; lo que faltaba es el estado DESPUÉS de interactuar, que es donde
// el usuario dice que se queda atascado.
const RUTAS = [
  '/mision/m1_1', '/mision/m1_2', '/mision/m1_3',
  '/examen', '/civilis/vof', '/procesal/prueba/vof',
  '/civilis/practica', '/procesal/plazos', '/oral',
];

const PALABRAS_AVANCE = /siguiente|continuar|avanzar|seguir|terminar|finalizar|volver|cerrar|responder|comprobar|confirmar|jugar|empezar|comenzar|iniciar|atender/i;

async function estado(page) {
  return page.evaluate((rx) => {
    const re = new RegExp(rx, 'i');
    const d = document.documentElement;
    const vh = d.clientHeight;
    const nav = document.querySelector('.shell-nav');
    const navTop = nav && getComputedStyle(nav).position === 'fixed'
      ? nav.getBoundingClientRect().top : Infinity;
    const limite = Math.min(vh, navTop);

    const ctrls = [...document.querySelectorAll('.shell-main a[href], .shell-main button, .modal-scrim button, .modal-scrim a[href]')]
      .filter((e) => {
        const q = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return q.width > 8 && q.height > 8 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.disabled;
      });

    const info = (e) => {
      const q = e.getBoundingClientRect();
      return {
        txt: (e.innerText || '').replace(/\n/g, ' ').trim().slice(0, 26),
        visible: q.top >= -2 && q.bottom <= limite + 2,
        bottom: Math.round(q.bottom),
        limite: Math.round(limite),
      };
    };

    const avance = ctrls.filter((e) => re.test(e.innerText || '')).map(info);
    // ¿hay algo que se pueda desplazar para alcanzarlo?
    const zonas = [document.scrollingElement, ...document.querySelectorAll('.shell-scroll, .modal-arte')];
    const desplazable = zonas.some((c) => c && c.scrollHeight - c.clientHeight > 4);

    return {
      totalCtrls: ctrls.length,
      avance,
      desplazable,
      texto: (document.querySelector('.shell-main')?.innerText || '').replace(/\s+/g, ' ').slice(0, 70),
    };
  }, PALABRAS_AVANCE.source);
}

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-proxy-server', '--no-sandbox'],
  });
  let malos = 0;
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(B + '/', { waitUntil: 'commit' });
  await page.evaluate(([s, e]) => {
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
    localStorage.setItem('foro-invisible:intro-vista', '1');
    localStorage.setItem('civilis-save', JSON.stringify(e.civilis));
    localStorage.setItem('reinos-del-derecho-save', JSON.stringify(e.reinos));
    localStorage.setItem('procesal-save', JSON.stringify(e.procesal));
  }, [SAVE, EXP]);

  for (const ruta of RUTAS) {
    await page.goto(B + ruta, { waitUntil: 'commit' });
    await page.waitForTimeout(1400);
    console.log(`\n### ${ruta}`);

    for (let paso = 1; paso <= 4; paso++) {
      const antes = await estado(page);
      const alcanzables = antes.avance.filter((a) => a.visible);
      const ocultos = antes.avance.filter((a) => !a.visible);

      if (antes.avance.length === 0) {
        console.log(`  paso ${paso}: sin control de avance visible · "${antes.texto.slice(0,42)}"`);
      } else if (alcanzables.length === 0 && !antes.desplazable) {
        malos++;
        console.log(`  paso ${paso}: ✗ BLOQUEADO — "${ocultos[0].txt}" cae en ${ocultos[0].bottom}px, límite ${ocultos[0].limite}px, y nada se desplaza`);
        break;
      } else if (alcanzables.length === 0) {
        console.log(`  paso ${paso}: ⚠ "${ocultos[0].txt}" fuera de vista (${ocultos[0].bottom} > ${ocultos[0].limite}) pero hay scroll`);
      } else {
        console.log(`  paso ${paso}: ✓ "${alcanzables[0].txt}" alcanzable`);
      }

      // Interactuar: primero una opción de respuesta, si la hay; si no, avanzar.
      const opcion = page.locator('.shell-main button, .modal-scrim button').filter({ hasNotText: PALABRAS_AVANCE }).first();
      const avanzar = page.locator('.shell-main button, .modal-scrim button').filter({ hasText: PALABRAS_AVANCE }).first();
      try {
        if (await opcion.count() && paso === 1) await opcion.click({ timeout: 3000 });
        else if (await avanzar.count()) await avanzar.click({ timeout: 3000 });
        else break;
      } catch { break; }
      await page.waitForTimeout(1000);
    }
  }
  await ctx.close();
  console.log(`\n${malos} bloqueo(s) de avance en móvil`);
  await b.close();
})();
