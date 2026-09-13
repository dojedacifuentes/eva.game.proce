// Repaso espaciado, de punta a punta.
//
// Las pruebas unitarias cubren el motor (lib/repaso.ts) y el banco
// (lib/bancoRepaso.ts) por separado. Lo que no cubre ninguna es la cadena
// completa: fallar una pregunta de verdad, que entre al mazo, que /repaso la
// vuelva a servir el día que toca y que responderla la aleje.
//
// El id de cada pregunta se calcula dentro del paquete, así que aquí NO se
// reproduce la función hash: se lee del guardado el id que el propio juego
// escribió. Replicarlo sería probar mi copia, no el juego.
const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const B = 'http://127.0.0.1:3100';

let fallos = 0;
const comprobar = (ok, texto, detalle = '') => {
  if (!ok) fallos++;
  console.log(`  ${ok ? '✓' : '✗'} ${texto}${detalle ? ` — ${detalle}` : ''}`);
};

const leerSave = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('derecho-procesal-rpg-save')).state; }
  catch { return null; }
});

async function sembrar(page, extra = {}) {
  await page.goto(B + '/', { waitUntil: 'commit' });
  await page.evaluate(([s, e]) => {
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify({ ...s, ...e }));
    localStorage.setItem('foro-invisible:intro-vista', '1');
  }, [SAVE, extra]);
}

