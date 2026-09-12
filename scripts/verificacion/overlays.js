const { chromium } = require('playwright');
const SAVE = require('./fixtures/save-prueba.json');
const EXP = require('./fixtures/save-expansiones.json');
const B = 'http://127.0.0.1:3100';

// Cada overlay con el gesto REAL que lo abre. Esto es lo que faltaba: los
// medidores anteriores sólo cargaban rutas y medían el estado inicial, así que
// nada de lo que aparece tras interactuar entraba en la medición.
const OVERLAYS = [
  { id: 'npc-zona', ruta: '/mundo/cautelares', abrir: async (p) => {
      await p.locator('button:has-text("Hablar")').first().click({ timeout: 6000 });
    } },
  // /mundo/conciliacion no tiene escenas narrativas por delante (escenasMundo
  // lo deja vacío) y su zona, cosajuzgada, es la que más eventos trae: el
  // explorador se monta de inmediato y el botón del evento está a la vista.
  { id: 'evento-zona', ruta: '/mundo/conciliacion', abrir: async (p) => {
      await p.locator('button:has-text("Atender evento"), .shell-main button:has-text("⚠")')
        .first().click({ timeout: 6000 });
    } },
  { id: 'creacion-reemplazo', ruta: '/creacion', abrir: async (p) => {
      await p.locator('#campo-nombre').fill('Intruso');
      await p.locator('button:has-text("PARTIDA RÁPIDA")').click();
      await p.waitForTimeout(400);
      await p.locator('button:has-text("Reemplazar y comenzar")').click();
    } },
  // El diálogo de importar sólo aparece tras elegir un archivo: se adjunta uno
  // real al input oculto, que es lo que hace el jugador con el selector.
  { id: 'inventario-importar', ruta: '/inventario', abrir: async (p) => {
      await p.locator('#archivo-partida').setInputFiles({
        name: 'partida.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({
          __save: 'foro-invisible',
          estado: { personaje: { nombre: 'Importada, Prueba' }, xp: 500 },
        })),
      });
    } },
  // Estos overlays conservan su arte propio y reciben el comportamiento por
  // hook; se abren pulsando la primera ficha de su rejilla.
  { id: 'reinos-biblioteca', ruta: '/reinos/biblioteca', abrir: async (p) => {
      await p.locator('.shell-main button:not(:has-text("🔒"))').nth(1).click({ timeout: 6000 });
    } },
  { id: 'civilis-codex',   ruta: '/civilis/codex', abrir: async (p) => {
      await p.locator('.shell-main button:not(:has-text("🔒"))').nth(1).click({ timeout: 6000 });
    } },
  { id: 'civilis-cartas',  ruta: '/civilis/cartas', abrir: async (p) => {
      await p.locator('.shell-main button:not(:has-text("🔒"))').nth(1).click({ timeout: 6000 });
    } },
  { id: 'civilis-bestiario', ruta: '/civilis/bestiario', abrir: async (p) => {
      await p.locator('.shell-main button:not(:has-text("🔒"))').nth(1).click({ timeout: 6000 });
    } },
];

