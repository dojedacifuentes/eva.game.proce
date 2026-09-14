/**
 * DECK DEL VIDEO — guion, storyboard y dirección de arte en un .pptx vertical.
 *
 * Una diapositiva por escena, al tamaño real del video (9:16). Cada escena
 * lleva la captura del juego que le toca, el texto que va en pantalla, la línea
 * que dice la voz y, en las notas del orador, la indicación de montaje.
 *
 *   npm i pptxgenjs           (no es dependencia del juego: sólo para esto)
 *   python3 scripts/video/deck/piezas.py
 *   node scripts/video/deck/generar-deck.js
 *
 * Sale scripts/video/deck/EVAGAMEPROCE-video.pptx
 */
const path = require('path');
const pptxgen = require('pptxgenjs');

// ── Medidas ────────────────────────────────────────────────────────────────
// 7,5 × 13,333 pulgadas = 9:16 exacto = 1080×1920 px al exportar.
const W = 7.5;
const H = 13.333;
const MARGEN = 0.62;
const ANCHO_TEXTO = W - MARGEN * 2;
// La interfaz de Instagram y TikTok tapa ~250 px arriba y ~420 px abajo.
const SEGURO_ABAJO = H - (420 / 1920) * H; // 10,42"

// ── Colores del juego (app/globals.css) ────────────────────────────────────
const C = {
  fondo: '06070B',
  aceite: '0A1220',
  cian: '4BE7FF',
  violeta: '8A5CFF',
  papel: 'E8DFC5',
  blanco: 'F2F2F0',
  verde: '58F5B0',
  rojo: 'D94A4A',
  dorado: 'D7B46A',
  tenue: '8FA3B8',
  apagado: '46586B',
  fantasma: '1B2A3A',
};

// ── Tipografías ────────────────────────────────────────────────────────────
// Las del juego (Cinzel, JetBrains Mono, Inter) no están instaladas en la
// mayoría de los PowerPoint, así que el deck usa equivalentes que sí vienen con
// Office. Para el video final, instalar las de verdad desde Google Fonts.
const DISPLAY = 'Cambria';
const MONO = 'Courier New';
const CUERPO = 'Calibri';

const CAP = (f) => path.join(__dirname, '..', 'capturas', 'vertical', f);
const PIEZA = (f) => path.join(__dirname, 'piezas', f);

