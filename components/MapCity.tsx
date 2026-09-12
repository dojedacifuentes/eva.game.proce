"use client";

// ============================================================================
// CIUDAD JUDICIAL — escenario del mapa.
//
// Mismo espacio de coordenadas que el SVG de GameWorldMap (viewBox
// "20 50 800 620"). Suelo en y≈600; la arquitectura ocupa la franja inferior,
// por debajo de la última hilera de nodos.
//
// Antes eran torres de oficinas genéricas con ventanas de neón: podía ser
// cualquier ciudad cyberpunk. Ahora la silueta es JURÍDICA y legible de un
// vistazo: el Palacio de Tribunales con su frontón y sus columnas, la Torre del
// Archivo hecha de expedientes atados, el Monumento de la Balanza, la columnata
// del foro con fustes rotos, el Muro de los Artículos y, al fondo, la Comisión
// Examinadora rematada por un mallete.
//
// Todo SVG puro: sin librerías, sin imágenes y sin Math.random, para no romper
// la hidratación del servidor.
// ============================================================================

const SUELO = 600;

export function MapDefs() {
  return (
    <defs>
      {/* ── Cielo y ambiente ── */}
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#04060C" />
        <stop offset="45%" stopColor="#081020" />
        <stop offset="100%" stopColor="#0D1C34" />
      </linearGradient>
      <radialGradient id="horizonGlow" cx="50%" cy="100%" r="75%">
        <stop offset="0%" stopColor="rgba(75,231,255,0.20)" />
        <stop offset="42%" stopColor="rgba(138,92,255,0.09)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      {/* ── Piedra y mármol de la arquitectura jurídica ── */}
      <linearGradient id="marmol" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2C3550" />
        <stop offset="55%" stopColor="#1A2137" />
        <stop offset="100%" stopColor="#0D1220" />
      </linearGradient>
      <linearGradient id="marmolClaro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3C4766" />
        <stop offset="100%" stopColor="#1B2238" />
      </linearGradient>
      <linearGradient id="piedraLejana" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#131E33" />
        <stop offset="100%" stopColor="#070D18" />
      </linearGradient>

      {/* ── Papel de expediente, para la Torre del Archivo ── */}
      <linearGradient id="expediente" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#D7B46A" stopOpacity="0.62" />
        <stop offset="50%" stopColor="#E8DFC5" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#8A7440" stopOpacity="0.55" />
      </linearGradient>

      {/* ── Ciudadela de la Comisión ── */}
      <linearGradient id="citadel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#33193D" />
        <stop offset="100%" stopColor="#0B0918" />
      </linearGradient>

      {/* ── Tinta cayendo, en lugar de lluvia genérica ── */}
      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(123,212,230,0)" />
        <stop offset="65%" stopColor="rgba(123,212,230,0.45)" />
        <stop offset="100%" stopColor="rgba(123,212,230,0)" />
      </linearGradient>

      <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="lacre" cx="38%" cy="34%" r="70%">
        <stop offset="0%" stopColor="#FF8A6B" />
        <stop offset="60%" stopColor="#D94A4A" />
        <stop offset="100%" stopColor="#5E1717" />
      </radialGradient>

      <filter id="softGlow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="4" />
      </filter>

      {/* Mosaico del suelo, como el pavimento de un tribunal */}
      <pattern id="cityGrid" width="52" height="52" patternUnits="userSpaceOnUse">
        <path d="M 52 0 L 0 0 0 52" fill="none" stroke="rgba(75,231,255,0.05)" strokeWidth="0.6" />
        <path d="M 0 26 L 26 0 L 52 26 L 26 52 Z" fill="none" stroke="rgba(215,180,106,0.045)" strokeWidth="0.5" />
      </pattern>
    </defs>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PIEZAS DE ARQUITECTURA JURÍDICA
// ════════════════════════════════════════════════════════════════════════════

/** Columna clásica: basa, fuste estriado y capitel. */
function Columna({ x, base, alto, ancho = 9, rota = false, color = "url(#marmolClaro)" }: {
  x: number; base: number; alto: number; ancho?: number; rota?: boolean; color?: string;
}) {
  const altoReal = rota ? alto * 0.58 : alto;
  const cima = base - altoReal;
  return (
    <g>
      {/* basa */}
      <rect x={x - ancho * 0.16} y={base - 4} width={ancho * 1.32} height={4} fill="url(#marmol)" />
      {/* fuste */}
      <rect x={x} y={cima} width={ancho} height={altoReal} fill={color} />
      {/* estrías */}
      <line x1={x + ancho * 0.33} y1={cima + 2} x2={x + ancho * 0.33} y2={base - 5}
        stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" />
      <line x1={x + ancho * 0.66} y1={cima + 2} x2={x + ancho * 0.66} y2={base - 5}
        stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" />
      {!rota && (
        <rect x={x - ancho * 0.2} y={cima - 3.5} width={ancho * 1.4} height={3.5} fill="url(#marmolClaro)" />
      )}
      {/* fuste truncado: el foro también tiene ruinas */}
      {rota && (
        <path d={`M ${x} ${cima} l ${ancho * 0.3} -3 l ${ancho * 0.35} 2.5 l ${ancho * 0.35} -2`}
          fill="none" stroke="rgba(215,180,106,0.4)" strokeWidth="1" />
      )}
    </g>
  );
}

/** Balanza de la justicia dibujada como silueta. */
function Balanza({ x, y, escala = 1, color = "#D7B46A", opacidad = 1 }: {
  x: number; y: number; escala?: number; color?: string; opacidad?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={opacidad}>
      <line x1="0" y1="-22" x2="0" y2="12" stroke={color} strokeWidth="1.8" />
      <line x1="-16" y1="-18" x2="16" y2="-18" stroke={color} strokeWidth="1.6" />
      <path d="M -16 -18 L -21 -9 L -11 -9 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <path d="M 16 -18 L 11 -9 L 21 -9 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="0" cy="-22" r="2.2" fill={color} />
      <path d="M -8 12 L 8 12 L 5 16 L -5 16 Z" fill={color} opacity="0.8" />
    </g>
  );
}

/** PALACIO DE TRIBUNALES — el hito central del mapa. */
function PalacioTribunales({ x, base }: { x: number; base: number }) {
  const ancho = 150;
  const altoCuerpo = 56;
  const cima = base - altoCuerpo;
  return (
    <g>
      {/* escalinata */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x - 10 + i * 2.5} y={base + i * 3} width={ancho + 20 - i * 5} height={3}
          fill={i % 2 ? "#141B2C" : "#1A2335"} />
      ))}
      {/* cuerpo */}
      <rect x={x} y={cima} width={ancho} height={altoCuerpo} fill="url(#marmol)"
        stroke="rgba(75,231,255,0.18)" strokeWidth="0.8" />
      {/* columnata de la fachada */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Columna key={i} x={x + 10 + i * 17.5} base={base} alto={altoCuerpo - 12} ancho={8} />
      ))}
      {/* arquitrabe */}
      <rect x={x - 6} y={cima - 8} width={ancho + 12} height={8} fill="url(#marmolClaro)" />
      {/* frontón con la balanza en el tímpano */}
      <path d={`M ${x - 10} ${cima - 8} L ${x + ancho / 2} ${cima - 30} L ${x + ancho + 10} ${cima - 8} Z`}
        fill="url(#marmol)" stroke="rgba(215,180,106,0.32)" strokeWidth="1" />
      <Balanza x={x + ancho / 2} y={cima - 13} escala={0.5} opacidad={0.85} />
      {/* cúpula */}
      <path d={`M ${x + ancho / 2 - 18} ${cima - 30} A 18 18 0 0 1 ${x + ancho / 2 + 18} ${cima - 30} Z`}
        fill="url(#marmolClaro)" opacity="0.9" />
      <line x1={x + ancho / 2} y1={cima - 48} x2={x + ancho / 2} y2={cima - 58} stroke="#D7B46A" strokeWidth="1.4" />
      <circle cx={x + ancho / 2} cy={cima - 60} r="2.6" fill="#D7B46A">
        <animate attributeName="opacity" values="1;0.35;1" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* ventanales encendidos */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 18 + i * 28} y={cima + 16} width={7} height={13} rx="3.5"
          fill="#4BE7FF" opacity={i % 2 ? 0.5 : 0.28} />
      ))}
    </g>
  );
}

