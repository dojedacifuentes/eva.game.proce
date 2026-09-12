"use client";
import { EVA } from "@/lib/brand";

/**
 * IDENTIFICADOR VISUAL DE EVA — TRATAMIENTO PROVISIONAL Y REEMPLAZABLE.
 *
 * En el repositorio no existe ninguna referencia visual verificable de EVA
 * (`public/` está vacío), así que se dibuja un monograma tipográfico abstracto:
 * un rombo de líneas con las letras EVA. Deliberadamente NO es un rostro, ni una
 * figura humana, ni una fotografía de persona.
 *
 * PARA REEMPLAZARLO: pon el archivo oficial en `public/` y apunta a él desde
 * `EVA.assetSrc` en `lib/brand.ts`. Este componente lo usará sin más cambios.
 */
export default function EvaMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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

  const id = "eva-mark-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--eva-accent)" />
          <stop offset="100%" stopColor="var(--zona-recursos)" />
        </linearGradient>
      </defs>
      {/* Rombo exterior */}
      <path
        d="M24 3 L45 24 L24 45 L3 24 Z"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* Rombo interior, sensación de profundidad de terminal */}
      <path
        d="M24 11 L37 24 L24 37 L11 24 Z"
        fill="none"
        stroke="var(--eva-accent)"
        strokeWidth="0.75"
        opacity="0.35"
      />
      <text
        x="24"
        y="28.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1"
        fill="var(--eva-accent)"
      >
        EVA
      </text>
    </svg>
  );
}
