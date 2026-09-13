"use client";

// ============================================================================
// PISTA DE AVANCE
//
// Dice dos cosas a la vez: que la espera tiene fin (la barra se vacía) y que no
// hace falta esperarla (se puede seguir ya). Acompaña a `useAvanceAutomatico`.
// ============================================================================

export default function PistaAvance({
  duracion,
  etiqueta = "Toca o pulsa Enter para seguir",
}: {
  /** Milisegundos que durará la espera; alimenta la animación de la barra. */
  duracion: number;
  etiqueta?: string;
}) {
  return (
    <div className="pista-avance" role="note">
      <div className="pista-avance-pista" aria-hidden="true">
        <div
          className="pista-avance-barra"
          style={{ animationDuration: `${duracion}ms` }}
        />
      </div>
      <span className="t-meta font-mono-terminal">{etiqueta}</span>
    </div>
  );
}
