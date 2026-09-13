// ============================================================================
// BANCO DE REPASO
//
// Una sola forma para preguntas que en el juego viven en tres sitios distintos:
// la cédula de /examen, el verdadero/falso y las alternativas difíciles del
// banco de grado. El repaso espaciado necesita poder volver a servir una
// pregunta fallada sin saber de dónde salió.
//
// Nada de esto duplica contenido: se lee de `data/` y se adapta. Si una
// pregunta cambia de texto, cambia su id y su historial de repaso empieza de
// cero, que es lo correcto — ya no es la pregunta que se falló.
// ============================================================================

import { PREGUNTAS_CEDULA } from "@/data/cedula";
import { BANCO_VOF } from "@/data/preguntas-vof";
import { ALTERNATIVAS_DIFICIL } from "@/data/examen-extendido";
import { idEstable } from "./repaso";

export type FuenteRepaso = "cedula" | "vof" | "alternativa";

export type PreguntaRepaso = {
  id: string;
  fuente: FuenteRepaso;
  enunciado: string;
  opciones: string[];
  /** Índice de la opción correcta dentro de `opciones`. */
  correcta: number;
  explicacion: string;
  /** Artículos citados, ya como una sola línea. */
  norma: string;
};

/** Nombre legible de cada fuente, para decirle al jugador de dónde viene. */
export const NOMBRE_FUENTE: Record<FuenteRepaso, string> = {
  cedula: "Cédula",
  vof: "Verdadero o falso",
  alternativa: "Alternativa de grado",
};

/** Id de una pregunta de la cédula. Lo usan /examen y el repaso. */
export const idCedula = (enunciado: string) => idEstable("cedula", enunciado);
/** Id de una pregunta de verdadero/falso. */
export const idVoF = (enunciado: string) => idEstable("vof", enunciado);

function deCedula(): PreguntaRepaso[] {
  return PREGUNTAS_CEDULA.map((p) => ({
    id: idCedula(p.q),
    fuente: "cedula" as const,
    enunciado: p.q,
    opciones: p.opciones,
    correcta: p.correcta,
    explicacion: p.explicacion,
    norma: p.art,
  }));
}

function deVoF(): PreguntaRepaso[] {
  return BANCO_VOF.map((p) => ({
    id: idVoF(p.enunciado),
    fuente: "vof" as const,
    enunciado: p.enunciado,
    opciones: ["Verdadero", "Falso"],
    correcta: p.respuesta ? 0 : 1,
    explicacion: p.explicacion,
    norma: p.art,
  }));
}

function deAlternativas(): PreguntaRepaso[] {
  return ALTERNATIVAS_DIFICIL.map((p) => {
    const correcta = p.opciones.findIndex((o) => o.letra === p.correcta);
    return {
      // Estas ya traen id propio en los datos: se respeta.
      id: `alternativa:${p.id}`,
      fuente: "alternativa" as const,
      enunciado: p.enunciado,
      opciones: p.opciones.map((o) => o.texto),
      // Si la letra marcada como correcta no existiera entre las opciones, se
      // deja en 0 antes que romper la pantalla; el dato estaría mal y hay que
      // corregirlo en data/, no aquí.
      correcta: correcta >= 0 ? correcta : 0,
      explicacion: p.explicacion,
      norma: p.normas.join(" · "),
    };
  });
}

let indice: Map<string, PreguntaRepaso> | null = null;

/** Todas las preguntas repasables, indexadas por id. Se construye una vez. */
function porId(): Map<string, PreguntaRepaso> {
  if (!indice) {
    indice = new Map();
    for (const p of [...deCedula(), ...deVoF(), ...deAlternativas()]) indice.set(p.id, p);
  }
  return indice;
}

/** Devuelve la pregunta de un id, o `undefined` si ya no existe en los bancos. */
export function preguntaDe(id: string): PreguntaRepaso | undefined {
  return porId().get(id);
}

/**
 * Resuelve una lista de ids a preguntas, descartando en silencio las que ya no
 * existen: una pregunta retirada o reescrita no debe dejar la pantalla en
 * blanco ni obligar a limpiar el guardado.
 */
export function preguntasDe(ids: string[]): PreguntaRepaso[] {
  const mapa = porId();
  return ids.map((id) => mapa.get(id)).filter((p): p is PreguntaRepaso => !!p);
}

/** Cuántas preguntas repasables hay en total. Sólo para diagnóstico. */
export function totalRepasables(): number {
  return porId().size;
}
