import type { Atributos, Origen, Rol } from "@/types/game";

/**
 * Catálogo de orígenes y roles, y cálculo de atributos.
 *
 * Vive fuera del componente de creación por dos motivos: es la única regla del
 * juego que decide con qué números empieza una partida, y así puede probarse
 * sin montar React (ver lib/__tests__/personaje.test.ts).
 *
 * El campo `eva` es la explicación en lenguaje llano que EVA muestra junto a
 * cada opción. No describe personalidad de EVA: describe la mecánica.
 */
export const ATRIBUTOS_BASE: Atributos = {
  conocimiento_procesal: 5, persuasion_forense: 5, diligencia: 5,
  rigor_formal: 5, estrategia: 5, resistencia_psicologica: 5,
};

export const ORIGENES: {
  id: Origen; nombre: string; desc: string; mod: Partial<Atributos>; nivel: number; eva: string;
}[] = [
  { id: "litigante_freelancer", nombre: "Litigante freelance", desc: "Estudio unipersonal, café reusado, plazos vividos al filo.", mod: { diligencia: 2, resistencia_psicologica: 1 }, nivel: 35,
    eva: "Equilibrado. Sube diligencia y aguante: buen punto de partida si no tienes preferencia." },
  { id: "estudio_grande", nombre: "Estudio grande", desc: "Pasillos alfombrados. Costo-hora alto. Pleitos serios.", mod: { rigor_formal: 2, estrategia: 1 }, nivel: 90,
    eva: "Formalista. Rinde en escritos y plazos, donde un error de forma cuesta el juicio." },
  { id: "defensoria_publica", nombre: "Defensoría / clínica jurídica", desc: "Causas sociales, recursos limitados, vocación.", mod: { persuasion_forense: 1, resistencia_psicologica: 2 }, nivel: 25,
    eva: "Resistente. Encaja los golpes de las derrotas sin perder tanto terreno." },
  { id: "academia", nombre: "Académico forense", desc: "Couture en una mano, Cassarino en la otra.", mod: { conocimiento_procesal: 3 }, nivel: 45,
    eva: "El de más conocimiento procesal. Si vienes a estudiar para el grado, es el más directo." },
  { id: "litigante_propia_causa", nombre: "Litigante en causa propia", desc: "El que más sufre. El que menos sabe.", mod: { resistencia_psicologica: -1, conocimiento_procesal: -1, persuasion_forense: 1 }, nivel: 30,
    eva: "El más difícil: empiezas por debajo en dos atributos. Elígelo si quieres el juego duro." },
];

export const ROLES: { id: Rol; nombre: string; mod: Partial<Atributos>; eva: string }[] = [
  { id: "abogado_demandante", nombre: "Abogado/a demandante", mod: { estrategia: 2, persuasion_forense: 1 },
    eva: "Llevas la iniciativa: demanda, prueba y recursos. Es el recorrido más completo del CPC." },
  { id: "abogado_demandado", nombre: "Abogado/a demandado/a", mod: { rigor_formal: 2, diligencia: 1 },
    eva: "Juegas a la defensa: excepciones dilatorias, contestación y plazos. Muy de examen." },
  { id: "juez", nombre: "Juez/a (rol pedagógico)", mod: { conocimiento_procesal: 2, rigor_formal: 1 },
    eva: "Miras el expediente desde el tribunal: resoluciones del art. 158 y requisitos del 170." },
  { id: "secretario", nombre: "Secretario/a del tribunal", mod: { rigor_formal: 3 },
    eva: "El más formalista de todos. Notificaciones, certificaciones y cómputo de plazos." },
  { id: "litigante_propio", nombre: "Litigante por sí mismo (art. 2 Ley 18.120)", mod: { resistencia_psicologica: -1 },
    eva: "Sin patrocinio. Enseña por qué el art. 2 de la Ley 18.120 existe." },
];

/** Configuración recomendada de la partida rápida. */
export const PARTIDA_RAPIDA = {
  origen: "litigante_freelancer" as Origen,
  rol: "abogado_demandante" as Rol,
  sexo: "femenino" as const,
};

/**
 * Atributos resultantes de un origen y un rol.
 *
 * SIEMPRE parte de `ATRIBUTOS_BASE`, nunca de los atributos ya calculados: por
 * eso volver atrás en el asistente y cambiar de opción no acumula
 * bonificaciones. Todo queda acotado a 0-10.
 */
export function calcularAtributos(origen: Origen, rol: Rol): Atributos {
  const o = ORIGENES.find((x) => x.id === origen)?.mod ?? {};
  const r = ROLES.find((x) => x.id === rol)?.mod ?? {};
  const res = { ...ATRIBUTOS_BASE };
  (Object.keys(res) as (keyof Atributos)[]).forEach((k) => {
    res[k] = Math.max(0, Math.min(10, ATRIBUTOS_BASE[k] + (o[k] ?? 0) + (r[k] ?? 0)));
  });
  return res;
}

/** Nivel económico de partida, determinado por el origen. */
export function nivelEconomicoDe(origen: Origen): number {
  return ORIGENES.find((x) => x.id === origen)?.nivel ?? 50;
}