// ── El guion, escena por escena ────────────────────────────────────────────
// rotulo    · lo que va escrito en pantalla (corto: los subtítulos dicen el resto)
// voz       · lo que lee HeyGen, literal
// imagen    · la captura de fondo
// clip      · el clip de apoyo que reemplaza a la captura en el montaje
// montaje   · la indicación para las notas del orador
const ESCENAS = [
  {
    n: 1, desde: '0:00', hasta: '0:03', fuente: 'AVATAR',
    rotulo: '¿Por quinta\nvez?',
    voz: '¿Leyendo tus apuntes por quinta vez para el grado?',
    imagen: PIEZA('avatar-cerrado.png'),
    montaje:
      'Plano cerrado, avatar solo. Es el gancho: tiene que entrar en el primer ' +
      'segundo, sin logo, sin intro, sin música de arranque. La ceja levantada ' +
      'hace más que cualquier efecto. Fondo: negro del juego, no el fondo por ' +
      'defecto de HeyGen.',
  },
  {
    n: 2, desde: '0:03', hasta: '0:05', fuente: 'AVATAR',
    rotulo: 'Qué adorable.',
    voz: 'Qué adorable.',
    imagen: PIEZA('avatar-medio.png'),
    montaje:
      'Corte seco a plano medio: el cambio de encuadre es el chiste. Media ' +
      'pausa antes de decirlo. En HeyGen va como escena aparte — es la única ' +
      'forma de que respete el silencio.',
  },
  {
    n: 3, desde: '0:05', hasta: '0:09', fuente: 'JUEGO',
    rotulo: 'Leer no es\naprender.',
    voz: 'Pero leer no significa necesariamente que aprendiste.',
    imagen: CAP('06-examen.png'),
    montaje:
      'Primera vez que se ve el juego. Pregunta de cédula sin responder: el ' +
      'espectador la lee y se contesta solo. El avatar se va del cuadro o baja ' +
      'a un círculo pequeño abajo a la izquierda.',
  },
  {
    n: 4, desde: '0:09', hasta: '0:13', fuente: 'JUEGO',
    rotulo: 'Convierte el\nsufrimiento\nen juego.',
    voz: 'Así que convierte tu sufrimiento académico en un videojuego.',
    imagen: CAP('02-hub.png'),
    montaje:
      'El mapa de campaña: nodos, actos, progreso. Es el plano que dice ' +
      '«videojuego» sin tener que decirlo. Un empuje lento hacia el nodo actual.',
  },
  {
    n: 5, desde: '0:13', hasta: '0:16', fuente: 'JUEGO',
    rotulo: 'EVAGAMEPROCE',
    voz: 'EVAGAMEPROCE.',
    imagen: CAP('01-portada.png'),
    montaje:
      'El revelado. Corte a negro de 3 fotogramas y entra la portada con un ' +
      'golpe de sonido. Es el único momento del video con silencio antes. ' +
      'Sobreimprimir evagameproce.vercel.app en mono, debajo del título.',
  },
  {
    n: 6, desde: '0:16', hasta: '0:21', fuente: 'CLIP',
    rotulo: 'Tu cerebro\norgánico,\na prueba.',
    voz: 'Un juego diseñado para poner a prueba tu cerebro orgánico…',
    imagen: CAP('10-oral.png'),
    clip: 'clips/oral.mp4',
    montaje:
      'La interrogación oral: tres examinadores atacando en cadena. Aquí entra ' +
      'movimiento de verdad — usar el clip, no la captura fija. Los puntos ' +
      'suspensivos son una pausa real: la frase no termina hasta la escena 7.',
  },
  {
    n: 7, desde: '0:21', hasta: '0:26', fuente: 'CLIP',
    rotulo: '¿Cuánto sabes\nrealmente?',
    voz: 'Y descubrir cuánto sabes realmente.',
    imagen: CAP('04-mision.png'),
    clip: 'clips/mision.mp4',
    montaje:
      'Pregunta con las alternativas todavía neutras. El espectador elige en su ' +
      'cabeza. Dejarla en pantalla lo suficiente para que alcance a leerla: ' +
      'si no la lee, la escena 8 no funciona.',
  },
  {
    n: 8, desde: '0:26', hasta: '0:30', fuente: 'CLIP',
    rotulo: 'O cuánto\ncreías saber.',
    voz: 'O cuánto creías saber.',
    imagen: CAP('07-examen-fb.png'),
    clip: 'clips/examen.mp4',
    montaje:
      'El plano que vende el juego: la X roja sobre la respuesta que el ' +
      'espectador acaba de elegir. Sincronizar el destello rojo con la palabra ' +
      '«creías». Un fotograma de blanco al 15 % ayuda al golpe.',
  },
  {
    n: 9, desde: '0:30', hasta: '0:36', fuente: 'AVATAR',
    rotulo: 'Juega gratis.',
    voz: 'Juega gratis. Y sígueme para aprender a crear prototipos como este.',
    imagen: PIEZA('avatar-medio.png'),
    montaje:
      'Vuelve el avatar, ahora de frente y sin ironía: es la única frase sincera ' +
      'del video y tiene que sonar distinta. El juego sigue corriendo en un ' +
      'círculo pequeño. Sobreimprimir evagameproce.vercel.app en mono cian.',
  },
  {
    n: 10, desde: '0:36', hasta: '0:40', fuente: 'AVATAR',
    rotulo: 'Link en la bio.\nEva fuera.',
    voz: 'Link en la bio. Eva fuera.',
    imagen: PIEZA('avatar-cerrado.png'),
    montaje:
      'Cierre. «Eva fuera» y corte a negro en el mismo fotograma — sin fundido, ' +
      'sin pantalla final de tres segundos: eso mata el bucle. El video tiene ' +
      'que volver a empezar antes de que el espectador decida irse.',
  },
];

const OPCIONAL = {
  n: '8B', desde: '0:30', hasta: '0:34', fuente: 'CLIP',
  rotulo: '13 mundos.\nCédula, oral\ny códex.',
  voz: 'Trece mundos. Cédula, oral y códex. Todo el procesal civil, gratis.',
  imagen: CAP('03-mundos.png'),
  clip: 'clips/mundos.mp4',
  montaje:
    'OPCIONAL — no está en tu guion. Añade 4 segundos y da la prueba de que ' +
    'esto no es una demo de tres preguntas. Si el video se va de 45 segundos, ' +
    'esta es la primera que se cae. Va entre la 8 y la 9.',
};

// ── Piezas de composición ──────────────────────────────────────────────────

// El fotograma se divide en tres franjas, y cada una tiene un dueño:
//   arriba (hasta BANDA_ALTA)  · rótulo de escena — casi opaco
//   centro                     · la imagen, intacta
//   abajo (desde SEGURO_ABAJO) · anotación de guion — opaco del todo
// Entre el centro y la franja de abajo va el velo, que sube hasta tapar: es lo
// que permite escribir texto blanco encima de una interfaz que ya tiene el suyo.
const BANDA_ALTA = 1.45;

