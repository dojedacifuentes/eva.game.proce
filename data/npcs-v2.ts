/**
 * SISTEMA NPC MEJORADO v2.0 — Arcos narrativos coherentes
 * Cada NPC tiene: historias, misiones ramificadas, desafío final, consecuencias
 * Los NPCs se conectan entre sí en una red procesal viva
 */

export type NpcId =
  | "dra_noemí"
  | "juez_silva"
  | "receptor_castro"
  | "lic_neruda"
  | "escribana_gloria"
  | "prof_torres"
  | "fiscal_mendoza"
  | "paralegal_diego"
  | "secretaria_patricia"
  | "juez_supremo_araya";

export type EstadoMision = "no_iniciada" | "en_progreso" | "etapa_1" | "etapa_2" | "etapa_3" | "desafio_final" | "completada" | "fallida";

export interface EtapaMision {
  numero: number;
  titulo: string;
  descripcion: string;
  aprendizaje: string; // Concepto legal aprendido
  actividad: string; // Qué hace el jugador
  recompensa: {
    reputacion: number;
    conocimiento: number;
    atributo?: string;
    skill?: string;
  };
}

export interface MisionFinal {
  titulo: string;
  descripcion: string;
  contexto: string; // Narrativa del desafío
  requisitos: string[]; // Qué debe haber aprendido
  tipo: "arcade" | "investigacion" | "dialogo" | "escritura" | "batalla_procesal";
  dificultad: 1 | 2 | 3;
  consecuencia_exito: string;
  consecuencia_fracaso: string;
}

export interface ArcoNpc {
  titulo: string; // Arco narrativo general
  etapas: EtapaMision[];
  mision_final: MisionFinal;
  consecuencias_globales: {
    reputacion: number;
    trauma?: number;
    atributos?: Record<string, number>;
    desbloquea?: string[];
  };
}

export interface Npc {
  id: NpcId;
  nombre: string;
  titulo: string;
  zona: string;
  emoji: string;
  icono?: string;
  especialidad?: string;
  descripcion: string;
  personalidad: string;
  historia: string; // Quién es realmente

  // Relaciones con otros NPCs
  aliados: NpcId[];
  enemigos: NpcId[];
  dependencias: NpcId[]; // NPCs cuyas misiones son requisito para esta

  // Diálogos contextuales
  dialogo_inicial: string;
  dialogos_etapas: Record<EstadoMision, string[]>;

  // Arco narrativo completo
  arco_principal: ArcoNpc;

  // Misiones secundarias
  misiones_secundarias?: Array<{
    titulo: string;
    descripcion: string;
    requisitos: EstadoMision[];
    recompensa: { reputacion: number; skill?: string };
  }>;
}

// ============================================================================
// DRA. NOEMÍ — ARCO: "LA JUEZA QUE ENSEÑA COMPETENCIA"
// ============================================================================

export const DRA_NOEMÍ: Npc = {
  id: "dra_noemí",
  nombre: "Dra. Noemí Vásquez",
  titulo: "Jueza de Primera Instancia",
  zona: "competencia",
  emoji: "⚖️",
  descripcion: "Magistrada de 45 años, doctora en Derecho Procesal. Experta en competencia y jurisdicción.",
  personalidad: "Seria, meticulosa, no tolera errores formales. Te enseña con firmeza pero respeta a quien aprende.",
  historia:
    "Noemí ha visto cientos de demandas rechazadas por incompetencia. Para ella, la competencia es la base del estado de derecho. Su obsesión: evitar nulidades por vicios de competencia.",

  aliados: ["prof_torres"],
  enemigos: [],
  dependencias: [],

  dialogo_inicial:
    "Bienvenido a mi juzgado. Aquí la competencia es TODO. Un error de jurisdicción equivale a nulidad de pleno derecho. ¿Entiende los alcances?",

  dialogos_etapas: {
    no_iniciada: ["No tenemos negocios aún."],
    en_progreso: [
      "Veo que empiezas a comprender la materia. Continúa así.",
      "Recuerda: art. 254, art. 45-148 COT. La demanda debe cumplirse al pie de la letra.",
    ],
    etapa_1: ["Bien. Ahora sabes qué es competencia relativa."],
    etapa_2: ["Interesante. Distingues entre inhibitoria y declinatoria."],
    etapa_3: [
      "Estás listo para lo difícil. Las excepciones de competencia y los conflictos de competencia.",
    ],
    desafio_final: ["Aquí es donde se separan los abogados de los aficionados."],
    completada: ["Has aprendido bien. Eres bienvenido en mi juzgado."],
    fallida: ["Lástima. La competencia requiere precisión. Inténtalo de nuevo."],
  },

  arco_principal: {
    titulo: "La Forja de la Competencia",
    etapas: [
      {
        numero: 1,
        titulo: "Fundamentos de Competencia Absoluta",
        descripcion:
          "Noemí te explica la diferencia entre competencia absoluta (materia, fuero) y relativa (territorio).",
        aprendizaje: "Competencia absoluta vs relativa. Art. 45-133 COT.",
        actividad: "Clasificar 5 casos por tipo de competencia. Arcade rápido.",
        recompensa: { reputacion: 10, conocimiento: 15 },
      },
      {
        numero: 2,
        titulo: "Las Excepciones de Competencia",
        descripcion:
          "Aprendes a interponer excepción de incompetencia relativa (art. 303 N°1 CPC).",
        aprendizaje: "Excepciones dilatorias. Art. 303 CPC.",
        actividad: "Redactar escrito de excepción contra tribunal incompetente.",
        recompensa: { reputacion: 15, conocimiento: 20, atributo: "rigor_formal" },
      },
      {
        numero: 3,
        titulo: "Conflictos de Competencia",
        descripcion:
          "Noemí te enseña los mecanismos de inhibitoria (art. 101) y declinatoria (art. 106).",
        aprendizaje:
          "Inhibitoria vs Declinatoria. Cuestiones de competencia. Art. 101-112 CPC.",
        actividad: "Caso investigativo: Determinar inhibitoria o declinatoria.",
        recompensa: { reputacion: 20, conocimiento: 25 },
      },
    ],
    mision_final: {
      titulo: "Juicio por Conflicto de Competencia",
      descripcion:
        "Una demanda fue interpuesta ante tribunal que reclama incompetencia. Dos juzgados se disputan el conocimiento.",
      contexto:
        "Demanda de nulidad. Materia: civil. Cuantía: $80M. Domicilio demandado: Región Metropolitana. Pero demanda interpuesta en tribunal de Valparaíso. Ahora: inhibitoria de Valparaíso vs. silencio de Santiago. ¿Qué pasa?",
      requisitos: [
        "Entender competencia relativa",
        "Distinguir inhibitoria de declinatoria",
        "Conocer art. 104 (silencio = competencia)",
      ],
      tipo: "investigacion",
      dificultad: 3,
      consecuencia_exito:
        "Noemí te reconoce como alguien que entiende el sistema. Desbloquea: 'Catedrático de Competencia' skill. +30 reputación.",
      consecuencia_fracaso:
        "Noemí niega audiencia. 'Vuelve cuando entiendas cómo funciona la ley.'",
    },
    consecuencias_globales: {
      reputacion: 50,
      atributos: { rigor_formal: 5, conocimiento_procesal: 10 },
      desbloquea: [
        "Especialista en Competencia",
        "Acceso a módulo InhibitoriaDeclinatoria sin restricciones",
      ],
    },
  },

  misiones_secundarias: [
    {
      titulo: "Revisión de demanda",
      descripcion: "Noemí necesita que revises 3 demandas por errores de competencia.",
      requisitos: ["en_progreso"],
      recompensa: { reputacion: 5 },
    },
  ],
};