(async () => {
  const b = await lanzar();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();

  // ── 1. El mazo empieza vacío y la pantalla lo dice ───────────────────────
  console.log('\n1. Mazo vacío');
  await sembrar(page);
  await page.goto(B + '/repaso', { waitUntil: 'commit' });
  await page.waitForTimeout(1600);
  const textoVacio = await page.locator('.shell-main').innerText();
  comprobar(/mazo está vacío/i.test(textoVacio), 'sin fallos, /repaso explica para qué sirve');
  comprobar(
    !/Abriendo el mazo/i.test(textoVacio),
    'no se queda colgada en el estado de carga',
  );

  // ── 2. Fallar en la cédula mete la pregunta en el mazo ───────────────────
  console.log('\n2. Fallar la cédula alimenta el mazo');
  await sembrar(page);
  await page.goto(B + '/examen', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);

  // Se elige a propósito una opción incorrecta: se pulsan las alternativas
  // hasta dar con una marcada como "mal".
  let falloRegistrado = false;
  for (const tecla of ['1', '2', '3', '4']) {
    await page.keyboard.press(tecla);
    await page.waitForTimeout(450);
    const estados = await page.evaluate(() =>
      [...document.querySelectorAll('.opcion')].map((e) => e.dataset.estado || ''));
    if (estados.includes('mal')) { falloRegistrado = true; break; }
    // Si se acertó, se pasa a la siguiente pregunta y se intenta otra vez.
    const siguiente = page.locator('.barra-accion button');
    if (await siguiente.count()) { await siguiente.first().click(); await page.waitForTimeout(500); }
  }
  comprobar(falloRegistrado, 'se consigue fallar una pregunta de la cédula');

  const trasFallar = await leerSave(page);
  const mazo = trasFallar?.repaso ?? {};
  const ids = Object.keys(mazo);
  comprobar(ids.length === 1, 'el fallo crea una ficha, y sólo una', `${ids.length}`);

  const ficha = mazo[ids[0]];
  const hoy = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  comprobar(ficha?.nivel === 0 && ficha?.fallos === 1, 'la ficha nace en nivel 0 con un fallo');
  comprobar(ficha?.proximo > hoy, 'no vuelve hoy mismo: vence más adelante', `proximo=${ficha?.proximo}`);

  // ── 3. Cuando vence, /repaso la sirve ────────────────────────────────────
  console.log('\n3. El día que vence, vuelve');
  await page.evaluate(([id, dia]) => {
    const guardado = JSON.parse(localStorage.getItem('derecho-procesal-rpg-save'));
    guardado.state.repaso[id].proximo = dia; // adelantamos el reloj del mazo
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(guardado));
  }, [ids[0], hoy]);

  await page.goto(B + '/repaso', { waitUntil: 'commit' });
  await page.waitForTimeout(1600);
  const opcionesRepaso = await page.locator('.shell-main .opcion').count();
  comprobar(opcionesRepaso >= 2, '/repaso sirve la pregunta vencida', `${opcionesRepaso} alternativas`);
  comprobar(
    /1 de 1/.test(await page.locator('.shell-main').innerText()),
    'la tanda trae exactamente la que vencía',
  );

  // ── 4. Acertarla la aleja ────────────────────────────────────────────────
  console.log('\n4. Acertar aleja el próximo repaso');
  const correcta = await page.evaluate(() => {
    // La opción correcta no está marcada antes de responder, así que se prueba
    // la primera y, si falla, el propio guardado dirá que sigue en nivel 0.
    return 0;
  });
  await page.keyboard.press(String(correcta + 1));
  await page.waitForTimeout(900);

  const trasRepasar = await leerSave(page);
  const fichaDespues = trasRepasar?.repaso?.[ids[0]];
  comprobar(!!fichaDespues, 'la ficha sigue en el mazo tras repasarla');
  const acerto = (fichaDespues?.aciertos ?? 0) > 0;
  comprobar(
    acerto ? fichaDespues.nivel === 1 : fichaDespues.nivel === 0,
    acerto ? 'acertar sube al nivel 1' : 'volver a fallar la deja en nivel 0',
    `nivel=${fichaDespues?.nivel} aciertos=${fichaDespues?.aciertos} fallos=${fichaDespues?.fallos}`,
  );
  comprobar(
    fichaDespues?.proximo > hoy,
    'en cualquier caso, el próximo repaso queda en el futuro',
    `proximo=${fichaDespues?.proximo}`,
  );

  // ── 4·bis. Un acierto de verdad, no el que salga ─────────────────────────
  //
  // La comprobación anterior admite las dos ramas, así que por sí sola no
  // demuestra que acertar aleje el repaso. Aquí se lee del propio juego cuál
  // era la opción correcta —quedó marcada en el DOM al responder— y se vuelve a
  // servir la pregunta para acertarla a propósito.
  console.log('\n4·bis. Acertar a propósito');
  const indiceCorrecto = await page.evaluate(() =>
    [...document.querySelectorAll('.opcion')].findIndex((e) => e.dataset.estado === 'ok'));
  comprobar(indiceCorrecto >= 0, 'el juego señala cuál era la correcta', `opción ${indiceCorrecto + 1}`);

  await page.evaluate(([id, dia]) => {
    const guardado = JSON.parse(localStorage.getItem('derecho-procesal-rpg-save'));
    guardado.state.repaso[id].proximo = dia;
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(guardado));
  }, [ids[0], hoy]);
  await page.goto(B + '/repaso', { waitUntil: 'commit' });
  await page.waitForTimeout(1600);
  await page.keyboard.press(String(indiceCorrecto + 1));
  await page.waitForTimeout(900);

  const trasAcertar = (await leerSave(page))?.repaso?.[ids[0]];
  comprobar(trasAcertar?.nivel === 1, 'acertar sube al nivel 1', `nivel=${trasAcertar?.nivel}`);
  comprobar(trasAcertar?.aciertos === 1, 'se anota el acierto', `aciertos=${trasAcertar?.aciertos}`);
  // Nivel 1 → INTERVALOS[1] = 3 días.
  const esperado = new Date(Date.UTC(...hoy.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n)))));
  esperado.setUTCDate(esperado.getUTCDate() + 3);
  const enTresDias = esperado.toISOString().slice(0, 10);
  comprobar(
    trasAcertar?.proximo === enTresDias,
    'el próximo repaso se va a tres días',
    `proximo=${trasAcertar?.proximo} esperado=${enTresDias}`,
  );

  // ── 5. Entrenar lo anuncia ───────────────────────────────────────────────
  console.log('\n5. Se encuentra desde Entrenar');
  await page.evaluate(([id, dia]) => {
    const guardado = JSON.parse(localStorage.getItem('derecho-procesal-rpg-save'));
    guardado.state.repaso[id].proximo = dia;
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(guardado));
  }, [ids[0], hoy]);
  await page.goto(B + '/expansion', { waitUntil: 'commit' });
  await page.waitForTimeout(1600);
  const entrenar = await page.locator('.shell-main').innerText();
  comprobar(/Repaso espaciado/i.test(entrenar), 'la fila de repaso aparece en Campaña');
  comprobar(/1 para hoy/i.test(entrenar), 'anuncia cuántas vencen hoy');
  comprobar(/1 en el mazo/i.test(entrenar), 'dice cuántas lleva en el mazo');

  await ctx.close();
  await b.close();
  console.log(`\n${fallos === 0 ? '✓' : '✗'} ${fallos} comprobación(es) fallida(s)`);
  process.exit(fallos === 0 ? 0 : 1);
})();