/** Fotograma a sangre, con las franjas que dejan leer lo escrito encima. */
function fotograma(slide, imagen, { anotado = true } = {}) {
  slide.background = { color: C.fondo };
  slide.addImage({ path: imagen, x: 0, y: 0, w: W, h: H });
  slide.addImage({ path: PIEZA('velo.png'), x: 0, y: 7.15, w: W, h: SEGURO_ABAJO - 7.15 });
  slide.addShape('rect', {
    x: 0, y: 0, w: W, h: BANDA_ALTA,
    fill: { color: C.fondo }, line: { color: C.fondo, width: 0 },
  });
  if (anotado) {
    slide.addShape('rect', {
      x: 0, y: SEGURO_ABAJO, w: W, h: H - SEGURO_ABAJO,
      fill: { color: C.fondo }, line: { color: C.fondo, width: 0 },
    });
  }
}

/** Rótulo de escena: el mismo sitio y el mismo aire en todas. */
function cabecera(slide, izq, der, bajo) {
  slide.addText(izq, {
    x: MARGEN, y: 0.5, w: ANCHO_TEXTO / 2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 12, bold: true, color: C.cian, charSpacing: 2,
  });
  slide.addText(der, {
    x: MARGEN + ANCHO_TEXTO / 2, y: 0.5, w: ANCHO_TEXTO / 2 - 0.95, h: 0.3,
    isTextBox: true, margin: 0, align: 'right',
    fontFace: MONO, fontSize: 12, color: C.tenue, charSpacing: 1,
  });
  slide.addText(bajo, {
    x: MARGEN, y: 0.84, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10, color: C.apagado, charSpacing: 1.5,
  });
}

function escena(pres, e, opcional = false) {
  const slide = pres.addSlide();
  fotograma(slide, e.imagen);

  const etiqueta = opcional ? `ESCENA ${e.n} · OPCIONAL` : `ESCENA ${String(e.n).padStart(2, '0')}`;
  cabecera(slide, etiqueta, `${e.desde} – ${e.hasta}`,
    `EN PANTALLA: ${e.fuente}${e.clip ? `  ·  ${e.clip}` : ''}`);

  // El número de escena, grande y apagado: el motivo que se repite.
  slide.addText(String(e.n), {
    x: W - MARGEN - 0.95, y: 0.42, w: 0.95, h: 0.8, isTextBox: true, margin: 0,
    align: 'right', valign: 'top', fontFace: MONO, fontSize: 38, bold: true,
    color: C.fantasma,
  });

  // El texto que va escrito en el video. Nunca baja de la zona segura.
  slide.addText(e.rotulo, {
    x: MARGEN, y: 8.5, w: ANCHO_TEXTO, h: 1.85, isTextBox: true, margin: 0,
    valign: 'bottom', fontFace: DISPLAY, fontSize: 36, bold: true,
    color: opcional ? C.dorado : C.blanco, lineSpacing: 42,
  });

  // Debajo de la zona segura: la anotación de guion, que no va al video.
  slide.addText('VOZ', {
    x: MARGEN, y: SEGURO_ABAJO + 0.3, w: ANCHO_TEXTO, h: 0.26, isTextBox: true,
    margin: 0, fontFace: MONO, fontSize: 10, color: C.violeta, charSpacing: 2,
  });
  slide.addText(`«${e.voz}»`, {
    x: MARGEN, y: SEGURO_ABAJO + 0.6, w: ANCHO_TEXTO, h: 1.5, isTextBox: true,
    margin: 0, fontFace: CUERPO, fontSize: 15, italic: true, color: C.papel,
    lineSpacing: 21,
  });
  slide.addText(path.basename(e.imagen), {
    x: MARGEN, y: H - 0.48, w: ANCHO_TEXTO, h: 0.25, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: C.apagado,
  });

  slide.addNotes(
    `ESCENA ${e.n} · ${e.desde}–${e.hasta}\n\n` +
    `VOZ (pegar en HeyGen, literal):\n${e.voz}\n\n` +
    `EN PANTALLA: ${e.rotulo.replace(/\n/g, ' ')}\n\n` +
    `IMAGEN: ${path.relative(path.join(__dirname, '..'), e.imagen)}\n` +
    (e.clip ? `CLIP: scripts/video/${e.clip}\n` : '') +
    `\nMONTAJE:\n${e.montaje}`
  );
}

