// ============================================================================
// ICONOGRAFÍA JURÍDICA
//
// Sustituye a los emoji de la interfaz permanente. Los emoji tenían tres
// problemas: los dibuja el sistema operativo, así que el juego se ve distinto
// en cada teléfono; llegan con su propio color, que pelea con la paleta; y
// ninguno es de derecho procesal — un maletín y una diana podrían ser de
// cualquier aplicación.
//
// Estos son de trazo, heredan `currentColor` y comparten rejilla de 24 y grosor
// de 1.6, así que una fila de iconos se lee como un conjunto y no como una
// colección de pegatinas.
//
// Para añadir uno: dibújalo dentro del viewBox 0 0 24 24, sin `fill` salvo que
// sea una masa sólida a propósito, y sin color propio.
// ============================================================================

export type NombreIcono =
  // Navegación
  | "mapa" | "diana" | "estrado" | "mundos" | "expediente"
  // Cabecera
  | "silencio" | "altavoz" | "onda" | "racha" | "moneda"
  // Estudio
  | "repaso" | "cedula" | "lupa" | "toga" | "libro" | "pluma"
  // Actividades
  | "maletin" | "cronometro" | "bifurcacion" | "balanza" | "rayo"
  | "columna" | "linea" | "arena" | "archivador" | "martillo"
  | "reliquia" | "puerta" | "tema" | "cartas" | "escudo" | "candado";

