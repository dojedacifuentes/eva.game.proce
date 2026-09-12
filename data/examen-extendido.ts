// ============================================================================
// EXAMEN DE GRADO — PREGUNTAS TIPO CÉDULA CON RESPUESTA MODELO
// Simulación de comisión examinadora · Derecho Procesal Civil
// Formato: pregunta abierta + respuesta académica completa + fundamento normativo
// ============================================================================

import type { Procedencia } from "@/types/procedencia";

export type PreguntaExamen = {
  id: string;
  tema: string;
  pregunta: string;
  respuestaModelo: string;
  normas: string[];
  dificultad: "media" | "alta" | "extrema";
  trampa?: string; // el error común que comete la mayoría
  zona: "competencia" | "recursos" | "nulidad" | "ejecutivo" | "prueba" | "oralidad" | "cautelares" | "cosajuzgada" | "notificaciones" | "incidentes";
  /** Fuente y fecha de revisión. Sólo se muestra si está rellena. */
  procedencia?: Procedencia;
};

export type AlternativaDificil = {
  id: string;
  tema: string;
  enunciado: string;
  opciones: { letra: string; texto: string }[];
  correcta: string; // letra
  explicacion: string;
  normas: string[];
  zona: string;
  /** Fuente y fecha de revisión. Sólo se muestra si está rellena. */
  procedencia?: Procedencia;
};

// ============================================================================
// PREGUNTAS TIPO CÉDULA — RESPUESTA ABIERTA CON MODELO
// ============================================================================

