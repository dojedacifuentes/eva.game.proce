const { chromium } = require('playwright');
const SAVE = require('./fixtures/save-prueba.json');
const TAREAS = [
  ['modal-npc-escritorio', {width:1366,height:768}, '/mundo/cautelares', 'button:has-text("Hablar")'],
  ['modal-npc-movil',      {width:390,height:844},  '/mundo/cautelares', 'button:has-text("Hablar")'],
  ['zona-cautelares',      {width:1366,height:768}, '/mundo/cautelares', null],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server','--no-sandbox'] });
  for (const [nombre, vp, ruta, sel] of TAREAS) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    try {
      await page.goto('http://127.0.0.1:3100/', { waitUntil: 'commit' });
      await page.evaluate((s)=>{localStorage.setItem('derecho-procesal-rpg-save',JSON.stringify(s));localStorage.setItem('foro-invisible:intro-vista','1');}, SAVE);
      await page.goto('http://127.0.0.1:3100'+ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(1400);
      if (sel) { await page.locator(sel).first().click({ timeout: 6000 }); await page.waitForTimeout(800); }
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
      await page.waitForTimeout(200);
      await page.screenshot({ path: `scripts/verificacion/capturas/${nombre}.png`, timeout: 12000 });
      console.log('✓', nombre);
    } catch (e) { console.log('✗', nombre, e.message.slice(0,60)); }
    await ctx.close();
  }
  await b.close();
})();
