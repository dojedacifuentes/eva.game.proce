const { lanzar } = require('./navegador');
const SAVE = require('./fixtures/save-prueba.json');
const TAREAS = [
  ['escritorio-1366x768-hub',      { width: 1366, height: 768 }, '/juego'],
  ['escritorio-1366x768-portada',  { width: 1366, height: 768 }, '/'],
  ['escritorio-1366x768-creacion', { width: 1366, height: 768 }, '/creacion'],
  ['escritorio-1366x768-mundos',   { width: 1366, height: 768 }, '/mundos'],
  ['movil-390x844-hub',            { width: 390,  height: 844 }, '/juego'],
  ['movil-390x844-portada',        { width: 390,  height: 844 }, '/'],
  ['movil-390x844-creacion',       { width: 390,  height: 844 }, '/creacion'],
];
(async () => {
  const b = await lanzar();
  for (const [nombre, vp, ruta] of TAREAS) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    try {
      await page.goto('http://127.0.0.1:3100/', { waitUntil: 'commit' });
      await page.evaluate((s)=>{localStorage.setItem('derecho-procesal-rpg-save',JSON.stringify(s));localStorage.setItem('foro-invisible:intro-vista','1');}, SAVE);
      await page.goto('http://127.0.0.1:3100'+ruta, { waitUntil: 'commit' });
      await page.waitForTimeout(1600);
      // Congela cualquier animación que siguiera viva antes de capturar.
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
      await page.waitForTimeout(250);
      await page.screenshot({ path: `scripts/verificacion/capturas/${nombre}.png`, timeout: 12000 });
      console.log('✓', nombre);
    } catch (e) { console.log('✗', nombre, e.message.slice(0, 70)); }
    await ctx.close();
  }
  await b.close();
})();
