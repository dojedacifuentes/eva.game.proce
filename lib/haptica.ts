// ============================================================================
// HÁPTICA — respuesta táctil en móvil
//
// Complementa al sonido, no lo sustituye: mucha gente estudia en silencio y una
// vibración corta es la única confirmación que recibe de que su toque llegó.
//
// Dos límites que conviene conocer antes de apoyarse en esto:
//  · Safari de iOS **no implementa** `navigator.vibrate`. En iPhone no vibra
//    nada, y no hay alternativa desde una web. Es Android y poco más.
//  · Nunca puede ser el único canal de información. Aquí sólo refuerza algo
//    que además se ve y, si el sonido está encendido, se oye.
// ============================================================================

/** Patrones en milisegundos. Cortos a propósito: se sienten, no molestan. */
const PATRONES = {
  toque: 10,
  acierto: 18,
  error: [22, 40, 22],
  hito: [14, 50, 14, 50, 28],
} as const;

function permitida(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  // Quien pide menos movimiento pide menos estímulo. La vibración entra ahí.
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch {
    /* sin matchMedia: se trata como "sin preferencia" */
  }
  return true;
}

function vibrar(patron: number | readonly number[]): void {
  if (!permitida()) return;
  try {
    navigator.vibrate(patron as number | number[]);
  } catch {
    /* algunos navegadores lanzan si la pestaña no está activa */
  }
}

export const haptica = {
  /** Un control que responde. Para acciones frecuentes: elegir, navegar. */
  toque: () => vibrar(PATRONES.toque),
  /** Respuesta correcta. */
  acierto: () => vibrar(PATRONES.acierto),
  /** Respuesta incorrecta o acción rechazada. */
  error: () => vibrar(PATRONES.error),
  /** Hito: subir de nivel, vencer a un jefe, desbloquear contenido. */
  hito: () => vibrar(PATRONES.hito),
};
