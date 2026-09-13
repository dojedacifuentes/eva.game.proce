const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const EXP = require('./fixtures/save-expansiones.json');
const B = 'http://127.0.0.1:3100';

// ¿Se puede AVANZAR en móvil? Comprueba, en cada pantalla de actividad, que el
// control que hace progresar existe, es visible, no está tapado por la barra
// inferior y que el documento no se desplaza (v4: armazón fijo en móvil).
const PANTALLAS = [
  '/juego', '/mision/m1_3', '/boss/esfinge_competencia', '/examen', '/oral', '/expansion', '/creacion',
  '/civilis', '/civilis/vof', '/civilis/flashcards', '/civilis/practica',
  '/procesal', '/procesal/plazos', '/procesal/prueba/vof',
  '/reinos', '/mundo/cautelares', '/mundo', '/inventario', '/codex', '/mundos',
];

(async () => {
  const b = await lanzar();
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
      await page.waitForTimeout(1400);
      const r = await page.evaluate(() => {
        const d = document.documentElement;
        const vh = d.clientHeight;
        const nav = document.querySelector('.shell-nav');
        // La barra es fija o fila del grid: en ambos casos nada por debajo de
        // su borde superior es alcanzable.
        const navTop = nav ? nav.getBoundingClientRect().top : Infinity;
        const limite = Math.min(vh, navTop);

        // Controles interactivos: también el buscador y los desplegables de las
        // pantallas de lectura (el Codex no tiene botones, pero sí se usa).
        const controles = [...document.querySelectorAll('.shell-main a[href], .shell-main button, .shell-main input:not([type=hidden]), .shell-main summary')]
          .filter((e) => {
            const q = e.getBoundingClientRect();
            const cs = getComputedStyle(e);
            return q.width > 8 && q.height > 8 && cs.visibility !== 'hidden' && cs.display !== 'none';
          });

        const alcanzables = controles.filter((e) => {
          const q = e.getBoundingClientRect();
          return q.top >= -2 && q.bottom <= limite + 2;
        });

        const contenedores = [document.scrollingElement, ...document.querySelectorAll('.shell-scroll, .flujo-lienzo, .modal-arte, [style*="overflow"]')];
        const puedeDesplazar = contenedores.some((c) => c && c.scrollHeight - c.clientHeight > 4);

        const fueraDeAlcance = controles.filter((e) => {
          const q = e.getBoundingClientRect();
          return q.bottom > limite + 2 || q.top < -2;
        }).length;

        // Acción pegada abajo (barra de acción), si la pantalla tiene una.
        const barra = document.querySelector('.barra-accion, .hub-accion');
        const qb = barra ? barra.getBoundingClientRect() : null;
        const barraVisible = !qb || (getComputedStyle(barra).display === 'none') || (qb.top >= 0 && qb.bottom <= limite + 2);

        return {
          total: controles.length,
          alcanzables: alcanzables.length,
          fueraDeAlcance,
          puedeDesplazar,
          barraVisible,
          scrollDoc: d.scrollHeight - d.clientHeight,
        };
      });

      const bloqueado = r.fueraDeAlcance > 0 && !r.puedeDesplazar;
      const sinAccion = r.alcanzables === 0;
      const docSeMueve = r.scrollDoc > 1;
      const mal = bloqueado || sinAccion || docSeMueve || !r.barraVisible;
      if (mal) malos++;
      const etiqueta = sinAccion ? 'SIN ACCIÓN ALCANZABLE'
        : bloqueado ? `BLOQUEADO: ${r.fueraDeAlcance} control(es) fuera y no hay scroll`
        : docSeMueve ? `EL DOCUMENTO SE DESPLAZA ${r.scrollDoc}px`
        : !r.barraVisible ? 'BARRA DE ACCIÓN FUERA DE LA VENTANA'
        : `ok (${r.alcanzables}/${r.total} a la vista)`;
      console.log(`${mal ? '✗' : '✓'} ${ruta.padEnd(28)} ${etiqueta}`);
    }
    await ctx.close();
  }
  console.log(`\n${malos} pantalla(s) donde no se puede avanzar`);
  await b.close();
  process.exit(malos > 0 ? 1 : 0);
})();
