// ============================================================================
// SISTEMA DE AUDIO SINTETIZADO — Web Audio API
// Sin archivos externos. Todo se sintetiza al vuelo.
// SFX procesales: click táctico, hover holográfico, warnings, casación exitosa,
// inadmisibilidad, glitch fatal, oral correcta, terminal beep.
// AMBIENTES: drone grave, lluvia digital, murmullo tribunalicio.
// ============================================================================

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function ctx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(audioCtx.destination);
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (typeof window !== "undefined") localStorage.setItem("rpgproce-audio-muted", m ? "1" : "0");
  if (masterGain) masterGain.gain.value = m ? 0 : 0.35;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("rpgproce-audio-muted") === "1";
}

// Inicializa según localStorage
if (typeof window !== "undefined") {
  muted = isMuted();
}

// ─────────────────────────── HELPER GENÉRICO ───────────────────────────
function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, attack = 0.01, decay = 0.1) {
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + attack + decay);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + attack + decay + 0.05);
}

function sweep(fromHz: number, toHz: number, dur: number, type: OscillatorType = "sawtooth", vol = 0.15) {
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromHz, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(toHz, c.currentTime + dur);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + dur + 0.05);
}

function noiseBurst(dur: number, vol = 0.12, filterFreq = 1200) {
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start();
}

