// ============================================================================
// TIPOS DEL DOMINIO — Derecho Procesal Civil chileno
// Referencias: Constitución Política de la República (CPR), Código Orgánico
// de Tribunales (COT), Código de Procedimiento Civil (CPC).
// ============================================================================

import type { FichaRepaso } from "@/lib/repaso";

export type Atributos = {
  conocimiento_procesal: number;     // dominio del CPC, COT, doctrina
  persuasion_forense: number;        // alegatos, audiencias
  diligencia: number;                // gestión de plazos, escritos a tiempo
  rigor_formal: number;              // requisitos formales: emplazamiento, escritos
  estrategia: number;                // elección de vía, recursos, cautelares
  resistencia_psicologica: number;   // dilaciones, plazos fatales, doble lectura
};

export type Origen =
  | "litigante_freelancer"
  | "estudio_grande"
  | "defensoria_publica"
  | "academia"
  | "litigante_propia_causa";

export type Rol = "abogado_demandante" | "abogado_demandado" | "juez" | "secretario" | "litigante_propio";

export type Personaje = {
  nombre: string;
  sexo: "masculino" | "femenino";
  origen: Origen;
  rol: Rol;
  nivelEconomico: number;
  atributos: Atributos;
  reputacion: number;          // ante el tribunal y la contraparte
  trauma: number;              // por dilaciones, rebeldías, vistas suspendidas
  expedientesGanados: number;
  expedientesPerdidos: number;
  cicloProcesal: number;       // ciclos completos (juicios terminados)
};

// ============== TRIBUNALES Y COMPETENCIA ==============

export type TipoTribunal =
  | "juzgado_letras_civil"
  | "juzgado_letras_competencia_comun"
  | "corte_apelaciones"
  | "corte_suprema"
  | "tribunal_arbitral_derecho"
  | "tribunal_arbitral_arbitrador"
  | "tribunal_familia"          // ref. solo para distinguir
  | "tribunal_letras_trabajo";  // idem

export type FactorCompetencia =
  | "materia"      // arts. 130-133 COT
  | "fuero"        // arts. 50, 168 COT
  | "cuantia"      // arts. 115-129 COT
  | "territorio";  // arts. 134-148 COT

export type Tribunal = {
  id: string;
  tipo: TipoTribunal;
  asiento: string;
  competente: boolean;
  factor?: FactorCompetencia;
  articulo?: string;
};

// ============== ETAPAS DEL JUICIO ORDINARIO ==============
// CPC Libro II (arts. 253-433).

export type EtapaJuicio =
  | "discusion"        // demanda, contestación, réplica, dúplica (eventual reconvención)
  | "conciliacion"     // arts. 262-268 CPC
  | "prueba"           // arts. 318-433 CPC
  | "sentencia"        // arts. 158, 162-170, 432 CPC
  | "recursos"         // Libro III
  | "ejecucion";       // cumplimiento incidental o juicio ejecutivo

// ============== ESCRITOS / ACTOS PROCESALES ==============

export type TipoEscrito =
  | "demanda"               // art. 254 CPC
  | "contestacion"          // art. 309 CPC (excepciones dilatorias + perentorias)
  | "replica"               // art. 311 CPC
  | "duplica"               // art. 312 CPC
  | "reconvencion"          // art. 314 CPC
  | "lista_testigos"        // art. 320 CPC
  | "minuta_puntos_prueba"  // art. 320 CPC
  | "observaciones_prueba"  // art. 430 CPC
  | "demanda_ejecutiva"     // art. 434 CPC
  | "oposicion_ejecucion";  // art. 464 CPC

export type Escrito = {
  id: string;
  tipo: TipoEscrito;
  fecha: number;
  plazoDias: number;             // plazo legal aplicable
  presentadoDentroDePlazo: boolean;
  observaciones?: string;
  articulo: string;
};

// ============== EXPEDIENTE (CAUSA) ==============

export type CuadernoEjecutivo = "principal" | "apremio" | "tercerias";

