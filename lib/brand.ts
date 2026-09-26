/**
 * CONFIGURACIÓN DE MARCA — punto único de verdad.
 *
 * Todo el nombre, los créditos, los colores y las rutas de assets de marca viven
 * aquí. La marca oficial de EVA (el símbolo □X) llega calculada en
 * `lib/marca-eva.ts` y se reexporta desde aquí: ningún componente referencia
 * archivos de marca por su cuenta.
 *
 * Reglas de contenido que este archivo respeta a propósito (no las relajes sin
 * material verificable):
 *  - No se afirma qué significa la sigla EVA.
 *  - EVA no tiene biografía, personalidad oficial, rostro ni apariencia humana.
 *  - No se declaran relaciones empresariales, titularidad jurídica, credenciales
 *    profesionales de Diego, avales universitarios, cifras de usuarios ni
 *    promesas de aprobación del examen.
 */

/** Nombre del juego, tal como está escrito en el repositorio desde su origen. */
export const JUEGO = {
  /** Nombre canónico para metadatos, títulos de documento y texto corrido. */
  nombre: "FORO [in]VISIBLE",
  /** Composición tipográfica de la portada: FORO + [in] + visible. */
  partes: { uno: "FORO", dos: "[in]", tres: "visible" },
  subtitulo: "Simulador Procesal Chileno",
  descripcion:
    "Cyberpunk jurídico chileno. CPC + COT + CPR. Estudio para el examen de grado.",
} as const;

/** Marca que presenta la experiencia. */
export const PROYECTO = {
  nombre: "Proyecto01",
  /** Texto de marca aprobado. */
  presenta: "Una experiencia EVA de Proyecto01",
} as const;

/** Crédito de autoría. */
export const AUTOR = {
  nombre: "Diego Ojeda",
  credito: "Creada por Diego Ojeda",
  /** Contexto de origen, documentado en el README del repositorio. */
  origen:
    "Nacida como herramienta de estudio durante la preparación del examen de grado.",
} as const;

/**
 * EVA — guía de aprendizaje dentro de la experiencia.
 *
 * Su marca ya es la oficial: `components/shell/EvaMark.tsx` dibuja el símbolo □X
 * de EVA con la geometría de `lib/marca-eva.ts`, generada desde la landing de EVA
 * (eva.proyecto01, `scripts/brand-assets.mjs --kit`). Hasta septiembre de 2026
 * era un monograma provisional en rombo.
 *
 * `assetSrc` sigue sirviendo para forzar una imagen en su lugar (ruta en
 * `public/`); con `null`, se dibuja el símbolo.
 */
export const EVA = {
  nombre: "EVA",
  /** Función, no personalidad: es lo único que está documentado. */
  rol: "Guía de aprendizaje",
  assetSrc: null as string | null,
  /** El símbolo ya es el oficial de EVA. */
  assetEsProvisional: false,
  color: "var(--eva-accent)",
} as const;

/** Colores de marca. Reutilizan los tokens de identidad que el juego ya tiene. */
export const COLORES = {
  eva: "var(--eva-accent)",
  proyecto: "var(--zona-recursos)",
  acento: "var(--zona-competencia)",
} as const;

/**
 * EVA ARCADE — la colección de juegos de EVA a la que pertenece éste. Su puerta
 * es `/links` en la landing de EVA: desde ahí se llega a cada juego y a ella
 * se vuelve (`components/shell/VolverArcade.tsx`).
 */
export const ARCADE = {
  nombre: "EVA ARCADE",
  puerta: "https://evaproyecto01.vercel.app/links",
  volver: "Volver a EVA ARCADE",
  /** Categoría del juego dentro del Arcade, como en su tarjeta de /links. */
  categoria: "RPG · Derecho Procesal",
  /** Su color en el Arcade: el azul claro de su tarjeta en /links. */
  tinta: "#86c1ff",
} as const;

/** La geometría y los colores de la marca de EVA (generados; no se editan a mano). */
export { MARCA as MARCA_EVA } from "./marca-eva";

/** Pie de marca reutilizable: una sola línea, dos datos. */
export const FIRMA = `${PROYECTO.presenta} · ${AUTOR.credito}` as const;
