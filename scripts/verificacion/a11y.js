const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const RUTAS = process.argv.slice(2);
(async () => {
  const b = await lanzar();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:3100/', { waitUntil: 'commit' });
  await page.evaluate((s)=>{localStorage.setItem('derecho-procesal-rpg-save',JSON.stringify(s));localStorage.setItem('foro-invisible:intro-vista','1');}, SAVE);
  let total = 0;
  for (const ruta of RUTAS) {
    await page.goto('http://127.0.0.1:3100'+ruta, { waitUntil: 'commit' });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const EMOJI = /^[\s\p{Extended_Pictographic}\p{Emoji_Component}◂▸▶◀←→↑↓✓✗×·◈●▢⚔📋🗺🎒📜★☆•←-⇿☀-➿]*$/u;
      const sin = [];
      for (const el of document.querySelectorAll('button, a[href], [role="button"]')) {
        if (el.getAttribute('aria-hidden') === 'true') continue;
        const q = el.getBoundingClientRect();
        if (q.width === 0 && q.height === 0) continue;
        const aria = el.getAttribute('aria-label') || el.getAttribute('title') || '';
        if (aria.trim()) continue;
        const texto = (el.innerText || el.textContent || '').trim();
        // nombre accesible sólo si hay texto que NO es únicamente un icono
        if (texto && !EMOJI.test(texto)) continue;
        sin.push({ tag: el.tagName.toLowerCase(), txt: texto.slice(0, 16), cls: String(el.className).slice(0, 32) });
      }
      // campos de formulario sin etiqueta
      const camposSinLabel = [];
      for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
        const id = el.id;
        const tieneLabel = (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) || el.closest('label')
          || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!tieneLabel) camposSinLabel.push(el.tagName.toLowerCase() + (el.type ? ':'+el.type : ''));
      }
      return { sin, camposSinLabel };
    });
    total += r.sin.length + r.camposSinLabel.length;
    const s = r.sin.length + r.camposSinLabel.length;
    console.log(`${ruta.padEnd(14)} ${s === 0 ? '✓ ok' : `✗ ${r.sin.length} control(es) sin nombre, ${r.camposSinLabel.length} campo(s) sin etiqueta`}`);
    r.sin.slice(0,5).forEach(x => console.log(`      <${x.tag}> "${x.txt}"  [${x.cls}]`));
    r.camposSinLabel.slice(0,3).forEach(x => console.log(`      campo ${x}`));
  }
  console.log(`\nTOTAL: ${total}`);
  await b.close();
})();
