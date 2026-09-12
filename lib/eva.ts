/**
 * EVA — motor de guía contextual.
 *
 * DETERMINISTA Y TRANSPARENTE POR DISEÑO. Todo lo que EVA dice sale de reglas
 * legibles en este archivo y de contenido que ya existe en el repositorio:
 * no hay llamadas a modelos, ni claves, ni backend, ni costo por uso.
 *
 * Dos límites deliberados:
 *  1. EVA nunca aparenta analizar más información de la que tiene. Cada consejo
 *     viaja con su `razon`, redactada a partir del dato concreto que lo motivó.
 *  2. Si no hay historial suficiente para hablar de debilidades, EVA NO inventa
 *     un diagnóstico: ofrece continuar la campaña o elegir materia.
 */
import { CAMPAÑA, getBoss, type Acto, type Mision } from "@/data/campaign";

/** Concordancia de número: "1 misión" / "3 misiones". */
export function plural(n: number, singular: string, plural_: string): string {
  return `${n} ${n === 1 ? singular : plural_}`;
}

export type TipoPaso =
  | "crear"        // todavía no hay personaje
  | "mision"       // siguiente misión pendiente de la campaña
  | "boss"         // todas las misiones del acto están hechas
  | "examen"       // campaña terminada, queda el examen
  | "epilogo";     // partida finalizada

export type PasoEva = {
  tipo: TipoPaso;
  /** Qué hacer, en una línea. */
  titulo: string;
  /** Por qué se recomienda ESTO. Siempre derivado de un dato real. */
  razon: string;
  /** Texto del botón que abre la actividad. */
  cta: string;
  href: string;
  /** Contexto corto para la cabecera del panel (acto, materia…). */
  contexto?: string;
};

export type ProgresoCampaña = {
  actoActual: Acto;
  misionActual: Mision | null;
  hechas: number;
  total: number;
  porcentaje: number;
  /** Misiones del acto en curso que faltan. */
  pendientesActo: number;
  /** ¿Queda por vencer el jefe del acto en curso? */
  bossPendiente: boolean;
};

/** Id del logro que el juego graba al vencer al jefe de un acto. */
export const idLogroBoss = (bossId: string) => `campaign_boss_${bossId}`;

/** ¿Está vencido el jefe de este acto, según los logros guardados? */
export function bossVencido(bossId: string, logrosIds: string[]): boolean {
  return logrosIds.includes(idLogroBoss(bossId));
}

/**
 * Lee el progreso real de la campaña. Sin efectos secundarios.
 *
 * Un acto se considera terminado cuando están hechas todas sus misiones Y su
 * jefe está vencido. Con sólo las misiones, el acto quedaba "cerrado" antes de
 * tiempo y la recomendación saltaba al acto siguiente sin pasar por el jefe.
 */
export function leerProgreso(misionesCompletadas: string[], logrosIds: string[] = []): ProgresoCampaña {
  const total = CAMPAÑA.reduce((s, a) => s + a.misiones.length, 0);
  const hechas = CAMPAÑA.reduce(
    (s, a) => s + a.misiones.filter((m) => misionesCompletadas.includes(m.id)).length,
    0,
  );

  let actoActual = CAMPAÑA[CAMPAÑA.length - 1];
  let misionActual: Mision | null = null;
  for (const acto of CAMPAÑA) {
    const pendiente = acto.misiones.find((m) => !misionesCompletadas.includes(m.id));
    if (pendiente) {
      actoActual = acto;
      misionActual = pendiente;
      break;
    }
    // Misiones hechas pero jefe pendiente: el acto sigue siendo el actual.
    if (!bossVencido(acto.bossId, logrosIds)) {
      actoActual = acto;
      misionActual = null;
      break;
    }
  }

  const pendientesActo = actoActual.misiones.filter(
    (m) => !misionesCompletadas.includes(m.id),
  ).length;

  return {
    actoActual,
    misionActual,
    hechas,
    total,
    porcentaje: total > 0 ? Math.round((hechas / total) * 100) : 0,
    pendientesActo,
    bossPendiente: !bossVencido(actoActual.bossId, logrosIds),
  };
}