/** Fondo liso para las diapositivas de referencia, que no son fotogramas. */
function anexo(pres, titulo, entradilla) {
  const slide = pres.addSlide();
  slide.background = { color: C.fondo };
  slide.addText('ANEXO', {
    x: MARGEN, y: 0.62, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 11, bold: true, color: C.violeta, charSpacing: 3,
  });
  slide.addText(titulo, {
    x: MARGEN, y: 0.98, w: ANCHO_TEXTO, h: 1.2, isTextBox: true, margin: 0,
    valign: 'top', fontFace: DISPLAY, fontSize: 34, bold: true, color: C.blanco,
    lineSpacing: 40,
  });
  slide.addText(entradilla, {
    x: MARGEN, y: 2.28, w: ANCHO_TEXTO, h: 0.95, isTextBox: true, margin: 0,
    fontFace: CUERPO, fontSize: 15, color: C.tenue, lineSpacing: 21,
  });
  return slide;
}

/** Tarjeta: tinte suave del color, sin filos de color (quedan a plantilla). */
function tarjeta(slide, { x, y, w, h, color }) {
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: C.aceite },
    line: { color, width: 0.75, transparency: 55 },
  });
}


// ── Portada ────────────────────────────────────────────────────────────────
function portada(pres) {
  const slide = pres.addSlide();
  fotograma(slide, CAP('01-portada.png'));
  slide.addText('GUION · STORYBOARD · DIRECCIÓN DE ARTE', {
    x: MARGEN, y: 0.5, w: ANCHO_TEXTO, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 11, bold: true, color: C.cian, charSpacing: 2.5,
  });
  slide.addText('EVAGAMEPROCE', {
    x: MARGEN, y: 8.15, w: ANCHO_TEXTO, h: 0.95, isTextBox: true, margin: 0,
    fontFace: DISPLAY, fontSize: 40, bold: true, color: C.blanco, charSpacing: 1,
  });
  slide.addText('Un video vertical de 40 segundos', {
    x: MARGEN, y: 9.08, w: ANCHO_TEXTO, h: 0.5, isTextBox: true, margin: 0,
    fontFace: DISPLAY, fontSize: 22, italic: true, color: C.papel,
  });
  slide.addText(
    [
      { text: 'FORO [in]VISIBLE', options: { color: C.papel, bold: true, breakLine: true } },
      { text: 'Una experiencia EVA de Proyecto01 · Creada por Diego Ojeda', options: { color: C.tenue } },
    ],
    { x: MARGEN, y: 9.62, w: ANCHO_TEXTO, h: 0.74, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 14, lineSpacing: 20 },
  );
  slide.addText('10 ESCENAS  ·  1080 × 1920  ·  evagameproce.vercel.app', {
    x: MARGEN, y: SEGURO_ABAJO + 0.36, w: ANCHO_TEXTO, h: 0.3, isTextBox: true,
    margin: 0, fontFace: MONO, fontSize: 11, color: C.cian, charSpacing: 1,
  });
  slide.addNotes(
    'Deck de producción del video de lanzamiento de EVAGAMEPROCE.\n\n' +
    'Las diapositivas 3 a 12 son las escenas, al tamaño real del video. ' +
    'La 13 es una escena opcional. De la 14 en adelante es referencia: ' +
    'no va al video.\n\n' +
    'Todas las capturas salen del juego de verdad, no son maquetas: ' +
    'las genera scripts/video/capturar.js sobre el build de producción.'
  );
}

// ── Cómo usar el deck ──────────────────────────────────────────────────────
function comoUsar(pres) {
  const slide = anexo(pres, 'Cómo usar esto',
    'No es una presentación: es el plano de montaje. Cada diapositiva de escena ' +
    'está al tamaño exacto del video, así que lo que ves encuadrado es lo que ' +
    'queda encuadrado.');

  const filas = [
    ['3 – 12', 'Las diez escenas', 'Una por línea del guion. El texto grande es lo que va escrito en pantalla; lo de abajo, entre comillas, es lo que lee HeyGen. Las notas del orador traen la indicación de montaje.', C.cian],
    ['13', 'Escena opcional', 'No está en tu guion. Suma cuatro segundos de prueba de que el juego tiene fondo. Es la primera que se cae si el video se alarga.', C.dorado],
    ['14 – 17', 'Referencia', 'Paleta, tipografía, encuadre, pasos de HeyGen y dónde quedó cada archivo. Esto no va al video.', C.violeta],
  ];
  let y = 3.45;
  for (const [rango, titulo, texto, color] of filas) {
    tarjeta(slide, { x: MARGEN, y, w: ANCHO_TEXTO, h: 2.0, color });
    slide.addText(`DIAPOSITIVAS ${rango}`, {
      x: MARGEN + 0.32, y: y + 0.26, w: ANCHO_TEXTO - 0.64, h: 0.26,
      isTextBox: true, margin: 0, fontFace: MONO, fontSize: 10, bold: true,
      color, charSpacing: 2,
    });
    slide.addText(titulo, {
      x: MARGEN + 0.32, y: y + 0.56, w: ANCHO_TEXTO - 0.64, h: 0.4,
      isTextBox: true, margin: 0, fontFace: DISPLAY, fontSize: 20, bold: true,
      color: C.blanco,
    });
    slide.addText(texto, {
      x: MARGEN + 0.32, y: y + 1.0, w: ANCHO_TEXTO - 0.64, h: 0.88,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 13,
      color: C.tenue, lineSpacing: 18,
    });
    y += 2.25;
  }

  slide.addText('Duración total: 40 segundos. 45 con la escena opcional.', {
    x: MARGEN, y: 10.5, w: ANCHO_TEXTO, h: 0.35, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 12, color: C.cian,
  });
  slide.addNotes(
    'Para exportar el video desde PowerPoint: Archivo → Exportar → Crear un ' +
    'video, y elegir sólo las escenas. Pero lo normal es lo otro: usar estas ' +
    'diapositivas como referencia y montar en HeyGen + CapCut, que es lo que ' +
    'describe el anexo de montaje.'
  );
}

