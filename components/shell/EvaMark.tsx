"use client";
import { useId } from "react";
import { EVA, MARCA_EVA } from "@/lib/brand";

/** Margen del filtro del halo alrededor de la figura, en unidades de la marca. */
const MARGEN_HALO = 3.5;

type Punto = readonly [number, number];

/** Una pose ya colocada: su caja (sin halo) y sus piezas visibles. */
interface PoseColocada {
  caja: { x: number; y: number; ancho: number; alto: number };
  piezas: readonly (readonly Punto[])[];
}

/**
 * IDENTIFICADOR VISUAL DE EVA — el símbolo oficial □X (un cuadrado sobre una X).
 *
 * La geometría llega ya colocada en `lib/marca-eva.ts`, generada desde la
 * landing de EVA, donde vive la marca: aquí sólo se pinta. Dos capas, como en
 * la landing: debajo el halo (azul eléctrico a la izquierda, violeta a la
 * derecha, desenfocado); encima el trazo, casi blanco. Hasta septiembre de 2026
 * este componente dibujaba un monograma provisional en rombo.
 *
 * `size` es el alto en píxeles; el ancho sale de la proporción del símbolo. Si
 * `EVA.assetSrc` apunta a una imagen, se usa esa en su lugar.
 */
export default function EvaMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Un id por instancia (la marca sale varias veces por pantalla), sin los
  // caracteres que `useId` añade y que no sirven dentro de `url(#…)`.
  const id = `eva-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  if (EVA.assetSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={EVA.assetSrc}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
        style={{ display: "block" }}
      />
    );
  }

  const { caja, piezas }: PoseColocada = MARCA_EVA.poses.simbolo;
  const viewBox = `${caja.x} ${caja.y} ${caja.ancho} ${caja.alto}`;
  const ancho = Math.round((size * caja.ancho) / caja.alto);
  const x1 = caja.x;
  const x2 = caja.x + caja.ancho;
  const figuras = piezas.map((pieza, k) => (
    <polygon key={k} points={pieza.map(([x, y]) => `${x},${y}`).join(" ")} />
  ));
  const degradado = (nombre: string, colores: readonly string[]) => (
    <linearGradient id={`${id}-${nombre}`} gradientUnits="userSpaceOnUse" x1={x1} x2={x2} y1="0" y2="0">
      {colores.map((color, k) => (
        <stop key={color} offset={k / (colores.length - 1)} stopColor={color} />
      ))}
    </linearGradient>
  );

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: ancho, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <svg viewBox={viewBox} width={ancho} height={size} focusable="false" className="absolute inset-0 overflow-visible" style={{ opacity: 0.85 }}>
        <defs>
          {degradado("halo", MARCA_EVA.colores.halo)}
          <filter
            id={`${id}-difuso`}
            filterUnits="userSpaceOnUse"
            x={caja.x - MARGEN_HALO}
            y={caja.y - MARGEN_HALO}
            width={caja.ancho + MARGEN_HALO * 2}
            height={caja.alto + MARGEN_HALO * 2}
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="ancho" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="corto" />
            <feMerge>
              <feMergeNode in="ancho" />
              <feMergeNode in="ancho" />
              <feMergeNode in="corto" />
            </feMerge>
          </filter>
        </defs>
        <g fill={`url(#${id}-halo)`} filter={`url(#${id}-difuso)`}>
          {figuras}
        </g>
      </svg>
      <svg viewBox={viewBox} width={ancho} height={size} focusable="false" className="relative overflow-visible">
        <defs>{degradado("trazo", MARCA_EVA.colores.trazo)}</defs>
        {/* El contorno tapa la costura de los vértices, donde dos brazos se tocan. */}
        <g fill={`url(#${id}-trazo)`} stroke={`url(#${id}-trazo)`} strokeWidth={MARCA_EVA.costura}>
          {figuras}
        </g>
      </svg>
    </span>
  );
}
