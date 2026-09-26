import { ImageResponse } from "next/og";
import { ARCADE, JUEGO, MARCA_EVA } from "@/lib/brand";

export const alt = `${JUEGO.nombre} — ${JUEGO.subtitulo} · ${ARCADE.nombre}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const W = size.width;
const H = size.height;
/** Radio de la órbita de la marca, centrada en la imagen. */
const ORBITA = 300;
/** Alto del símbolo □X, en píxeles. */
const SIMBOLO = 150;
const [AZUL, INDIGO, VIOLETA] = MARCA_EVA.colores.halo;

/**
 * El fondo de las fichas de la marca de EVA: resplandor azul a la izquierda y
 * violeta a la derecha, la órbita con sus ocho nodos y la cruz de ejes. Va como
 * imagen porque `next/og` no pinta degradados radiales ni líneas discontinuas.
 */
function fondo() {
  const cx = W / 2;
  const cy = H / 2;
  const nodos = Array.from({ length: 8 }, (_, k) => {
    const giro = (k * Math.PI) / 4;
    const x = cx + Math.cos(giro) * ORBITA;
    const y = cy + Math.sin(giro) * ORBITA;
    const color = x < cx - 1 ? AZUL : x > cx + 1 ? VIOLETA : INDIGO;
    return `<circle cx="${x}" cy="${y}" r="13" fill="${color}" opacity=".22"/><circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/><circle cx="${x}" cy="${y}" r="2" fill="#f4f6ff"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="l" cx="0.08" cy="0.5" r="0.62"><stop stop-color="${AZUL}" stop-opacity=".34"/><stop offset="1" stop-color="${AZUL}" stop-opacity="0"/></radialGradient>
      <radialGradient id="r" cx="0.92" cy="0.5" r="0.62"><stop stop-color="${VIOLETA}" stop-opacity=".24"/><stop offset="1" stop-color="${VIOLETA}" stop-opacity="0"/></radialGradient>
      <linearGradient id="o" gradientUnits="userSpaceOnUse" x1="${cx - ORBITA}" x2="${cx + ORBITA}" y1="0" y2="0"><stop stop-color="${AZUL}"/><stop offset=".5" stop-color="${INDIGO}"/><stop offset="1" stop-color="${VIOLETA}"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${MARCA_EVA.colores.fondo}"/>
    <rect width="${W}" height="${H}" fill="url(#l)"/>
    <rect width="${W}" height="${H}" fill="url(#r)"/>
    <g stroke="#a9b8ff" stroke-opacity=".18" stroke-width="1.2" stroke-dasharray="2 7">
      <line x1="0" y1="${cy}" x2="${W}" y2="${cy}"/><line x1="${cx}" y1="0" x2="${cx}" y2="${H}"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${ORBITA * 0.72}" fill="none" stroke="#a9b8ff" stroke-opacity=".12" stroke-width="1.2" stroke-dasharray="2 6"/>
    <circle cx="${cx}" cy="${cy}" r="${ORBITA}" fill="none" stroke="url(#o)" stroke-opacity=".6" stroke-width="2"/>
    ${nodos}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Vista previa al compartir el juego: el símbolo □X de EVA en su órbita, EVA
 * ARCADE, el nombre del juego y su categoría (la misma que en su tarjeta de
 * /links). El símbolo llega de `lib/marca-eva.ts` como SVG suelto con su halo.
 */
export default function OpengraphImage() {
  const simbolo = MARCA_EVA.poses.simbolo;
  // El SVG suelto lleva 1,6 unidades de aire por lado para el halo.
  const escala = SIMBOLO / simbolo.caja.alto;
  const anchoSimbolo = Math.round((simbolo.caja.ancho + 3.2) * escala);
  const altoSimbolo = Math.round((simbolo.caja.alto + 3.2) * escala);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: MARCA_EVA.colores.fondo,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og sólo entiende <img> */}
        <img src={fondo()} alt="" width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og sólo entiende <img> */}
        <img
          src={`data:image/svg+xml;base64,${btoa(simbolo.svg)}`}
          alt=""
          width={anchoSimbolo}
          height={altoSimbolo}
        />
        <div style={{ display: "flex", marginTop: 6, fontSize: 22, letterSpacing: 8, color: "#b9c3e8" }}>
          {ARCADE.nombre}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 60, fontWeight: 700, color: "#f4f6ff" }}>
          {JUEGO.nombre}
        </div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 24, letterSpacing: 4, color: ARCADE.tinta }}>
          {ARCADE.categoria.toUpperCase()}
        </div>
      </div>
    ),
    size,
  );
}