// ============================================================================
// JUEZ SILVA — ARCO: "LA PRECAUCIÓN QUE SALVA PATRIMONIOS"
// ============================================================================

export const JUEZ_SILVA: Npc = {
  id: "juez_silva",
  nombre: "Sr. Juez Cornelio Silva",
  titulo: "Juez de Garantía",
  zona: "cautelares",
  emoji: "🔒",
  descripcion: "Magistrado de 62 años, conservador, especialista en medidas cautelares.",
  personalidad: "Protector del status quo. Exige tres requisitos claros antes de cualquier medida.",
  historia:
    "Silva ha visto fortunas destruidas por embargos negligentes. Para él, la cautela es ética judicial. Rechaza el 80% de peticiones de cautelares.",

  aliados: ["escribana_gloria"],
  enemigos: [],
  dependencias: [],

  dialogo_inicial:
    "Las cautelares son el arma nuclear del proceso. Una mal concedida destruye vidas. Por eso soy implacable con los tres requisitos.",

  dialogos_etapas: {
    no_iniciada: ["No tenemos negocios."],
    en_progreso: ["Veo que intentas aprender a manejar la precaución."],
    etapa_1: ["Bien. Sabes los tres requisitos: apariencia de derecho, periculum in mora, contracautela."],
    etapa_2: ["Interesante. Distingues entre prejudicial, precautoria e innominada."],
    etapa_3: ["Ahora vienen los casos difíciles: cautelares sin previo traslado."],
    desafio_final: ["Aquí decidirás si un patrimonio se congela o no."],
    completada: ["Has aprendido que la precaución es también justicia."],
    fallida: ["Vuelve cuando entiendas que las cautelares son para proteger, no para destruir."],
  },

  arco_principal: {
    titulo: "El Arte de la Precaución",
    etapas: [
      {
        numero: 1,
        titulo: "Los Tres Pilares Inviolables",
        descripcion: "Silva enseña: apariencia de derecho, periculum in mora, contracautela.",
        aprendizaje: "Art. 273 CPC. Los tres requisitos de medidas cautelares.",
        actividad: "Mini-juego: Evalúa 5 solicitudes de cautelares. ¿Proceden o no?",
        recompensa: { reputacion: 12, conocimiento: 18 },
      },
      {
        numero: 2,
        titulo: "Clases de Cautelares",
        descripcion: "Prejudicial, precautoria, innominada. Cuándo se usan.",
        aprendizaje: "Art. 273-302 CPC. Clasificación de medidas.",
        actividad: "Caso investigativo: Categorizar y diseñar medida cautelar adecuada.",
        recompensa: { reputacion: 15, conocimiento: 20 },
      },
      {
        numero: 3,
        titulo: "Cautelares Sin Previo Traslado",
        descripcion: "El caso extremo: cuándo se puede gravar un bien sin que se entere el demandado.",
        aprendizaje: "Art. 290-295 CPC. Urgencia extrema.",
        actividad: "Redactar solicitud de embargo sin previo traslado. Incluir fundamentación",
        recompensa: { reputacion: 20, conocimiento: 25 },
      },
    ],
    mision_final: {
      titulo: "Embargo Express Ante Silva",
      descripcion:
        "Un acreedor está por ser defraudado. Solicitas embargo sin previo traslado. ¿Silva lo concede?",
      contexto:
        "Demandante tiene contrato de compraventa incumplido. Demandado anuncia venta de bienes. Tienes 2 horas antes de que se transfieran los títulos. Necesitas embargo urgente sin notificación previa.",
      requisitos: [
        "Entender periculum in mora",
        "Demostrar apariencia de derecho",
        "Proponer contracautela realista",
      ],
      tipo: "escritura",
      dificultad: 3,
      consecuencia_exito:
        "Silva concede embargo. 'Finalmente alguien que entiende la urgencia.' +40 reputación. Skill: Embargo Express.",
      consecuencia_fracaso:
        "Silva rechaza. 'Tu argumentación es débil. Los patrimonios no se congelan por sospecha.'",
    },
    consecuencias_globales: {
      reputacion: 45,
      atributos: { estrategia: 5 },
      desbloquea: ["Maestro de Cautelares", "Sistema de Cartas integrado con misiones Silva"],
    },
  },
};

// ============================================================================
// RECEPTOR CASTRO — ARCO: "EL CAOS DE LA NOTIFICACIÓN"
// ============================================================================