// ─────────────────────────── SFX DE UI ───────────────────────────
export const sfx = {
  // Click táctico procesal — pulso corto + click sintético
  click: () => {
    tone(880, 0.04, "square", 0.06, 0.001, 0.04);
    tone(1320, 0.04, "sine", 0.04, 0.001, 0.05);
  },

  // Hover holográfico — frecuencia ligera ascendente
  hover: () => {
    sweep(700, 1100, 0.08, "sine", 0.04);
  },

  // Confirmación procesal — dos tonos ascendentes
  confirm: () => {
    tone(523, 0.08, "triangle", 0.12, 0.005, 0.08);
    setTimeout(() => tone(784, 0.12, "triangle", 0.1, 0.005, 0.12), 70);
  },

  // Warning doctrinal — tono medio con leve disonancia
  warning: () => {
    tone(440, 0.15, "sawtooth", 0.1, 0.01, 0.15);
    tone(466, 0.15, "sawtooth", 0.08, 0.01, 0.15);
  },

  // Inadmisibilidad — distorsión grave descendente
  inadmisible: () => {
    sweep(380, 120, 0.4, "sawtooth", 0.18);
    noiseBurst(0.3, 0.1, 800);
  },

  // Casación exitosa — expansión sonora ascendente armónica
  casacion: () => {
    tone(523, 0.15, "triangle", 0.1, 0.005, 0.2);
    setTimeout(() => tone(659, 0.15, "triangle", 0.1, 0.005, 0.2), 80);
    setTimeout(() => tone(784, 0.3, "triangle", 0.12, 0.005, 0.4), 160);
    setTimeout(() => tone(1047, 0.5, "triangle", 0.1, 0.005, 0.5), 280);
  },

  // Glitch violento — error fatal
  glitch: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        tone(80 + Math.random() * 400, 0.04, "square", 0.18, 0.001, 0.04);
        noiseBurst(0.05, 0.12, 400 + Math.random() * 1200);
      }, i * 40);
    }
  },

  // Oral correcta — resonancia elegante
  oralCorrecta: () => {
    tone(440, 0.2, "sine", 0.12, 0.01, 0.3);
    setTimeout(() => tone(880, 0.4, "sine", 0.08, 0.05, 0.4), 120);
  },

  // Oral incorrecta — distorsión grave breve
  oralIncorrecta: () => {
    sweep(280, 140, 0.3, "sawtooth", 0.15);
  },

  // Boot — secuencia de inicialización
  boot: () => {
    sweep(80, 600, 0.6, "sawtooth", 0.1);
    setTimeout(() => {
      tone(880, 0.05, "square", 0.08);
      tone(1320, 0.05, "square", 0.06);
    }, 400);
  },

  // Terminal beep
  beep: () => tone(1200, 0.03, "square", 0.06, 0.001, 0.03),

  // Combo arcade
  combo: (nivel: number) => {
    const base = 523 + nivel * 60;
    tone(base, 0.06, "triangle", 0.1, 0.001, 0.08);
    setTimeout(() => tone(base * 1.5, 0.08, "triangle", 0.08, 0.001, 0.1), 40);
  },

  // Plazo crítico — pulso de alarma
  plazoCritico: () => {
    tone(880, 0.08, "square", 0.12, 0.001, 0.08);
    setTimeout(() => tone(440, 0.12, "square", 0.1, 0.001, 0.12), 100);
  },

  // Boss aparece
  bossEntrada: () => {
    sweep(40, 110, 1.2, "sawtooth", 0.18);
    setTimeout(() => noiseBurst(0.8, 0.06, 200), 200);
  },

  // Power-up — arpegio brillante ascendente (subir de nivel)
  powerUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => tone(f, 0.12, "triangle", 0.12, 0.005, 0.14), i * 70));
  },

  // Select — blip nítido de dos tonos (elegir opción/avatar)
  select: () => {
    tone(740, 0.05, "square", 0.08, 0.001, 0.05);
    setTimeout(() => tone(1100, 0.06, "square", 0.06, 0.001, 0.06), 45);
  },

  // Whoosh — barrido filtrado (transición / entrar a región)
  whoosh: () => {
    sweep(180, 900, 0.35, "sine", 0.1);
    noiseBurst(0.3, 0.05, 1400);
  },

  // Unlock — campanita de tesoro (artículo desbloqueado)
  unlock: () => {
    tone(880, 0.1, "triangle", 0.1, 0.005, 0.12);
    setTimeout(() => tone(1320, 0.14, "triangle", 0.1, 0.005, 0.18), 90);
    setTimeout(() => tone(1760, 0.3, "sine", 0.08, 0.01, 0.35), 180);
  },

  // ── Paleta de navegación ──────────────────────────────────────────────
  // Antes todo sonaba a `click`: abrir un modal, elegir una alternativa,
  // navegar y confirmar compartían el mismo golpe. Estos cuatro separan la
  // intención, que es lo que el oído usa para orientarse.

  /** Ir a otra pantalla. Seco y bajo: acompaña, no celebra. */
  tap: () => {
    tone(620, 0.03, "square", 0.045, 0.001, 0.03);
    tone(930, 0.025, "sine", 0.025, 0.001, 0.035);
  },

  /** Volver atrás. El mismo gesto que `tap`, pero descendente. */
  back: () => {
    tone(720, 0.03, "square", 0.04, 0.001, 0.03);
    setTimeout(() => tone(480, 0.05, "sine", 0.035, 0.001, 0.05), 35);
  },

  /** Abrir una ventana o ficha: aire que entra. */
  abrir: () => {
    sweep(320, 760, 0.16, "sine", 0.055);
  },

  /** Cerrarla: el mismo aire, al revés y más corto. */
  cerrar: () => {
    sweep(700, 300, 0.13, "sine", 0.05);
  },

  /** Error recuperable: no es una nulidad, es un «eso no». */
  error: () => {
    tone(300, 0.09, "square", 0.075, 0.002, 0.09);
    setTimeout(() => tone(225, 0.13, "square", 0.06, 0.002, 0.13), 80);
  },

  /** Subida de nivel: el arpegio de `powerUp` con una cola de campana. */
  subidaNivel: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => tone(f, 0.12, "triangle", 0.11, 0.005, 0.14), i * 70));
    setTimeout(() => {
      tone(1047, 0.9, "sine", 0.07, 0.02, 1.1);
      tone(1568, 0.9, "sine", 0.04, 0.02, 1.1);
    }, 380);
  },
};

// ─────────────────────────── AMBIENTES (drones) ───────────────────────────
let droneNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode }[] = [];

export function startAmbient(modo: "ambiente" | "oral" | "ejecutivo" | "nulidad" | "recursos" = "ambiente") {
  stopAmbient();
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;

  const settings: Record<string, { freqs: number[]; vol: number; lfoRate: number }> = {
    ambiente: { freqs: [55, 82.5], vol: 0.02, lfoRate: 0.12 },
    oral: { freqs: [60, 90, 135], vol: 0.025, lfoRate: 0.3 },
    ejecutivo: { freqs: [45, 67.5], vol: 0.03, lfoRate: 0.08 },
    nulidad: { freqs: [50, 75, 110, 165], vol: 0.025, lfoRate: 0.4 },
    recursos: { freqs: [110, 165], vol: 0.025, lfoRate: 0.15 },
  };
  const s = settings[modo];

  s.freqs.forEach((f) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(s.vol, c.currentTime + 2);

    lfo.frequency.value = s.lfoRate;
    lfoGain.gain.value = s.vol * 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start();
    lfo.start();

    droneNodes.push({ osc, gain, lfo, lfoGain });
  });
}