export type Expediente = {
  id: string;
  rol: string;                   // "C-1234-2026"
  materia: string;
  partes: { actor: string; demandado: string };
  cuantia?: number;
  fuero: boolean;
  procedimiento: "ordinario" | "sumario" | "ejecutivo" | "incidental";
  tribunal?: Tribunal;
  etapa: EtapaJuicio;
  escritos: Escrito[];
  cuadernos?: CuadernoEjecutivo[];
  notificacionDemanda?: {
    forma: "personal" | "personal_subsidiaria_44" | "cedula" | "estado_diario" | "avisos";
    fecha: number;
    articulo: string;
    valida: boolean;
  };
  pruebas: Prueba[];
  resoluciones: Resolucion[];
  recursosPendientes: RecursoInterpuesto[];
  resultado?: "ganado" | "perdido" | "transaccion" | "abandono" | "pendiente";
};

// ============== PRUEBA ==============
// CPC arts. 341 y ss.

export type MedioProbatorio =
  | "instrumental"    // 342-355 (públicos y privados)
  | "testimonial"     // 356-384
  | "confesion"       // 385-402 (absolución de posiciones)
  | "inspeccion"      // 403-408
  | "pericial"        // 409-425
  | "presunciones";   // 426-427

export type Prueba = {
  id: string;
  medio: MedioProbatorio;
  contenido: string;
  oportuna: boolean;
  legal: boolean;
  valorada?: "plena_prueba" | "base_de_presuncion" | "indicio" | "desestimada";
  articulo: string;
};

// ============== RESOLUCIONES JUDICIALES ==============
// Art. 158 CPC.

export type TipoResolucion =
  | "decreto_providencia_proveido"   // art. 158 inc. final
  | "auto"                            // art. 158 inc. 3°
  | "sentencia_interlocutoria_1grado" // art. 158 inc. 2° (derechos permanentes / sirve de base)
  | "sentencia_interlocutoria_2grado" // pone término al juicio o hace imposible continuación
  | "sentencia_definitiva";           // art. 158 inc. 1°

export type Resolucion = {
  id: string;
  tipo: TipoResolucion;
  contenido: string;
  fecha: number;
  notificada: boolean;
  firme: boolean;
  articulo: string;
};

// ============== RECURSOS ==============

export type TipoRecurso =
  | "aclaracion_rectificacion_enmienda"  // art. 182 CPC
  | "reposicion"                          // art. 181 CPC (ordinaria/extraordinaria)
  | "reposicion_especial"                 // ej. art. 319 CPC (auto de prueba)
  | "apelacion"                           // art. 187 CPC (regla general)
  | "apelacion_subsidiaria"               // art. 188 CPC (autos y decretos que alteran sustanciación)
  | "hecho_verdadero"                     // art. 203 CPC
  | "hecho_falso"                         // art. 196 CPC
  | "casacion_forma"                      // art. 766 CPC
  | "casacion_fondo"                      // art. 767 CPC
  | "queja"                               // art. 545 COT
  | "revision";                           // art. 810 CPC

export type RecursoInterpuesto = {
  id: string;
  tipo: TipoRecurso;
  contraResolucion: TipoResolucion;
  fecha: number;
  plazoDias: number;
  presentadoEnPlazo: boolean;
  fundado: boolean;
  resultado?: "acogido" | "rechazado" | "inadmisible";
  articulo: string;
};

// ============== INCIDENTES Y CAUTELARES ==============

export type Incidente = {
  id: string;
  tipo: "ordinario" | "especial" | "previo_y_especial_pronunciamiento";
  contenido: string;
  articulo: string;
  resuelto?: boolean;
};

export type MedidaCautelar = {
  id: string;
  clase: "prejudicial" | "precautoria" | "innominada";
  tipo: "secuestro" | "interventor" | "retencion" | "prohibicion_celebrar_actos_contratos";
  bienAfectado?: string;
  decretada: boolean;
  caucion?: number;
  articulo: string;
};