// ── Dirección artística ────────────────────────────────────────────────────
function direccionArtistica(pres) {
  const slide = anexo(pres, 'Dirección artística',
    'Una sola regla lo resume: el video y el juego tienen que parecer la misma ' +
    'cosa. Si el espectador toca el link y aterriza en algo que no se parece a ' +
    'lo que vio, el video no sirvió de nada.');

  slide.addText('PALETA — LA DEL JUEGO, SIN INVENTAR NINGUNA', {
    x: MARGEN, y: 3.52, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10, bold: true, color: C.violeta, charSpacing: 2,
  });

  const paleta = [
    ['06070B', 'Fondo', 'todo el video'],
    ['4BE7FF', 'Cian', 'acento, luz principal'],
    ['8A5CFF', 'Violeta', 'contraluz, recursos'],
    ['E8DFC5', 'Papel', 'texto de lectura'],
    ['58F5B0', 'Verde', 'acierto'],
    ['D94A4A', 'Rojo', 'error'],
  ];
  const cw = (ANCHO_TEXTO - 0.3 * 2) / 3;
  paleta.forEach(([hex, nombre, uso], i) => {
    const x = MARGEN + (i % 3) * (cw + 0.3);
    const y = 3.9 + Math.floor(i / 3) * 1.55;
    slide.addShape('roundRect', {
      x, y, w: cw, h: 0.72, rectRadius: 0.07,
      fill: { color: hex },
      line: { color: hex === '06070B' ? C.apagado : hex, width: 0.75 },
    });
    slide.addText(nombre, {
      x, y: y + 0.8, w: cw, h: 0.26, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 13, bold: true, color: C.blanco,
    });
    slide.addText(`#${hex}`, {
      x, y: y + 1.04, w: cw, h: 0.24, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 10, color: C.cian,
    });
    slide.addText(uso, {
      x, y: y + 1.26, w: cw, h: 0.24, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 11, color: C.apagado,
    });
  });

  slide.addText('TIPOGRAFÍA', {
    x: MARGEN, y: 7.22, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10, bold: true, color: C.violeta, charSpacing: 2,
  });
  slide.addText(
    [
      { text: 'Cinzel', options: { bold: true, color: C.blanco } },
      { text: '  —  títulos en pantalla. Gravedad institucional.', options: { color: C.tenue, breakLine: true } },
      { text: 'JetBrains Mono', options: { bold: true, color: C.blanco } },
      { text: '  —  rótulos, URL, cifras, subtítulos.', options: { color: C.tenue, breakLine: true } },
      { text: 'Inter', options: { bold: true, color: C.blanco } },
      { text: '  —  cualquier párrafo largo.', options: { color: C.tenue, breakLine: true } },
      { text: 'Las tres son gratis en Google Fonts. Instálalas antes de montar: este deck usa sustitutas para que abra en cualquier PowerPoint.', options: { color: C.apagado, italic: true, fontSize: 12 } },
    ],
    { x: MARGEN, y: 7.56, w: ANCHO_TEXTO, h: 1.55, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 14, lineSpacing: 21 },
  );

  slide.addText('CINCO REGLAS', {
    x: MARGEN, y: 9.3, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10, bold: true, color: C.violeta, charSpacing: 2,
  });
  const reglas = [
    'Nada blanco, ni un fotograma. El fondo del avatar es el negro del juego, no el de HeyGen.',
    'El neón ilumina, no decora: cian de frente, violeta de contraluz. Dos fuentes, no cinco.',
    'Grano y líneas de barrido al 8 % sobre todo, avatar incluido: es lo que hace que el render y el juego parezcan filmados con la misma cámara.',
    'Un corte por frase. El avatar nunca está solo más de cuatro segundos.',
    'Cero emoji, cero flechas animadas, cero robot genérico de fondo: el juego ya trae iconografía propia, y es jurídica.',
  ];
  slide.addText(
    reglas.map((r, i) => ({ text: r, options: { bullet: true, breakLine: i < reglas.length - 1 } })),
    { x: MARGEN, y: 9.64, w: ANCHO_TEXTO, h: 3.2, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 12.5, color: C.papel, lineSpacing: 17,
      paraSpaceAfter: 6 },
  );

  slide.addNotes(
    'DECISIÓN PENDIENTE, Y NO ES MENOR.\n\n' +
    'lib/brand.ts dice, a propósito y por escrito, que EVA no tiene rostro ni ' +
    'apariencia humana, y que el monograma de EvaMark.tsx es un tratamiento ' +
    'provisional. El avatar de HeyGen le pone una cara, y el guion cierra con ' +
    '«Eva fuera»: eso la convierte en personaje.\n\n' +
    'Hay dos caminos coherentes, y el peor es no elegir:\n\n' +
    '1. El avatar ES Eva. Entonces deja de ser provisional: se registra en ' +
    'lib/brand.ts (EVA.assetSrc) y el juego y el video usan la misma imagen.\n\n' +
    '2. El avatar presenta el juego, pero no es Eva. Entonces el guion no puede ' +
    'cerrar con «Eva fuera» — bastaría cambiar esa línea.\n\n' +
    'Si eliges 1 y no tocas el repositorio, la cara vive sólo en Instagram y el ' +
    'juego sigue mostrando un monograma abstracto: dos marcas distintas para la ' +
    'misma cosa.'
  );
}