export const RECEPTOR_CASTRO: Npc = {
  id: "receptor_castro",
  nombre: "Sr. Recep. Mauricio Castro",
  titulo: "Receptor Judicial",
  zona: "notificaciones",
  emoji: "📬",
  descripcion: "Profesional de 38 años, pragmático. 15 años notificando gente.",
  personalidad:
    "Cínico, divertido, cuenta historias de demandados que se esconden. Es tu aliado práctico en el terreno.",
  historia:
    "Castro ha perseguido a traficantes, jueces corruptos, abogados morosos. Para él, notificar es una ciencia de detectives. Sabe dónde se esconde la gente.",

  aliados: ["lic_neruda"],
  enemigos: [],
  dependencias: [],

  dialogo_inicial:
    "He notificado a gente en túneles, iglesias, bares. El art. 40-46 es mi biblia. Pero en el terreno, todo es improvisación.",

  dialogos_etapas: {
    no_iniciada: ["¿Necesitas notificar algo?"],
    en_progreso: ["Veo que aprendes los trucos del oficio."],
    etapa_1: ["Bien. Personal es la mejor, pero requiere saber dónde está el tipo."],
    etapa_2: ["Subsidiaria: dos intentos en días distintos. Después, Diario Oficial."],
    etapa_3: ["Ahora viene lo oscuro: dónde buscar cuando alguien quiere desaparecer."],
    desafio_final: ["Este demandado es profesional en evasión. Tú eres receptor o no."],
    completada: ["Eres detective judicial ahora."],
    fallida: ["La notificación fallida colapsa todo el juicio."],
  },

  arco_principal: {
    titulo: "La Hunt por el Demandado",
    etapas: [
      {
        numero: 1,
        titulo: "Notificación Personal: Fundamentos",
        descripcion:
          "Castro enseña: entre 6 AM y 22 PM, en domicilio. La forma correcta.",
        aprendizaje: "Art. 40 CPC. Notificación personal válida.",
        actividad:
          "Arcade: Identifica 8 direcciones válidas e inválidas para notificación.",
        recompensa: { reputacion: 10, conocimiento: 15 },
      },
      {
        numero: 2,
        titulo: "Notificación Subsidiaria y por Edicto",
        descripcion:
          "Cuando el demandado no está: dos intentos fallidos → Diario Oficial.",
        aprendizaje: "Art. 44-46 CPC. Publicación en diario oficial.",
        actividad:
          "Caso investigativo: Determinar si notificación fue válida o no.",
        recompensa: { reputacion: 15, conocimiento: 20 },
      },
      {
        numero: 3,
        titulo: "Casos Extremos: Demandados Evasivos",
        descripcion: "Cómo buscar cuando alguien definitivamente no quiere ser encontrado.",
        aprendizaje: "Prácticas de campo. Cómo validar intentos de notificación.",
        actividad: "Mini-investigación: Rastrear al demandado. Decisiones de búsqueda.",
        recompensa: { reputacion: 20, conocimiento: 25, atributo: "diligencia" },
      },
    ],
    mision_final: {
      titulo: "Notificar al Demandado Fantasma",
      descripcion: "Un demandado cambió domicilio tres veces. Notificación válida en 45 días.",
      contexto:
        "Domicilio 1 (juicio iniciado): Casa abandonada. Domicilio 2 (búsqueda día 10): Mudó a hostal. Domicilio 3 (búsqueda día 20): Se fue sin dejar rastro. Tienes hasta día 45 para notificación válida o preclusión del demandado.",
      requisitos: [
        "Entender art. 44 (dos intentos)",
        "Conocer publicación en Diario Oficial",
        "Identificar cuándo notificación es válida vs inválida",
      ],
      tipo: "investigacion",
      dificultad: 2,
      consecuencia_exito:
        "Castro admira tu trabajo de detective. 'Conseguiste lo que muchos no logran.' +35 reputación. Skill: Blindaje del 44.",
        consecuencia_fracaso:
          "Castro sacude la cabeza. 'Sin notificación válida, el juicio colapsa. Aprendes para la próxima.'",
    },
    consecuencias_globales: {
      reputacion: 40,
      atributos: { diligencia: 5 },
      desbloquea: [
        "Maestro Notificador",
        "Acceso a mini-investigaciones de notificación",
      ],
    },
  },
};

// ============================================================================
// EXPANDIDO: LIC. NERUDA, ESCRIBANA GLORIA, PROF. TORRES con mismos arcos
// Más 4 NPCs NUEVOS para expandir el sistema
// ============================================================================

// Por brevedad, aquí están las definiciones básicas de los nuevos NPCs:

export const LIC_NERUDA: Npc = {
  id: "lic_neruda",
  nombre: "Lic. Alejo Neruda",
  titulo: "Abogado Litigante",
  zona: "recursos",
  emoji: "⚔️",
  descripcion: "Veterano de mil casos. Especialista en recursos procesales.",
  personalidad: "Desencantado, bromista oscuro, pero enseña con generosidad.",
  historia:
    "Neruda ha ganado casos que parecían perdidos. Para él, la ley tiene grietas por todas partes. Enseña a otros a encontrarlas.",
  aliados: ["prof_torres", "receptor_castro"],
  enemigos: [],
  dependencias: [],
  dialogo_inicial:
    "He visto abogados ganar apelaciones imposibles. La clave: leer la ley como quien busca contradicciones.",
  dialogos_etapas: {
    no_iniciada: ["Aún no tenemos negocios."],
    en_progreso: ["Veo que intentas pensar como litigante."],
    etapa_1: ["Bien. Sabes apelación básica."],
    etapa_2: ["Ahora: casación. Forma vs fondo."],
    etapa_3: ["Los casos difíciles: cuando todo parece perdido."],
    desafio_final: ["Aquí veremos si puedes leer entre líneas."],
    completada: ["Has aprendido a pensar como litigante."],
    fallida: ["La casación requiere precisión. Vuelve cuando entiendas."],
  },
  arco_principal: {
    titulo: "El Litigante Oscuro",
    etapas: [
      {
        numero: 1,
        titulo: "Apelación: Primera Oportunidad",
        descripcion: "Art. 186-190. Cómo recurrir sentencias.",
        aprendizaje: "Apelación como recurso ordinario.",
        actividad: "Redactar apelación contra sentencia adversa.",
        recompensa: { reputacion: 12, conocimiento: 18 },
      },
      {
        numero: 2,
        titulo: "Casación en la Forma vs Casación en el Fondo",
        descripcion: "Art. 768 vs 775. Vicios procedimentales vs errores de derecho.",
        aprendizaje: "Casación. Vicios rectificables.",
        actividad: "Caso investigativo: Identificar causal de casación.",
        recompensa: { reputacion: 15, conocimiento: 20 },
      },
      {
        numero: 3,
        titulo: "Lectura de Jurisprudencia",
        descripcion: "Cómo argumentar contra precedentes. O usarlos a tu favor.",
        aprendizaje: "Jurisprudencia como ley.",
        actividad: "Análisis de sentencias: Encontrar inconsistencias.",
        recompensa: { reputacion: 20, conocimiento: 25 },
      },
    ],
    mision_final: {
      titulo: "Casación Imposible",
      descripcion:
        "Sentencia adversa con jurisprudencia en contra. ¿Cómo casas esto?",
      contexto:
        "Sentencia de primera instancia rechaza tu demanda. Jurisprudencia de la Corte está consolidada contra ti en 8 sentencias. Tienes UNA casación posible. Encuéntrala.",
      requisitos: [
        "Leer entre líneas de jurisprudencia",
        "Encontrar vicio no evidente",
        "Argumentar contra precedente",
      ],
      tipo: "investigacion",
      dificultad: 3,
      consecuencia_exito:
        "Neruda sonríe. 'Leíste bien. La grieta estaba ahí.' +45 reputación.",
      consecuencia_fracaso: "Neruda cierra el libro. 'A veces, la ley gana.'",
    },
    consecuencias_globales: {
      reputacion: 50,
      atributos: { estrategia: 5, conocimiento_procesal: 10 },
      desbloquea: ["Maestro Casacional", "Acceso a Sistema de Cartas mejorado"],
    },
  },
};