export const PREGUNTAS_EXAMEN: PreguntaExamen[] = [
  // ═══════════════════════ JUICIO EJECUTIVO ═══════════════════════
  {
    id: "eje_01",
    tema: "Juicio Ejecutivo",
    pregunta: "¿Cuáles son los requisitos que debe reunir un título ejecutivo para fundar una demanda ejecutiva? Analice el caso de la letra de cambio protestada.",
    respuestaModelo: `Un título ejecutivo es el documento al que la ley atribuye mérito suficiente para exigir el cumplimiento forzado de una obligación sin necesidad de juicio declarativo previo.

**Requisitos copulativos para despachar ejecución (art. 437 CPC):**

1. **Que exista título ejecutivo** (art. 434 CPC — numerus clausus): sentencia firme, escritura pública, acta de conciliación, instrumento privado reconocido, letra de cambio, pagaré o cheque (con formalidades de la Ley 18.092 o 18.552).

2. **Que la obligación sea actualmente exigible** (art. 437 N°1): líquida, determinada, no sujeta a condición suspensiva no cumplida ni a plazo pendiente.

3. **Que la obligación sea líquida** (art. 438): en dinero, o liquidable mediante simples operaciones aritméticas que el mismo título permita.

4. **Que la acción no esté prescrita** (art. 442): el tribunal examinará de oficio si el título tiene más de 3 años.

**La letra de cambio protestada (art. 434 N°4 CPC / Ley 18.092):**

La letra de cambio constituye título ejecutivo cuando ha sido protestada personalmente por falta de pago, o cuando el deudor no ha opuesto tacha de falsedad dentro del plazo legal tras la notificación judicial de la letra. Sin protesto personal, requiere gestión preparatoria de notificación judicial (art. 435 CPC). El protesto debe cumplir los requisitos de la Ley 18.092: ser practicado por notario, en día hábil, con aviso previo y acta protocolarizada.

**Error frecuente:** Confundir que toda letra de cambio es título ejecutivo per se. Solo lo es si fue protestada personalmente o notificada judicialmente sin tacha oportuna. La letra no protestada NO tiene mérito ejecutivo.`,
    normas: ["Art. 434 CPC", "Art. 437 CPC", "Art. 438 CPC", "Art. 442 CPC", "Ley 18.092 arts. 59-73"],
    dificultad: "alta",
    trampa: "Creer que cualquier letra de cambio tiene mérito ejecutivo sin protesto ni notificación judicial.",
    zona: "ejecutivo",
  },
  {
    id: "eje_02",
    tema: "Juicio Ejecutivo — Excepciones",
    pregunta: "El ejecutado opone las excepciones del art. 464 CPC. ¿Puede oponer más de una? ¿Cuál es el plazo, la oportunidad y el efecto de la oposición sobre el cuaderno ejecutivo?",
    respuestaModelo: `**Pluralidad de excepciones:**
Sí, el ejecutado puede oponer todas las excepciones del art. 464 CPC que tenga, con el límite de que deben oponerse simultáneamente en un solo escrito (art. 465 inc. 1°). No se admite oposición posterior.

**Plazo para oponer excepciones (art. 462 CPC):**
- Requerido dentro de la comuna del tribunal: **4 días hábiles**.
- Requerido fuera de la comuna pero dentro del territorio jurisdiccional: **8 días hábiles**.
- Requerido fuera del territorio jurisdiccional o del país: **8 días hábiles + tabla de emplazamiento** (art. 259 CPC).

El plazo se cuenta desde el requerimiento de pago (no desde la notificación de la demanda, que puede ser anterior).

**Excepciones del art. 464 CPC (taxativas — 17 causales):**
Destacan: inexistencia de la obligación (N°7), extinción de la deuda (N°8), prescripción (N°17), cosa juzgada (N°9), nulidad de la obligación (N°14), espera o remisión (N°4), entre otras.

**Efecto de la oposición sobre el cuaderno ejecutivo:**
La oposición oportuna **no suspende el embargo** (cuaderno de apremio sigue). Lo que se abre es el **cuaderno principal de oposición**. El art. 466 distingue:
- Si el juez estima que las excepciones son dilatorias: las tramita como incidente previo.
- Si son perentorias: se tramitan como juicio ordinario en cuaderno separado.
El remate puede suspenderse si el ejecutado así lo pide y otorga caución (art. 523 CPC).

**Error frecuente:** Señalar que la oposición de excepciones suspende la ejecución. NO la suspende; solo abre el cuaderno de oposición.`,
    normas: ["Art. 462 CPC", "Art. 464 CPC", "Art. 465 CPC", "Art. 466 CPC", "Art. 523 CPC"],
    dificultad: "alta",
    trampa: "Creer que oponer excepciones suspende automáticamente el embargo y el cuaderno de apremio.",
    zona: "ejecutivo",
  },

  // ═══════════════════════ RECURSOS ═══════════════════════
  {
    id: "rec_01",
    tema: "Casación en la Forma",
    pregunta: "¿En qué consiste el requisito de preparación del recurso de casación en la forma? ¿Cuándo NO se exige este requisito?",
    respuestaModelo: `**Preparación de la casación en la forma (art. 769 CPC):**

El recurso de casación en la forma solo es admisible si el recurrente reclamó oportunamente del vicio que invoca como causal, salvo que el vicio no haya podido reclamarse en ese momento.

**Fundamento:** Impide que la parte especule: no puede guardar silencio ante el vicio procesal durante el juicio y luego invocarlo estratégicamente al momento de recurrir.

**Forma de preparar el recurso:**
El recurrente debe haber reclamado antes del fallo mediante los medios ordinarios: incidente de nulidad, recurso de reposición, apelación (si procedía), o cualquier forma de reclamación que ponga en conocimiento del tribunal el defecto.

**Casos en que NO se exige preparación (art. 769 inc. 2° CPC):**

1. Cuando la causal invocada es la **incompetencia del tribunal** (768 N°1).
2. Cuando la causal es el **haber sido pronunciada la sentencia por un juez con implicancia** (768 N°2) o recusación (768 N°2).
3. Cuando **el vicio se cometió en la misma sentencia** que se recurre (no había oportunidad anterior para reclamar).
4. Cuando el **recurrente no fue parte en el juicio** (tercero afectado).

**Error frecuente:** Confundir la preparación (requisito de admisibilidad) con el plazo de interposición (15 días desde notificación de la sentencia). Son requisitos distintos e independientes.`,
    normas: ["Art. 768 CPC", "Art. 769 CPC", "Art. 770 CPC"],
    dificultad: "alta",
    trampa: "No distinguir entre la preparación del recurso y el plazo de interposición, o ignorar que el vicio en la propia sentencia no requiere preparación.",
    zona: "recursos",
  },
  {
    id: "rec_02",
    tema: "Casación en el Fondo",
    pregunta: "¿Cuál es la diferencia entre la casación en el fondo y la apelación? ¿Qué significa que la casación sea un recurso de derecho estricto?",
    respuestaModelo: `**Diferencias fundamentales:**

| Aspecto | Apelación | Casación en el Fondo |
|---|---|---|
| Objeto | Enmienda de agravios en hechos y derecho | Solo errores de derecho con influencia decisiva |
| Tribunal | Corte de Apelaciones respectiva | Corte Suprema |
| Efecto devolutivo | Pleno — el superior revisa todo | Limitado — solo la infracción de ley alegada |
| Hechos | El tribunal de alzada puede modificarlos | Los hechos están fijos; solo se discute el derecho |
| Naturaleza | Recurso ordinario, reformatorio | Recurso extraordinario, anulatorio |

**La casación en el fondo como recurso de derecho estricto:**

Significa que la Corte Suprema:
1. **No entra a los hechos establecidos** por los jueces del fondo. La valoración fáctica es inamovible salvo infracción de las leyes reguladoras de la prueba (art. 772 CPC).
2. **Solo puede fundar el recurso en una causal taxativa**: infracción de ley que haya influido sustancialmente en lo dispositivo del fallo (art. 767 CPC).
3. **No puede anularlo si el error no influyó** en la parte resolutiva: si el fallo era correcto aunque la motivación fuera defectuosa, la Corte rechaza.
4. **Formalidades estrictas** en el escrito de interposición: debe mencionar expresamente en qué consiste el error de derecho y la influencia sustancial (art. 772 inc. 2° CPC).

**Leyes reguladoras de la prueba:** Son aquellas que establecen qué medios probatorios son admisibles, cuál es su valor probatorio y cómo se distribuye el onus probandi. Su infracción SÍ es causal de casación en el fondo aunque involucre hechos.`,
    normas: ["Art. 767 CPC", "Art. 772 CPC", "Art. 785 CPC"],
    dificultad: "extrema",
    trampa: "Afirmar que la casación en el fondo permite revisar los hechos. Solo procede respecto a errores jurídicos puros, salvo infracción de leyes reguladoras de la prueba.",
    zona: "recursos",
  },
  {
    id: "rec_03",
    tema: "Recurso de Revisión",
    pregunta: "¿Es el recurso de revisión un recurso procesal ordinario? ¿Cuáles son sus causales y ante qué tribunal se interpone?",
    respuestaModelo: `**Naturaleza jurídica del recurso de revisión:**

El recurso de revisión **NO es un recurso procesal en sentido estricto**, sino una acción de impugnación autónoma o acción rescisoria. Esto porque:
- Se dirige contra sentencias firmes o ejecutoriadas (que ya produjeron cosa juzgada).
- No interrumpe la firmeza de la sentencia; puede incluso coexistir con su ejecución.
- Su naturaleza es declarativa de nulidad con efecto retroactivo.

**Causales del art. 810 CPC (taxativas):**

1. Haberse fundado en **documentos declarados falsos** por sentencia penal ejecutoriada, dictada después del fallo civil.
2. Haberse dictado en virtud de **prueba testimonial** y haber sido los testigos condenados por falso testimonio en las declaraciones que sirvieron de base al fallo.
3. Haberse ganado el pleito por **cohecho, violencia u otra maquinación fraudulenta**.
4. Haberse dictado contra otra **sentencia pasada en autoridad de cosa juzgada** y que no se alegó en el juicio.

**Plazo:** 1 año desde la fecha de la última notificación de la sentencia cuya revisión se pide (art. 811 CPC). Es un plazo de caducidad.

**Tribunal competente:** La **Corte Suprema** conoce del recurso de revisión en única instancia (art. 810 inc. 1° CPC). Esto es una consecuencia de su naturaleza extraordinaria.

**Error frecuente:** Clasificar la revisión como recurso ordinario junto a la apelación. Es extraordinario y, en rigor, una acción autónoma de impugnación.`,
    normas: ["Art. 810 CPC", "Art. 811 CPC", "Art. 812 CPC"],
    dificultad: "media",
    trampa: "Clasificar la revisión como recurso ordinario o creer que puede interponerse contra sentencias no firmes.",
    zona: "recursos",
  },

  // ═══════════════════════ NULIDAD PROCESAL ═══════════════════════
  {
    id: "nul_01",
    tema: "Nulidad Procesal",
    pregunta: "¿Cuáles son los principios que rigen la nulidad procesal en el CPC chileno? ¿Puede una parte alegar la nulidad que ella misma causó?",
    respuestaModelo: `**Principios de la nulidad procesal:**

1. **Principio de especificidad o legalidad** (art. 83 CPC): No hay nulidad sin texto expreso que la establezca o sin que el vicio cause efectivo perjuicio. Se distingue de la nulidad civil donde basta el vicio formal.

2. **Principio de trascendencia** (art. 83 inc. 1°): La nulidad solo procede cuando el vicio causa **perjuicio reparable únicamente con la declaración de nulidad**. Nulidad sin perjuicio es como cirugía sin enfermedad: innecesaria.

3. **Principio de convalidación**: Los vicios se convalidan si no se alegan oportunamente. Quien calla consiente (art. 83 inc. 2°). Los plazos de reclamación son fatales.

4. **Principio de protección o buena fe procesal**: No puede alegar la nulidad quien la causó (nemo auditur propriam turpitudinem allegans). El art. 83 inc. 3° lo consagra expresamente: **la parte que ha originado el vicio o que ha concurrido a su materialización no puede pedir la nulidad**.

5. **Principio de extensión**: La nulidad de un acto procesal puede extenderse a los actos que dependen de él (art. 83 inc. final CPC). Pero no invalida necesariamente todo el proceso.

**Respuesta a la pregunta sobre quien causó la nulidad:**

No. El art. 83 inc. 3° CPC establece explícitamente que **la parte que ha dado lugar al vicio o ha concurrido en él no podrá solicitar la nulidad fundándose en dicho vicio**. Este principio recoge la doctrina de los actos propios (venire contra factum proprium) en el proceso.

**Error frecuente:** Confundir la nulidad procesal con la nulidad civil. En el proceso rige la trascendencia; en el derecho civil, en principio, el solo vicio formal puede ser suficiente.`,
    normas: ["Art. 83 CPC", "Art. 84 CPC", "Art. 85 CPC"],
    dificultad: "alta",
    trampa: "Aplicar la teoría de la nulidad civil al proceso, ignorando el principio de trascendencia y la regla del art. 83 inc. 3°.",
    zona: "nulidad",
  },

  // ═══════════════════════ MEDIDAS CAUTELARES ═══════════════════════
  {
    id: "cau_01",
    tema: "Medidas Precautorias",
    pregunta: "¿Cuáles son los requisitos para decretar una medida precautoria ordinaria? ¿Qué son las medidas precautorias innominadas? ¿Cuándo pueden decretarse sin notificación previa?",
    respuestaModelo: `**Requisitos para medidas precautorias ordinarias (art. 298 CPC):**

1. **Existencia de la acción principal**: Se debe tener demanda presentada o presentarla simultáneamente (o dentro de los 10 días siguientes si se decretan prejudicialmente).

2. **Fumus boni iuris** (apariencia de buen derecho): "Cuando el solicitante acompañare comprobantes que constituyan presunción grave del derecho que se reclama" (art. 298 CPC). No se exige prueba plena, solo presunción grave.

3. **Periculum in mora** (peligro en la demora): El art. 298 inc. 2° permite al tribunal exigir caución para responder por los perjuicios que la medida cause si la demanda no prosperare.

**Medidas precautorias ordinarias (arts. 290-302 CPC):** Secuestro, nombramiento de interventor, retención de bienes, prohibición de celebrar actos y contratos.

**Medidas innominadas (art. 298 inc. 2° CPC):**
Además de las ordinarias, el tribunal puede decretar "las medidas que juzgue necesarias para asegurar el resultado de la acción". Son indeterminadas en la ley y quedan a discreción del juez. Ejemplo: prohibir salida del país, suspender una resolución administrativa, etc. Requieren siempre caución del solicitante.

**Precautorias sin notificación previa (art. 302 inc. 2° CPC):**
Procede cuando concurren dos condiciones:
1. **Razones graves**: que la notificación previa haga probable que la medida se frustre (ocultamiento de bienes, fuga, etc.).
2. **Caución suficiente** del solicitante para responder de los perjuicios.

En ese caso, la resolución es provisoria y debe notificarse dentro de **5 días** desde que se decretó; si no, queda sin efecto ipso facto.

**Error frecuente:** Creer que toda medida cautelar requiere notificación previa. El art. 302 inc. 2° permite decretarlas inaudita parte con caución.`,
    normas: ["Art. 290 CPC", "Art. 298 CPC", "Art. 302 CPC"],
    dificultad: "alta",
    trampa: "Omitir el plazo de notificación posterior (5 días) cuando se decretan sin notificación previa, o ignorar que las innominadas siempre requieren caución.",
    zona: "cautelares",
  },

  // ═══════════════════════ PRUEBA ═══════════════════════
  {
    id: "pru_01",
    tema: "Prueba — Carga probatoria",
    pregunta: "¿Cómo se distribuye la carga de la prueba en el proceso civil chileno? ¿Qué son los hechos negativos y cómo se prueban?",
    respuestaModelo: `**Distribución de la carga probatoria (art. 1698 CC aplicable supletoriamente):**

La regla general es: **quien afirma un hecho debe probarlo**. El art. 1698 CC establece que "incumbe probar las obligaciones o su extinción al que alega aquéllas o ésta".

**Distribución práctica en el proceso civil:**
- **Demandante**: prueba los hechos constitutivos de su pretensión (la fuente de la obligación, el incumplimiento).
- **Demandado**: prueba los hechos extintivos (pago, prescripción, remisión), los modificativos (mora del acreedor, compensación) y los impeditivos (nulidad, falta de causa).

Esta distribución es la regla supletoria; puede ser modificada por:
- Pacto expreso entre las partes (art. 1547 inc. 3° CC en algunas materias).
- Presunciones legales que invierten el onus (art. 1547 CC en responsabilidad contractual: se presume la culpa del deudor).

**Los hechos negativos:**

**Principio general:** Las negaciones indefinidas no se prueban. *Affirmanti incumbit probatio; neganti nulla est probatio.*

Sin embargo, hay excepciones:
1. **Negación indefinida transformable en afirmación**: "No debo" puede probarse demostrando que nunca contraje la obligación (hecho positivo).
2. **Negación determinada** (acotada en tiempo y espacio): sí es susceptible de prueba. "No estuve en Santiago el 3 de enero" puede probarse con testigos o documentos.
3. **Hechos negativos con presunción en contrario**: La ley presume ciertos hechos positivos; la parte afecta debe desvirtuar esa presunción.

**Carga dinámica de la prueba:** Doctrina moderna (acogida en el nuevo proceso civil) que propone que debe probar quien está en mejor posición para hacerlo, con independencia de su rol procesal.`,
    normas: ["Art. 1698 CC", "Art. 341 CPC", "Art. 1547 CC"],
    dificultad: "alta",
    trampa: "Afirmar categóricamente que los hechos negativos nunca se prueban. La regla solo aplica a negaciones indefinidas; las determinadas son perfectamente probables.",
    zona: "prueba",
  },
  {
    id: "pru_02",
    tema: "Prueba — Instrumentos",
    pregunta: "¿Cuál es la diferencia entre instrumento público e instrumento privado en cuanto a su valor probatorio? ¿Qué es la fecha cierta de un instrumento privado?",
    respuestaModelo: `**Instrumento público (art. 1700 CC):**

Es el autorizado con las solemnidades legales por el competente funcionario (art. 1699 CC). Produce dos tipos de plena prueba:

1. **Respecto de las partes y terceros**: prueba que el hecho se realizó ante el funcionario, en la fecha, lugar y por las personas que indica. Es plena prueba de la **materialidad del acto** (lo que el funcionario declara haber visto, oído o hecho).

2. **Respecto de las declaraciones de las partes**: prueba en contra del declarante (confesión espontánea). El que aparece dando algo a otro se presume que lo ha entregado.

**Impugnación del instrumento público:** Por vía de nulidad (solemnidades omitidas), por falsedad material (adulteración física) o por falsedad ideológica (lo que el funcionario dice es mentira). Esta última es muy difícil de probar.

**Instrumento privado (arts. 1702-1704 CC):**

Solo hace plena prueba cuando ha sido **reconocido** por la parte contra quien se opone (art. 1702 CC), sea:
- Reconocimiento expreso (art. 346 N°1 CPC).
- Reconocimiento tácito (no objetado en plazo — art. 346 N°3 CPC).
- Reconocimiento judicial (el tribunal lo declara auténtico tras cotejo).

Antes del reconocimiento, **no tiene valor probatorio alguno**.

**Fecha cierta del instrumento privado (art. 1703 CC):**

El instrumento privado no tiene fecha cierta frente a terceros sino desde que:
1. Ha sido **protocolizado** ante notario.
2. Ha sido **presentado en juicio**.
3. Uno de los que lo **firmaron ha fallecido**.
4. Ha tomado razón de él o lo ha **inventariado un funcionario público** en su carácter de tal.

**Importancia:** Para la inoponibilidad de traspasos de bienes frente a terceros (acreedores, otros cesionarios) es determinante la fecha cierta.`,
    normas: ["Art. 1699 CC", "Art. 1700 CC", "Art. 1702 CC", "Art. 1703 CC", "Art. 346 CPC"],
    dificultad: "media",
    trampa: "Creer que el instrumento privado tiene valor probatorio desde que es firmado. Solo lo tiene desde que es reconocido.",
    zona: "prueba",
  },

  // ═══════════════════════ COSA JUZGADA ═══════════════════════
  {
    id: "cj_01",
    tema: "Cosa Juzgada",
    pregunta: "¿Cuáles son los requisitos de la triple identidad para que opere la cosa juzgada? Explique qué es la identidad legal de personas.",
    respuestaModelo: `**Triple identidad (art. 177 CPC):**

Para que la excepción de cosa juzgada sea procedente se requiere que entre la nueva demanda y la que fue objeto del fallo exista:

**1. Identidad legal de personas (eadem personae):**
No es identidad física sino **identidad jurídica**: se precisa que las partes litiguen en la misma calidad jurídica.

Ejemplos:
- El heredero que demanda/es demandado **en su calidad de sucesor** tiene la misma identidad que el causante en el juicio anterior.
- El que demanda como dueño y luego como poseedor **NO** tiene identidad de personas: son calidades jurídicas distintas.
- Los copropietarios que no intervinieron en el juicio pueden NO estar afectos a la cosa juzgada relativa.

No se requiere que sean las mismas personas físicas; basta que sean las mismas partes procesales o sus causahabientes.

**2. Identidad de objeto pedido (eadem res):**
El beneficio jurídico reclamado debe ser el mismo: la misma cosa, la misma prestación, el mismo derecho. No es identidad del objeto material (el bien), sino del bien jurídico reclamado. Pedir el precio de una compraventa y pedir la resolución son objetos distintos aunque involucren el mismo contrato.

**3. Identidad de causa de pedir (eadem causa petendi):**
El fundamento inmediato del derecho deducido: el hecho o acto jurídico que origina la pretensión. La obligación contractual y la obligación extracontractual son causas distintas aunque produzcan el mismo efecto. Un contrato de arrendamiento y la ley (arts. 1916 ss. CC) como fuentes distintas generan causas de pedir distintas.

**Efecto de la cosa juzgada:**
- **Acción de cosa juzgada**: permite exigir el cumplimiento de lo resuelto (art. 176 CPC).
- **Excepción de cosa juzgada**: impide un nuevo juicio sobre lo ya resuelto (art. 177 CPC). Puede hacerse valer como excepción dilatoria (art. 303 N°6) o perentoria (en cualquier estado).`,
    normas: ["Art. 177 CPC", "Art. 175 CPC", "Art. 176 CPC", "Art. 303 N°6 CPC"],
    dificultad: "alta",
    trampa: "Confundir identidad física de personas con identidad jurídica, o ignorar que los causahabientes quedan afectos a la cosa juzgada del causante.",
    zona: "cosajuzgada",
  },

  // ═══════════════════════ COMPETENCIA ═══════════════════════
  {
    id: "comp_01",
    tema: "Competencia — Reglas especiales",
    pregunta: "¿Qué es la regla de la prevención? ¿Y la regla de la acumulación? ¿Cómo interactúan cuando existe pluralidad de acciones o demandados?",
    respuestaModelo: `**Regla de la prevención (art. 112 COT):**

Cuando por aplicación de las reglas de competencia relativa dos o más tribunales son igualmente competentes, el que primero comienza a conocer del negocio **previene** en el conocimiento y excluye a los demás. La prevención opera mediante la radicación: una vez que el tribunal asume conocimiento, queda fijo el asunto.

**Fundamento:** Certeza y economía procesal. Evita la simultánea tramitación ante distintos tribunales.

**Regla de la acumulación o extensión (art. 111 COT):**

El tribunal competente para conocer de un asunto lo es también para conocer de todas las incidencias que en él se promuevan, de la reconvención, de la compensación y de las cuestiones accesorias. **La competencia se extiende** a lo accesorio.

**Interacción con la pluralidad de acciones (art. 17 CPC):**
Cuando el demandante acumula varias acciones en una misma demanda (acumulación objetiva), el tribunal competente para la acción principal lo es para todas. Si las acciones son incompatibles entre sí, se deducen en subsidio.

**Interacción con la pluralidad de demandados (art. 141 COT):**
Cuando una acción se dirige contra varios demandados domiciliados en distintos territorios, es competente el tribunal del lugar donde cualquiera de ellos tenga su domicilio, a elección del demandante. Esto es una manifestación de la prevención: el que elige primero fija el foro.

**Reglas de orden de prelación (art. 134 y ss. COT):**
Para la competencia relativa en asuntos civiles: 1° el acordado por las partes (prórroga); 2° el del domicilio del demandado; 3° el del lugar de celebración del contrato; 4° el del lugar donde debe cumplirse la obligación.`,
    normas: ["Art. 111 COT", "Art. 112 COT", "Art. 134 COT", "Art. 141 COT", "Art. 17 CPC"],
    dificultad: "alta",
    trampa: "Aplicar la regla de prevención solo al proceso y olvidar que también opera entre tribunales de igual jerarquía cuando existen reglas de competencia relativa alternativas.",
    zona: "competencia",
  },
  {
    id: "comp_02",
    tema: "Prórroga de Competencia",
    pregunta: "¿Cuáles son los requisitos y límites de la prórroga de competencia? ¿Puede prorrogarse la competencia absoluta?",
    respuestaModelo: `**Prórroga de competencia (arts. 181-187 COT):**

Es el acuerdo por el cual las partes confieren competencia a un tribunal que naturalmente no la tendría, según las reglas de competencia relativa (territorio).

**Requisitos:**

1. **Solo respecto de la competencia relativa**: La prórroga nunca puede alterar la competencia **absoluta** (materia, cuantía, fuero). Esto es de orden público e irrenunciable.

2. **Solo en primera instancia**: No procede la prórroga para segunda instancia ni para la Corte Suprema.

3. **Asuntos civiles contenciosos** de primera instancia: No procede en asuntos no contenciosos ni en materias donde la ley prohíbe expresamente la prórroga.

4. **Capacidad de las partes**: Las partes deben ser capaces de disponer de sus derechos (art. 184 COT).

**Formas de la prórroga:**
- **Expresa** (art. 186 COT): pacto escrito en que las partes designan el tribunal.
- **Tácita** (art. 187 COT): del demandante, por el hecho de ocurrir ante el tribunal incompetente; del demandado, por haber hecho cualquier gestión que no sea la de reclamar la incompetencia.

**Límites absolutos:**
- No procede respecto de la **competencia absoluta**.
- No procede cuando la ley expresamente la prohíbe.
- No opera en asuntos de familia, laborales o de jurisdicción voluntaria.

**Error frecuente:** Creer que puede prorrogarse la competencia en razón de la materia (civil vs. penal, civil vs. laboral). Eso es absolutamente imposible.`,
    normas: ["Art. 181 COT", "Art. 182 COT", "Art. 186 COT", "Art. 187 COT"],
    dificultad: "media",
    trampa: "Confundir competencia relativa (territorio, prorrogable) con competencia absoluta (materia, cuantía, fuero, improrrogable).",
    zona: "competencia",
  },

  // ═══════════════════════ INCIDENTES ═══════════════════════
  {
    id: "inc_01",
    tema: "Incidentes",
    pregunta: "¿Qué es un incidente ordinario? ¿En qué se diferencia de los incidentes especiales? ¿Cuándo debe resolverse un incidente de previo y especial pronunciamiento?",
    respuestaModelo: `**Incidente ordinario (arts. 82-91 CPC):**

Toda cuestión accesoria de un juicio que requiera pronunciamiento especial del tribunal, con audiencia de parte contraria (art. 82 CPC). Es la regla general; los incidentes especiales tienen su propio procedimiento.

**Requisito de conexión:** El incidente debe tener relación directa con el asunto principal. Los que no tengan esta conexión se rechazan de plano (art. 84 CPC).

**Diferencia con incidentes especiales:**

| Aspecto | Incidente Ordinario | Incidente Especial |
|---|---|---|
| Tramitación | Arts. 82-91 CPC (regla general) | Regulación específica en el CPC |
| Ejemplos | Nulidad procesal art. 83, oposición a diligencia | Acumulación de autos (92 ss.), implicancias y recusaciones (113 ss.), privilegio de pobreza (129 ss.), costas (138 ss.), desistimiento (148 ss.), abandono del procedimiento (152 ss.) |
| Plazo para alegar | El que corresponda según las reglas generales | Especialmente regulado |

**Incidente de previo y especial pronunciamiento (art. 87 CPC):**

Cuando el tribunal ordena que se tramite el incidente **en cuaderno separado sin suspender el proceso principal**, el incidente es de tramitación separada. Pero cuando el incidente es **de previo y especial pronunciamiento**, **suspende la marcha del juicio principal** hasta su resolución.

Son de previo y especial pronunciamiento cuando:
- La ley así lo declara expresamente (ej. declinatoria de competencia, art. 112 CPC).
- Por su naturaleza impiden continuar el juicio principal sin antes resolverlo (ej. incidente sobre capacidad procesal de una parte).

El tribunal al proveer el incidente debe declarar si se tramita en cuaderno separado o en el cuaderno principal con efecto suspensivo.`,
    normas: ["Art. 82 CPC", "Art. 84 CPC", "Art. 87 CPC", "Art. 92 CPC"],
    dificultad: "media",
    trampa: "No distinguir entre incidente ordinario y de previo y especial pronunciamiento, especialmente el efecto suspensivo de este último.",
    zona: "incidentes",
  },

  // ═══════════════════════ NOTIFICACIONES ═══════════════════════
  {
    id: "not_01",
    tema: "Notificaciones",
    pregunta: "¿Cuándo procede la notificación subsidiaria del art. 44 CPC? ¿Cuáles son sus requisitos formales para que no sea nula?",
    respuestaModelo: `**Notificación subsidiaria o por cédula en domicilio (art. 44 CPC):**

Procede cuando se intenta la notificación personal (art. 40 CPC) y **no se encuentra a la persona en su habitación o en el lugar donde ordinariamente ejerce su industria o negocio**, siempre que se acredite que se le busca en **dos días distintos** en el mismo lugar.

**Requisitos formales (art. 44 CPC) — deben cumplirse todos para evitar nulidad:**

1. **Búsqueda en días distintos**: el ministro de fe debe certificar que buscó al notificado en al menos **dos días diferentes** (no solo en distintos momentos del mismo día).

2. **En el lugar adecuado**: habitación o lugar donde ejerce industria o negocio.

3. **Resolución judicial previa**: el tribunal debe **decretar la notificación por el art. 44** a petición del interesado. No puede practicarse sin orden judicial.

4. **Entrega de la cédula**: La notificación se practica entregando copia íntegra de la resolución y de la solicitud en que haya recaído, si no ha sido provista de oficio, a cualquier **persona adulta** que se encuentre en el lugar.

5. **Si no hay persona adulta o el lugar está cerrado**: se fija en la puerta un aviso que indique la notificación practicada (art. 44 inc. 2°).

6. **Aviso por carta certificada**: Dentro de los **2 días siguientes**, el ministro de fe debe enviar carta certificada al notificado dando cuenta de la notificación (art. 46 CPC). La omisión de este requisito acarrea nulidad.

**Causal de casación:** La notificación defectuosa que prive al demandado de su emplazamiento puede configurar la causal del art. 768 N°9 (trámite esencial — emplazamiento) del CPC.

**Error frecuente:** Practicar la notificación sin decreto judicial previo o no enviar la carta certificada posterior (art. 46 CPC).`,
    normas: ["Art. 44 CPC", "Art. 46 CPC", "Art. 768 N°9 CPC"],
    dificultad: "alta",
    trampa: "Olvidar la carta certificada posterior del art. 46 CPC, o creer que basta buscar en dos momentos del mismo día en lugar de en dos días distintos.",
    zona: "notificaciones",
  },

  // ═══════════════════════ JUICIO SUMARIO ═══════════════════════
  {
    id: "sum_01",
    tema: "Juicio Sumario",
    pregunta: "¿Cuál es la diferencia entre el juicio sumario de aplicación específica y el de cláusula abierta? ¿Puede convertirse el juicio ordinario en sumario y viceversa?",
    respuestaModelo: `**Juicio sumario: aplicación específica vs. cláusula abierta (art. 680 CPC):**

**Aplicación específica (art. 680 inc. 2° CPC):**
Son casos taxativamente señalados por la ley donde el juicio sumario es **obligatorio**, sin que las partes puedan convertirlo en ordinario:
- Desahucio y restitución de arrendamiento (arts. 1968-1971 CC + 680 N°6).
- Cobro de honorarios a que se refiere el art. 697.
- Juicios del art. 680 N°1-9 (acciones cambiarias en ciertos casos, tutela de derechos constitucionales, interdictos posesorios menores, etc.).

En estos casos la naturaleza sumaria es indisponible.

**Cláusula abierta (art. 680 inc. 1° CPC):**
"El procedimiento sumario se aplicará también a los casos en que la acción deducida requiera, por su naturaleza, tramitación rápida para que sea eficaz." Esta cláusula es **de aplicación subsidiaria y discrecional**: el tribunal aprecia si la urgencia del asunto justifica el procedimiento más breve. Son asuntos no contemplados en la lista específica.

**Conversión de procedimientos (arts. 681 y 683 CPC):**

**Ordinario → Sumario**: A solicitud de parte, el tribunal puede decretar el sumario cuando el demandante acredite que, por la naturaleza del negocio, la tramitación ordinaria lo haría ilusorio o ineficaz. Requiere resolución fundada.

**Sumario → Ordinario**: Igualmente, a petición de parte y por motivos fundados, el tribunal puede convertir el procedimiento sumario en ordinario cuando la complejidad del asunto lo requiera.

En ambos casos, lo actuado conserva validez en cuanto sea compatible con el nuevo procedimiento.

**Error frecuente:** Afirmar que la conversión procede de oficio. Requiere siempre solicitud de parte.`,
    normas: ["Art. 680 CPC", "Art. 681 CPC", "Art. 683 CPC"],
    dificultad: "alta",
    trampa: "Confundir la aplicación obligatoria (inc. 2°) con la discrecional (inc. 1°), o creer que la conversión puede ser de oficio.",
    zona: "incidentes",
  },

  // ═══════════════════════ ABANDONO Y DESISTIMIENTO ═══════════════════════
  {
    id: "aba_01",
    tema: "Abandono del procedimiento",
    pregunta: "¿Cuál es la diferencia entre el abandono del procedimiento y el desistimiento de la demanda? ¿Qué efecto tiene el abandono sobre la prescripción?",
    respuestaModelo: `**Abandono del procedimiento (arts. 152-157 CPC):**

Se produce cuando todas las partes que figuran en el juicio han cesado en su prosecución durante **6 meses contados desde la fecha de la última resolución recaída en alguna gestión útil** para dar curso progresivo a los autos.

**Características:**
- Solo puede pedirlo el **demandado** (art. 153).
- Solo durante el curso del juicio, no después de citadas las partes para oír sentencia.
- Se tramita como **incidente**.
- El abandono no opera de pleno derecho; debe ser **declarado por el tribunal**.

**Efectos del abandono (art. 156 CPC):**
1. Extingue el procedimiento (no la acción ni la pretensión).
2. **Las partes quedan en el mismo estado en que se hallaban antes de la demanda**: subsisten las inscripciones, embargos y demás medidas decretadas, pero solo como acciones independientes.
3. **NO extingue la acción**: el demandante puede interponer nueva demanda.
4. **Prescripción**: La interrupción de la prescripción que produjo la primera demanda **se tiene por no producida** (art. 2503 N°2 CC). La prescripción corre como si no hubiera existido demanda. Esto es devastador para el demandante.

**Desistimiento de la demanda (arts. 148-150 CPC):**

El demandante **renuncia a su pretensión**, con efecto de cosa juzgada. A diferencia del abandono:
- Extingue la **acción** (no puede volver a demandar).
- Requiere conformidad del demandado (si ya contestó).
- Produce cosa juzgada en cuanto a la pretensión deducida.
- El demandado puede oponerse si tiene interés en que continúe el juicio.

**Resumen comparativo:**
| Aspecto | Abandono | Desistimiento |
|---|---|---|
| Quien lo pide | Demandado | Demandante |
| Efecto sobre la acción | La conserva | La extingue |
| Efecto prescripción | Interrupción se tiene por no producida | No aplica (ya terminó el proceso) |
| Cosa juzgada | No | Sí |`,
    normas: ["Art. 152 CPC", "Art. 156 CPC", "Art. 148 CPC", "Art. 150 CPC", "Art. 2503 CC"],
    dificultad: "alta",
    trampa: "Afirmar que el abandono extingue la acción (solo extingue el procedimiento) o ignorar el efecto sobre la prescripción del art. 2503 N°2 CC.",
    zona: "incidentes",
  },
];