export function stopAmbient() {
  const c = ctx();
  if (!c) return;
  droneNodes.forEach(({ osc, gain, lfo }) => {
    try {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
      setTimeout(() => {
        try { osc.stop(); lfo.stop(); } catch {}
      }, 600);
    } catch {}
  });
  droneNodes = [];
}

// ─── AMBIENTES TEMÁTICOS POR REGIÓN (Reinos del Derecho) ───────────────────
// 7 atmósferas distintas: cada bioma su drone. Aditivo, no toca el resto.
const AMBIENTE_REINOS: Record<string, { freqs: number[]; vol: number; lfoRate: number }> = {
  bosque_obligaciones: { freqs: [55, 110, 165], vol: 0.022, lfoRate: 0.1 },     // bosque cálido
  ciudad_mercantil: { freqs: [49, 73.5, 98], vol: 0.026, lfoRate: 0.18 },        // puerto, oleaje
  tierras_posesion: { freqs: [46, 92], vol: 0.024, lfoRate: 0.07 },              // viento de cañón
  mansion_sucesoria: { freqs: [50, 75, 100, 150], vol: 0.024, lfoRate: 0.35 },   // mansión inquieta
  republica_administrativa: { freqs: [60, 120, 180, 240], vol: 0.02, lfoRate: 0.5 }, // electrónico
  castillo_competencia: { freqs: [44, 66, 88], vol: 0.028, lfoRate: 0.25 },       // cavernoso
  tribunal_supremo: { freqs: [65, 130, 195], vol: 0.024, lfoRate: 0.12 },         // sacro
};

export function startAmbientReino(region: string) {
  stopAmbient();
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;
  const s = AMBIENTE_REINOS[region] ?? AMBIENTE_REINOS.bosque_obligaciones;
  s.freqs.forEach((f) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(s.vol, c.currentTime + 2);
    lfo.frequency.value = s.lfoRate;
    lfoGain.gain.value = s.vol * 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start();
    lfo.start();
    droneNodes.push({ osc, gain, lfo, lfoGain });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// AMBIENTE HIPNÓTICO — pensado para estudiar, no para ambientar una escena.
//
// El ambiente anterior eran dos senoidales y poco más. Este monta un colchón
// sostenido con las propiedades que hacen que un sonido acompañe sin robar
// atención:
//
//  · Intervalos consonantes (fundamental, quinta y octava): nada que resolver,
//    así que el oído deja de seguirlo.
//  · Pares de osciladores desafinados unas décimas de hercio. La diferencia
//    produce un batido lentísimo —una pulsación cada tres o cuatro segundos—
//    que es de donde sale la sensación envolvente.
//  · Respiración de volumen de ciclo muy largo (~20 s), por debajo del ritmo
//    de la respiración en reposo.
//  · Una capa de ruido filtrado que barre el paso bajo muy despacio: el papel
//    y la lluvia del foro.
//  · Campanas escasas y separadas, con caída larga, para marcar el paso del
//    tiempo sin sobresaltar.
//
// Todo sintetizado, sin archivos. Volumen deliberadamente bajo.
// ════════════════════════════════════════════════════════════════════════════

type NodoHipnotico = { parar: () => void };
let nodosHipnoticos: NodoHipnotico[] = [];
let temporizadorCampana: ReturnType<typeof setTimeout> | null = null;

/** Par de osciladores desafinados: su diferencia es el batido que se percibe. */
function parBatiente(c: AudioContext, destino: AudioNode, frecuencia: number, batido: number, volumen: number) {
  const mezcla = c.createGain();
  mezcla.gain.setValueAtTime(0, c.currentTime);
  mezcla.gain.linearRampToValueAtTime(volumen, c.currentTime + 6); // entrada lenta
  mezcla.connect(destino);

  const osciladores = [frecuencia, frecuencia + batido].map((f) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(mezcla);
    o.start();
    return o;
  });

  return {
    parar: () => {
      try {
        mezcla.gain.cancelScheduledValues(c.currentTime);
        mezcla.gain.linearRampToValueAtTime(0, c.currentTime + 1.6);
        setTimeout(() => osciladores.forEach((o) => { try { o.stop(); } catch {} }), 1800);
      } catch { /* contexto ya cerrado */ }
    },
  };
}

/** Ruido rosa aproximado, filtrado y con barrido lento. */
function capaDeRuido(c: AudioContext, destino: AudioNode, volumen: number) {
  const segundos = 4;
  const buffer = c.createBuffer(1, c.sampleRate * segundos, c.sampleRate);
  const datos = buffer.getChannelData(0);
  // Filtro de Voss simplificado: más energía en graves que el ruido blanco, que
  // resulta áspero a volumen bajo.
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < datos.length; i++) {
    const blanco = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + blanco * 0.0990460;
    b1 = 0.96300 * b1 + blanco * 0.2965164;
    b2 = 0.57000 * b2 + blanco * 1.0526913;
    datos[i] = (b0 + b1 + b2 + blanco * 0.1848) * 0.09;
  }

  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  fuente.loop = true;

  const filtro = c.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 420;
  filtro.Q.value = 0.7;

  // Barrido del filtro: un ciclo cada ~33 s.
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.03;
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain);
  lfoGain.connect(filtro.frequency);

  const gan = c.createGain();
  gan.gain.setValueAtTime(0, c.currentTime);
  gan.gain.linearRampToValueAtTime(volumen, c.currentTime + 8);

  fuente.connect(filtro);
  filtro.connect(gan);
  gan.connect(destino);
  fuente.start();
  lfo.start();

  return {
    parar: () => {
      try {
        gan.gain.cancelScheduledValues(c.currentTime);
        gan.gain.linearRampToValueAtTime(0, c.currentTime + 1.6);
        setTimeout(() => { try { fuente.stop(); lfo.stop(); } catch {} }, 1800);
      } catch { /* contexto ya cerrado */ }
    },
  };
}

