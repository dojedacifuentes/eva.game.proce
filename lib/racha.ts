// ============================================================================
// RACHA DE ESTUDIO
//
// Para un examen de grado lo que decide no es una sesión larga, es volver.
// Esto cuenta días seguidos con actividad real —no días con la pestaña abierta—
// y es la única pieza del juego que mide constancia.
//
// Lógica pura y probada, aparte del store: los errores aquí son de los que no se
// ven hasta que alguien cruza la medianoche o cambia de huso horario.
// ============================================================================

export type EstadoRacha = {
  /** Días seguidos con actividad, contando hoy. */
  rachaDias: number;
  /** La mejor racha alcanzada. No baja nunca. */
  mejorRacha: number;
  /** Último día con actividad, en formato AAAA-MM-DD y hora **local**. */
  ultimoDiaJugado: string;
  /** Cuántas actividades lleva hoy. Se reinicia al cambiar de día. */
  actividadesHoy: number;
};

export const RACHA_INICIAL: EstadoRacha = {
  rachaDias: 0,
  mejorRacha: 0,
  ultimoDiaJugado: "",
  actividadesHoy: 0,
};

/**
 * Día en hora **local**, no UTC. Con UTC, quien estudia a las 22:00 en Chile
 * vería su racha saltar de día a mitad de sesión.
 */
export function diaLocal(fecha: Date = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Días entre dos claves AAAA-MM-DD. Negativo si `b` es anterior a `a`. */
function diasEntre(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  // UTC a propósito: aquí sólo se restan fechas de calendario ya normalizadas,
  // y con UTC el cálculo no lo estropea un cambio de horario de verano.
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86400000);
}

/**
 * Registra una actividad y devuelve el estado nuevo.
 *
 * - Mismo día: sólo suma una actividad.
 * - Día siguiente: la racha crece.
 * - Hueco de dos días o más: la racha vuelve a 1. Sin perdón ni congelaciones;
 *   si algún día se quieren, es aquí y con su propia prueba.
 * - Fecha anterior a la última (reloj cambiado, partida importada): no se
 *   castiga ni se premia, sólo se cuenta la actividad.
 */
export function registrarActividad(previo: EstadoRacha, hoy: string = diaLocal()): EstadoRacha {
  if (previo.ultimoDiaJugado === hoy) {
    return { ...previo, actividadesHoy: previo.actividadesHoy + 1 };
  }

  const salto = previo.ultimoDiaJugado ? diasEntre(previo.ultimoDiaJugado, hoy) : Infinity;

  if (salto < 0) {
    // El reloj va hacia atrás respecto del último día registrado. No se toca la
    // racha ni la fecha: no hay forma honesta de interpretarlo.
    return { ...previo, actividadesHoy: previo.actividadesHoy + 1 };
  }

  const rachaDias = salto === 1 ? previo.rachaDias + 1 : 1;

  return {
    rachaDias,
    mejorRacha: Math.max(previo.mejorRacha, rachaDias),
    ultimoDiaJugado: hoy,
    actividadesHoy: 1,
  };
}

/**
 * ¿Sigue viva la racha guardada, mirada desde hoy? Una racha de ayer sigue
 * viva —aún se puede continuar—; una de anteayer ya se rompió.
 *
 * Se usa sólo para mostrarla: el estado no se reescribe hasta que el jugador
 * hace algo, para que abrir la aplicación no cuente como estudiar.
 */
export function rachaVigente(estado: EstadoRacha, hoy: string = diaLocal()): number {
  if (!estado.ultimoDiaJugado) return 0;
  const salto = diasEntre(estado.ultimoDiaJugado, hoy);
  if (salto < 0) return estado.rachaDias;
  return salto <= 1 ? estado.rachaDias : 0;
}
