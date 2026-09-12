const { chromium } = require('playwright');

// Partida de prueba AISLADA: se inyecta en localStorage del navegador
// automatizado, nunca toca partidas reales de nadie.
const SAVE_PRUEBA = {
  state: {
    version: 1, creado: Date.now(), ultimoGuardado: Date.now(),
    personaje: {
      nombre: "Prueba, Ana", sexo: "femenino", origen: "academia", rol: "abogado_demandante",
      nivelEconomico: 45,
      atributos: { conocimiento_procesal: 8, persuasion_forense: 6, diligencia: 5, rigor_formal: 5, estrategia: 7, resistencia_psicologica: 5 },
      reputacion: 12, trauma: 4, expedientesGanados: 1, expedientesPerdidos: 0, cicloProcesal: 1,
    },
    expedientesArchivados: [], cautelares: [], incidentes: [], flags: [],
    mundoActual: "jurisdiccion", log: [], logros: [], casosResueltos: [],
    npcesEnProgreso: { __type: "Map", entries: [] }, npcesCompletados: [], npcesDesbloqueados: [],
    xp: 260, nivel: 3, monedas: 75, mundoVisual: "cybervalpo",
    misionesCompletadas: ["m1_1", "m1_2"], relicsEquipadas: [], relicsCompradas: [],
  },
  version: 3,
};

const TAMANOS = [
  { nombre: '1366x768', width: 1366, height: 768 },
  { nombre: '1440x900', width: 1440, height: 900 },
  { nombre: '1024x768', width: 1024, height: 768 },
  { nombre: '390x844',  width: 390,  height: 844 },
  { nombre: '360x800',  width: 360,  height: 800 },
];

const RUTAS = process.argv.slice(2);
const BASE = 'http://127.0.0.1:3100';

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--no-sandbox'] });
  const filas = [];
  for (const t of TAMANOS) {
    const ctx = await browser.newContext({ viewport: { width: t.width, height: t.height } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'commit' });
    await page.evaluate((s) => {
      localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
      localStorage.setItem('foro-invisible:intro-vista', '1');
    }, SAVE_PRUEBA);

    for (const ruta of RUTAS) {
      await page.goto(BASE + ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(900);
      const m = await page.evaluate(() => {
        const d = document.documentElement;
        return {
          scrollVertical: d.scrollHeight - d.clientHeight,
          scrollHorizontal: d.scrollWidth - d.clientWidth,
          alturaDoc: d.scrollHeight,
          alturaVentana: d.clientHeight,
          bloqueado: d.classList.contains('shell-lock'),
          overflowY: getComputedStyle(d).overflowY,
          nav: !!document.querySelector('.shell-nav'),
        };
      });
      filas.push({ tam: t.nombre, ruta, ...m });
    }
    await ctx.close();
  }
  await browser.close();

  const cab = ['tam', 'ruta', 'scrollV', 'scrollH', 'doc', 'win', 'lock', 'nav'];
  console.log(cab.map((c) => c.padEnd(12)).join(''));
  console.log('-'.repeat(96));
  for (const f of filas) {
    const alerta = (f.scrollH > 0 ? ' ⟵ DESBORDE-H' : '') +
      (f.scrollVertical > 0 && !f.tam.startsWith('3') ? ' ⟵ SCROLL-DOC' : '');
    console.log([f.tam, f.ruta, f.scrollVertical, f.scrollHorizontal, f.alturaDoc, f.alturaVentana,
      f.bloqueado ? 'sí' : 'no', f.nav ? 'sí' : 'no'].map((c) => String(c).padEnd(12)).join('') + alerta);
  }
})();