// ============================================================================
// ALTERNATIVAS DIFÍCILES — OPCIÓN MÚLTIPLE TIPO EXAMEN
// ============================================================================

export const ALTERNATIVAS_DIFICIL: AlternativaDificil[] = [
  {
    id: "alt_01",
    tema: "Casación en la forma — Causales",
    enunciado: "Una sentencia definitiva de segunda instancia, pronunciada por una Corte de Apelaciones, contiene una sección de fundamentos que se contradicen entre sí en la interpretación del art. 76 CPC, pero la parte resolutiva es coherente y se ajusta al petitorio. ¿Cuál es la causal de casación en la forma que corresponde invocar?",
    opciones: [
      { letra: "A", texto: "Art. 768 N°4 CPC: haber sido dada ultra o extra petita, porque los fundamentos excedieron lo solicitado." },
      { letra: "B", texto: "Art. 768 N°7 CPC: contener decisiones contradictorias en la parte resolutiva que generan inseguridad jurídica." },
      { letra: "C", texto: "Art. 768 N°5 CPC: haber sido pronunciada con omisión de los requisitos del art. 170 CPC, particularmente las consideraciones coherentes de hecho y derecho." },
      { letra: "D", texto: "No cabe casación, porque las contradicciones en los fundamentos (ratio decidendi) no afectan la parte dispositiva siempre que la decisión sea coherente." },
    ],
    correcta: "C",
    explicacion: "Los fundamentos contradictorios constituyen incumplimiento del requisito de 'consideraciones de hecho y derecho' del art. 170 N°4 CPC (ejecutoriabilidad formal). Aunque la parte resolutiva sea coherente, la sentencia carece del razonamiento lógico y no contradictorio exigido. La causal es N°5 del art. 768 (omisión de requisitos del art. 170). El N°7 se refiere solo a decisiones contradictorias EN LA PARTE RESOLUTIVA (ej: condenar y absolver simultáneamente), no a fundamentos. El N°4 (ultra petita) requiere que la decisión supere lo pedido, no que los razonamientos sean contradictorios. La opción D es la trampa común: creer que solo importa la parte dispositiva.",
    normas: ["Art. 768 N°5 CPC", "Art. 768 N°7 CPC", "Art. 170 N°4 CPC", "Auto Acordado 1920"],
    zona: "recursos",
  },
  {
    id: "alt_02",
    tema: "Ejecutivo — Tercerías",
    enunciado: "En un juicio ejecutivo, el cónyuge del ejecutado (no propietario del inmueble embargado) alega que el inmueble fue declarado bien familiar conforme al art. 141 CC. El cónyuge afirma que posee derechos reales sobre el bien. ¿Cuál tercería debe interponer?",
    opciones: [
      { letra: "A", texto: "Tercería de posesión, porque el art. 141 CC otorga derecho de uso y ocupación que equivale a posesión legal." },
      { letra: "B", texto: "Tercería de prelación, porque los bienes familiares tienen preferencia en la distribución de los bienes ejecutables." },
      { letra: "C", texto: "Tercería de dominio, porque la calidad de bien familiar genera un derecho real de habitación oponible contra terceros (art. 518 N°1 CPC)." },
      { letra: "D", texto: "Tercería de dominio, porque el cónyuge es copropietario legal del bien familiar conforme a la Ley de Matrimonio Civil." },
    ],
    correcta: "C",
    explicacion: "El bien familiar conforme al art. 141 CC genera un derecho real de habitación y uso que es oponible erga omnes, aun cuando el cónyuge no sea propietario. Este derecho real justifica la tercería de DOMINIO (art. 518 N°1: 'aquel que está en posesión de la cosa...' o tiene derecho real sobre ella). Trampa A: el derecho de ocupación no es posesión sino derecho real de habitación. Trampa B: existe tercería de prelación, pero solo cuando quien la interpone tiene UN CRÉDITO que cobrar del bien ejecutado, no cuando solo defiende derechos reales. Trampa D: confunde bien familiar con copropiedad; el art. 141 CC no genera copropiedad automática.",
    normas: ["Art. 141 CC", "Art. 518 N°1 CPC", "Art. 519 CPC", "Art. 520 CPC"],
    zona: "ejecutivo",
  },
  {
    id: "alt_03",
    tema: "Medidas precautorias — Caución",
    enunciado: "El demandante solicita una medida precautoria de retención de cuentas corrientes sin acompañar los comprobantes exigidos en el art. 298 CPC. El tribunal desea favorecerle. ¿Bajo qué condiciones puede el tribunal decretar la medida sin los comprobantes?",
    opciones: [
      { letra: "A", texto: "No puede hacerlo; el art. 298 establece requisitos taxativos que no admiten excepción, incluso por caución." },
      { letra: "B", texto: "Puede hacerlo solo si exige caución suficiente al demandante para responder de perjuicios y concurran motivos graves y calificados (art. 299 CPC)." },
      { letra: "C", texto: "Puede hacerlo discrecionalmente si estima que el demandante actúa de buena fe, sin necesidad de caución." },
      { letra: "D", texto: "Puede hacerlo si la medida es de las llamadas 'innominadas' del art. 298 inc. 2°, que por su naturaleza excepcional no requieren comprobantes." },
    ],
    correcta: "B",
    explicacion: "El art. 299 CPC es claro: cuando concurren motivos graves, el tribunal puede decretar la medida precautoria sin los comprobantes del 298, PERO exigiendo caución al solicitante. La caución es la contraprestación que permite al tribunal flexibilizar el requisito probatorio (fumus boni iuris). Trampa A: confunde rigidez de requisitos con imposibilidad de excepción; el 299 permite excepción. Trampa C: la buena fe no suple el requisito de caución. Trampa D: distorsiona el art. 298 inc. 2° (medidas innominadas); estas SÍ requieren caución, pero no son excepción al régimen de comprobantes.",
    normas: ["Art. 298 CPC", "Art. 299 CPC", "Art. 302 CPC", "Art. 297 CPC"],
    zona: "cautelares",
  },
  {
    id: "alt_04",
    tema: "Recursos — Apelación adhesiva",
    enunciado: "El demandado apeló de la sentencia de primera instancia dentro del plazo de ley. El demandante, habiendo dejado vencer el plazo de apelación, desea impugnar aspectos que le son desfavorables al comparecer ante el tribunal de alzada. ¿Qué recurso procesal le procede?",
    opciones: [
      { letra: "A", texto: "Apelación adhesiva conforme al art. 217 CPC, siempre que se interponga al comparecer ante la Corte de Apelaciones." },
      { letra: "B", texto: "Casación en la forma directamente ante la Corte Suprema, porque la casación no está sujeta al límite temporal de la apelación." },
      { letra: "C", texto: "No puede hacer nada; la preclusión del plazo de apelación es de orden público y no admite excepción, incluso mediante adhesión." },
      { letra: "D", texto: "Recurso de queja contra la resolución de primera instancia, porque cuestiona la regularidad del procedimiento anterior." },
    ],
    correcta: "A",
    explicacion: "El art. 217 CPC permite apelación adhesiva: cuando hay apelación de una parte, la otra puede adherirse al comparecer en segunda instancia, aun habiendo dejado vencer el plazo ordinario de apelación. LA ADHESIÓN NO ES UNA APELACIÓN INDEPENDIENTE sino un recurso dependiente de la apelación principal. Si el apelante principal desiste, la adhesión caduca. Trampa B: la casación es recurso de nulidad para vicios procesales, no forma de salvación de plazos vencidos. Trampa C: aunque la preclusión es de orden público, existe precisamente el mecanismo de adhesión para permitir esta situación. Trampa D: la queja es para actos de jurisdicción contenciosa que causan daño irreparable, no para reabrir plazos.",
    normas: ["Art. 217 CPC", "Art. 186 CPC"],
    zona: "recursos",
  },
  {
    id: "alt_05",
    tema: "Prueba — Presunciones en responsabilidad civil",
    enunciado: "En un juicio de responsabilidad extracontractual por el hecho de una cosa inanimada, el demandante prueba el daño y el nexo causal. ¿Cuál es la correcta distribución de la carga probatoria respecto de la culpa?",
    opciones: [
      { letra: "A", texto: "El demandante debe probar la culpa directamente como cuarto elemento, sin presunción alguna (art. 2314 CC)." },
      { letra: "B", texto: "El demandado debe probar que actuó diligentemente, porque el art. 2329 inc. 2° CC presume la culpa por daños causados por cosas inanimadas bajo su guarda." },
      { letra: "C", texto: "La culpa se presume indistintamente entre demandante y demandado, quien debe justificar haber actuado conforme a derecho." },
      { letra: "D", texto: "El demandante debe probar culpa; solo en caso de cosas animadas bajo custodia existe presunción de culpa a cargo del custodio." },
    ],
    correcta: "B",
    explicacion: "El art. 2329 inc. 2° CC es crucial: presume la culpa del dueño o guardián por los daños causados por cosas inanimales bajo su guarda. INVIERTE LA CARGA PROBATORIA: el demandante solo acredita que la cosa causó daño, y se PRESUME culpa del guardián, quien debe probar que actuó con la debida diligencia para evitar el daño (art. 2330 CC). Trampa A: confunde regla general del 2314 con excepción específica del 2329. Trampa C: la culpa no se presume para ambas partes simétricamente. Trampa D: invierte el régimen; la presunción aplica también a cosas inanimadas bajo guarda.",
    normas: ["Art. 2314 CC", "Art. 2329 inc. 2° CC", "Art. 2330 CC"],
    zona: "prueba",
  },
  {
    id: "alt_06",
    tema: "Notificaciones — Reforma",
    enunciado: "Una resolución que recibe la causa a prueba (auto de prueba) debe notificarse de una forma específica. ¿Cuál es la forma correcta de notificarla?",
    opciones: [
      { letra: "A", texto: "Por el estado diario, como cualquier resolución judicial." },
      { letra: "B", texto: "Personalmente, por ser una resolución que afecta los derechos de las partes." },
      { letra: "C", texto: "Por cédula, conforme al art. 48 CPC." },
      { letra: "D", texto: "Por carta certificada, para asegurar que las partes tengan conocimiento oportuno." },
    ],
    correcta: "C",
    explicacion: "El art. 48 CPC establece que deben notificarse por cédula las resoluciones que ordenen la comparecencia personal de las partes, la sentencia definitiva de primera instancia, y la resolución que recibe la causa a prueba. La notificación por cédula implica entregar copia íntegra de la resolución en el domicilio del notificado. El recurso de reposición contra el auto de prueba tiene plazo de 3 días desde esta notificación.",
    normas: ["Art. 48 CPC", "Art. 320 CPC"],
    zona: "notificaciones",
  },
  {
    id: "alt_07",
    tema: "Juicio Ejecutivo — Prescripción de la acción ejecutiva",
    enunciado: "El ejecutado alega prescripción como excepción del art. 464 CPC. El título es una sentencia definitiva ejecutoriada dictada hace 4 años y 2 meses. ¿Procede la excepción?",
    opciones: [
      { letra: "A", texto: "No procede; la acción ejecutiva derivada de sentencia tiene prescripción especial de 4 años conforme a jurisprudencia de la Corte Suprema." },
      { letra: "B", texto: "Sí procede; la acción ejecutiva prescribe en 3 años (art. 2515 inc. 2° CC) y transcurrido ese plazo solo cabe acción ordinaria durante 2 años más." },
      { letra: "C", texto: "No procede porque el art. 442 CPC faculta al tribunal (no al ejecutado) a examinar de oficio la prescripción; no puede alegarse como excepción." },
      { letra: "D", texto: "Sí procede, pero el tribunal debe declararla de oficio conforme al art. 442 CPC; el ejecutado no puede simplemente invocarla pasivamente." },
    ],
    correcta: "B",
    explicacion: "El art. 2515 inc. 2° CC es claro: acción ejecutiva prescribe en 3 años. Pasado ese plazo, la acción ejecutiva se extingue y solo subsiste acción ordinaria (más lenta) por 2 años adicionales. Aunque sea sobre sentencia ejecutoriada, esta prescripción aplica (sin excepciones de plazo superior). El art. 442 CPC ordena al tribunal examinar de oficio; pero el ejecutado TAMBIÉN puede alegarla como excepción del art. 464 N°17 (prescripción). Trampa A: existe jurisprudencia pero no establece plazo diferente de 3 años. Trampa C: el tribunal examina de oficio, pero eso no impide que el ejecutado la alegue como excepción. Trampa D: aunque existe examen de oficio, la excepción es igualmente procedente.",
    normas: ["Art. 2515 inc. 2° CC", "Art. 442 CPC", "Art. 464 N°17 CPC"],
    zona: "ejecutivo",
  },
  {
    id: "alt_08",
    tema: "Competencia — Recursos contra laudos arbitrales",
    enunciado: "Las partes sometieron a arbitraje un conflicto. El árbitro de derecho dictó laudo condenatorio. El vencido desea impugnar por casación en la forma. ¿Procede la casación?",
    opciones: [
      { letra: "A", texto: "Sí; los árbitros de derecho deben aplicar reglas de procedimiento ordinario y sus laudos son impugnables por casación (art. 239 COT)." },
      { letra: "B", texto: "No; los laudos arbitrales son definitivos e irrecurribles, aunque provengan de árbitro de derecho (art. 795 CPC)." },
      { letra: "C", texto: "Sí, pero solo si las partes expresamente renunciaron a la cláusula de arbitraje y consintieron la jurisdicción ordinaria." },
      { letra: "D", texto: "No procede casación; solo procede nulidad de laudo conforme a los artículos 84-85 del Código de Procedimiento Arbitral." },
    ],
    correcta: "A",
    explicacion: "El art. 239 COT establece que los árbitros de derecho deben tramitar conforme al procedimiento ordinario y sus laudos son impugnables por los mismos recursos que las sentencias judiciales (incluyendo casación), salvo renuncia expresa de las partes. Los árbitros arbitradores (art. 242) resuelven sin sujetarse a formas y las partes pueden renunciar a recursos. PERO si es árbitro de derecho, la regla es que procede casación (art. 795 CPC). Trampa B: confunde definitividad del laudo con inimpugnabilidad de derecho; de derecho es impugnable. Trampa C: la renuncia a cláusula de arbitraje es distinta del régimen de recursos. Trampa D: confunde el CPA (arbitraje comercial) con CPC ordinario.",
    normas: ["Art. 239 COT", "Art. 242 COT", "Art. 795 CPC", "Art. 791 CPC"],
    zona: "recursos",
  },
  {
    id: "alt_09",
    tema: "Cosa Juzgada — Límites subjetivos",
    enunciado: "Pedro demanda a Juan por incumplimiento de contrato y obtiene sentencia condenatoria. Posteriormente, Pedro intenta ejecutar al fiador de Juan por la misma obligación. ¿Puede el fiador oponer la cosa juzgada de la sentencia anterior?",
    opciones: [
      { letra: "A", texto: "Sí; la cosa juzgada material produce efectos erga omnes cuando versa sobre obligaciones acccesorias como la fianza." },
      { letra: "B", texto: "No; el fiador es tercero y no fue parte en la sentencia; no hay identidad legal de personas (art. 177 CPC)." },
      { letra: "C", texto: "Sí, pero solo respecto de los hechos constitutivos de la deuda, no respecto de la responsabilidad solidaria del fiador." },
      { letra: "D", texto: "No procede cosa juzgada, pero puede oponer las excepciones reales del deudor principal conforme al art. 2354 CC." },
    ],
    correcta: "B",
    explicacion: "La cosa juzgada (art. 177 CPC) requiere triple identidad: de partes (IDENTIDAD LEGAL), de causa y de objeto. El fiador es TERCERO respecto del juicio Pedro vs. Juan. No existe identidad de personas entre Juan y su fiador. Aunque la sentencia sea condenatoria indiscutible, NO produce cosa juzgada contra quien no fue parte. Sin embargo (trampa D): el fiador SÍ puede oponer excepciones reales del art. 2354 CC, pero eso es distinto de cosa juzgada. Trampa A: la cosa juzgada no es erga omnes respecto a terceros (principio fundamental). Trampa C: la cosa juzgada no se parcializa por tipo de hecho.",
    normas: ["Art. 177 CPC", "Art. 175 CPC", "Art. 2354 CC"],
    zona: "cosajuzgada",
  },
  {
    id: "alt_10",
    tema: "Incidentes — Abandono",
    enunciado: "En un juicio ordinario, el demandado pide el abandono del procedimiento. El demandante se opone alegando que realizó una gestión de cobro extrajudicial que interrumpió el plazo. ¿Es correcta esta alegación?",
    opciones: [
      { letra: "A", texto: "Sí, cualquier gestión del demandante, judicial o extrajudicial, interrumpe el plazo del abandono." },
      { letra: "B", texto: "No, solo las gestiones útiles realizadas dentro del proceso interrumpen el plazo; las extrajudiciales no tienen efecto." },
      { letra: "C", texto: "Sí, porque la gestión extrajudicial demuestra que el demandante no ha abandonado su pretensión." },
      { letra: "D", texto: "Depende del tipo de gestión extrajudicial: si es una carta certificada, sí interrumpe; si es verbal, no." },
    ],
    correcta: "B",
    explicacion: "El art. 152 CPC es claro: el abandono opera cuando las partes 'hayan cesado en la prosecución del juicio' durante 6 meses. Lo relevante es la actividad procesal dentro del expediente judicial. Las gestiones extrajudiciales (cartas, llamadas, negociaciones) no constituyen gestiones útiles para dar curso progresivo a los autos. Solo los actos procesales realizados dentro del expediente que tengan por objeto avanzar el proceso interrumpen el plazo del abandono. La inactividad procesal es suficiente aunque haya actividad extrajudicial.",
    normas: ["Art. 152 CPC", "Art. 153 CPC"],
    zona: "incidentes",
  },
  {
    id: "alt_11",
    tema: "Nulidad — Convalidación tácita",
    enunciado: "En una notificación personal defectuosa, el demandado se apersonó al juicio y contestó la demanda sin alegar la nulidad de la notificación. Posteriormente, en la etapa de prueba, desea alegar dicha nulidad. ¿Puede hacerlo?",
    opciones: [
      { letra: "A", texto: "Sí, porque la nulidad del emplazamiento es irrenunciable y puede alegarse en cualquier estado del juicio." },
      { letra: "B", texto: "No, porque al contestar sin alegar la nulidad la convalidó tácitamente conforme al art. 83 CPC." },
      { letra: "C", texto: "Sí, porque la nulidad de la notificación personal puede operar de pleno derecho sin necesidad de alegación." },
      { letra: "D", texto: "No, a menos que demuestre que el defecto le causó perjuicio concreto que no puede repararse de otro modo." },
    ],
    correcta: "B",
    explicacion: "El principio de convalidación del art. 83 CPC establece que la parte que no reclame oportunamente un vicio lo convalida. La convalidación puede ser expresa (renuncia) o tácita (realización de actos incompatibles con el propósito de alegar la nulidad). Al contestar la demanda sin alegar la nulidad de la notificación, el demandado realizó un acto procesal de fondo que implica su conformidad con el emplazamiento. Esto es convalidación tácita. La oportunidad para alegar la nulidad del emplazamiento era antes de contestar o en el primer escrito presentado.",
    normas: ["Art. 83 CPC", "Art. 85 CPC"],
    zona: "nulidad",
  },
  {
    id: "alt_12",
    tema: "Prueba — Medidas para mejor resolver",
    enunciado: "El tribunal, citadas las partes para oír sentencia, desea ordenar de oficio la declaración de un testigo que ninguna parte ofreció. ¿Puede hacerlo?",
    opciones: [
      { letra: "A", texto: "Sí, conforme al art. 159 N°5 CPC: el tribunal puede ordenar de oficio la declaración de testigos que hayan declarado en el juicio." },
      { letra: "B", texto: "No, porque el tribunal no puede suplir la negligencia probatoria de las partes en ningún caso." },
      { letra: "C", texto: "Sí, el tribunal tiene facultades omnímodas para decretar cualquier diligencia probatoria de oficio." },
      { letra: "D", texto: "Solo si ambas partes lo solicitan simultáneamente mediante escrito conjunto." },
    ],
    correcta: "A",
    explicacion: "El art. 159 CPC permite al tribunal, para mejor resolver, decretar medidas de oficio. Entre ellas, el N°5 contempla la declaración de testigos que hayan declarado en el juicio sobre hechos que el tribunal estime conducentes. Sin embargo, esta facultad tiene límites importantes: (1) Solo puede llamar testigos que YA DECLARARON en el juicio, no testigos nuevos; (2) Las partes pueden agregar observaciones dentro de tercero día; (3) Si el resultado de la diligencia genera nueva prueba, el tribunal debe darle traslado. El tribunal NO puede ordenar testimonios de personas que nunca fueron testigos en el proceso.",
    normas: ["Art. 159 CPC", "Art. 159 N°5 CPC"],
    zona: "prueba",
  },
];
