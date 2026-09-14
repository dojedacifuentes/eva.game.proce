/**
 * CLIPS PARA VIDEO — grabaciones cortas del juego en movimiento.
 *
 * Cada clip es una toma vertical (9:16) con una interacción real: entrar a una
 * actividad, responder, ver el color del acierto o del error, pasar a la
 * siguiente. Sirven de recurso de apoyo (B-roll) sobre el que hablar.
 *
 * Sale .webm de Playwright y, si hay ffmpeg, también .mp4 (H.264) — que es lo
 * que aceptan sin pelear los editores y las plataformas.
 *
 *   npm run build && npx next start -p 3100     (en otra terminal)
 *   node scripts/video/clips.js
 *
 * Usa la PARTIDA DE PRUEBA del arnés: nunca toca una partida personal.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { lanzar } = require('./navegador');

const SAVE = require('../verificacion/fixtures/save-prueba.json');
const EXP = require('../verificacion/fixtures/save-expansiones.json');
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SALIDA = path.join(__dirname, 'clips');
const CSS = { width: 405, height: 720 };          // 9:16 en píxeles CSS
const VIDEO = { width: 1080, height: 1920 };      // 9:16 en píxeles reales

const AVANCE = /siguiente|continuar|avanzar|seguir|terminar|finalizar/i;

const pausa = (page, ms) => page.waitForTimeout(ms);

/** Clic tolerante: espera a que exista, lo trae a la vista y lo fuerza. */
async function pulsar(page, locator) {
  if (!(await locator.count())) return false;
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 2500 });
    await locator.click({ timeout: 4000, force: true });
    return true;
  } catch { return false; }
}

/** Pulsa una alternativa y deja ver el color de la respuesta. */
async function responder(page, indice = 0) {
  const opciones = page.locator('.shell-main .opcion, .shell-main button').filter({ hasNotText: AVANCE });
  const n = await opciones.count();
  if (!n) return false;
  try { await opciones.nth(Math.min(indice, n - 1)).click({ timeout: 3000 }); } catch { return false; }
  await pausa(page, 2200);
  return true;
}

/** Pasa a lo siguiente, si hay dónde pasar. */
async function avanzar(page) {
  const btn = page.locator('.shell-main button').filter({ hasText: AVANCE }).first();
  if (!(await btn.count())) return false;
  try { await btn.click({ timeout: 3000 }); } catch { return false; }
  await pausa(page, 1600);
  return true;
}

/** Desplaza despacio la región de contenido: un barrido, no un salto. */
async function barrer(page, pasos = 8) {
  for (let i = 0; i < pasos; i++) {
    await page.evaluate(() => {
      const z = document.querySelector('.shell-scroll') || document.scrollingElement;
      if (z) z.scrollBy({ top: 90, behavior: 'smooth' });
    });
    await pausa(page, 420);
  }
}

const TOMAS = [
  ['examen', '/examen', 'Cédula: pregunta, error y explicación', async (page) => {
    await pausa(page, 1600);
    await responder(page, 0);
    await avanzar(page);
    await responder(page, 1);
    await pausa(page, 1400);
  }],
  ['mision', '/mision/m1_3', 'Desafío dentro de una misión', async (page) => {
    await pausa(page, 1600);
    await responder(page, 1);
    await avanzar(page);
    await pausa(page, 1400);
  }],
  ['mundos', '/mundos', 'Recorrido por los mundos y expansiones', async (page) => {
    await pausa(page, 1400);
    await barrer(page, 9);
    await pausa(page, 900);
  }],
  ['hub', '/juego', 'Mapa de campaña y progreso', async (page) => {
    await pausa(page, 1800);
    await barrer(page, 7);
    await pausa(page, 1000);
  }],
  ['codex', '/codex', 'Códex: artículos del CPC y del COT', async (page) => {
    await pausa(page, 1400);
    await barrer(page, 9);
    await pausa(page, 900);
  }],
  ['oral', '/oral', 'La comisión examinadora: entrada de jefe e interrogatorio', async (page) => {
    await pausa(page, 1800);
    // Tres planos en una toma: el roster, la entrada del jefe y el interrogatorio.
    await pulsar(page, page.locator('.shell-main button').first());
    await pausa(page, 2600);
    // «⚔ Combatir» entra con una cinemática. Pulsarlo mientras se mueve falla
    // en silencio y la toma se queda en la ficha del jefe: por eso se espera a
    // que esté quieto y se fuerza el clic.
    await pulsar(page, page.locator('button').filter({ hasText: /combatir/i }).first());
    await pausa(page, 3000);
    await responder(page, 0);
    await pausa(page, 1800);
  }],
  ['plazos', '/procesal/plazos', 'Minijuego de plazos', async (page) => {
    await pausa(page, 1600);
    await responder(page, 0);
    await avanzar(page);
    await pausa(page, 1600);
  }],
];

