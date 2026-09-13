// ============================================================================
// FONDO — la Ciudad Judicial vista desde arriba, con un flujo de nodos encima.
//
// Dos capas en un solo SVG estático:
//   1. Plano cenital: manzanas, parques, un río, dos avenidas, el Palacio de
//      Tribunales con su patio y la Plaza de la Justicia. Contraste muy bajo:
//      es un fondo, no compite con los paneles.
//   2. Flujo: nodos rectangulares con puertos de entrada y salida unidos por
//      cables curvos, a la manera de un editor de automatizaciones (n8n).
//
// Es un componente de servidor sin estado: se renderiza en el HTML, se pinta en
// el primer fotograma y no ejecuta JavaScript en el teléfono. Todo el trazado
// es determinista (sin Math.random) para que servidor y cliente coincidan.
// ============================================================================

const W = 1600;
const H = 1000;

/** Pseudoaleatorio estable a partir de coordenadas enteras. */
function azar(i: number, j: number, semilla = 0): number {
  let x = Math.imul(i + 11, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(semilla + 3, 1442695041);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

type Manzana = { x: number; y: number; w: number; h: number; parque: boolean };

const PASO_X = 104;
const PASO_Y = 84;
const CALLE = 16;

function trazarManzanas(): Manzana[] {
  const out: Manzana[] = [];
  for (let j = 0; j * PASO_Y < H; j++) {
    for (let i = 0; i * PASO_X < W; i++) {
      const x = i * PASO_X + 4;
      const y = j * PASO_Y + 4;
      const w = PASO_X - CALLE;
      const h = PASO_Y - CALLE;
      const r = azar(i, j);
      if (r < 0.07) {
        out.push({ x, y, w, h, parque: true });
      } else if (r < 0.12) {
        // solar abierto: la calle se ensancha en una plazuela
        continue;
      } else if (r < 0.45) {
        // manzana partida por un pasaje
        const corte = 0.38 + azar(i, j, 1) * 0.24;
        if (azar(i, j, 2) < 0.5) {
          const w1 = Math.round(w * corte);
          out.push({ x, y, w: w1 - 3, h, parque: false });
          out.push({ x: x + w1 + 3, y, w: w - w1 - 3, h, parque: false });
        } else {
          const h1 = Math.round(h * corte);
          out.push({ x, y, w, h: h1 - 3, parque: false });
          out.push({ x, y: y + h1 + 3, w, h: h - h1 - 3, parque: false });
        }
      } else {
        out.push({ x, y, w, h, parque: false });
      }
    }
  }
  return out;
}

const MANZANAS = trazarManzanas();

// ── Flujo de nodos ─────────────────────────────────────────────────────────
type NodoFondo = { x: number; y: number; c: string };

const GRUPOS: NodoFondo[][] = [
  [
    { x: 150, y: 780, c: "#4BE7FF" },
    { x: 360, y: 700, c: "#7AD4E6" },
    { x: 580, y: 800, c: "#D7B46A" },
    { x: 800, y: 730, c: "#8A5CFF" },
  ],
  [
    { x: 1050, y: 860, c: "#58F5B0" },
    { x: 1270, y: 780, c: "#FF8A3D" },
    { x: 1490, y: 860, c: "#FF4FCF" },
  ],
  [
    { x: 1130, y: 150, c: "#8A5CFF" },
    { x: 1350, y: 230, c: "#4BE7FF" },
  ],
  [
    { x: 170, y: 110, c: "#D7B46A" },
    { x: 390, y: 70, c: "#58F5B0" },
  ],
];

const NODO_W = 76;
const NODO_H = 40;

function cable(a: NodoFondo, b: NodoFondo): string {
  const x1 = a.x + NODO_W / 2;
  const x2 = b.x - NODO_W / 2;
  const d = Math.max(40, (x2 - x1) * 0.5);
  return `M ${x1} ${a.y} C ${x1 + d} ${a.y}, ${x2 - d} ${b.y}, ${x2} ${b.y}`;
}

export default function FondoCiudad() {
  return (
    <div className="fondo-ciudad" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <pattern id="fondo-puntos" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.1" fill="#8FA3BF" opacity="0.16" />
          </pattern>
          <radialGradient id="fondo-vineta" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#06080D" stopOpacity="0" />
            <stop offset="70%" stopColor="#06080D" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#05070B" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="#080B12" />

        {/* ── Plano cenital ── */}
        <g>
          {MANZANAS.map((m, k) => (
            <rect
              key={k}
              x={m.x}
              y={m.y}
              width={m.w}
              height={m.h}
              rx="3"
              fill={m.parque ? "#0C1813" : "#0F1520"}
              stroke={m.parque ? "#12261C" : "#161E2C"}
              strokeWidth="1"
            />
          ))}
          {/* árboles de los parques */}
          {MANZANAS.filter((m) => m.parque).map((m, k) =>
            [0.25, 0.5, 0.75].map((f, q) => (
              <circle key={`${k}-${q}`} cx={m.x + m.w * f} cy={m.y + m.h * (q % 2 ? 0.35 : 0.65)} r="6" fill="#10241A" />
            )),
          )}
        </g>

        {/* río */}
        <path d="M -60 210 C 280 300, 520 120, 820 300 S 1300 600, 1680 470" fill="none" stroke="#0E2033" strokeWidth="58" />
        <path d="M -60 210 C 280 300, 520 120, 820 300 S 1300 600, 1680 470" fill="none" stroke="#0A1624" strokeWidth="42" />

        {/* avenidas */}
        <g fill="none">
          <path d="M -20 650 L 1620 572" stroke="#0A0E16" strokeWidth="28" />
          <path d="M -20 650 L 1620 572" stroke="#1B2433" strokeWidth="1.5" strokeDasharray="14 12" />
          <path d="M 960 -20 L 1050 1020" stroke="#0A0E16" strokeWidth="24" />
          <path d="M 960 -20 L 1050 1020" stroke="#1B2433" strokeWidth="1.5" strokeDasharray="14 12" />
        </g>

        {/* Palacio de Tribunales, visto desde arriba: cuerpo, patio y cúpula */}
        <g>
          <rect x="624" y="386" width="232" height="150" rx="4" fill="#080B12" />
          <rect x="636" y="398" width="208" height="126" rx="3" fill="#131A28" stroke="#24324B" strokeWidth="1.5" />
          <rect x="682" y="430" width="116" height="62" rx="2" fill="#0A0E16" stroke="#1D2940" />
          <circle cx="740" cy="461" r="17" fill="none" stroke="#D7B46A" strokeOpacity="0.4" strokeWidth="2" />
          <circle cx="740" cy="461" r="4" fill="#D7B46A" fillOpacity="0.45" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
            <rect key={c} x={648 + c * 26} y="404" width="6" height="6" fill="#2A3A57" />
          ))}
        </g>

        {/* Plaza de la Justicia: rotonda con paseos radiales */}
        <g>
          <circle cx="1230" cy="360" r="74" fill="#080B12" />
          <circle cx="1230" cy="360" r="62" fill="#0E1420" stroke="#1F2A3E" strokeWidth="1.5" />
          {[0, 45, 90, 135].map((a) => (
            <line
              key={a}
              x1={1230 - 62 * Math.cos((a * Math.PI) / 180)}
              y1={360 - 62 * Math.sin((a * Math.PI) / 180)}
              x2={1230 + 62 * Math.cos((a * Math.PI) / 180)}
              y2={360 + 62 * Math.sin((a * Math.PI) / 180)}
              stroke="#18212F"
              strokeWidth="5"
            />
          ))}
          <circle cx="1230" cy="360" r="14" fill="#0A0E16" stroke="#4BE7FF" strokeOpacity="0.3" />
        </g>

        {/* rejilla de puntos del lienzo de flujo */}
        <rect width={W} height={H} fill="url(#fondo-puntos)" />

        {/* ── Flujo de nodos ── */}
        <g opacity="0.6">
          {GRUPOS.map((g, gi) =>
            g.slice(1).map((b, k) => (
              <path
                key={`c-${gi}-${k}`}
                className={gi === 0 && k === 1 ? "fondo-cable fondo-cable-activo" : "fondo-cable"}
                d={cable(g[k], b)}
                fill="none"
                stroke={g[k].c}
                strokeOpacity="0.45"
                strokeWidth="2"
              />
            )),
          )}
          {GRUPOS.flat().map((n, k) => (
            <g key={`n-${k}`}>
              <rect x={n.x - NODO_W / 2} y={n.y - NODO_H / 2} width={NODO_W} height={NODO_H} rx="8" fill="#0E131D" stroke={n.c} strokeOpacity="0.5" strokeWidth="1.5" />
              <rect x={n.x - NODO_W / 2 + 6} y={n.y - 14} width="28" height="28" rx="6" fill={n.c} fillOpacity="0.18" />
              <rect x={n.x + 2} y={n.y - 8} width="26" height="4" rx="2" fill="#2A3548" />
              <rect x={n.x + 2} y={n.y + 2} width="16" height="4" rx="2" fill="#1E2738" />
              <circle cx={n.x - NODO_W / 2} cy={n.y} r="4" fill="#0E131D" stroke={n.c} strokeOpacity="0.6" />
              <circle cx={n.x + NODO_W / 2} cy={n.y} r="4" fill="#0E131D" stroke={n.c} strokeOpacity="0.6" />
            </g>
          ))}
        </g>

        <rect width={W} height={H} fill="url(#fondo-vineta)" />
      </svg>
    </div>
  );
}