const lum = (c) => { const f = c.map(v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2]; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server','--no-sandbox'] });
  let fallos = 0;
  for (const o of OVERLAYS) {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    try {
      await page.goto(B + '/', { waitUntil: 'commit' });
      await page.evaluate(([s, e]) => {
        localStorage.setItem('derecho-procesal-rpg-save', JSON.stringify(s));
        localStorage.setItem('foro-invisible:intro-vista', '1');
        // Contenido de expansión desbloqueado: si no, las fichas salen con
        // candado y el modal no llega a abrirse.
        localStorage.setItem('civilis-save', JSON.stringify(e.civilis));
        localStorage.setItem('reinos-del-derecho-save', JSON.stringify(e.reinos));
        localStorage.setItem('procesal-save', JSON.stringify(e.procesal));
      }, [SAVE, EXP]);
      await page.goto(B + o.ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(1300);
      if (o.abrir) { try { await o.abrir(page); } catch (e) { console.log(`· ${o.id.padEnd(22)} no se pudo abrir (${e.message.slice(0,40)})`); await ctx.close(); continue; } }
      await page.waitForTimeout(900);

      const shot = (await page.screenshot({ type: 'png' })).toString('base64');
      const r = await page.evaluate(async ({ b64 }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
        const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
        const lum = (c) => { const f = c.map(v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2]; };
        const parse = (s) => { const n=(s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number); return s.startsWith('color(')? n.map(v=>v*255):n; };

        // El overlay = el .fixed de mayor z-index visible en pantalla.
        const capas = [...document.querySelectorAll('div,section,aside')].filter(e => {
          const cs = getComputedStyle(e);
          if (cs.position !== 'fixed') return false;
          const q = e.getBoundingClientRect();
          return q.width > 200 && q.height > 120 && cs.visibility !== 'hidden' && cs.opacity !== '0';
        });
        if (capas.length === 0) return { ausente: true };
        capas.sort((a, c) => (parseInt(getComputedStyle(c).zIndex)||0) - (parseInt(getComputedStyle(a).zIndex)||0));
        const capa = capas[0];

        const dialogo = capa.querySelector('[role="dialog"]') || (capa.getAttribute('role') === 'dialog' ? capa : null);
        const duplicados = document.querySelectorAll('.modal-scrim').length;

        // ¿cabe? la caja interior no debe exigir desplazamiento sin región propia
        let hayQueBajar = 0;
        for (const el of capa.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          const exceso = el.scrollHeight - el.clientHeight;
          if (exceso > 4 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && (cs.overflow === 'hidden' || cs.overflowY === 'hidden')) hayQueBajar = Math.max(hayQueBajar, exceso);
        }
        const q = capa.getBoundingClientRect();
        const desborda = Math.max(0, Math.round(q.bottom - innerHeight)) + Math.max(0, Math.round(-q.top));

        // Texto: tamaño y contraste real
        let peq = 0, bajos = 0; const ejemplos = [];
        const fondoDe = (qq, fg) => {
          const x0=Math.max(0,Math.round(qq.left)), y0=Math.max(0,Math.round(qq.top));
          const w=Math.min(cv.width-x0,Math.round(qq.width)), h=Math.min(cv.height-y0,Math.round(qq.height));
          if (w<4||h<4) return null;
          const d=g.getImageData(x0,y0,w,h).data; const L=[];
          for (let i=0;i<d.length;i+=4) L.push([d[i],d[i+1],d[i+2]]);
          if (L.length<12) return null;
          L.sort((a,c)=>lum(a)-lum(c));
          const osc=L[Math.floor(L.length*0.08)], cla=L[Math.floor(L.length*0.92)];
          return Math.abs(lum(osc)-lum(fg))>Math.abs(lum(cla)-lum(fg))?osc:cla;
        };
        for (const el of capa.querySelectorAll('*')) {
          if (el.children.length) continue;
          const t=(el.textContent||'').trim(); if (t.length<3) continue;
          if (el.closest('svg')) continue;
          const cs=getComputedStyle(el);
          if (cs.visibility==='hidden'||cs.display==='none') continue;
          const qq=el.getBoundingClientRect();
          if (qq.width<8||qq.height<6||qq.top<0||qq.bottom>innerHeight) continue;
          const px=parseFloat(cs.fontSize);
          if (px<12) { peq++; if(ejemplos.length<2) ejemplos.push(`${Math.round(px)}px "${t.slice(0,20)}"`); }
          const fg=parse(cs.color); const bg=fondoDe(qq,fg); if(!bg) continue;
          const L1=lum(fg),L2=lum(bg); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
          const grande = px>=24 || (px>=18.66 && parseInt(cs.fontWeight)>=700);
          if (ratio < (grande?3.0:4.5)) { bajos++; if(ejemplos.length<2) ejemplos.push(`r=${ratio.toFixed(1)} "${t.slice(0,20)}"`); }
        }
        // ¿La tarjeta tiene fondo propio? (el fallo bg-terminal-dark)
        const caja = dialogo || capa.firstElementChild || capa;
        const cs2 = getComputedStyle(caja);
        const alfa = (cs2.backgroundColor.match(/[\d.]+/g)||[0,0,0,1])[3];
        const sinFondo = cs2.backgroundImage === 'none' && (cs2.backgroundColor === 'rgba(0, 0, 0, 0)' || Number(alfa) < 0.9);

        return { peq, bajos, ejemplos, dialogo: !!dialogo, duplicados, hayQueBajar, desborda, sinFondo, cero: (capa.textContent||'').match(/^\s*0\s*$/m) ? 1 : 0 };
      }, { b64: shot });

      if (r.ausente) { console.log(`· ${o.id.padEnd(22)} sin overlay visible`); await ctx.close(); continue; }

      // Escape cierra
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      const cerroConEsc = await page.evaluate(() => ![...document.querySelectorAll('div')].some(e => getComputedStyle(e).position==='fixed' && parseInt(getComputedStyle(e).zIndex)>=50 && e.getBoundingClientRect().height>120));

      const mal = [];
      if (r.sinFondo)      mal.push('SIN-FONDO');
      if (r.peq)           mal.push(`${r.peq}<12px`);
      if (r.bajos)         mal.push(`${r.bajos}<AA`);
      if (r.duplicados>1)  mal.push(`DUPLICADO(${r.duplicados})`);
      if (r.hayQueBajar>4) mal.push(`RECORTE(${r.hayQueBajar}px)`);
      if (r.desborda>4)    mal.push(`DESBORDA(${r.desborda}px)`);
      if (!r.dialogo)      mal.push('sin-role-dialog');
      if (!cerroConEsc)    mal.push('Escape-no-cierra');
      if (mal.length) fallos++;
      console.log(`${mal.length?'✗':'✓'} ${o.id.padEnd(22)} ${mal.join(' ') || 'ok'}`);
      r.ejemplos?.slice(0,2).forEach(e => console.log(`     ${e}`));
    } catch (e) { console.log(`! ${o.id.padEnd(22)} ${e.message.slice(0,60)}`); }
    await ctx.close();
  }
  console.log(`\n${fallos} overlay(s) con hallazgos`);
  await b.close();
})();