/**
 * Busca un ffmpeg que sepa codificar H.264. El que trae Playwright NO sirve:
 * es una compilacion minima, solo VP8, y rechaza hasta la opcion -preset.
 */
function ffmpeg() {
  const candidatos = [
    process.env.FFMPEG,
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
    'ffmpeg',
  ].filter(Boolean);
  for (const c of candidatos) {
    try {
      const salida = execFileSync(c, ['-hide_banner', '-encoders'], { stdio: 'pipe' }).toString();
      if (salida.includes('libx264')) return c;
    } catch { /* probar el siguiente */ }
  }
  return null;
}

(async () => {
  // Sin argumentos, las siete. Con argumentos, sólo esas: regrabar una toma
  // que salió mal no debería costar las otras seis.
  const pedidas = process.argv.slice(2);
  const tomas = pedidas.length
    ? TOMAS.filter(([nombre]) => pedidas.includes(nombre))
    : TOMAS;
  if (!tomas.length) {
    console.log(`Ninguna toma se llama así. Hay: ${TOMAS.map((t) => t[0]).join(', ')}`);
    process.exit(1);
  }

  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await lanzar();
  const hechos = [];

  for (const [nombre, ruta, para, guion] of tomas) {
    const tmp = path.join(SALIDA, `.tmp-${nombre}`);
    fs.mkdirSync(tmp, { recursive: true });
    const ctx = await navegador.newContext({
      viewport: CSS,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      recordVideo: { dir: tmp, size: VIDEO },
    });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + '/', { waitUntil: 'commit' });
      await page.evaluate(([s, e]) => {
        localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
        localStorage.setItem('foro-invisible:intro-vista', '1');
        localStorage.setItem('civilis-save', JSON.stringify(e.civilis));
        localStorage.setItem('reinos-del-derecho-save', JSON.stringify(e.reinos));
        localStorage.setItem('procesal-save', JSON.stringify(e.procesal));
      }, [SAVE, EXP]);
      await page.goto(BASE + ruta, { waitUntil: 'commit' });
      await guion(page);
    } catch (e) {
      console.log(`⚠ ${nombre} — ${e.message.slice(0, 70)}`);
    }
    await ctx.close(); // cerrar el contexto es lo que termina de escribir el vídeo

    const crudo = fs.readdirSync(tmp).find((f) => f.endsWith('.webm'));
    if (crudo) {
      const destino = path.join(SALIDA, `${nombre}.webm`);
      fs.renameSync(path.join(tmp, crudo), destino);
      hechos.push([nombre, destino, para]);
      console.log(`✓ ${nombre}.webm — ${para}`);
    } else {
      console.log(`✗ ${nombre} — sin vídeo`);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  await navegador.close();

  const ff = ffmpeg();
  if (!ff) {
    console.log('\nSin un ffmpeg con H.264: los clips quedan en .webm.');
    console.log('El ffmpeg que trae Playwright solo hace VP8, así que no vale.');
    console.log('Instala uno de verdad (brew install ffmpeg · winget install ffmpeg)');
    console.log('o importa los .webm directamente: CapCut y DaVinci los abren.');
  } else {
    for (const [nombre, origen] of hechos) {
      const mp4 = path.join(SALIDA, `${nombre}.mp4`);
      try {
        execFileSync(ff, [
          '-y', '-loglevel', 'error', '-i', origen,
          '-vf', `scale=${VIDEO.width}:${VIDEO.height}:force_original_aspect_ratio=decrease,pad=${VIDEO.width}:${VIDEO.height}:(ow-iw)/2:(oh-ih)/2:color=#06070B,fps=30`,
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', mp4,
        ], { stdio: 'pipe' });
        console.log(`✓ ${nombre}.mp4`);
      } catch (e) {
        console.log(`✗ ${nombre}.mp4 — ${String(e.stderr || e.message).slice(0, 90)}`);
      }
    }
  }
  console.log(`\n${hechos.length} clip(s) en scripts/video/clips/`);
})();