// ── Encuadre 9:16 ──────────────────────────────────────────────────────────
function encuadre(pres) {
  const slide = anexo(pres, 'Encuadre y zonas seguras',
    'El video se ve en un teléfono con la interfaz de la app encima. Todo lo ' +
    'que importa vive en la franja central; el resto lo tapan los botones.');

  const dw = 2.45, dh = dw * 16 / 9, dx = MARGEN, dy = 3.78;
  slide.addShape('rect', { x: dx, y: dy, w: dw, h: dh,
    fill: { color: C.aceite }, line: { color: C.apagado, width: 1 } });

  const arriba = dh * (250 / 1920);
  const abajo = dh * (420 / 1920);
  slide.addShape('rect', { x: dx, y: dy, w: dw, h: arriba,
    fill: { color: C.rojo, transparency: 78 }, line: { color: C.rojo, width: 0.5, transparency: 55 } });
  slide.addShape('rect', { x: dx, y: dy + dh - abajo, w: dw, h: abajo,
    fill: { color: C.rojo, transparency: 78 }, line: { color: C.rojo, width: 0.5, transparency: 55 } });
  slide.addShape('rect', { x: dx, y: dy + arriba, w: dw, h: dh - arriba - abajo,
    fill: { color: C.cian, transparency: 92 }, line: { color: C.cian, width: 0.75, transparency: 60 } });

  slide.addText('ZONA\nSEGURA', {
    x: dx, y: dy + dh / 2 - 0.35, w: dw, h: 0.7, isTextBox: true, margin: 0,
    align: 'center', fontFace: MONO, fontSize: 11, bold: true, color: C.cian,
    charSpacing: 2, lineSpacing: 16,
  });
  slide.addText('1080 × 1920', {
    x: dx, y: dy - 0.36, w: dw, h: 0.3, isTextBox: true, margin: 0,
    align: 'center', fontFace: MONO, fontSize: 11, color: C.tenue, charSpacing: 1,
  });
  const etiquetas = [
    [dy + arriba / 2 - 0.32, '250 px arriba', 'Nombre de cuenta y controles de la app.', C.rojo],
    [dy + dh / 2 - 0.5, 'Aquí va todo', 'Rótulos, subtítulos, cara del avatar y el remate del juego.', C.cian],
    [dy + dh - abajo / 2 - 0.45, '420 px abajo', 'Descripción, sonido, botones de compartir y guardar.', C.rojo],
  ];
  for (const [ey, titulo, texto, color] of etiquetas) {
    slide.addText(titulo, {
      x: dx + dw + 0.3, y: ey, w: W - dx - dw - 0.3 - MARGEN, h: 0.3,
      isTextBox: true, margin: 0, fontFace: MONO, fontSize: 11, bold: true,
      color, charSpacing: 1,
    });
    slide.addText(texto, {
      x: dx + dw + 0.3, y: ey + 0.3, w: W - dx - dw - 0.3 - MARGEN, h: 0.7,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 12, color: C.tenue,
      lineSpacing: 16,
    });
  }

  const puntos = [
    ['Avatar solo', 'Encuadre de pecho para arriba, ojos a un tercio de la altura. Nunca centrado: deja aire para el texto abajo.'],
    ['Juego a pantalla completa', 'Las capturas ya son 1080 × 1920: entran sin recortar ni escalar. No las metas en un marco de teléfono, resta pantalla.'],
    ['Avatar sobre el juego', 'Círculo de 300 px abajo a la izquierda, borde cian de 3 px. Nunca abajo a la derecha: ahí van los botones de la app.'],
    ['Subtítulos', 'Entre el 62 % y el 78 % de la altura. Mono, mayúsculas, fondo negro al 55 %, dos líneas como máximo.'],
  ];
  let y = dy + dh + 0.42;
  for (const [titulo, texto] of puntos) {
    slide.addText(titulo, {
      x: MARGEN, y, w: ANCHO_TEXTO, h: 0.3, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 15, bold: true, color: C.cian,
    });
    slide.addText(texto, {
      x: MARGEN, y: y + 0.29, w: ANCHO_TEXTO, h: 0.62, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 13, color: C.tenue, lineSpacing: 18,
    });
    y += 1.06;
  }
  slide.addNotes(
    'Las medidas son para Instagram Reels y TikTok. YouTube Shorts tapa algo ' +
    'menos abajo, pero si respetas estas dos franjas sirve en las tres sin ' +
    'volver a montar nada.'
  );
}

