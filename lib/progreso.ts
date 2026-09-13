// ============================================================================
// PROGRESO — decisiones puras sobre el avance del jugador.
//
// Están aquí, y no dentro del componente, para poder probarlas: el aviso de
// nivel se dispara con cambios de estado que son fáciles de confundir (la
// primera lectura del guardado, una partida importada) y equivocarse significa
// celebrar un ascenso que no ocurrió.
// ============================================================================

/**
 * Saltos mayores que esto no vienen de jugar: vienen de restaurar una partida
 * exportada, que reemplaza el estado entero de una vez.
 */
export const SALTO_MAXIMO_CELEBRABLE = 2;

/**
 * ¿Corresponde celebrar el paso de `previo` a `actual`?
 *
 * @param previo Nivel de referencia, o `null` si el guardado aún no se ha
 *   leído. Con `null` nunca se celebra: al abrir el juego en nivel 7 el estado
 *   pasa de 1 a 7 sin que el jugador haya hecho nada.
 */
export function debeCelebrarNivel(previo: number | null, actual: number): boolean {
  if (previo === null) return false;
  const salto = actual - previo;
  return salto > 0 && salto <= SALTO_MAXIMO_CELEBRABLE;
}
