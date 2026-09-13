// ¿Se puede jugar con el teclado? Y ¿la racha cuenta lo que dice contar?
//
// Existe porque las dos cosas son invisibles para el resto del arnés: los
// medidores miran la pantalla, no lo que pasa al pulsar una tecla. La lección
// que dejó el modal de NPC vale también aquí — una medición que no interactúa
// no está midiendo el juego.
const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const B = 'http://127.0.0.1:3100';

let fallos = 0;
const comprobar = (ok, texto, detalle = '') => {
  if (!ok) fallos++;
  console.log(`  ${ok ? '✓' : '✗'} ${texto}${detalle ? ` — ${detalle}` : ''}`);
};

async function sembrar(page) {
  await page.goto(B + '/', { waitUntil: 'commit' });
  await page.evaluate((s) => {
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
    localStorage.setItem('foro-invisible:intro-vista', '1');
  }, SAVE);
}

const leerSave = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('derecho-procesal-rpg-save')).state; }
  catch { return null; }
});

(async () => {
  const b = await lanzar();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();

  // ── 1. Teclas de alternativa en la cédula ────────────────────────────────
  console.log('\n1. Responder la cédula con el teclado');
  await sembrar(page);
  await page.goto(B + '/examen', { waitUntil: 'commit' });
  await page.waitForTimeout(1400);

  const opciones = await page.locator('.shell-main .opcion').count();
  comprobar(opciones >= 2, `la pregunta ofrece alternativas`, `${opciones}`);

  await page.keyboard.press('2');
  await page.waitForTimeout(500);
  const trasTecla = await page.evaluate(() =>
    [...document.querySelectorAll('.opcion')].some((e) => e.dataset.estado));
  comprobar(trasTecla, 'la tecla 2 responde la pregunta');

  // Con la respuesta en pantalla los atajos se apagan: pulsar otra no debe
  // contestar la siguiente sin que dé tiempo a leerla.
  const textoAntes = await page.locator('.shell-main h2').first().innerText();
  await page.keyboard.press('3');
  await page.waitForTimeout(400);
  const textoDespues = await page.locator('.shell-main h2').first().innerText();
  comprobar(textoAntes === textoDespues, 'con respuesta en pantalla los atajos quedan apagados');

  // ── 2. La letra también vale ─────────────────────────────────────────────
  console.log('\n2. La letra de la alternativa');
  await sembrar(page);
  await page.goto(B + '/examen', { waitUntil: 'commit' });
  await page.waitForTimeout(1400);
  await page.keyboard.press('c');
  await page.waitForTimeout(500);
  comprobar(
    await page.evaluate(() => [...document.querySelectorAll('.opcion')].some((e) => e.dataset.estado)),
    'la tecla C responde igual que la 3',
  );

  // ── 3. Ninguna tecla se roba a un campo de texto ─────────────────────────
  console.log('\n3. Escribir no dispara atajos');
  await sembrar(page);
  await page.goto(B + '/creacion', { waitUntil: 'commit' });
  await page.waitForTimeout(1400);
  const campo = page.locator('#campo-nombre');
  if (await campo.count()) {
    await campo.fill('');
    await campo.type('Ana 2 Bravo');
    comprobar((await campo.inputValue()).includes('2'), 'el nombre conserva los dígitos escritos');
  } else {
    comprobar(false, 'no se encontró el campo de nombre');
  }

  // ── 4. La racha cuenta días, no visitas ──────────────────────────────────
  console.log('\n4. Racha de estudio');
  await sembrar(page);
  await page.goto(B + '/juego', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  const antes = await leerSave(page);
  comprobar(antes !== null, 'el guardado se lee');
  const rachaAlEntrar = antes?.rachaDias ?? 0;

  // Sólo abrir el juego no cuenta como estudiar.
  await page.goto(B + '/mundos', { waitUntil: 'commit' });
  await page.waitForTimeout(900);
  const trasNavegar = await leerSave(page);
  comprobar(
    (trasNavegar?.rachaDias ?? 0) === rachaAlEntrar,
    'navegar por el juego no toca la racha',
    `${rachaAlEntrar} → ${trasNavegar?.rachaDias ?? 0}`,
  );

  // Completar una misión sí. Se juega de verdad: entrar al desafío, responder
  // con el teclado y cerrar la misión. Comprobar esto contra la cédula no
  // serviría: no otorga XP hasta la última pregunta, así que la comprobación
  // pasaría en vacío sin haber tocado nunca la racha.
  await page.goto(B + '/mision/m1_3', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);

  // Fase «caso» → «desafío»: el botón principal de la barra de acción.
  await page.locator('.barra-accion button, .shell-main .btn-primario').first().click({ timeout: 8000 });
  await page.waitForTimeout(700);
  const hayOpciones = await page.locator('.shell-main .opcion').count();
  comprobar(hayOpciones > 0, 'la misión llega a su desafío', `${hayOpciones} alternativas`);

  // Las alternativas se barajan, así que hay que ACERTAR de verdad: la misión
  // sólo se cobra con la decisión correcta —al fallar, la barra ofrece
  // «Revisar expediente» y «Reintentar»—. La primera versión de esta prueba
  // pulsaba siempre la tecla 1 y pasaba o fallaba según el barajado.
  let acertada = false;
  for (let intento = 1; intento <= hayOpciones && !acertada; intento++) {
    await page.keyboard.press(String(intento));
    await page.waitForTimeout(700);
    acertada = /Decisión correcta/i.test(await page.locator('.shell-main').innerText());
    if (!acertada) {
      await page.locator('.barra-accion button:has-text("Reintentar")').click({ timeout: 8000 });
      await page.waitForTimeout(700);
    }
  }
  comprobar(acertada, 'se acierta el desafío de la misión');

  // Fase «resultado» correcta → cobrar la recompensa cierra la misión.
  await page.locator('.barra-accion .btn-primario').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  const trasEstudiar = await leerSave(page);
  const hoy = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  comprobar(
    (trasEstudiar?.rachaDias ?? 0) === 1,
    'completar una misión abre la racha en 1',
    `racha=${trasEstudiar?.rachaDias ?? 0}`,
  );
  comprobar(
    trasEstudiar?.ultimoDiaJugado === hoy,
    'el día de la racha es el de hoy en hora local',
    `guardado="${trasEstudiar?.ultimoDiaJugado ?? ''}" hoy="${hoy}"`,
  );
  comprobar(
    (trasEstudiar?.actividadesHoy ?? 0) >= 1,
    'se cuenta la actividad del día',
    `actividadesHoy=${trasEstudiar?.actividadesHoy ?? 0}`,
  );

  await ctx.close();
  await b.close();
  console.log(`\n${fallos === 0 ? '✓' : '✗'} ${fallos} comprobación(es) fallida(s)`);
  process.exit(fallos === 0 ? 0 : 1);
})();