// Estructura similar para ESCRIBANA_GLORIA y PROF_TORRES... (abbrevés aquí)

export const ESCRIBANA_GLORIA: Npc = {
  id: "escribana_gloria",
  nombre: "Sra. Escribana Gloria Fuentes",
  titulo: "Escribana Notarial",
  zona: "prueba",
  emoji: "📜",
  descripcion: "Custodio de documentos. Entiende de instrumentos públicos y privados.",
  personalidad: "Seria. Cree en el poder de la documentación.",
  historia:
    "Gloria ha visto pleitos ganarse o perderse por una firma. Para ella, la prueba documental es la verdad del sistema.",
  aliados: ["juez_silva"],
  enemigos: [],
  dependencias: [],
  dialogo_inicial:
    "Un documento bien hecho vale más que cien testigos. Por eso los instrumentos públicos son la verdad del proceso.",
  dialogos_etapas: {
    no_iniciada: ["Sin documentos válidos, no hay caso."],
    en_progreso: ["Aprendes a valorar la documentación."],
    etapa_1: ["Bien. Sabes la diferencia entre público y privado."],
    etapa_2: ["Interesante. Distingues entre confesión de parte e instrumento."],
    etapa_3: ["Ahora: falsedades. Cómo impugnarse un documento."],
    desafio_final: ["Una firma falsa. ¿La encuentras?"],
    completada: ["Eres perito ocular ahora."],
    fallida: ["La falsedad se detecta con paciencia."],
  },
  arco_principal: {
    titulo: "La Verdad en el Papel",
    etapas: [
      {
        numero: 1,
        titulo: "Instrumentos Públicos vs Privados",
        descripcion: "Art. 1700 CC. Niveles de prueba.",
        aprendizaje: "Clasificación de documentos.",
        actividad: "Arcade: Clasificar 6 documentos.",
        recompensa: { reputacion: 12, conocimiento: 18 },
      },
      {
        numero: 2,
        titulo: "Confesión de Parte",
        descripcion: "Art. 1709 CC. La mejor prueba.",
        aprendizaje: "Confesión de parte en juicio.",
        actividad: "Redactar absolución de posiciones.",
        recompensa: { reputacion: 15, conocimiento: 20 },
      },
      {
        numero: 3,
        titulo: "Pericia Caligráfica",
        descripcion: "Cómo se impugna un documento. Falsedades.",
        aprendizaje: "Prueba pericial.",
        actividad: "Caso investigativo: Detectar falsedad documental.",
        recompensa: { reputacion: 20, conocimiento: 25 },
      },
    ],
    mision_final: {
      titulo: "Autenticación Bajo Presión",
      descripcion:
        "Una letra de cambio es impugnada. ¿Es genuina o falsa?",
      contexto:
        "Demandado reclama que su firma fue falsificada. Necesitas pericia caligráfica urgente. Gloria puede conseguir perito rápido... si confía en ti.",
      requisitos: [
        "Entender valorbinaria de documentos",
        "Saber cuándo encomendar pericia",
        "Presentar pericia correctamente",
      ],
      tipo: "escritura",
      dificultad: 2,
      consecuencia_exito:
        "Gloria autentica el documento. 'Tu demanda está sólida ahora.' +30 reputación.",
      consecuencia_fracaso:
        "Pericia declara falsedad. Caso colapsa. Gloria no vuelve a confiar.",
    },
    consecuencias_globales: {
      reputacion: 40,
      atributos: { rigor_formal: 5 },
      desbloquea: ["Maestro Probatorio"],
    },
  },
};

export const PROF_TORRES: Npc = {
  id: "prof_torres",
  nombre: "Prof. Dr. Enrique Torres",
  titulo: "Catedrático de Derecho Procesal",
  zona: "cosa_juzgada",
  emoji: "📚",
  descripcion: "Profesor de 68 años, doctrinario puro.",
  personalidad: "Erudito, paciente, pero socrático. Pregunta más que responde.",
  historia:
    "Torres ha escrito libros sobre cosa juzgada que son referencia. Para él, el proceso es filosofía aplicada.",
  aliados: ["dra_noemí"],
  enemigos: [],
  dependencias: [],
  dialogo_inicial:
    "La cosa juzgada es el corazón del proceso. Art. 175-177. Pero ¿realmente entiendes qué significa?",
  dialogos_etapas: {
    no_iniciada: ["Vuelve cuando estés listo para pensar."],
    en_progreso: ["Veo que intentas pensar doctrinariamente."],
    etapa_1: ["Bien. Distingues formal de material."],
    etapa_2: ["Interesante. Entiendes preclusión."],
    etapa_3: ["Ahora: los casos límite. Donde la teoría no alcanza."],
    desafio_final: ["Un problema que no tiene respuesta clara."],
    completada: ["Has aprendido a pensar como profesor."],
    fallida: ["La doctrina requiere precisión. Vuelve."],
  },
  arco_principal: {
    titulo: "Filosofía del Proceso",
    etapas: [
      {
        numero: 1,
        titulo: "Cosa Juzgada: Formal vs Material",
        descripcion: "Art. 175 vs 177. Dos tipos de seguridad.",
        aprendizaje: "Cosa juzgada.",
        actividad: "Análisis de jurisprudencia sobre cosa juzgada.",
        recompensa: { reputacion: 12, conocimiento: 20 },
      },
      {
        numero: 2,
        titulo: "Preclusión y Bilateralidad",
        descripcion: "Art. 64, 76. Los pilares del proceso.",
        aprendizaje: "Preclusión como muerte de derechos.",
        actividad: "Caso investigativo: ¿Hubo preclusión?",
        recompensa: { reputacion: 15, conocimiento: 25 },
      },
      {
        numero: 3,
        titulo: "Jurisprudencia como Doctrina Viva",
        descripcion:
          "Cómo la Corte Suprema crea ley a través de sentencias.",
        aprendizaje: "Jurisprudencia consolidada.",
        actividad: "Escribir pequeño ensayo doctrinario.",
        recompensa: { reputacion: 25, conocimiento: 30 },
      },
    ],
    mision_final: {
      titulo: "Ensayo Doctrinario Definitivo",
      descripcion:
        "Analiza si esta sentencia anterior produce cosa juzgada en este nuevo conflicto.",
      contexto:
        "Identidad de partes, objeto y causa. ¿Están presentes? ¿Hay cosa juzgada? Una sentencia de 2015 vs un juicio de 2024. Mismo bien, diferentes demandantes. ¿Vinculado?",
      requisitos: [
        "Entender identidad tripartita",
        "Analizar jurisprudencia sobre identidad",
        "Argumentar como doctrinario",
      ],
      tipo: "escritura",
      dificultad: 3,
      consecuencia_exito:
        "Torres publica tu análisis en su revista. 'Has entendido el corazón del proceso.' +50 reputación. Skill: Doctrinal Expert.",
      consecuencia_fracaso:
        "Torres devuelve tu ensayo. 'Faltan rigor y profundidad.'",
    },
    consecuencias_globales: {
      reputacion: 55,
      atributos: { conocimiento_procesal: 15 },
      desbloquea: ["Maestro Doctrinario", "Acceso a Submundos doctrinales"],
    },
  },
};