// ── Montaje ────────────────────────────────────────────────────────────────
function montaje(pres) {
  const slide = anexo(pres, 'Cómo montarlo',
    'HeyGen pone la cara y la voz. El resto — el ritmo, que es lo que decide si ' +
    'el video funciona — se hace después, en el editor.');

  const pasos = [
    ['Formato vertical primero', 'Deja el proyecto en 9:16 antes de escribir nada: cambiarlo después reencuadra el avatar y hay que rehacer las diez escenas.'],
    ['Una escena por línea', 'Diez escenas, no una con todo el texto: es la única forma de controlar las pausas.'],
    ['Fondo negro, no el de HeyGen', 'Sube un PNG liso #06070B de fondo. Los de oficina futurista que trae por defecto son justo lo que el juego no es.'],
    ['Voz seca y algo lenta', 'Velocidad ~0,95: la ironía necesita aire. Escucha «Qué adorable» aislado antes de dar la voz por buena.'],
    ['Exporta el avatar y móntalo aparte', 'Saca el render a 1080 × 1920 y llévalo a CapCut o DaVinci: ahí van encima las capturas y los clips.'],
    ['Grano, scanlines y color', 'Grano al 8 % y líneas de barrido finas sobre TODO, avatar incluido: es lo que funde las dos fuentes de imagen en una.'],
    ['Subtítulos quemados', 'La mayoría lo ve sin sonido. Quemados: los de la plataforma traen su propia tipografía y rompen el conjunto.'],
    ['Sonido', 'El juego genera su audio por Web Audio API: no hay archivos que sacar. Grábalo de pantalla, o usa una base oscura y sube el golpe sólo en el revelado.'],
  ];

  let y = 3.32;
  pasos.forEach(([titulo, texto], i) => {
    slide.addShape('ellipse', {
      x: MARGEN, y: y + 0.02, w: 0.42, h: 0.42,
      fill: { color: C.aceite }, line: { color: C.cian, width: 0.75 },
    });
    slide.addText(String(i + 1), {
      x: MARGEN, y: y + 0.05, w: 0.42, h: 0.36, isTextBox: true, margin: 0,
      align: 'center', fontFace: MONO, fontSize: 13, bold: true, color: C.cian,
    });
    slide.addText(titulo, {
      x: MARGEN + 0.62, y: y + 0.02, w: ANCHO_TEXTO - 0.62, h: 0.3,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 15, bold: true,
      color: C.blanco,
    });
    slide.addText(texto, {
      x: MARGEN + 0.62, y: y + 0.31, w: ANCHO_TEXTO - 0.62, h: 0.7,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 12.5, color: C.tenue,
      lineSpacing: 17,
    });
    y += 1.16;
  });

  slide.addNotes(
    'Lo que decide si un reel funciona no es el avatar: es el ritmo. Diez cortes ' +
    'en cuarenta segundos. Si una escena se siente larga al verla, lo está.'
  );
}