// ============== FLAGS, MUNDOS, LOG ==============

export type Flag = string;

export type Mundo =
  | "jurisdiccion"
  | "competencia"
  | "accion_pretension"
  | "demanda"
  | "emplazamiento"
  | "discusion"
  | "conciliacion"
  | "prueba"
  | "sentencia"
  | "recursos"
  | "juicio_ejecutivo"
  | "cautelares"
  | "examen"
  | "submundo_archivo_secreto"
  | "submundo_camaras_ocultas"
  | "submundo_doctrina_apocifa";

export type Logro = {
  id: string;
  titulo: string;
  descripcion: string;
  articulo: string;
  desbloqueado: boolean;
  fecha?: number;
};

// ============== INVESTIGACIÓN — PHASE 5 ==============

export type CasoResuelto = {
  caseId: string;
  titulo: string;
  resueltoBien: boolean;
  tiempoMinutos: number;
  pistasUtilizadas: number;
  hipótesisElegida: string;
  score: number;
  fechaResolucion: number;
};

export type CasoEnProgreso = {
  caseId: string;
  titulo: string;
  pistasDescubiertas: string[];
  hipótesisSeleccionada?: number;
  estado: "intro" | "explorando" | "deduccion" | "verificacion" | "resultado";
  inicioTiempo: number;
};

// ============== SISTEMA DE NPCS - MENTORÍA ==============

export type EstadoNpc =
  | "no_iniciada"
  | "en_progreso_etapa_1"
  | "en_progreso_etapa_2"
  | "en_progreso_etapa_3"
  | "desafio_final"
  | "completada"
  | "fallida";

export type ProgresionNpc = {
  npcId: string;
  estado: EstadoNpc;
  etapaActual: number;         // 1, 2, 3, o 0 si no iniciada
  fechaInicio: number;
  ultimoProgreso: number;
  actividadCompletada: boolean;
  intentosFinal: number;        // para desafío final
};

// ============== SISTEMA RPG — XP, NIVEL, MONEDAS ==============

export type MundoVisual =
  | "cybervalpo"    // Cyberpunk Valparaíso — identidad original del proyecto
  | "gotico"        // Gótico Judicial — vitrales, velas, tribunales medievales
  | "plataformas"   // Mundo Plataformas — colorido, alegre, monedas
  | "rts"           // StarCraft Legal — sci-fi, táctico, HUD complejo
  | "medieval";     // Age of Empires Procesal — pergaminos, castillos

export type SaveState = {
  version: number;
  creado: number;
  ultimoGuardado: number;
  personaje: Personaje;
  expedienteActivo?: Expediente;
  expedientesArchivados: Expediente[];
  cautelares: MedidaCautelar[];
  incidentes: Incidente[];
  flags: Flag[];
  mundoActual: Mundo;
  log: { t: number; texto: string; tag?: string }[];
  logros: Logro[];
  casosResueltos: CasoResuelto[];
  casosEnProgreso?: CasoEnProgreso;
  // Sistema de NPCs
  npcesEnProgreso: Map<string, ProgresionNpc>;
  npcesCompletados: string[];
  npcesDesbloqueados: string[];
  // Sistema RPG
  xp: number;
  nivel: number;
  monedas: number;
  mundoVisual: MundoVisual;
  misionActiva?: string;
  misionesCompletadas: string[];
  finalizado?: boolean;
  epilogo?: string;
  // Sistema de inventario — reliquias procesales
  relicsEquipadas: string[];   // IDs de reliquias actualmente equipadas (máx. 3)
  relicsCompradas: string[];   // IDs de reliquias compradas (historial)

  // Constancia. Ver lib/racha.ts: cuenta días con actividad real, no visitas.
  rachaDias: number;
  mejorRacha: number;
  ultimoDiaJugado: string;     // AAAA-MM-DD en hora local
  actividadesHoy: number;

  /** Mazo de repaso espaciado, indexado por id de pregunta. Ver lib/repaso.ts. */
  repaso: Record<string, FichaRepaso>;
};
