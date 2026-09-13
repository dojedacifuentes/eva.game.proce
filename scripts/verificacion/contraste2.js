const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');

// Mide el contraste REAL: captura la pantalla, la vuelve a meter en la página
// sobre un canvas y lee los píxeles pintados alrededor de cada texto. Así el
// fondo medido incluye degradados, imágenes y capas superpuestas, que es lo que
// de verdad ve el usuario. Deducirlo del CSS daba falsos positivos en los dos
// sentidos.
(async () => {
  const b = await lanzar();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:3100/', { waitUntil: 'commit' });
  await page.evaluate((s)=>{localStorage.setItem('derecho-procesal-rpg-save',JSON.stringify(s));localStorage.setItem('foro-invisible:intro-vista','1');}, SAVE);

  let tot = 0, malos = 0, peq = 0;
  for (const ruta of process.argv.slice(2)) {
    await page.goto('http://127.0.0.1:3100'+ruta, { waitUntil: 'commit' });
    await page.waitForTimeout(1200);
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(200);

    const shot = (await page.screenshot({ type: 'png' })).toString('base64');
    const r = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const g = cv.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);

      const lum = (c) => { const f = c.map(v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2]; };
      const parse = (s) => { const n=(s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number); return s.startsWith('color(')? n.map(v=>v*255):n; };
      // Fondo = el extremo de luminancia DENTRO de la caja del texto que más se
      // aleja del color del propio texto. Muestrear por encima del elemento
      // fallaba con los bloques (caía fuera, sobre la página) y daba lecturas
      // absurdas como texto oscuro sobre papel claro marcado como ilegible.
      const fondoPintado = (q, fg) => {
        const x0 = Math.max(0, Math.round(q.left)), y0 = Math.max(0, Math.round(q.top));
        const w = Math.min(cv.width - x0, Math.round(q.width));
        const h = Math.min(cv.height - y0, Math.round(q.height));
        if (w < 4 || h < 4) return null;
        const d = g.getImageData(x0, y0, w, h).data;
        const L = [];
        for (let i = 0; i < d.length; i += 4) L.push([d[i], d[i+1], d[i+2]]);
        if (L.length < 12) return null;
        L.sort((a, c) => lum(a) - lum(c));
        const oscuro = L[Math.floor(L.length * 0.08)];
        const claro  = L[Math.floor(L.length * 0.92)];
        const lf = lum(fg);
        return Math.abs(lum(oscuro) - lf) > Math.abs(lum(claro) - lf) ? oscuro : claro;
      };

      let nodos = 0, bajos = 0, pequenos = 0; const peores = [];
      for (const el of document.querySelectorAll('.shell-main *, .shell-header *, .shell-nav *')) {
        if (el.children.length) continue;
        const t = (el.textContent||'').trim(); if (t.length < 3) continue;
        if (el.closest('svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
        const q = el.getBoundingClientRect();
        if (q.width < 8 || q.height < 6 || q.top < 0 || q.bottom > innerHeight) continue;
        const px = parseFloat(cs.fontSize);
        nodos++;
        if (px < 12) pequenos++;
        const fg = parse(cs.color);
        const bg = fondoPintado(q, fg); if (!bg) continue;
        const L1 = lum(fg), L2 = lum(bg);
        const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
        const grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
        if (ratio < (grande ? 3.0 : 4.5)) {
          bajos++;
          if (peores.length < 3) peores.push(`${Math.round(px)}px r=${ratio.toFixed(1)} "${t.slice(0,26)}"`);
        }
      }
      return { nodos, bajos, pequenos, peores };
    }, shot);

    tot += r.nodos; malos += r.bajos; peq += r.pequenos;
    console.log(`${r.bajos === 0 && r.pequenos === 0 ? '✓' : '✗'} ${ruta.padEnd(20)} ${String(r.nodos).padStart(4)} textos · ${r.pequenos} bajo 12px · ${r.bajos} bajo AA`);
    r.peores.forEach(x => console.log(`      ${x}`));
  }
  console.log(`\nTOTAL: ${tot} textos medidos sobre píxel real · ${peq} bajo 12px · ${malos} bajo AA`);
  await b.close();
})();
