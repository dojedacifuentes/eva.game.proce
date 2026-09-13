const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const RUTAS = process.argv.slice(2);
(async () => {
  const b = await lanzar();
  for (const vp of [{w:1366,h:768},{w:1440,h:900}]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:3100/', { waitUntil: 'commit' });
    await page.evaluate((s)=>{localStorage.setItem('derecho-procesal-rpg-save',JSON.stringify(s));localStorage.setItem('foro-invisible:intro-vista','1');}, SAVE);
    console.log(`\n### ${vp.w}x${vp.h}`);
    for (const ruta of RUTAS) {
      await page.goto('http://127.0.0.1:3100'+ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(1100);
      const r = await page.evaluate(() => {
        let peor = 0, cual = '';
        for (const el of document.querySelectorAll('.shell-scroll')) {
          const exceso = el.scrollHeight - el.clientHeight;
          if (exceso > peor) { peor = exceso; cual = String(el.getAttribute('aria-label') || el.className).slice(0,32); }
        }
        return { peor, cual, alto: document.documentElement.clientHeight };
      });
      const pct = Math.round((r.peor / r.alto) * 100);
      const marca = r.peor <= 8 ? '✓ cabe entero' : `✗ hay que bajar ${r.peor}px (+${pct}% de pantalla)`;
      console.log(`  ${ruta.padEnd(22)} ${marca}`);
    }
    await ctx.close();
  }
  await b.close();
})();
