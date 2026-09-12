"use client";

/**
 * RETRATO DE NPC — medallón procedural del interlocutor.
 *
 * La biblia visual del proyecto pide para los diálogos «retrato del interlocutor
 * + registro de conversación», no un formulario. Hasta ahora el modal mostraba
 * un emoji suelto de 30 px.
 *
 * Sigue el mismo criterio que components/game/BossPortrait.tsx: emblema
 * procedural, reconocible sin texto e intercambiable por arte de imagen más
 * adelante sin tocar el resto de la pantalla.
 */
export default function RetratoNpc({
  emoji,
  acento,
  size = 72,
  estado = "neutral",
}: {
  emoji: string;
  acento: string;
  size?: number;
  /** Tiñe el marco según cómo va la conversación. */
  estado?: "neutral" | "favorable" | "tenso";
}) {
  const anillo =
    estado === "favorable" ? "var(--zona-cautelares)"
    : estado === "tenso" ? "var(--zona-nulidad)"
    : acento;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, color-mix(in srgb, ${anillo} 28%, transparent), transparent 68%)` }}
      />
      {/* marco octogonal: la placa de identificación del foro */}
      <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden="true">
        <polygon
          points="28,4 72,4 96,28 96,72 72,96 28,96 4,72 4,28"
          fill="color-mix(in srgb, #070A12 92%, transparent)"
          stroke={anillo}
          strokeWidth="3"
        />
        <polygon
          points="32,11 68,11 89,32 89,68 68,89 32,89 11,68 11,32"
          fill="none"
          stroke={anillo}
          strokeWidth="1"
          opacity="0.42"
        />
      </svg>
      <span
        aria-hidden="true"
        className="relative"
        style={{ fontSize: size * 0.42, filter: `drop-shadow(0 0 8px color-mix(in srgb, ${anillo} 55%, transparent))` }}
      >
        {emoji}
      </span>
    </div>
  );
}
