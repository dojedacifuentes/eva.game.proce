// ============================================================================
// REPASO ESPACIADO
//
// Lo que falla se anota y vuelve a preguntarse más adelante, con huecos cada vez
// más largos. Es la pieza del juego que más debería notarse en el examen: no
// añade contenido, hace que el contenido que ya fallaste vuelva cuando estás a
// punto de olvidarlo.
//
// **Sobre los intervalos**: 1, 3, 7, 16 y 35 días es una progresión razonable y
// de uso común, elegida por criterio de diseño. No es un protocolo validado ni
// está calibrado con datos de este juego; si alguna vez se mide, se cambia aquí
// y las pruebas dirán qué se rompe.
//
// Sólo entra al sistema lo que **fallas**. Un mazo de fallos se mantiene corto y
// va a lo que hace falta; uno que lo guarda todo se vuelve una tarea más.
// ============================================================================

/** Días hasta el próximo repaso, según cuántas veces seguidas se ha acertado. */
export const INTERVALOS = [1, 3, 7, 16, 35] as const;

export type FichaRepaso = {
  /** Identificador estable de la pregunta. Ver `idEstable`. */
  id: string;
  /** Aciertos seguidos desde el último fallo. Indexa `INTERVALOS`. */
  nivel: number;
  /** Día del próximo repaso, AAAA-MM-DD en hora local. */
  proximo: string;
  fallos: number;
  aciertos: number;
};

/** Una ficha llega aquí cuando ya no hace falta seguir repasándola. */
export const NIVEL_APRENDIDA = INTERVALOS.length;

/**
 * Identificador estable a partir del texto de la pregunta.
 *
 * Se deriva del enunciado y no de su posición, para que reordenar un banco no
 * mezcle los historiales. Si alguien **edita** el enunciado, la ficha se
 * considera otra pregunta y su historial empieza de cero: es lo correcto, porque
 * la pregunta que fallaste ya no existe.
 */
export function idEstable(fuente: string, texto: string): string {
  let h = 2166136261; // FNV-1a de 32 bits: corto, estable y sin dependencias
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${fuente}:${(h >>> 0).toString(36)}`;
}

/** Suma días a una clave AAAA-MM-DD y devuelve otra clave. */
export function sumarDias(dia: string, dias: number): string {
  const [y, m, d] = dia.split("-").map(Number);
  // UTC para la aritmética: son fechas de calendario ya normalizadas, y así el
  // cambio de horario de verano no mueve el resultado un día.
  const t = new Date(Date.UTC(y, m - 1, d + dias));
  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Registra el resultado de una pregunta y devuelve la ficha actualizada.
 *
 * @param previa Ficha guardada, o `undefined` si nunca se ha fallado.
 * @returns La ficha nueva, o `null` si no hay nada que anotar: acertar una
 *   pregunta que nunca fallaste no crea ficha.
 */
export function registrarResultado(
  previa: FichaRepaso | undefined,
  id: string,
  acierto: boolean,
  hoy: string,
): FichaRepaso | null {
  if (!previa) {
    if (acierto) return null; // no fallada nunca: no entra al mazo
    return { id, nivel: 0, proximo: sumarDias(hoy, INTERVALOS[0]), fallos: 1, aciertos: 0 };
  }

  if (!acierto) {
    // Volver a fallar devuelve la ficha al principio. Sin medias tintas: si se
    // ha vuelto a escapar, hay que verla mañana.
    return { ...previa, nivel: 0, proximo: sumarDias(hoy, INTERVALOS[0]), fallos: previa.fallos + 1 };
  }

  const nivel = Math.min(previa.nivel + 1, NIVEL_APRENDIDA);
  const espera = INTERVALOS[Math.min(nivel, INTERVALOS.length - 1)];
  return { ...previa, nivel, proximo: sumarDias(hoy, espera), aciertos: previa.aciertos + 1 };
}

/** ¿Toca repasarla hoy? Las atrasadas también, claro. */
export function toca(ficha: FichaRepaso, hoy: string): boolean {
  if (ficha.nivel >= NIVEL_APRENDIDA) return false;
  return ficha.proximo <= hoy; // comparación de cadenas: AAAA-MM-DD lo permite
}

/**
 * Fichas que tocan hoy, primero las más falladas: si sólo hay tiempo para unas
 * pocas, que sean las que peor se llevan.
 */
export function pendientes(
  fichas: Record<string, FichaRepaso> | undefined,
  hoy: string,
): FichaRepaso[] {
  if (!fichas || typeof fichas !== "object") return [];
  return Object.values(fichas)
    .filter((f) => f && typeof f.proximo === "string" && toca(f, hoy))
    .sort((a, b) => b.fallos - a.fallos || a.proximo.localeCompare(b.proximo));
}

/** Resumen para enseñar al jugador sin que tenga que abrir nada. */
export function resumen(fichas: Record<string, FichaRepaso> | undefined, hoy: string) {
  const todas = fichas && typeof fichas === "object" ? Object.values(fichas) : [];
  return {
    pendientes: pendientes(fichas, hoy).length,
    enMazo: todas.filter((f) => f && f.nivel < NIVEL_APRENDIDA).length,
    aprendidas: todas.filter((f) => f && f.nivel >= NIVEL_APRENDIDA).length,
  };
}
