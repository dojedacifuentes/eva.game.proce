"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { fx } from "@/lib/fx";
import { useGame } from "@/store/useGame";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): { shuffled: T[]; originalIndices: number[] } {
  const indices = arr.map((_, i) => i);
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return { shuffled, originalIndices: indices };
}

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  correcta: number;
  articulo: string;
  explicacion: string;
  dificultad: 1 | 2 | 3;
}

const PREGUNTAS: Pregunta[] = [
  {
    id: "preg_001",
    texto: "En un juicio ejecutivo, el tribunal analiza el título en",
    opciones: ["10 días", "5 días", "15 días", "20 días"],
    correcta: 0,
    articulo: "Art. 434 CPC",
    explicacion: "El tribunal tiene 10 días para verificar que el título sea ejecutivo válido.",
    dificultad: 1,
  },
  {
    id: "preg_002",
    texto: "La notificación personal requiere acto de domicilio entre",
    opciones: ["6 AM y 22 PM", "8 AM y 20 PM", "9 AM y 18 PM", "7 AM y 19 PM"],
    correcta: 0,
    articulo: "Art. 40 CPC",
    explicacion: "Las horas válidas para notificación son de 6 a 22 horas (art. 40).",
    dificultad: 1,
  },
  {
    id: "preg_003",
    texto: "La notificación subsidiaria requiere dos intentos en",
    opciones: ["dos días distintos", "el mismo día", "tres días", "una semana"],
    correcta: 0,
    articulo: "Art. 44 CPC",
    explicacion: "Se requieren DOS intentos en DÍAS DISTINTOS para notificación subsidiaria.",
    dificultad: 2,
  },
  {
    id: "preg_004",
    texto: "Tras notificación subsidiaria, debe enviarse carta certificada dentro de",
    opciones: ["2 días", "5 días", "10 días", "15 días"],
    correcta: 0,
    articulo: "Art. 46 CPC",
    explicacion: "Dentro de 2 días debe enviarse carta certificada avisando la notificación.",
    dificultad: 2,
  },
  {
    id: "preg_005",
    texto: "La cosa juzgada se adquiere cuando la sentencia",
    opciones: ["se dicta", "se ejecutoria", "se notifica", "cabe apelación"],
    correcta: 1,
    articulo: "Art. 174 CPC",
    explicacion: "La cosa juzgada material ocurre cuando la sentencia se EJECUTORIA (sin recursos pendientes).",
    dificultad: 3,
  },
  {
    id: "preg_006",
    texto: "El desasimiento se produce cuando dicta sentencia",
    opciones: ["de primera instancia", "de apelación", "de casación", "de revisión"],
    correcta: 1,
    articulo: "Art. 182 CPC",
    explicacion: "Desasimiento = tribunal de apelación dicta sentencia y se desasía del juicio.",
    dificultad: 3,
  },
  {
    id: "preg_007",
    texto: "La prescripción de una letra de cambio es",
    opciones: ["2 años", "3 años", "4 años", "5 años"],
    correcta: 1,
    articulo: "Art. 2515 CC",
    explicacion: "Plazo máximo para cobrar letra de cambio: 3 años desde el protesto.",
    dificultad: 2,
  },
  {
    id: "preg_008",
    texto: "Los bienes inembargables del ejecutado incluyen",
    opciones: ["Todos sus bienes", "Casa de habitación", "Dinero en cuenta", "Auto de trabajo"],
    correcta: 1,
    articulo: "Art. 445 CPC",
    explicacion: "La casa de habitación tiene limitaciones de embargo (bien familiar).",
    dificultad: 2,
  },

  // ─── PREGUNTAS AÑADIDAS — dificultad media-alta ───────────────────────────

  {
    id: "preg_009",
    texto: "Plazo para contestar demanda si el demandado está en el MISMO lugar del tribunal",
    opciones: ["15 días", "18 días", "20 días", "10 días"],
    correcta: 0,
    articulo: "Art. 258 inc. 1° CPC",
    explicacion: "Art. 258: 15 días en el mismo lugar. 18 días si está dentro del territorio pero en distinto lugar. Confundir estos plazos es error clásico de primer año.",
    dificultad: 2,
  },
  {
    id: "preg_010",
    texto: "Las excepciones perentorias anómalas (art. 310) pueden oponerse en 2ª instancia hasta",
    opciones: ["Antes de la vista de la causa", "Antes de citación a oír sentencia", "En cualquier estado", "Solo en 1ª instancia"],
    correcta: 0,
    articulo: "Art. 310 inc. 2° CPC",
    explicacion: "Art. 310 inc. 2°: en 2ª instancia, hasta antes de la VISTA DE LA CAUSA. No confundir con el límite de 1ª instancia (citación a oír sentencia).",
    dificultad: 3,
  },
  {
    id: "preg_011",
    texto: "Reposición especial contra el auto de prueba — plazo",
    opciones: ["3 días con apelación subsidiaria", "5 días solo reposición", "10 días", "2 días"],
    correcta: 0,
    articulo: "Art. 319 CPC",
    explicacion: "Art. 319: 3 días para la reposición especial, siempre con apelación en subsidio. La reposición ordinaria del 181 tiene 5 días — distintas herramientas.",
    dificultad: 3,
  },
  {
    id: "preg_012",
    texto: "Plazo para apelar sentencia DEFINITIVA de primera instancia",
    opciones: ["15 días", "5 días", "10 días", "20 días"],
    correcta: 0,
    articulo: "Art. 189 CPC",
    explicacion: "Art. 189: 15 días para sentencias definitivas. Son 5 días para interlocutorias, autos y decretos. Error clásico: invertir los plazos.",
    dificultad: 2,
  },
  {
    id: "preg_013",
    texto: "Si el ejecutado no opone excepciones, el juicio termina con",
    opciones: ["Mandamiento de ejecución que hace de sentencia (art. 472)", "Nueva sentencia definitiva", "Auto de liquidación", "Resolución del secretario"],
    correcta: 0,
    articulo: "Art. 472 CPC",
    explicacion: "Art. 472: el mandamiento de ejecución HACE DE SENTENCIA DEFINITIVA cuando no hay oposición. No se dicta nueva resolución — el mandamiento ya es suficiente.",
    dificultad: 3,
  },
  {
    id: "preg_014",
    texto: "La causal N°9 del art. 768 (casación en la forma) se refiere a",
    opciones: ["Omisión de trámite esencial (arts. 795 y 800)", "Falta de emplazamiento", "Ultra petita", "Cosa juzgada"],
    correcta: 0,
    articulo: "Arts. 768 N°9, 795, 800 CPC",
    explicacion: "N°9 = 'haberse faltado a algún trámite o diligencia esencial'. Los trámites esenciales están en el 795 (1ª instancia) y 800 (2ª instancia). La falta de emplazamiento es el N°1 del 795.",
    dificultad: 3,
  },
  {
    id: "preg_015",
    texto: "La inhibitoria (art. 102 CPC) se presenta ante el tribunal que se cree",
    opciones: ["COMPETENTE (para que requiera al otro)", "INCOMPETENTE (para que decline)", "La Corte de Apelaciones siempre", "El más antiguo en la zona"],
    correcta: 0,
    articulo: "Art. 102 CPC",
    explicacion: "La inhibitoria se interpone ante el tribunal que SE CREE COMPETENTE para que requiera al otro. La declinatoria (art. 111) se presenta ante el incompetente para que decline. Error típico: invertirlas.",
    dificultad: 2,
  },
  {
    id: "preg_016",
    texto: "El término probatorio ordinario en el juicio ordinario es de",
    opciones: ["20 días", "15 días", "30 días", "10 días"],
    correcta: 0,
    articulo: "Art. 328 CPC",
    explicacion: "Art. 328: 20 días de término probatorio ordinario. Los 15 días son para contestar la demanda. Confundir ambos plazos es el error más frecuente en pruebas escritas.",
    dificultad: 1,
  },
];

