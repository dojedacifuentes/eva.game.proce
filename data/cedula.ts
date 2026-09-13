// ============================================================================
// CÉDULA PROCESAL — banco de la ruta /examen
//
// Estaba escrito dentro de app/examen/page.tsx. Vive aquí para que el repaso
// espaciado pueda volver a servir una pregunta fallada sin importar una página.
// El contenido NO se tocó al mudarlo.
// ============================================================================

export type PreguntaCedula = {
  q: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  art: string;
};

export const PREGUNTAS_CEDULA: PreguntaCedula[] = [
  { q: "La facultad de conocer, juzgar y hacer ejecutar lo juzgado pertenece exclusivamente a los tribunales establecidos por la ley. Esta es la definición de:", opciones: ["Acción procesal", "Jurisdicción", "Competencia", "Pretensión"], correcta: 1, explicacion: "Art. 76 CPR y 1 COT definen así la jurisdicción.", art: "Art. 76 CPR / 1 COT" },
  { q: "La competencia ABSOLUTA NO admite prórroga porque:", opciones: ["Es renunciable", "Es de orden público", "Solo aplica a tribunales arbitrales", "Es supletoria"], correcta: 1, explicacion: "La competencia absoluta es de orden público (factores materia, fuero, cuantía) y es improrrogable.", art: "Arts. 181 y ss. COT" },
  { q: "Regla general de competencia relativa en materia civil:", opciones: ["Domicilio del actor", "Domicilio del demandado", "Lugar de cumplimiento", "A elección del demandante"], correcta: 1, explicacion: "Art. 134 COT: regla general es el domicilio del demandado, salvo reglas especiales.", art: "Art. 134 COT" },
  { q: "Los requisitos formales de la demanda están en:", opciones: ["Art. 254 CPC", "Art. 309 CPC", "Art. 170 CPC", "Art. 38 CPC"], correcta: 0, explicacion: "Art. 254 enumera los 5 requisitos formales.", art: "Art. 254 CPC" },
  { q: "Notificación que se practica si el demandado no es habido tras búsqueda en dos días distintos:", opciones: ["Por avisos", "Por estado diario", "Personal subsidiaria del art. 44", "Por cédula"], correcta: 2, explicacion: "Art. 44 CPC: notificación personal subsidiaria con entrega de cédula.", art: "Art. 44 CPC" },
  { q: "Plazo para contestar la demanda en juicio ordinario, demandado en el lugar del tribunal:", opciones: ["10 días", "15 días", "18 días", "30 días"], correcta: 1, explicacion: "Art. 258 inc. 1° CPC: 15 días.", art: "Art. 258 CPC" },
  { q: "La excepción dilatoria de INEPTITUD DEL LIBELO se funda en:", opciones: ["Falta de jurisdicción", "Defecto en el modo de proponer la demanda", "Cosa juzgada", "Prescripción"], correcta: 1, explicacion: "Art. 303 N°4 CPC: defecto formal en el modo de proponer la demanda.", art: "Art. 303 N°4 CPC" },
  { q: "Las excepciones perentorias del art. 310 (prescripción, cosa juzgada, transacción, pago) pueden oponerse:", opciones: ["Solo al contestar", "En cualquier estado hasta antes de la citación a oír sentencia (1ª) o vista (2ª)", "Solo en réplica", "Solo en juicio sumario"], correcta: 1, explicacion: "Art. 310 CPC: excepciones perentorias anómalas. Plazo amplio.", art: "Art. 310 CPC" },
  { q: "El término probatorio ORDINARIO en juicio ordinario civil es de:", opciones: ["10 días", "15 días", "20 días", "30 días"], correcta: 2, explicacion: "Art. 328 CPC: 20 días.", art: "Art. 328 CPC" },
  { q: "Resolución que recibe la causa a prueba se notifica por:", opciones: ["Personal", "Cédula", "Estado diario", "Avisos"], correcta: 1, explicacion: "Art. 48 CPC: por cédula. Reposición especial del 319 dentro de 3 días.", art: "Arts. 48 y 319 CPC" },
  { q: "Plazo del recurso de reposición ordinaria sin nuevos antecedentes:", opciones: ["3 días", "5 días", "10 días", "15 días"], correcta: 1, explicacion: "Art. 181 CPC: 5 días.", art: "Art. 181 CPC" },
  { q: "El recurso de apelación procede contra:", opciones: ["Solo decretos", "Sentencias definitivas e interlocutorias de 1ª instancia (regla general)", "Solo sentencias firmes", "Solo resoluciones de la Corte Suprema"], correcta: 1, explicacion: "Art. 187 CPC: regla general.", art: "Art. 187 CPC" },
  { q: "Plazo de apelación contra sentencia definitiva:", opciones: ["5 días", "10 días", "15 días", "30 días"], correcta: 1, explicacion: "Art. 189 CPC: 10 días para definitivas, 5 días para interlocutorias.", art: "Art. 189 CPC" },
  { q: "El recurso de hecho VERDADERO procede cuando:", opciones: ["El tribunal inferior concede una apelación improcedente", "El tribunal inferior deniega una apelación que debía concederse", "Hay vicios in procedendo", "Hay infracción de ley"], correcta: 1, explicacion: "Art. 203 CPC: denegación errada.", art: "Art. 203 CPC" },
  { q: "El recurso de casación en el FONDO procede contra sentencias:", opciones: ["Apelables de 1ª instancia", "Inapelables dictadas por Cortes de Apelaciones o árbitros de derecho de 2ª instancia", "Firmes", "Decretos"], correcta: 1, explicacion: "Art. 767 CPC: requiere ser INAPELABLE y dictada por CA o árbitro de derecho de 2ª.", art: "Art. 767 CPC" },
  { q: "El recurso de QUEJA del art. 545 COT procede contra:", opciones: ["Cualquier resolución", "Sentencias definitivas o interlocutorias que pongan fin al juicio y no admitan otro recurso (con excepción)", "Decretos y autos", "Sentencias firmes"], correcta: 1, explicacion: "Art. 545 COT: subsidiariedad. Excepción: sentencias definitivas de árbitros arbitradores.", art: "Art. 545 COT" },
  { q: "El recurso de REVISIÓN procede contra sentencias:", opciones: ["Apelables", "Firmes injustamente ganadas (cohecho, violencia, documentos falsos, etc.)", "De primera instancia", "Definitivas de la Corte Suprema"], correcta: 1, explicacion: "Art. 810 CPC: causales taxativas. Plazo: 1 año.", art: "Art. 810 CPC" },
  { q: "El juicio ejecutivo requiere obligación:", opciones: ["Discutida y prescrita", "Líquida, actualmente exigible y no prescrita", "Solo determinada", "Solo escrita"], correcta: 1, explicacion: "Requisitos esenciales del título ejecutivo. Arts. 434 ss.", art: "Arts. 434, 437 CPC" },
  { q: "Las excepciones a la ejecución en el juicio ejecutivo son:", opciones: ["Libres", "Taxativas (17 del art. 464)", "Solo dilatorias", "Solo perentorias"], correcta: 1, explicacion: "Art. 464 CPC: enumeración taxativa de 17 excepciones.", art: "Art. 464 CPC" },
  { q: "La medida precautoria del art. 290 N°4 CPC (prohibición de celebrar actos o contratos) sobre inmuebles requiere:", opciones: ["Solo decreto judicial", "Inscripción en el Conservador de Bienes Raíces para ser oponible a terceros", "Notificación personal", "Caución obligatoria"], correcta: 1, explicacion: "Art. 297 inc. 2° CPC: si recae sobre inmuebles, debe inscribirse.", art: "Art. 297 CPC" },
];