// ============================================================================
// NUEVOS NPCs (breve estructura):
// ============================================================================

export const FISCAL_MENDOZA: Npc = {
  id: "fiscal_mendoza",
  nombre: "Fiscal Jorge Mendoza",
  titulo: "Fiscal Adjunto",
  zona: "recursos",
  emoji: "🔍",
  descripcion: "Fiscal investigador. Persigue vicios procedimentales.",
  personalidad: "Implacable. No deja pasar errores de derecho.",
  historia:
    "Mendoza ha demolido sentencias que parecían inmemorables. Ve vicios donde otros ven justicia.",
  aliados: ["lic_neruda"],
  enemigos: ["dra_noemí"],
  dependencias: ["lic_neruda"],
  dialogo_inicial:
    "Los vicios procedimentales son mi especialidad. Art. 768 es mi arma.",
  dialogos_etapas: {
    no_iniciada: ["Sin vicios, no tengo trabajo."],
    en_progreso: ["Aprendes a cazar errores."],
    etapa_1: ["Bien. Sabes qué es un vicio procesal."],
    etapa_2: ["Interesante. Distingues entre salvables e insalvables."],
    etapa_3: ["Ahora: cómo construir un casación ganadora."],
    desafio_final: ["Una sentencia defectuosa. ¿Puedes derribarla?"],
    completada: ["Eres cazador de vicios ahora."],
    fallida: ["Los vicios se detectan con ojo entrenado."],
  },
  arco_principal: {
    titulo: "La Caza del Vicio Procesal",
    etapas: [
      {
        numero: 1,
        titulo: "Clasificación de Vicios",
        descripcion: "Art. 768. 16 causales de nulidad procesal.",
        aprendizaje: "Causales de nulidad por vicio procesal.",
        actividad: "Arcade rápido: Identifica 8 vicios en sentencias.",
        recompensa: { reputacion: 15, conocimiento: 20 },
      },
      {
        numero: 2,
        titulo: "Vicios Salvables vs Insalvables",
        descripcion: "Cuáles precluyen, cuáles destruyen sentencias.",
        aprendizaje: "Art. 84 CPC. Vicios insalvables.",
        actividad: "Análisis: ¿Este vicio es mortal?",
        recompensa: { reputacion: 18, conocimiento: 25 },
      },
      {
        numero: 3,
        titulo: "Construcción de Casación Ganadora",
        descripcion: "Cómo armar un libelo de casación basado en vicios.",
        aprendizaje: "Estrategia casacional.",
        actividad: "Redactar libelo de casación completo.",
        recompensa: { reputacion: 25, conocimiento: 30 },
      },
    ],
    mision_final: {
      titulo: "Casación que Mata Sentencia",
      descripcion: "Encuentra el vicio que destruye esta sentencia.",
      contexto: "Sentencia aparentemente sólida. Pero tiene un vicio oculto.",
      requisitos: [
        "Leer entre líneas",
        "Identificar vicio no obvio",
        "Construir argumento de casación",
      ],
      tipo: "investigacion",
      dificultad: 3,
      consecuencia_exito:
        "Mendoza te recluta. 'Tienes ojo de fiscal.' +40 reputación.",
      consecuencia_fracaso: "Mendoza niega respuesta.",
    },
    consecuencias_globales: {
      reputacion: 50,
      atributos: { estrategia: 5 },
      desbloquea: ["Fiscal Adjunto"],
    },
  },
};

// Más NPCs (PARALEGAL_DIEGO, SECRETARIA_PATRICIA, JUEZ_SUPREMO_ARAYA) siguen patrón similar...

// ============================================================================
// EXPORTAR
// ============================================================================

