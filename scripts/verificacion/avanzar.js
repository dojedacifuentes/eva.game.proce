const { chromium } = require('playwright');
const SAVE = require('./fixtures/save-prueba.json');
const EXP = require('./fixtures/save-expansiones.json');
const B = 'http://127.0.0.1:3100';

// ¿Se puede AVANZAR en móvil? Comprueba, en cada pantalla de actividad, que el
// control que hace progresar existe, es visible, no está tapado por la barra
// inferior y responde al toque.
const PANTALLAS = [
  '/juego', '/mision/m1_3', '/examen', '/oral', '/expansion',
  '/civilis', '/civilis/vof', '/civilis/flashcards', '/civilis/practica',
  '/procesal', '/procesal/plazos', '/procesal/prueba/vof',
  '/reinos', '/mundo/cautelares', '/mundo', '/inventario', '/codex', '/mundos',
];

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-proxy-server', '--no-sandbox'],
  });
  let malos = 0;
  for (const vp of [{ w: 390, h: 844, n: 'movil 390x844' }, { w: 360, h: 800, n: 'movil 360x800' }]) {
    console.log(`\n### ${vp.n}`);
    const ctx = await b.newContext({
      viewport: { width: vp.w, height: vp.h },
      hasTouch: true, isMobile: true, reducedMotion: 'reduce',
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

    for (const ruta of PANTALLAS) {
      await page.goto(B + ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        const d = document.documentElement;
        const vh = d.clientHeight;
        const nav = document.querySelector('.shell-nav');
        const navTop = nav && getComputedStyle(nav).position === 'fixed'
          ? nav.getBoundingClientRect().top : Infinity;

        // Controles que hacen progresar: enlaces y botones del contenido.
        const controles = [...document.querySelectorAll('.shell-main a[href], .shell-main button')]
          .filter((e) => {
            const q = e.getBoundingClientRect();
            const cs = getComputedStyle(e);
            return q.width > 8 && q.height > 8 && cs.visibility !== 'hidden' && cs.display !== 'none';
          });

        // ¿alguno alcanzable? visible en la ventana y no bajo la barra
        const alcanzables = controles.filter((e) => {
          const q = e.getBoundingClientRect();
          return q.top >= -2 && q.bottom <= Math.min(vh, navTop) + 2;
        });

        // ¿se puede llegar a los demás desplazando? (documento o región interna)
        const contenedores = [document.scrollingElement, ...document.querySelectorAll('.shell-scroll, .modal-arte, [style*="overflow"]')];
        const puedeDesplazar = contenedores.some((c) => c && c.scrollHeight - c.clientHeight > 4);

        // Controles que existen pero quedan fuera de todo alcance
        const fueraDeAlcance = controles.filter((e) => {
          const q = e.getBoundingClientRect();
          const fuera = q.bottom > Math.min(vh, navTop) + 2 || q.top < -2;
          return fuera;
        }).length;

        return {
          total: controles.length,
          alcanzables: alcanzables.length,
          fueraDeAlcance,
          puedeDesplazar,
          scrollDoc: d.scrollHeight - d.clientHeight,
          primero: (alcanzables[0]?.innerText || '').replace(/\n/g, ' ').slice(0, 24),
        };
      });

      // Un bloqueo real: hay controles fuera de alcance y NADA se puede desplazar.
      const bloqueado = r.fueraDeAlcance > 0 && !r.puedeDesplazar;
      const sinAccion = r.alcanzables === 0;
      const mal = bloqueado || sinAccion;
      if (mal) malos++;
      const etiqueta = sinAccion ? 'SIN ACCIÓN ALCANZABLE'
        : bloqueado ? `BLOQUEADO: ${r.fueraDeAlcance} control(es) fuera y no hay scroll`
        : `ok (${r.alcanzables}/${r.total} a la vista)`;
      console.log(`${mal ? '✗' : '✓'} ${ruta.padEnd(24)} ${etiqueta}`);
    }
    await ctx.close();
  }
  console.log(`\n${malos} pantalla(s) donde no se puede avanzar`);
  await b.close();
})();