const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  // ── Navegación ───────────────────────────────────────────────────────────
  /** Plano plegado con una ruta: el mapa de la campaña. */
  mapa: <>
    <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
    <path d="M9 4v13.5M15 6.5V20" />
  </>,
  /** Diana: entrenar es apuntar a lo que falla. */
  diana: <>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </>,
  /** Estrado con micrófono: el interrogatorio oral. */
  estrado: <>
    <path d="M12 3.5a2.2 2.2 0 0 1 2.2 2.2v4.6a2.2 2.2 0 0 1-4.4 0V5.7A2.2 2.2 0 0 1 12 3.5Z" />
    <path d="M6.5 10.3a5.5 5.5 0 0 0 11 0M12 15.8V20M8.5 20h7" />
  </>,
  /** Globo con meridiano: los mundos y las expansiones. */
  mundos: <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z" />
  </>,
  /** Carpeta con pestaña y cinta: el expediente del litigante. */
  expediente: <>
    <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l1.6 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z" />
    <path d="M8.5 11h7" />
  </>,

  // ── Cabecera ─────────────────────────────────────────────────────────────
  silencio: <>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    <path d="m16.2 9.8 4.3 4.4M20.5 9.8l-4.3 4.4" />
  </>,
  altavoz: <>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    <path d="M15.6 9.4a3.7 3.7 0 0 1 0 5.2" />
  </>,
  /** Ondas largas: la cama sonora continua. */
  onda: <>
    <path d="M2.5 9c1.6-1.8 3.2-1.8 4.8 0s3.2 1.8 4.8 0 3.2-1.8 4.8 0 3.2 1.8 4.6 0" />
    <path d="M2.5 15c1.6-1.8 3.2-1.8 4.8 0s3.2 1.8 4.8 0 3.2-1.8 4.8 0 3.2 1.8 4.6 0" />
  </>,
  /** Llama: días seguidos de estudio. */
  racha: <>
    <path d="M12 3c3 3.1 4.7 5.7 4.7 8.4a4.7 4.7 0 0 1-9.4 0C7.3 9.4 8.4 7.6 10 6c0 1.6.5 2.6 1.4 3.2.5-2.1.7-4.1.6-6.2Z" />
    <path d="M12 21a3.1 3.1 0 0 0 3.1-3.1c0-1.3-1-2.6-3.1-4-2.1 1.4-3.1 2.7-3.1 4A3.1 3.1 0 0 0 12 21Z" />
  </>,
  /**
   * Moneda acuñada. El primer intento eran dos círculos concéntricos y resultó
   * ser el mismo dibujo que `diana`: dos significados con un solo glifo. Ahora
   * lleva un cuño en rombo, que no se parece a ningún otro del juego.
   */
  moneda: <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4 16.6 12 12 16.6 7.4 12z" />
  </>,

  // ── Estudio ──────────────────────────────────────────────────────────────
  /** Dos flechas en ciclo: lo que vuelve. */
  repaso: <>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" /><path d="M20 4.5v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" /><path d="M4 19.5v-4h4" />
  </>,
  /** Pliego con sello: la cédula. */
  cedula: <>
    <path d="M6 3.5h8.5L19 8v12.5H6z" /><path d="M14.5 3.5V8H19" />
    <path d="M8.8 12h7M8.8 15.4h4.6" />
  </>,
  lupa: <>
    <circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.4 15.4 4.6 4.6" />
  </>,
  /** Silueta con toga: los mentores. */
  toga: <>
    <circle cx="12" cy="6.6" r="3.1" />
    <path d="M5.5 20.5c0-3.9 2.9-7 6.5-7s6.5 3.1 6.5 7" />
    <path d="M12 13.5v7" />
  </>,
  libro: <>
    <path d="M4 4.5h5.5c1.4 0 2.5 1 2.5 2.3v12.7c0-1.1-1.1-2-2.5-2H4z" />
    <path d="M20 4.5h-5.5c-1.4 0-2.5 1-2.5 2.3v12.7c0-1.1 1.1-2 2.5-2H20z" />
  </>,
  /**
   * Pluma sobre el escrito. El primer intento era la silueta curva de una pluma
   * de ave y a 22 px se quedaba en un trazo fino que no decía nada; ésta tiene
   * masa y punta, y se reconoce al tamaño en que se usa.
   */
  pluma: <>
    <path d="M14.8 3.6 20.4 9.2 9.6 20H4v-5.6z" />
    <path d="m13 5.4 5.6 5.6M4 20l3.4-3.4" />
  </>,

  // ── Actividades ──────────────────────────────────────────────────────────
  maletin: <>
    <rect x="3" y="7.5" width="18" height="11.5" rx="1.6" />
    <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" />
  </>,
  cronometro: <>
    <circle cx="12" cy="13.3" r="7.2" /><path d="M12 9.5v3.8l2.4 1.8M9.6 3.5h4.8M12 3.5v2.6" />
  </>,
  /** Bifurcación: verdadero o falso. */
  bifurcacion: <>
    <path d="M12 21V13" /><path d="M12 13 6 7.5V3.5" /><path d="m12 13 6-5.5V3.5" />
    <circle cx="6" cy="3.5" r="1.6" /><circle cx="18" cy="3.5" r="1.6" />
  </>,
  /**
   * Balanza: el duelo de medios de prueba es pesarlos unos contra otros. Las
   * dos plumas cruzadas que había antes salían como un aspa que no decía nada.
   */
  balanza: <>
    <path d="M12 4.2v15.3M7.5 19.5h9" />
    <path d="M4.6 7.8h14.8" />
    <path d="M4.6 7.8 2.2 13.4h4.8zM19.4 7.8 17 13.4h4.8z" />
  </>,
  rayo: <>
    <path d="M13.5 3 5.5 13.5h5.2L10 21l8.3-10.7h-5.4z" />
  </>,
  /** Columna de tribunal. */
  columna: <>
    <path d="M3.5 8.5 12 3.5l8.5 5M4.5 20.5h15M6.5 8.5v9M11 8.5v9M15.5 8.5v9" />
  </>,
  /**
   * Línea de tiempo con hitos de distinta altura. Con los hitos dibujados como
   * círculos sobre la línea, a 22 px el conjunto se veía como una barra gruesa;
   * en vertical se distinguen los tres actos de un vistazo.
   */
  linea: <>
    <path d="M3 16.5h18" />
    <path d="M7 16.5V10M12 16.5V5.5M17 16.5v-4" />
    <circle cx="7" cy="8.4" r="1.4" /><circle cx="12" cy="3.9" r="1.4" /><circle cx="17" cy="10.9" r="1.4" />
  </>,
  /** Reloj de arena: la preclusión. */
  arena: <>
    <path d="M6.5 3.5h11M6.5 20.5h11" />
    <path d="M8 3.5v3.2c0 1.9 4 3.6 4 5.3s-4 3.4-4 5.3v3.2M16 3.5v3.2c0 1.9-4 3.6-4 5.3s4 3.4 4 5.3v3.2" />
  </>,
  archivador: <>
    <rect x="3.5" y="4" width="17" height="7" rx="1.4" /><rect x="3.5" y="13" width="17" height="7" rx="1.4" />
    <path d="M10 7.5h4M10 16.5h4" />
  </>,
  /**
   * Mazo de juez apoyado en su taco.
   *
   * Dos intentos anteriores fallaron y merece la pena dejarlo escrito: como aspa
   * de líneas sueltas se leía como una raya, y como rombo con mango salía una
   * chincheta. En vertical —maza arriba, mango recto, taco abajo— no se parece a
   * ninguna otra cosa.
   */
  martillo: <>
    <rect x="6.5" y="3.5" width="11" height="4.6" rx="1.5" />
    <path d="M12 8.1v7.4" />
    <rect x="4.5" y="17" width="15" height="3.5" rx="1.2" />
  </>,
  /** Frasco: las reliquias procesales. */
  reliquia: <>
    <path d="M9.5 3.5h5M10.5 3.5v5.2L6.4 16.3A2.6 2.6 0 0 0 8.7 20.5h6.6a2.6 2.6 0 0 0 2.3-3.8L13.5 8.7V3.5" />
    <path d="M8.2 14.5h7.6" />
  </>,
  puerta: <>
    <path d="M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15.5M4 20.5h16" />
    <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
  </>,
  /**
   * Círculo mitad relleno: los mundos visuales, que es cambiar de tema.
   * El prisma triangular que había antes se leía como una señal de peligro.
   */
  tema: <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
  </>,
  /** Dos cartas: la de atrás girada, para que se vea que son un mazo. */
  cartas: <>
    <rect x="9.5" y="4.5" width="10" height="14" rx="1.6" />
    <path d="M7.6 7.2 5.2 8.1a1.6 1.6 0 0 0-.9 2.1l3.6 9.3" />
    <path d="M12.4 9h4.2M12.4 12.2h4.2" />
  </>,
  escudo: <>
    <path d="M12 3.2 19.5 6v6.1c0 4-3 7.1-7.5 8.7-4.5-1.6-7.5-4.7-7.5-8.7V6z" />
    <path d="M12 8.5v5.5" />
  </>,
  /** Candado: contenido aún bloqueado. */
  candado: <>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 14.2v2.6" />
  </>,
};

/**
 * Icono de trazo. Hereda el color del texto, así que se pinta con `style` o
 * `className` del elemento que lo contiene, como cualquier letra.
 *
 * Siempre decorativo por defecto (`aria-hidden`): el nombre accesible lo pone el
 * control que lo envuelve. Si alguna vez uno tiene que hablar por sí solo, se le
 * pasa `titulo`.
 */
export default function Icono({
  nombre,
  tam = 22,
  titulo,
  className,
  style,
}: {
  nombre: NombreIcono;
  tam?: number;
  titulo?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tam}
      height={tam}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {titulo && <title>{titulo}</title>}
      {TRAZOS[nombre]}
    </svg>
  );
}
