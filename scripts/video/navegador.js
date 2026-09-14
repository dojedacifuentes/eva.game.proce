// Arranque del navegador para el arnés de capturas promocionales.
// Mismo orden de búsqueda que scripts/verificacion/navegador.js, para que
// funcione igual en el contenedor, en Windows y en macOS.
const fs = require('fs');
const { chromium } = require('playwright');

const RUTAS_CONTENEDOR = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];

async function lanzar(extra = []) {
  const args = ['--no-proxy-server', '--no-sandbox', ...extra];
  if (process.env.PW_CHROMIUM) {
    return chromium.launch({ executablePath: process.env.PW_CHROMIUM, args });
  }
  for (const ruta of RUTAS_CONTENEDOR) {
    if (fs.existsSync(ruta)) return chromium.launch({ executablePath: ruta, args });
  }
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel, args }); } catch { /* siguiente */ }
  }
  return chromium.launch({ args });
}

module.exports = { lanzar };