/** TORRE DEL ARCHIVO — expedientes apilados y atados con cinta. */
function TorreArchivo({ x, base, niveles = 11 }: { x: number; base: number; niveles?: number }) {
  const w = 46;
  const h = 13;
  return (
    <g>
      {Array.from({ length: niveles }).map((_, i) => {
        const y = base - (i + 1) * h;
        const desfase = (i % 3) - 1; // apilado imperfecto, determinista
        return (
          <g key={i}>
            <rect x={x + desfase * 2.5} y={y} width={w} height={h - 1.5} fill="url(#expediente)"
              stroke="rgba(215,180,106,0.30)" strokeWidth="0.6" />
            {/* cinta del expediente */}
            <rect x={x + desfase * 2.5 + w * 0.32} y={y} width={2.5} height={h - 1.5}
              fill="rgba(217,74,74,0.45)" />
            {/* canto de las hojas */}
            <line x1={x + desfase * 2.5 + 2} y1={y + h - 3.5} x2={x + desfase * 2.5 + w - 2} y2={y + h - 3.5}
              stroke="rgba(232,223,197,0.22)" strokeWidth="0.5" />
          </g>
        );
      })}
      {/* lacre encendido en la cima */}
      <circle cx={x + w / 2} cy={base - niveles * h - 5} r="5" fill="url(#lacre)">
        <animate attributeName="opacity" values="0.75;1;0.75" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/** MURO DE LOS ARTÍCULOS — normas grabadas en piedra. */
function MuroArticulos({ x, base, arts }: { x: number; base: number; arts: string[] }) {
  return (
    <g>
      <rect x={x} y={base - 52} width={118} height={52} fill="url(#marmol)"
        stroke="rgba(215,180,106,0.20)" strokeWidth="0.7" />
      {arts.map((a, i) => (
        <text key={a} x={x + 59} y={base - 38 + i * 13} textAnchor="middle"
          fontFamily="var(--font-mono), monospace" fontSize="9"
          fill="rgba(215,180,106,0.55)" letterSpacing="1">
          {a}
        </text>
      ))}
    </g>
  );
}

// ── Colonnata lejana: siluetas de tribunales menores en el horizonte ────────
const TRIBUNALES_LEJANOS = [
  { x: 30, w: 54, h: 70 }, { x: 100, w: 38, h: 48 }, { x: 156, w: 66, h: 88 },
  { x: 240, w: 44, h: 60 }, { x: 470, w: 58, h: 78 }, { x: 548, w: 40, h: 52 },
  { x: 604, w: 62, h: 94 }, { x: 686, w: 42, h: 64 },
];

export function CityBackdrop() {
  return (
    <g pointerEvents="none">
      {/* cielo y resplandor del horizonte */}
      <rect x="0" y="20" width="860" height="620" fill="url(#skyGrad)" />
      <ellipse cx="420" cy={SUELO} rx="580" ry="200" fill="url(#horizonGlow)" />

      {/* ── Tribunales lejanos: frontones triangulares, no cajas ── */}
      <g opacity="0.55">
        {TRIBUNALES_LEJANOS.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={SUELO - t.h} width={t.w} height={t.h} fill="url(#piedraLejana)" />
            <path d={`M ${t.x - 4} ${SUELO - t.h} L ${t.x + t.w / 2} ${SUELO - t.h - 16} L ${t.x + t.w + 4} ${SUELO - t.h} Z`}
              fill="url(#piedraLejana)" stroke="rgba(122,212,230,0.14)" strokeWidth="0.6" />
            {/* columnas insinuadas */}
            {Array.from({ length: Math.max(2, Math.floor(t.w / 16)) }).map((_, j) => (
              <rect key={j} x={t.x + 5 + j * 15} y={SUELO - t.h + 8} width={3} height={t.h - 8}
                fill="rgba(122,212,230,0.07)" />
            ))}
          </g>
        ))}
      </g>

      {/* ── Columnata del foro, con fustes rotos ── */}
      <g opacity="0.8">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Columna key={i} x={296 + i * 22} base={SUELO} alto={56} ancho={8} rota={i === 2 || i === 5} />
        ))}
      </g>

      {/* ── Monumento de la Balanza ── */}
      <g>
        <rect x="252" y={SUELO - 30} width="30" height="30" fill="url(#marmol)" />
        <rect x="248" y={SUELO - 34} width="38" height="5" fill="url(#marmolClaro)" />
        <Balanza x={267} y={SUELO - 46} escala={1.05} opacidad={0.82} />
      </g>

      {/* ── Palacio de Tribunales ── */}
      <PalacioTribunales x={72} base={SUELO} />

      {/* ── Torre del Archivo ── */}
      <TorreArchivo x={442} base={SUELO} niveles={7} />

      {/* ── Muro de los Artículos ── */}
      <MuroArticulos x={556} base={SUELO} arts={["art. 158", "art. 170", "art. 768"]} />

      {/* ── LA COMISIÓN EXAMINADORA — ciudadela del horizonte ── */}
      <g>
        <rect x="742" y="420" width="12" height={SUELO - 150} fill="#FF4FCF" opacity="0.13">
          <animate attributeName="opacity" values="0.07;0.2;0.07" dur="3.6s" repeatCount="indefinite" />
        </rect>
        <path
          d={`M 692 ${SUELO} L 700 520 L 720 520 L 726 490 L 740 490 L 748 462 L 758 462 L 766 490 L 780 490 L 786 520 L 806 520 L 814 ${SUELO} Z`}
          fill="url(#citadel)" stroke="rgba(255,79,207,0.32)" strokeWidth="1" />
        {/* columnata de la ciudadela */}
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={706 + j * 26} y={SUELO - 60} width={5} height={60} fill="rgba(255,79,207,0.12)" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <rect key={j} x="750" y={516 - j * 12} width="5" height="5" fill="#FF4FCF" opacity={0.45 + (j % 2) * 0.35} />
        ))}
        {/* remate: mallete de la comisión */}
        <circle cx="753" cy="444" r="15" fill="rgba(255,79,207,0.16)">
          <animate attributeName="r" values="12;18;12" dur="3.6s" repeatCount="indefinite" />
        </circle>
        <g transform="translate(753 444) rotate(-38)" style={{ filter: "drop-shadow(0 0 6px #FF4FCF)" }}>
          <rect x="-4" y="-13" width="8" height="13" rx="2" fill="#FF4FCF" />
          <rect x="-1.6" y="-1" width="3.2" height="16" fill="#FF4FCF" />
        </g>
      </g>

      {/* pavimento del foro */}
      <rect x="0" y={SUELO} width="860" height="90" fill="url(#cityGrid)" opacity="0.55" />
      <line x1="0" y1={SUELO} x2="860" y2={SUELO} stroke="rgba(75,231,255,0.2)" strokeWidth="1" />
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ATMÓSFERA — tinta cayendo y artículos suspendidos
// ════════════════════════════════════════════════════════════════════════════