/**
 * La recomendación del hub: "Tu próximo paso".
 *
 * Orden de las reglas (de arriba abajo, la primera que se cumple gana):
 *  1. Sin personaje → constituirlo.
 *  2. Partida finalizada → epílogo.
 *  3. Queda alguna misión de campaña → esa misión, la primera pendiente.
 *  4. Campaña completa pero falta el jefe del acto → ese jefe.
 *  5. Todo hecho → examen de grado.
 */
export function siguientePaso(args: {
  tieneNombre: boolean;
  misionesCompletadas: string[];
  /** Ids de logros guardados: de ahí se deduce qué jefes están vencidos. */
  logrosIds?: string[];
  finalizado?: boolean;
}): PasoEva {
  if (!args.tieneNombre) {
    return {
      tipo: "crear",
      titulo: "Constituye tu litigante",
      razon: "Sin personaje no hay dónde guardar progreso, reputación ni logros.",
      cta: "Crear personaje",
      href: "/creacion",
    };
  }

  if (args.finalizado) {
    return {
      tipo: "epilogo",
      titulo: "Cierra el ciclo",
      razon: "Terminaste la campaña: el epílogo resume tu expediente y abre un ciclo nuevo.",
      cta: "Leer epílogo",
      href: "/epilogo",
      contexto: "Campaña completada",
    };
  }

  const p = leerProgreso(args.misionesCompletadas, args.logrosIds ?? []);

  if (p.misionActual) {
    const m = p.misionActual;
    return {
      tipo: "mision",
      titulo: m.titulo,
      razon:
        p.hechas === 0
          ? "Es la primera misión de la campaña: parte por aquí para fijar las bases."
          : p.pendientesActo === 1
            ? `Es la última pendiente del Acto ${p.actoActual.numero}: al terminarla se abre el jefe.`
            : `Es la siguiente pendiente del Acto ${p.actoActual.numero}. Te faltan ${p.pendientesActo} de ${p.actoActual.misiones.length} para llamar al jefe.`,
      cta: "Atender misión",
      href: `/mision/${m.id}`,
      contexto: `Acto ${p.actoActual.numero} · ${p.actoActual.titulo}`,
    };
  }

  const boss = p.bossPendiente ? getBoss(p.actoActual.bossId) : null;
  if (boss) {
    return {
      tipo: "boss",
      titulo: boss.nombre,
      razon: `Completaste ${plural(p.actoActual.misiones.length, "misión", "misiones")} del Acto ${p.actoActual.numero}. El jefe del acto queda disponible.`,
      cta: "Preparar combate",
      href: `/boss/${p.actoActual.bossId}`,
      contexto: `Acto ${p.actoActual.numero} · Jefe de facción`,
    };
  }

  return {
    tipo: "examen",
    titulo: "Examen de grado",
    razon: "Cubriste toda la campaña. El modo examen mide lo que ya trabajaste.",
    cta: "Rendir examen",
    href: "/examen",
    contexto: "Campaña completada",
  };
}

/**
 * Alternativas honestas para cuando el jugador no quiere seguir la campaña.
 *
 * No son un diagnóstico: son rutas que EXISTEN, presentadas como opciones. EVA
 * no dice "tu debilidad es la prueba" porque el juego no registra aciertos por
 * materia todavía.
 */
export const ALTERNATIVAS: { titulo: string; descripcion: string; href: string }[] = [
  { titulo: "Elegir materia", descripcion: "Entra a un mundo suelto sin seguir el orden de la campaña.", href: "/mundos" },
  { titulo: "Repasar el Codex", descripcion: "Artículos, plazos y cuadros de recursos, para consulta.", href: "/codex" },
  { titulo: "Modo examen", descripcion: "Preguntas tipo cédula con explicación normativa.", href: "/examen" },
];

/** Aviso mostrado cuando EVA no tiene datos para personalizar nada. */
export const SIN_DATOS =
  "Todavía no tengo historial tuyo por materia, así que no voy a inventarte un diagnóstico. Sigue la campaña o elige una materia.";