export const NPCS_V2: Record<NpcId, Npc> = {
  dra_noemí: DRA_NOEMÍ,
  juez_silva: JUEZ_SILVA,
  receptor_castro: RECEPTOR_CASTRO,
  lic_neruda: LIC_NERUDA,
  escribana_gloria: ESCRIBANA_GLORIA,
  prof_torres: PROF_TORRES,
  fiscal_mendoza: FISCAL_MENDOZA,
  paralegal_diego: {
    id: "paralegal_diego",
    nombre: "Diego Flores",
    titulo: "Paralegal",
    zona: "demanda",
    emoji: "📋",
    descripcion: "Joven paralegal que conoce cada detalle de la demanda.",
    personalidad: "Rápido, eficiente, perfectionist en redacción.",
    historia:
      "Diego ha redactado miles de demandas. Conoce art. 254 como nadie.",
    aliados: ["dra_noemí"],
    enemigos: [],
    dependencias: [],
    dialogo_inicial:
      "La demanda bien hecha es el 50% del juicio. Art. 254 al pie de la letra.",
    dialogos_etapas: {
      no_iniciada: ["Demanda pendiente?"],
      en_progreso: ["Aprendes a redactar."],
      etapa_1: ["Bien. Sabes los 7 requisitos."],
      etapa_2: ["Interesante. Distingues causa de acción."],
      etapa_3: ["Ahora: demandas complejas con múltiples pretensiones."],
      desafio_final: ["Una demanda imposible: múltiple con reconvención."],
      completada: ["Eres redactor demandal ahora."],
      fallida: ["Vuélvelo a intentar."],
    },
    arco_principal: {
      titulo: "El Arte de la Demanda Perfecta",
      etapas: [
        {
          numero: 1,
          titulo: "Los 7 Requisitos de la Demanda",
          descripcion:
            "Art. 254 CPC. Identificación, legitimación, competencia, exposición, pretensión, patrocinio, firma.",
          aprendizaje: "Requisitos de admisibilidad.",
          actividad: "Arcade: Revisar 5 demandas. ¿Cuál cumple?",
          recompensa: { reputacion: 12, conocimiento: 18 },
        },
        {
          numero: 2,
          titulo: "Causa de Acción y Pretensión",
          descripcion: "Diferenciar hechos de derechos invocados.",
          aprendizaje: "Estructura lógica de demanda.",
          actividad: "Redactar demanda de cobro simple.",
          recompensa: { reputacion: 15, conocimiento: 20 },
        },
        {
          numero: 3,
          titulo: "Demandas Complejas",
          descripcion: "Múltiples pretensiones, reconvención, acumulación.",
          aprendizaje: "Demandas estratégicas.",
          actividad: "Redactar demanda con reconvención.",
          recompensa: { reputacion: 20, conocimiento: 25 },
        },
      ],
      mision_final: {
        titulo: "Demanda de Caso Imposible",
        descripcion:
          "Redacta demanda para situación procesal compleja. Debe cumplir todos los requisitos.",
        contexto:
          "Múltiples demandantes, demandado esquivo, reconvención probable. Demanda debe ser inexpugnable.",
        requisitos: [
          "Cumplir art. 254",
          "Identificar todas las pretensiones",
          "Anticipar reconvención",
        ],
        tipo: "escritura",
        dificultad: 2,
        consecuencia_exito: "Diego la revisa. 'Perfecto. Lista para presentar.' +30 reputación.",
        consecuencia_fracaso:
          "Diego marca errores de redacción. 'Vuelve a intentar.'",
      },
      consecuencias_globales: {
        reputacion: 40,
        atributos: { rigor_formal: 5 },
        desbloquea: ["Maestro Demandal"],
      },
    },
  },
  secretaria_patricia: {
    id: "secretaria_patricia",
    nombre: "Secretaria Patricia López",
    titulo: "Secretaria de Juzgado",
    zona: "demanda",
    emoji: "📞",
    descripcion: "Secretaria de 52 años. Sabe todos los plazos, todas las reglas.",
    personalidad: "Maternal pero firme. La verdadera autoridad del juzgado.",
    historia:
      "Patricia administra la justicia desde su escritorio. Sin ella, el sistema colapsa.",
    aliados: ["dra_noemí"],
    enemigos: [],
    dependencias: [],
    dialogo_inicial:
      "Aquí los plazos son sagrados. Un día tarde y pierdes todo. He visto abogados llorar.",
    dialogos_etapas: {
      no_iniciada: ["Cuídate de los plazos."],
      en_progreso: ["Aprendes a contar días."],
      etapa_1: ["Bien. Sabes cómo se cuentan los plazos."],
      etapa_2: ["Interesante. Distingues hábiles de inhábiles."],
      etapa_3: ["Ahora: prorrogación, ampliación, suspensión."],
      desafio_final: ["Un plazo a contrarreloj."],
      completada: ["Ahora administras el tiempo como abogado."],
      fallida: ["Los plazos no perdonan."],
    },
    arco_principal: {
      titulo: "El Maestro de los Plazos",
      etapas: [
        {
          numero: 1,
          titulo: "Conteo de Plazos",
          descripcion: "Art. 64 CPC. Cómo se cuentan los días.",
          aprendizaje: "Plazos procesales.",
          actividad: "Mini-juego: Calcula 10 plazos correctamente.",
          recompensa: { reputacion: 10, conocimiento: 15 },
        },
        {
          numero: 2,
          titulo: "Días Hábiles e Inhábiles",
          descripcion: "Art. 66. Suspensión y continuación de plazos.",
          aprendizaje: "Regla de días inhábiles.",
          actividad: "Determina si plazo venció o no en 5 escenarios.",
          recompensa: { reputacion: 12, conocimiento: 18 },
        },
        {
          numero: 3,
          titulo: "Prorrogación y Ampliación",
          descripcion: "Cuándo se pueden extender plazos.",
          aprendizaje: "Estrategia de plazos.",
          actividad: "Redactar solicitud de prórroga fundamentada.",
          recompensa: { reputacion: 15, conocimiento: 20 },
        },
      ],
      mision_final: {
        titulo: "Carrera Contra el Reloj",
        descripcion: "Un plazo vence en 3 días. ¿Lo haces o precluyes?",
        contexto:
          "Hoy es miércoles. Plazo vence viernes. Pero viernes es feriado. ¿Cuándo es realmente?",
        requisitos: [
          "Contar plazos correctamente",
          "Identificar días inhábiles",
          "Actuar antes de preclusión",
        ],
        tipo: "dialogo",
        dificultad: 1,
        consecuencia_exito: "Patricia asiente. 'Lo hiciste a tiempo.' +25 reputación.",
        consecuencia_fracaso: "Patricia cierra el archivo. 'Preclusión. Fin.'",
      },
      consecuencias_globales: {
        reputacion: 35,
        atributos: { diligencia: 5 },
        desbloquea: ["Maestro de Plazos"],
      },
    },
  },
  juez_supremo_araya: {
    id: "juez_supremo_araya",
    nombre: "Ministro Humberto Araya",
    titulo: "Ministro de la Corte Suprema",
    zona: "cosajuzgada",
    emoji: "👑",
    descripcion:
      "Ministro de 72 años. La última instancia. Quien decide definitivamente.",
    personalidad:
      "Distante, pocas palabras, pero cada frase es sentencia. Respeto absoluto.",
    historia:
      "Araya ha dictado sentencias que cambiaron jurisprudencia. Para litigantes, es casi mítico.",
    aliados: ["prof_torres"],
    enemigos: ["fiscal_mendoza"],
    dependencias: ["prof_torres"],
    dialogo_inicial:
      "Llegar aquí es raro. Significa que perdiste todo abajo. ¿Qué me traes?",
    dialogos_etapas: {
      no_iniciada: ["No nos conocemos."],
      en_progreso: ["Veo que estudias la jurisprudencia."],
      etapa_1: ["Interesante. Entiendes mis sentencias."],
      etapa_2: ["Raro. Encuentras las grietas en mis fallos."],
      etapa_3: ["Muy raro. Eres abogado de Corte Suprema."],
      desafio_final: ["El caso definitivo. Tu vida procesal en uno."],
      completada: ["Has llegado al techo. Ahora es política."],
      fallida: ["Vuelve cuando entiendas lo que aquí se juega."],
    },
    arco_principal: {
      titulo: "La Última Instancia",
      etapas: [
        {
          numero: 1,
          titulo: "Jurisprudencia de Araya",
          descripcion:
            "Analizar 5 sentencias del Ministro. Encontrar sus patrones.",
          aprendizaje: "Cómo piensa la Corte Suprema.",
          actividad: "Investigación: Analiza sentencias de Araya.",
          recompensa: { reputacion: 20, conocimiento: 25 },
        },
        {
          numero: 2,
          titulo: "Casación Definitiva",
          descripcion: "Cómo armar casación que convenza a Araya.",
          aprendizaje: "Argumentación ante Corte Suprema.",
          actividad: "Redacta libelo de casación para Corte.",
          recompensa: { reputacion: 25, conocimiento: 30 },
        },
        {
          numero: 3,
          titulo: "La Decisión del Ministro",
          descripcion: "Araya decide. Tu caso llega a Tribunal Pleno.",
          aprendizaje: "Política judicial.",
          actividad: "Presenta caso ante Ministro. Defiende tesis.",
          recompensa: { reputacion: 35, conocimiento: 40 },
        },
      ],
      mision_final: {
        titulo: "Audiencia Ante el Ministro",
        descripcion: "Presenta tu caso definitivo ante Araya.",
        contexto:
          "Caso ha perdido en dos instancias. Casación es la última esperanza. Tienes 30 minutos.",
        requisitos: [
          "Dominar jurisprudencia de Araya",
          "Argumentar con precisión",
          "Ser convincente",
        ],
        tipo: "dialogo",
        dificultad: 3,
        consecuencia_exito:
          "Araya asiente lentamente. 'Acuerdo a casación.' Tu nombre entra en jurisprudencia. +100 reputación. FINAL VERDADERO.",
        consecuencia_fracaso:
          "Araya rechaza. 'Case rechazada.' Fin del camino. +10 trauma.",
      },
      consecuencias_globales: {
        reputacion: 100,
        atributos: { conocimiento_procesal: 20, estrategia: 10 },
        desbloquea: [
          "Legendario Litigante",
          "Acceso a Submundos finales",
          "Acceso a zona secreta: Corte Suprema",
        ],
      },
    },
  },
};