// ── Materiales ─────────────────────────────────────────────────────────────
function materiales(pres) {
  const slide = anexo(pres, 'Los materiales',
    'Todo sale del juego de verdad, corriendo sobre el build de producción. ' +
    'Ninguna captura está maquetada, y se pueden volver a generar cuando el ' +
    'juego cambie.');

  const bloques = [
    ['18 capturas · 1080 × 1920', 'scripts/video/capturas/vertical/', C.cian,
      'Portada, hub, mundos, misión, examen con su acierto y su error, repaso, códex, oral, creación, expediente, las tres expansiones, plazos, cartas y verdadero o falso.'],
    ['18 capturas · 1920 × 1080', 'scripts/video/capturas/ancho/', C.violeta,
      'Las mismas pantallas en horizontal, por si sale una versión para YouTube o una presentación.'],
    ['6 clips · 1080 × 1920 · H.264', 'scripts/video/clips/', C.verde,
      'Juego en movimiento: cédula respondida y explicada, desafío de misión, recorrido de mundos, mapa de campaña, códex y minijuego de plazos. En .mp4 y en .webm.'],
  ];
  let y = 3.45;
  for (const [titulo, ruta, color, texto] of bloques) {
    tarjeta(slide, { x: MARGEN, y, w: ANCHO_TEXTO, h: 1.95, color });
    slide.addText(titulo, {
      x: MARGEN + 0.32, y: y + 0.24, w: ANCHO_TEXTO - 0.64, h: 0.32,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 16, bold: true,
      color: C.blanco,
    });
    slide.addText(ruta, {
      x: MARGEN + 0.32, y: y + 0.58, w: ANCHO_TEXTO - 0.64, h: 0.28,
      isTextBox: true, margin: 0, fontFace: MONO, fontSize: 11, color,
    });
    slide.addText(texto, {
      x: MARGEN + 0.32, y: y + 0.9, w: ANCHO_TEXTO - 0.64, h: 0.9,
      isTextBox: true, margin: 0, fontFace: CUERPO, fontSize: 12.5,
      color: C.tenue, lineSpacing: 17,
    });
    y += 2.2;
  }

  slide.addText('VOLVER A GENERARLO TODO', {
    x: MARGEN, y: 10.25, w: ANCHO_TEXTO, h: 0.28, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10, bold: true, color: C.violeta, charSpacing: 2,
  });
  slide.addText(
    'npm ci && npm run build\n' +
    'npx next start -p 3100\n' +
    'node scripts/video/capturar.js\n' +
    'node scripts/video/clips.js',
    { x: MARGEN, y: 10.6, w: ANCHO_TEXTO, h: 1.35, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 12, color: C.papel, lineSpacing: 19 },
  );
  slide.addText(
    'Usan la partida de prueba del arnés de verificación: no tocan una partida personal.',
    { x: MARGEN, y: 12.0, w: ANCHO_TEXTO, h: 0.55, isTextBox: true, margin: 0,
      fontFace: CUERPO, fontSize: 12, italic: true, color: C.apagado, lineSpacing: 17 },
  );
  slide.addNotes(
    'Los clips salen en .mp4 (H.264) si hay un ffmpeg completo instalado. El que ' +
    'trae Playwright sólo hace VP8 y no sirve: instala uno de verdad ' +
    '(brew install ffmpeg en macOS, winget install ffmpeg en Windows). Si no, ' +
    'quedan en .webm, que CapCut y DaVinci abren igual.'
  );
}

// ── Montaje del archivo ────────────────────────────────────────────────────
const pres = new pptxgen();
pres.defineLayout({ name: 'VERTICAL', width: W, height: H });
pres.layout = 'VERTICAL';
pres.author = 'Diego Ojeda';
pres.company = 'Proyecto01';
pres.title = 'EVAGAMEPROCE — guion, storyboard y dirección de arte';
pres.subject = 'Video vertical de lanzamiento · FORO [in]VISIBLE';

portada(pres);
comoUsar(pres);
for (const e of ESCENAS) escena(pres, e);
escena(pres, OPCIONAL, true);
direccionArtistica(pres);
encuadre(pres);
montaje(pres);
materiales(pres);

const destino = path.join(__dirname, 'EVAGAMEPROCE-video.pptx');
pres.writeFile({ fileName: destino }).then(() => {
  console.log(`✓ ${destino}`);
  console.log(`  ${2 + ESCENAS.length + 1 + 4} diapositivas · ${W}" × ${H}" (9:16)`);
});