const LLUVIA = [
  { x: 60, d: 2.8, delay: 0 }, { x: 148, d: 3.5, delay: 0.9 }, { x: 232, d: 3.0, delay: 1.7 },
  { x: 318, d: 3.9, delay: 0.4 }, { x: 402, d: 2.8, delay: 2.1 }, { x: 498, d: 3.6, delay: 1.2 },
  { x: 582, d: 3.1, delay: 0.3 }, { x: 668, d: 4.0, delay: 1.5 }, { x: 742, d: 2.9, delay: 0.7 },
];

const CARTELES = [
  { t: "art. 254 CPC", x: 150, y: 120, d: 7 },
  { t: "art. 768 CPC", x: 612, y: 150, d: 8.5 },
  { t: "art. 158 CPC", x: 372, y: 96, d: 9 },
  { t: "art. 434 CPC", x: 700, y: 392, d: 7.8 },
];

export function MapAtmosphere() {
  return (
    <g pointerEvents="none">
      {LLUVIA.map((r, i) => (
        <rect key={i} x={r.x} y="40" width="1.3" height="34" fill="url(#rainGrad)" opacity="0.45">
          <animateTransform attributeName="transform" type="translate" from="0 -60" to="0 560"
            dur={`${r.d}s`} begin={`${r.delay}s`} repeatCount="indefinite" />
        </rect>
      ))}
      {/* Artículos suspendidos. A 13px se leen; antes estaban a 9px. */}
      {CARTELES.map((b) => (
        <text key={b.t} x={b.x} y={b.y} textAnchor="middle"
          fontFamily="var(--font-mono), monospace" fontSize="13"
          fill="rgba(123,212,230,0.34)" letterSpacing="1.5">
          {b.t}
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${b.d}s`} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0 5;0 -7;0 5" dur={`${b.d}s`} repeatCount="indefinite" />
        </text>
      ))}
    </g>
  );
}

// ─── conducto entre nodos ───────────────────────────────────────────────────
export function EnergyConduit({ d, color, dim }: { d: string; color: string; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.22 : 1}>
      <path d={d} fill="none" stroke={color} strokeWidth="4.5" opacity="0.1" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" opacity="0.5" strokeLinecap="round"
        strokeDasharray="7 6">
        <animate attributeName="stroke-dashoffset" values="26;0" dur="2.4s" repeatCount="indefinite" />
      </path>
    </g>
  );
}
