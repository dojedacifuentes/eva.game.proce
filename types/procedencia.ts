/**
 * Procedencia de un contenido jurídico: de dónde sale y cuándo se revisó.
 *
 * Es OPCIONAL a propósito. Hoy la inmensa mayoría del banco no tiene una
 * verificación registrada, y marcar todo como verificado sería falso. El
 * componente que la muestra sólo dibuja algo cuando este campo existe: lo que
 * no está revisado no aparenta estarlo.
 *
 * Se rellena a medida que se contrasta contenido contra fuente oficial
 * (BCN/LeyChile), anotando la fecha de esa revisión.
 */
export type Procedencia = {
  /** Norma o documento concreto. Ej: "Art. 768 CPC". */
  norma: string;
  /** Enlace a la fuente oficial consultada. */
  url?: string;
  /** Fecha de la revisión, ISO corto: "2026-09-12". */
  revisadoEl: string;
  /** Quién la revisó, si consta. */
  revisadoPor?: string;
  /**
   * `verificado`: contrastado contra fuente oficial.
   * `doctrinal`: depende de interpretación; se muestra como tal.
   * `pendiente`: marcado para revisión, todavía sin contrastar.
   */
  estado: "verificado" | "doctrinal" | "pendiente";
  /** Matiz para el lector, si hace falta. */
  nota?: string;
};