/** Campana suelta con caída larga. */
function campana(c: AudioContext, destino: AudioNode, frecuencia: number, volumen: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  const filtro = c.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 1800;

  o.type = "triangle";
  o.frequency.value = frecuencia;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(volumen, c.currentTime + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 7); // caída larga

  o.connect(filtro);
  filtro.connect(g);
  g.connect(destino);
  o.start();
  o.stop(c.currentTime + 7.2);
}

/** La menor: grados consonantes, sin tensión que pida resolución. */
const NOTAS_CAMPANA = [220, 261.63, 329.63, 440];

/**
 * Escenas del ambiente. Una sola cama sonora, afinada distinto según dónde esté
 * el jugador: misma respiración y mismo motor, otro registro y otra tensión.
 *
 * Todas son consonantes —esto acompaña a alguien que estudia, no es una banda
 * sonora que reclame atención—; lo que cambia es la altura, la velocidad del
 * batido (cuanto más rápido, más inquieto) y cada cuánto entra una campana.
 */
export type EscenaAmbiente =
  | "estudio" | "oral" | "ejecutivo" | "nulidad" | "recursos" | "cautelares";

type AfinacionEscena = {
  /** Fundamental, quinta y octava, con su batido en Hz. */
  capas: [hz: number, batido: number, volumen: number][];
  ruido: number;
  campanas: number[];
  /** Milisegundos entre campanas. Más corto = más presente. */
  esperaCampana: number;
};

