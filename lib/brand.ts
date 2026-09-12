/**
 * CONFIGURACIÓN DE MARCA — punto único de verdad.
 *
 * Todo el nombre, los créditos, los colores y las rutas de assets de marca viven
 * aquí. Para incorporar la imagen oficial de EVA más adelante basta con rellenar
 * `EVA.assetSrc`: ningún componente referencia archivos de marca por su cuenta.
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
 * `assetSrc: null` significa que se está usando el TRATAMIENTO VISUAL PROVISIONAL:
 * el monograma tipográfico abstracto de `components/shell/EvaMark.tsx`. No existe
 * en el repositorio ninguna referencia visual oficial de EVA (`public/` está vacío).
 *
 * PARA REEMPLAZARLO: deja el archivo oficial en `public/` y pon aquí su ruta,
 * por ejemplo `assetSrc: "/eva-oficial.svg"`. `EvaMark` lo detecta y deja de
 * dibujar el monograma provisional. No hay que tocar ningún otro archivo.
 */
export const EVA = {
  nombre: "EVA",
  /** Función, no personalidad: es lo único que está documentado. */
  rol: "Guía de aprendizaje",
  assetSrc: null as string | null,
  /** Marca el tratamiento como reemplazable allí donde se muestra en créditos. */
  assetEsProvisional: true,
  color: "var(--eva-accent)",
} as const;

/** Colores de marca. Reutilizan los tokens de identidad que el juego ya tiene. */
export const COLORES = {
  eva: "var(--eva-accent)",
  proyecto: "var(--zona-recursos)",
  acento: "var(--zona-competencia)",
} as const;

/** Pie de marca reutilizable: una sola línea, dos datos. */
export const FIRMA = `${PROYECTO.presenta} · ${AUTOR.credito}` as const;
