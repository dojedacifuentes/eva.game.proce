// Arranque del navegador para el arnés, en cualquier sistema.
//
// Los guiones nacieron en un contenedor Linux con Chromium en una ruta fija.
// Orden de búsqueda:
//   1. PW_CHROMIUM=/ruta/al/ejecutable   (explícito)
//   2. el Chromium del contenedor original, si existe
//   3. Chrome o Edge instalados en el sistema (canales de Playwright): así
//      funciona en Windows y macOS sin descargar navegadores.
//   4. el Chromium que Playwright tenga descargado.
const fs = require('fs');
const { chromium } = require('playwright');

const RUTA_CONTENEDOR = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function lanzar() {
  const args = ['--no-proxy-server', '--no-sandbox'];
  if (process.env.PW_CHROMIUM) {
    return chromium.launch({ executablePath: process.env.PW_CHROMIUM, args });
  }
  if (fs.existsSync(RUTA_CONTENEDOR)) {
    return chromium.launch({ executablePath: RUTA_CONTENEDOR, args });
  }
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel, args });
    } catch { /* probar el siguiente */ }
  }
  return chromium.launch({ args });
}

module.exports = { lanzar };
