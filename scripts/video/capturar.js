/**
 * CAPTURAS PARA VIDEO — fotogramas del juego, listos para montar.
 *
 * Genera PNG de pantalla completa en dos formatos:
 *   · vertical  1080×1920 (9:16) — reels, TikTok, HeyGen vertical
 *   · ancho     1920×1080 (16:9) — YouTube, presentación
 *
 * Igual que el arnés de verificación: navegador real sobre el build de
 * producción, perfil limpio y una PARTIDA DE PRUEBA — nunca toca una partida
 * personal. Las animaciones se congelan antes de disparar para que no salga un
 * fotograma a medio camino.
 *
 *   npm run build && npx next start -p 3100     (en otra terminal)
 *   node scripts/video/capturar.js              (ambos formatos)
 *   node scripts/video/capturar.js vertical     (sólo 9:16)
 */
const fs = require('fs');
const path = require('path');
const { lanzar } = require('./navegador');

const SAVE = require('../verificacion/fixtures/save-prueba.json');
const EXP = require('../verificacion/fixtures/save-expansiones.json');
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SALIDA = path.join(__dirname, 'capturas');

// Un formato = una relación de aspecto. `css` es el tamaño en píxeles CSS (lo
// que decide qué disposición dibuja el juego) y `escala` lo multiplica hasta
// los píxeles reales del archivo.
const FORMATOS = {
  vertical: { css: { width: 360, height: 640 }, escala: 3, movil: true },  // 1080×1920
  ancho:    { css: { width: 1280, height: 720 }, escala: 1.5, movil: false }, // 1920×1080
};

// nombre · ruta · qué hacer antes de disparar · para qué sirve en el montaje
const PLANOS = [
  ['01-portada',      '/',                    null,        'Revelado del título'],
  ['02-hub',          '/juego',               null,        'Hub: estado de la partida'],
  ['03-mundos',       '/mundos',              null,        'Los 13 mundos'],
  ['04-mision',       '/mision/m1_3',         null,        'Pregunta con alternativas'],
  ['05-mision-fb',    '/mision/m1_3',         'responder', 'Acierto o error, con su color'],
  ['06-examen',       '/examen',              null,        'Modo examen tipo cédula'],
  ['07-examen-fb',    '/examen',              'responder', 'Explicación normativa'],
  ['08-repaso',       '/repaso',              'repaso',    'Repaso espaciado con mazo real'],
  ['09-codex',        '/codex',               null,        'Códex con buscador'],
  ['10-oral',         '/oral',                null,        'Interrogación oral'],
  ['11-creacion',     '/creacion',            null,        'Creación de personaje'],
  ['12-inventario',   '/inventario',          null,        'Expediente'],
  ['13-civilis',      '/civilis',             null,        'Expansión Civilis'],
  ['14-reinos',       '/reinos',              null,        'Expansión Reinos del Derecho'],
  ['15-procesal',     '/procesal',            null,        'Expansión Procesal'],
  ['16-plazos',       '/procesal/plazos',     null,        'Minijuego de plazos'],
  ['17-cartas',       '/civilis/cartas',      null,        'Cartas'],
  ['18-vof',          '/civilis/vof',         null,        'Verdadero o falso'],
];

const AVANCE = /siguiente|continuar|avanzar|seguir|terminar|finalizar|volver|cerrar|comprobar|confirmar|jugar|empezar|comenzar|iniciar/i;

async function sembrar(page) {
  await page.evaluate(([s, e]) => {
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
    localStorage.setItem('foro-invisible:intro-vista', '1');
    localStorage.setItem('civilis-save', JSON.stringify(e.civilis));
    localStorage.setItem('reinos-del-derecho-save', JSON.stringify(e.reinos));
    localStorage.setItem('procesal-save', JSON.stringify(e.procesal));
  }, [SAVE, EXP]);
}

/**
 * Deja el mazo de repaso con algo que repasar, jugando de verdad.
 *
 * El mazo arranca vacío, y una partida recién creada enseña «Tu mazo está
 * vacío»: verdad, pero no cuenta nada. Así que se contesta una tanda de cédula
 * contestando a lo largo de las cuatro alternativas —algunas caen mal, que es
 * justo lo que llena el mazo— y después se adelanta un día el reloj de las
 * fichas. Es el estado de quien vuelve al día siguiente, no una partida
 * inventada: los identificadores los produjo el código del juego.
 */