// Array derivado para iteración — usado por NPCInteractionPanel
export const TODOS_NPCS: Npc[] = Object.values(NPCS_V2);


// ============================================================================
// ENCUENTROS DE ZONA
// ----------------------------------------------------------------------------
// Lo que antes vivía en `data/npcs.ts`, que era un SEGUNDO sistema de NPC en
// paralelo a éste: el mismo personaje definido dos veces con textos distintos,
// el modal de zona leyendo del archivo viejo y los arcos de mentor leyendo de
// aquí. Ahora hay una sola fuente de verdad. Los arcos siguen arriba; esto son
// los diálogos cortos que el jugador encuentra al visitar la zona.
//
// Identificadores unificados con los de este archivo:
//   doctora_noemí → dra_noemí · abogado_neruda → lic_neruda
//   profesor_torres → prof_torres
// ============================================================================

export interface DialogoEncuentro {
  id: string;
  texto: string;
  efecto?: { reputacion?: number; trauma?: number; nivelEconomico?: number };
}

export interface EncuentroZona {
  dialogo_inicial: DialogoEncuentro;
  dialogos: DialogoEncuentro[];
  mision?: { titulo: string; descripcion: string; recompensa: string };
}

export const ENCUENTROS_ZONA: Partial<Record<NpcId, EncuentroZona>> = {
  dra_noemí: {
    dialogo_inicial: {
      id: "noemí_001",
      texto: "Bienvenido a mi juzgado. Aquí la competencia es todo. Un error en jurisdicción = nulidad. ¿Entiendes los alcances de tu acción?",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "noemí_002",
        texto: "He visto abogados arruinarse por no revisar competencia relativa. La materia, el fuero, la cuantía... todo importa.",
        efecto: { reputacion: 5 },
      },
      {
        id: "noemí_003",
        texto: "La demanda debe cumplir art. 254 al pie de la letra. Ni una coma fuera de lugar. Eso es lo que nos diferencia del caos.",
        efecto: { reputacion: 10 },
      },
      {
        id: "noemí_004",
        texto: "¿Inhibitoria o declinatoria? Muchos se confunden. Inhibitoria es para invocar competencia a favor de otro tribunal. Declinatoria es para rechazar la propia.",
        efecto: { reputacion: 15 },
      },
    ],
    mision: {
      titulo: "Resolver caso de competencia cuestionada",
      descripcion: "Una demanda fue interpuesta ante tribunal incompetente por materia. Debe determinarse si procede inhibitoria o declinatoria.",
      recompensa: "+15 Reputación · +20 Ciclo Procesal",
    },
  },
  juez_silva: {
    dialogo_inicial: {
      id: "silva_001",
      texto: "Las cautelares son el arma más peligrosa del proceso. Una medida mal concedida destruye patrimonios. Por eso soy cauteloso... con todo.",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "silva_002",
        texto: "Art. 273 a 302. Las prejudiciales son anteriores al proceso. Las precautorias preparatorias. Innominadas en el 298. Cada una con su régimen.",
        efecto: { reputacion: 5 },
      },
      {
        id: "silva_003",
        texto: "Para obtener una cautelar conmigo necesitas: verosimilitud del derecho, peligro en la demora, y contracautela. Sin eso, rechazaré de plano.",
        efecto: { reputacion: 10 },
      },
      {
        id: "silva_004",
        texto: "He visto litigantes gastar fortunas en cautelares inútiles. La verdadera estrategia es prever qué necesitarás antes de que suceda.",
        efecto: { reputacion: 8 },
      },
    ],
    mision: {
      titulo: "Justificar una medida cautelar urgente",
      descripcion: "Un embargo debe decretarse sin previo traslado. Demuestra que sin él el deudor dispersará su patrimonio.",
      recompensa: "+12 Reputación · Embargo Express skill",
    },
  },
  receptor_castro: {
    dialogo_inicial: {
      id: "castro_001",
      texto: "He notificado abogados, jueces, traficantes. Los demandados son creativos en desaparecer. Art. 40-46 es mi biblia, pero en el terreno es pura improvisación.",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "castro_002",
        texto: "Personal es la mejor. Entre 6 AM y 22 PM, en el domicilio. Pero si el tipo no está... subsidiaria: dos intentos en días distintos.",
        efecto: { reputacion: 5 },
      },
      {
        id: "castro_003",
        texto: "Publicación en diario oficial. El último recurso. Sirve cuando el demandado es prácticamente inubicable o intenta evadir notificación.",
        efecto: { reputacion: 10 },
      },
      {
        id: "castro_004",
        texto: "Carta certificada post-subsidiaria. Muchos olvidan esto. Sin ella, la notificación es incompleta. He visto nulidades por esto.",
        efecto: { reputacion: 7 },
      },
    ],
    mision: {
      titulo: "Notificar a demandado evasivo",
      descripcion: "Un demandado cambió tres veces de domicilio. Debes lograr notificación válida dentro de 30 días.",
      recompensa: "+10 Reputación · Blindaje del 44 skill",
    },
  },
  lic_neruda: {
    dialogo_inicial: {
      id: "neruda_001",
      texto: "He interpuesto apelaciones que nadie creía que funcionarían. La clave: leer la ley como si fuera poesía. Hay grietas en todas partes.",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "neruda_002",
        texto: "Art. 186-190. Apelación. 15 días. Demandante y demandado pueden. El tribunal de apelaciones revisa de novo.",
        efecto: { reputacion: 5 },
      },
      {
        id: "neruda_003",
        texto: "Casación en la forma: 768. Vicios de procedimiento. Casación en el fondo: 775. Errores de derecho sustantivo. Ambas son desasimiento.",
        efecto: { reputacion: 10 },
      },
      {
        id: "neruda_004",
        texto: "La Corte Suprema leo como quien lee a Cortázar: entre líneas. Donde otros ven silencio, yo veo jurisprudencia.",
        efecto: { reputacion: 12 },
      },
    ],
    mision: {
      titulo: "Preparar apelación imposible",
      descripcion: "Sentencia adversa con argumentación floja. Identifica 3 vicios que justifiquen apelación exitosa.",
      recompensa: "+15 Reputación · +1 Ciclo Procesal",
    },
  },
  escribana_gloria: {
    dialogo_inicial: {
      id: "gloria_001",
      texto: "Un documento bien hecho vale más que cien testigos. Por eso los instrumentos públicos son irrefutables en su forma, aunque no en su contenido.",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "gloria_002",
        texto: "Art. 1700 CC. Instrumento público prueba hasta la tacha de falsedad. Privado requiere reconocimiento para ser plena prueba.",
        efecto: { reputacion: 5 },
      },
      {
        id: "gloria_003",
        texto: "Pericia caligráfica. Cuando la falsedad es cuestionada, necesitas experto. He visto casos ganarse o perderse por una firma.",
        efecto: { reputacion: 10 },
      },
      {
        id: "gloria_004",
        texto: "La confesión de parte es la mejor prueba. Art. 1709. Si el adversario confiesa, no hay nada que probar.",
        efecto: { reputacion: 8 },
      },
    ],
    mision: {
      titulo: "Autenticar documento cuestionado",
      descripcion: "Una letra de cambio es impugnada como falsificada. Debes obtener pericia caligráfica que la valide.",
      recompensa: "+12 Reputación · +10 Nivel Económico",
    },
  },
  prof_torres: {
    dialogo_inicial: {
      id: "torres_001",
      texto: "La cosa juzgada es el corazón del proceso. Art. 175, 177. Seguridad jurídica. Pero cuidado: no es tan simple como parece.",
      efecto: { reputacion: 0 },
    },
    dialogos: [
      {
        id: "torres_002",
        texto: "¿Diferencia entre cosa juzgada material y cosa juzgada formal? Formal: se ejecutoria sin apelación. Material: produce estabilidad permanente.",
        efecto: { reputacion: 5 },
      },
      {
        id: "torres_003",
        texto: "Preclusión. Art. 64. Es la muerte de un derecho por inactividad. Bilateralidad. Art. 76. Ambas partes deben ser oídas. Estos son los pilares.",
        efecto: { reputacion: 10 },
      },
      {
        id: "torres_004",
        texto: "La jurisprudencia es ley viva. La Corte Suprema sienta precedentes. ¿Cómo se argumenta contra jurisprudencia consolidada? Con más jurisprudencia.",
        efecto: { reputacion: 15 },
      },
    ],
    mision: {
      titulo: "Escribir ensayo doctrinario",
      descripcion: "Analiza si una sentencia anterior produce cosa juzgada en este nuevo conflicto. Identidad de partes, objeto, causa.",
      recompensa: "+20 Reputación · Unlock: Doctrinal Mode",
    },
  },
};