export default function AtaqueRepreguntas() {
  const [indice_pregunta, setIndicePregunta] = useState(0);
  const [respuestas_correctas, setRespuestasCorrectas] = useState(0);
  const [respuestas_totales, setRespuestasTotales] = useState(0);
  const [tiempo_restante, setTiempoRestante] = useState(30);
  const [respondida, setRespondida] = useState(false);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [timeout, setTimeout] = useState(false);
  const pushLog = useGame((s) => s.pushLog);

  const pregunta_actual = PREGUNTAS[indice_pregunta];

  // Shuffle opciones para cada pregunta
  const shuffled = useMezclaEstable(pregunta_actual.id, () => {
    const { shuffled: opciones_shuffled, originalIndices } = shuffleArray(pregunta_actual.opciones);
    // Encontrar el nuevo índice de la respuesta correcta
    const nuevo_idx_correcto = originalIndices.indexOf(pregunta_actual.correcta);
    return { opciones: opciones_shuffled, correcta: nuevo_idx_correcto };
  });

  useEffect(() => {
    if (respondida || timeout) return;

    const timer = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) {
          setTimeout(true);
          sfx.warning();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [respondida, timeout]);

  function responder(opcion: number) {
    if (respondida || timeout) return;
    sfx.click();

    setSeleccion(opcion);
    const es_correcta = opcion === shuffled.correcta;

    if (es_correcta) {
      sfx.oralCorrecta();
      fx.reward();
      setRespuestasCorrectas((r) => r + 1);
    } else {
      sfx.warning();
      fx.shake();
    }

    setRespuestasTotales((r) => r + 1);
    setRespondida(true);

    pushLog(
      `Repregunta ${es_correcta ? "CORRECTA" : "INCORRECTA"}: ${pregunta_actual.texto.substring(0, 50)}...`,
      es_correcta ? "SKILL" : "WARN"
    );
  }

  function siguiente() {
    if (indice_pregunta < PREGUNTAS.length - 1) {
      sfx.click();
      setIndicePregunta((i) => i + 1);
      setRespondida(false);
      setSeleccion(null);
      setTiempoRestante(30);
      setTimeout(false);
    }
  }

  const pct = respuestas_totales > 0 ? Math.round((respuestas_correctas / respuestas_totales) * 100) : 0;
  const color_tiempo = tiempo_restante > 10 ? "text-zona-cautelares" : tiempo_restante > 5 ? "text-yellow-600" : "text-zona-nulidad";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="font-mono-terminal text-[10px] uppercase text-doc-aged/40">
          PREGUNTA {indice_pregunta + 1} / {PREGUNTAS.length}
        </div>
        <div className="flex gap-3 text-[10px] font-mono-terminal">
          <span className="text-zona-cautelares">✓ {respuestas_correctas}</span>
          <span className="text-zona-nulidad">✗ {respuestas_totales - respuestas_correctas}</span>
          <span className={`font-bold ${color_tiempo}`}>{tiempo_restante}s</span>
        </div>
      </div>

      <motion.div
        key={pregunta_actual.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="terminal p-6 space-y-4"
      >
        <div>
          <h3 className="font-display-grave text-2xl text-doc-aged mb-3">{pregunta_actual.texto}</h3>
          <div className="text-[9px] font-mono-terminal text-doc-aged/40 uppercase tracking-widest">
            {pregunta_actual.articulo}
          </div>
        </div>

        {/* BARRA DE TIEMPO */}
        <div className="w-full bg-doc-aged/10 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${(tiempo_restante / 30) * 100}%` }}
            className={`h-full ${tiempo_restante > 10 ? "bg-zona-cautelares" : tiempo_restante > 5 ? "bg-yellow-600" : "bg-zona-nulidad"}`}
          />
        </div>

        {/* OPCIONES */}
        <div className="space-y-2">
          {shuffled.opciones.map((opcion, idx) => {
            let cls = "w-full text-left p-3 border-2 transition-all ";
            if (!respondida && !timeout) {
              cls += "border-doc-aged/20 text-doc-aged/70 hover:border-doc-aged/60 hover:text-doc-aged cursor-pointer";
            } else if (idx === shuffled.correcta) {
              cls += "border-zona-cautelares bg-zona-cautelares/10 text-zona-cautelares";
            } else if (idx === seleccion) {
              cls += "border-zona-nulidad bg-zona-nulidad/10 text-zona-nulidad";
            } else {
              cls += "border-doc-aged/10 text-doc-aged/30";
            }

            return (
              <button
                key={idx}
                onClick={() => responder(idx)}
                disabled={respondida || timeout}
                className={cls}
              >
                <span className="font-mono-terminal text-[9px] uppercase tracking-widest">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span className="ml-2 font-serif-juridica text-[11px]">{opcion}</span>
                {respondida && idx === shuffled.correcta && <span className="text-[9px] ml-2">✓</span>}
                {respondida && idx === seleccion && idx !== shuffled.correcta && <span className="text-[9px] ml-2">✗</span>}
              </button>
            );
          })}
        </div>

        {/* TIMEOUT MESSAGE */}
        <AnimatePresence>
          {timeout && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-zona-nulidad/10 border border-zona-nulidad/20"
            >
              <div className="text-zona-nulidad font-mono-terminal text-[9px] uppercase">⏱ TIEMPO AGOTADO</div>
              <p className="text-[10px] text-doc-aged/70 mt-1">No respondiste a tiempo. La respuesta correcta era: {shuffled.opciones[shuffled.correcta]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANÁLISIS POST-RESPUESTA */}
        <AnimatePresence>
          {(respondida || timeout) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-doc-aged/10 pt-4 space-y-3">
              <div className={`p-3 italic text-[9px] ${seleccion === pregunta_actual.correcta && !timeout ? "text-zona-cautelares/70" : "text-zona-nulidad/70"}`}>
                {pregunta_actual.explicacion}
              </div>

              {indice_pregunta < PREGUNTAS.length - 1 && (
                <button onClick={siguiente} onMouseEnter={() => sfx.hover()} className="btn btn-recurso w-full py-2 text-sm">
                  SIGUIENTE PREGUNTA →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PROGRESO */}
      {respuestas_totales > 0 && (
        <div className="terminal p-3 space-y-2">
          <div className="text-[9px] font-mono-terminal text-doc-aged/40">ACIERTO GENERAL</div>
          <div className="flex gap-1 h-2 bg-doc-aged/10">
            <div className="bg-zona-cautelares transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[9px] font-mono-terminal text-right text-doc-aged/40">{pct}%</div>
        </div>
      )}
    </div>
  );
}