async function prepararRepaso(page) {
  await page.goto(BASE + '/examen', { waitUntil: 'commit' });
  await page.waitForTimeout(1600);

  for (let i = 0; i < 10; i++) {
    const opciones = page.locator('.shell-main .opcion, .shell-main button').filter({ hasNotText: AVANCE });
    const n = await opciones.count();
    if (!n) break;
    try { await opciones.nth(Math.min(i % 4, n - 1)).click({ timeout: 2500 }); } catch { break; }
    await page.waitForTimeout(550);
    const siguiente = page.locator('.shell-main button').filter({ hasText: AVANCE }).first();
    if (!(await siguiente.count())) break;
    try { await siguiente.click({ timeout: 2500 }); } catch { break; }
    await page.waitForTimeout(550);
  }

  // Adelantar el reloj del mazo. `toca()` compara cadenas AAAA-MM-DD, así que
  // basta con dejar `proximo` en ayer para que toque hoy.
  const fichas = await page.evaluate(() => {
    const crudo = localStorage.getItem('derecho-procesal-rpg-save');
    if (!crudo) return 0;
    const guardado = JSON.parse(crudo);
    const mazo = guardado?.state?.repaso;
    if (!mazo || typeof mazo !== 'object') return 0;
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    for (const id of Object.keys(mazo)) mazo[id].proximo = ayer;
    localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(guardado));
    return Object.keys(mazo).length;
  });
  if (!fichas) console.log('  · el mazo quedó vacío: se acertó todo');
}

async function responder(page) {
  // Primero cualquier botón que arranque la actividad, después una alternativa.
  const empezar = page.locator('.shell-main button').filter({ hasText: /empezar|comenzar|iniciar|jugar/i }).first();
  if (await empezar.count()) {
    try { await empezar.click({ timeout: 2500 }); await page.waitForTimeout(900); } catch { /* seguir */ }
  }
  const opcion = page.locator('.shell-main .opcion, .shell-main button').filter({ hasNotText: AVANCE }).first();
  if (await opcion.count()) {
    try { await opcion.click({ timeout: 2500 }); } catch { /* seguir */ }
  }
  await page.waitForTimeout(1200);
}

(async () => {
  const pedidos = process.argv.slice(2).filter((a) => FORMATOS[a]);
  const formatos = pedidos.length ? pedidos : Object.keys(FORMATOS);
  const navegador = await lanzar();
  let hechas = 0, fallidas = 0;

  for (const nombre of formatos) {
    const fmt = FORMATOS[nombre];
    const dir = path.join(SALIDA, nombre);
    fs.mkdirSync(dir, { recursive: true });

    for (const [plano, ruta, accion, para] of PLANOS) {
      const ctx = await navegador.newContext({
        viewport: fmt.css,
        deviceScaleFactor: fmt.escala,
        isMobile: fmt.movil,
        hasTouch: fmt.movil,
        reducedMotion: 'reduce',
      });
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + '/', { waitUntil: 'commit' });
        await sembrar(page);
        await page.goto(BASE + ruta, { waitUntil: 'commit' });
        await page.waitForTimeout(1800);
        if (accion === 'responder') await responder(page);
        if (accion === 'repaso') {
          await prepararRepaso(page);
          await page.goto(BASE + ruta, { waitUntil: 'commit' });
          await page.waitForTimeout(1800);
        }
        // Congelar lo que siguiera animándose: si no, sale un fotograma a medias.
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
        await page.waitForTimeout(300);
        const archivo = path.join(dir, `${plano}.png`);
        await page.screenshot({ path: archivo, timeout: 15000 });
        console.log(`✓ ${nombre}/${plano}.png — ${para}`);
        hechas++;
      } catch (e) {
        console.log(`✗ ${nombre}/${plano} — ${e.message.slice(0, 80)}`);
        fallidas++;
      }
      await ctx.close();
    }
  }

  await navegador.close();
  console.log(`\n${hechas} captura(s) en scripts/video/capturas/ · ${fallidas} fallida(s)`);
  process.exit(fallidas > 0 && hechas === 0 ? 1 : 0);
})();