const ESCENAS: Record<EscenaAmbiente, AfinacionEscena> = {
  // La menor. La cama original: la más neutra, para leer y repasar.
  estudio: {
    capas: [[55, 0.25, 0.052], [82.41, 0.33, 0.034], [110, 0.18, 0.022]],
    ruido: 0.030, campanas: NOTAS_CAMPANA, esperaCampana: 17000,
  },
  // Re menor, un tono más arriba y más despierta: hay alguien preguntando.
  oral: {
    capas: [[73.42, 0.34, 0.046], [110, 0.42, 0.030], [146.83, 0.24, 0.020]],
    ruido: 0.022, campanas: [293.66, 349.23, 440, 587.33], esperaCampana: 13000,
  },
  // Sol menor grave: el apremio pesa. Más ruido, batido lento, campana rara.
  ejecutivo: {
    capas: [[49, 0.16, 0.056], [73.42, 0.22, 0.036], [98, 0.12, 0.024]],
    ruido: 0.038, campanas: [196, 233.08, 293.66, 392], esperaCampana: 21000,
  },
  // Si menor con batidos rápidos: el suelo procesal no termina de asentarse.
  nulidad: {
    capas: [[61.74, 0.46, 0.050], [92.50, 0.56, 0.032], [123.47, 0.38, 0.022]],
    ruido: 0.034, campanas: [246.94, 293.66, 369.99, 493.88], esperaCampana: 11000,
  },
  // Do mayor, abierta y alta: se sube de instancia.
  recursos: {
    capas: [[65.41, 0.20, 0.048], [98, 0.28, 0.032], [130.81, 0.15, 0.022]],
    ruido: 0.026, campanas: [261.63, 311.13, 392, 523.25], esperaCampana: 19000,
  },
  // Mi menor contenida: se actúa antes de tiempo, en voz baja.
  cautelares: {
    capas: [[41.20, 0.22, 0.050], [61.74, 0.30, 0.034], [82.41, 0.16, 0.022]],
    ruido: 0.032, campanas: [246.94, 293.66, 329.63, 493.88], esperaCampana: 23000,
  },
};

let escenaActual: EscenaAmbiente = "estudio";

/** Qué escena está afinada ahora mismo. */
export function escenaAmbienteActual(): EscenaAmbiente {
  return escenaActual;
}

/**
 * Cambia la escena. Si el ambiente está sonando, lo recompone: el anterior se
 * va en 1,6 s y el nuevo entra en 6-8 s, así que el cruce se oye como una
 * disolución, no como un corte. Si no está sonando, sólo recuerda la escena
 * para cuando el jugador lo encienda.
 */
export function setEscenaAmbiente(escena: EscenaAmbiente) {
  if (escena === escenaActual) return;
  escenaActual = escena;
  if (nodosHipnoticos.length > 0) startAmbienteHipnotico(escena);
}

/**
 * Arranca el ambiente hipnótico. Sustituye a cualquier otro ambiente en curso.
 * Respeta el silencio global: si el audio está apagado, no suena nada.
 */
export function startAmbienteHipnotico(escena: EscenaAmbiente = escenaActual) {
  escenaActual = escena;
  const afinacion = ESCENAS[escena] ?? ESCENAS.estudio;
  stopAmbienteHipnotico();
  stopAmbient();
  if (muted) return;
  const c = ctx();
  if (!c || !masterGain) return;
  if (c.state === "suspended") c.resume().catch(() => {});

  // Bus propio, con su respiración de ciclo largo.
  const bus = c.createGain();
  bus.gain.value = 0.9;
  bus.connect(masterGain);

  const respiracion = c.createOscillator();
  const respiracionGain = c.createGain();
  respiracion.frequency.value = 0.05;  // un ciclo cada 20 s
  respiracionGain.gain.value = 0.22;
  respiracion.connect(respiracionGain);
  respiracionGain.connect(bus.gain);
  respiracion.start();

  nodosHipnoticos.push({
    parar: () => { try { respiracion.stop(); } catch {} },
  });

  // Fundamental, quinta y octava, cada una con su batido propio.
  for (const [hz, batido, volumen] of afinacion.capas) {
    nodosHipnoticos.push(parBatiente(c, bus, hz, batido, volumen));
  }
  nodosHipnoticos.push(capaDeRuido(c, bus, afinacion.ruido));

  // Campanas en orden rotatorio: previsible sin llegar a monótono.
  let indice = 0;
  const programar = () => {
    const espera = afinacion.esperaCampana + (indice % 5) * 2500;
    temporizadorCampana = setTimeout(() => {
      if (muted || nodosHipnoticos.length === 0) return;
      const cc = ctx();
      if (cc) campana(cc, bus, afinacion.campanas[indice % afinacion.campanas.length], 0.05);
      indice++;
      programar();
    }, espera);
  };
  programar();
}

/** Detiene el ambiente hipnótico con un desvanecido suave. */
export function stopAmbienteHipnotico() {
  if (temporizadorCampana) {
    clearTimeout(temporizadorCampana);
    temporizadorCampana = null;
  }
  nodosHipnoticos.forEach((n) => n.parar());
  nodosHipnoticos = [];
}

/** ¿Está sonando el ambiente hipnótico? */
export function ambienteHipnoticoActivo(): boolean {
  return nodosHipnoticos.length > 0;
}