/** NPC que habita una zona del mapa y tiene encuentro corto. */
export function npcsDeZona(zona: string): Npc[] {
  const alterno = zona === "cosajuzgada" ? "cosa_juzgada" : zona === "cosa_juzgada" ? "cosajuzgada" : zona;
  return Object.values(NPCS_V2).filter(
    (n) => (n.zona === zona || n.zona === alterno) && ENCUENTROS_ZONA[n.id] !== undefined,
  );
}

/** Encuentro de zona de un NPC, si lo tiene. */
export function encuentroDe(id: NpcId): EncuentroZona | undefined {
  return ENCUENTROS_ZONA[id];
}

/** Un NPC por su id. */
export function getNpcV2(id: NpcId): Npc | undefined {
  return NPCS_V2[id];
}

/**
 * Retratos. El campo `emoji` de cada NPC es un símbolo de su MATERIA (candado
 * para cautelares, buzón para notificaciones), que funciona como icono de zona
 * pero no como cara: en el medallón del diálogo salía un candado en lugar del
 * personaje. Esto da la figura humana; el símbolo se conserva para lo demás.
 */
export const RETRATOS: Partial<Record<NpcId, string>> = {
  dra_noemí: "👩‍⚖️",
  juez_silva: "🧑‍⚖️",
  receptor_castro: "🧑‍💼",
  lic_neruda: "🕵️",
  escribana_gloria: "👩‍💼",
  prof_torres: "👨‍🏫",
  fiscal_mendoza: "🧑‍💻",
  paralegal_diego: "🧑‍🎓",
  secretaria_patricia: "👩‍💻",
  juez_supremo_araya: "👑",
};

/** Retrato del personaje; si no lo tiene, su símbolo de materia. */
export function retratoDe(id: NpcId): string {
  return RETRATOS[id] ?? NPCS_V2[id]?.emoji ?? "🧑";
}
