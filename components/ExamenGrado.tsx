"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PREGUNTAS_EXAMEN, ALTERNATIVAS_DIFICIL, type PreguntaExamen, type AlternativaDificil } from "@/data/examen-extendido";
import { sfx } from "@/lib/audio";
import { useGame } from "@/store/useGame";
import { shuffleOptions, type ShuffleResult } from "@/lib/shuffleOptions";
import AlternativaButton from "./AlternativaButton";
import { useMezclaEstable } from "@/lib/useMezclaEstable";
import FichaProcedencia from "@/components/shell/FichaProcedencia";

// ============================================================================
// EXAMEN DE GRADO — Simulador de cédula oral con respuesta modelo
// Dos modos: (A) preguntas abiertas con respuesta modelo desplegable
//            (B) alternativas difíciles con explicación
// ============================================================================

type Modo = "menu" | "cedula" | "alternativas";
type EstadoRespuesta = "sin-responder" | "respondido";

export default function ExamenGrado() {
  const [modo, setModo] = useState<Modo>("menu");

  if (modo === "cedula") return <ModoCedula onVolver={() => setModo("menu")} />;
  if (modo === "alternativas") return <ModoAlternativas onVolver={() => setModo("menu")} />;

  return (
    <div className="space-y-4">
      <div className="terminal p-5">
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-nulidad mb-2">SIMULADOR</div>
        <h2 className="font-display-grave text-3xl text-doc-aged mb-2">Examen de Grado</h2>
        <p className="font-serif-juridica italic text-doc-aged/60 text-sm">
          «La comisión no quiere saber si memorizaste. Quiere ver si sobrevivís cuando te preguntan algo que no esperabas.»
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-mono-terminal text-doc-aged/50">
          <div>CÉDULAS ABIERTAS: <span className="text-zona-cautelares">{PREGUNTAS_EXAMEN.length}</span></div>
          <div>ALTERNATIVAS: <span className="text-zona-recursos">{ALTERNATIVAS_DIFICIL.length}</span></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* MODO CÉDULA */}
        <button
          onClick={() => { sfx.confirm(); setModo("cedula"); }}
          onMouseEnter={() => sfx.hover()}
          className="zona-card p-6 text-left"
          style={{ "--zona-color": "var(--zona-nulidad)" } as React.CSSProperties}
        >
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-display-grave text-xl text-doc-aged mb-2">Modo Cédula Oral</h3>
          <div className="text-[10px] uppercase tracking-widest font-mono-terminal text-zona-nulidad mb-3">
            PREGUNTA ABIERTA · RESPUESTA MODELO
          </div>
          <p className="text-doc-aged/55 text-xs font-mono-terminal">
            {PREGUNTAS_EXAMEN.length} preguntas tipo examen oral. Se muestra la cédula, reflexionás, luego desplegás la respuesta académica completa con fundamento normativo. Simula la dinámica real de la comisión.
          </p>
        </button>

        {/* MODO ALTERNATIVAS */}
        <button
          onClick={() => { sfx.confirm(); setModo("alternativas"); }}
          onMouseEnter={() => sfx.hover()}
          className="zona-card p-6 text-left"
          style={{ "--zona-color": "var(--zona-recursos)" } as React.CSSProperties}
        >
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="font-display-grave text-xl text-doc-aged mb-2">Alternativas Difíciles</h3>
          <div className="text-[10px] uppercase tracking-widest font-mono-terminal text-zona-recursos mb-3">
            TRAMPA · DISTINCIÓN FINA · EXPLICACIÓN COMPLETA
          </div>
          <p className="text-doc-aged/55 text-xs font-mono-terminal">
            {ALTERNATIVAS_DIFICIL.length} preguntas de opción múltiple diseñadas para confundir. Cada distractor está basado en errores reales de examen. La explicación desmonta el error con precisión normativa.
          </p>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODO CÉDULA
// ─────────────────────────────────────────────────────────────

function ModoCedula({ onVolver }: { onVolver: () => void }) {
  const pushLog = useGame((s) => s.pushLog);
  const [idx, setIdx] = useState(0);
  const [estado, setEstado] = useState<EstadoRespuesta>("sin-responder");
  const [filtroZona, setFiltroZona] = useState<string>("todas");

  const preguntasFiltradas = filtroZona === "todas"
    ? PREGUNTAS_EXAMEN
    : PREGUNTAS_EXAMEN.filter((p) => p.zona === filtroZona);

  const pregunta = preguntasFiltradas[idx % preguntasFiltradas.length];

  function verRespuesta() {
    sfx.confirm();
    setEstado("respondido");
    pushLog(`Cédula revisada: ${pregunta.tema}`, "INFO");
  }

  function siguiente() {
    sfx.click();
    setEstado("sin-responder");
    setIdx((i) => (i + 1) % preguntasFiltradas.length);
  }

  const colorDificultad: Record<string, string> = {
    media: "text-zona-prueba",
    alta: "text-zona-ejecutivo",
    extrema: "text-zona-nulidad",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button className="btn text-xs" onClick={onVolver}>◂ Volver</button>
        <div className="flex gap-2 flex-wrap">
          {["todas", "competencia", "recursos", "ejecutivo", "prueba", "cautelares", "cosajuzgada", "nulidad", "notificaciones", "incidentes"].map((z) => (
            <button
              key={z}
              onClick={() => { setFiltroZona(z); setIdx(0); setEstado("sin-responder"); }}
              className={`text-[9px] font-mono-terminal px-2 py-1 border ${filtroZona === z ? "border-zona-cautelares text-zona-cautelares" : "border-doc-aged/20 text-doc-aged/40"}`}
            >
              {z.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {preguntasFiltradas.length === 0 ? (
        <div className="terminal p-6 text-center text-doc-aged/40 font-mono-terminal text-sm">
          No hay cédulas para esta zona todavía.
        </div>
      ) : (
        <>
          {/* CÉDULA */}
          <motion.div
            key={pregunta.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="terminal p-6 space-y-4"
          >
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <div className="text-[9px] font-mono-terminal text-doc-aged/40 uppercase tracking-widest mb-1">
                  CÉDULA {idx + 1} / {preguntasFiltradas.length} · {pregunta.zona.toUpperCase()}
                </div>
                <div className="text-[9px] font-mono-terminal uppercase" style={{ color: `var(--zona-${pregunta.zona})` }}>
                  {pregunta.tema}
                </div>
              </div>
              <span className={`text-[9px] font-mono-terminal uppercase ${colorDificultad[pregunta.dificultad]}`}>
                ⚡ {pregunta.dificultad}
              </span>
            </div>

            <div className="border-l-2 pl-4" style={{ borderColor: `var(--zona-${pregunta.zona})` }}>
              <p className="font-serif-juridica text-doc-aged text-base leading-relaxed">{pregunta.pregunta}</p>
            </div>

            <div className="p-3 bg-zona-nulidad/5 border border-zona-nulidad/20 text-xs text-doc-aged/60 font-mono-terminal">
              <span className="text-zona-nulidad text-[9px] uppercase tracking-wider mr-2">NORMAS</span>
              {pregunta.normas.join(" · ")}
            </div>

            {pregunta.trampa && (
              <div className="p-3 bg-zona-ejecutivo/5 border border-zona-ejecutivo/20 text-xs">
                <span className="text-zona-ejecutivo text-[9px] font-mono-terminal uppercase tracking-wider block mb-1">⚠ ERROR FRECUENTE</span>
                <span className="font-serif-juridica italic text-doc-aged/60">{pregunta.trampa}</span>
              </div>
            )}

            {estado === "sin-responder" ? (
              <button
                onClick={verRespuesta}
                onMouseEnter={() => sfx.hover()}
                className="btn btn-recurso w-full py-3 text-sm"
              >
                ▶ VER RESPUESTA MODELO
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="border-t border-doc-aged/10 pt-4">
                  <div className="text-[9px] font-mono-terminal text-zona-cautelares uppercase tracking-widest mb-3">
                    ✓ RESPUESTA ACADÉMICA
                  </div>
                  <div className="font-serif-juridica text-doc-aged/85 text-sm leading-relaxed space-y-2 whitespace-pre-line">
                    {pregunta.respuestaModelo}
                  </div>
                </div>
                <button
                  onClick={siguiente}
                  onMouseEnter={() => sfx.hover()}
                  className="btn w-full py-2"
                >
                  SIGUIENTE CÉDULA →
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODO ALTERNATIVAS DIFÍCILES
// ─────────────────────────────────────────────────────────────

function ModoAlternativas({ onVolver }: { onVolver: () => void }) {
  const pushLog = useGame((s) => s.pushLog);
  const desbloquearLogro = useGame((s) => s.desbloquearLogro);
  const registrarRepaso = useGame((s) => s.registrarRepaso);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * ALTERNATIVAS_DIFICIL.length));
  const [seleccion, setSeleccion] = useState<number | null>(null); // Ahora es índice, no letra
  const [correctas, setCorrectas] = useState(0);
  const [respondidas, setRespondidas] = useState(0);
  const [historial, setHistorial] = useState<{ id: string; correcto: boolean }[]>([]);

  const pregunta = ALTERNATIVAS_DIFICIL[idx];

  // Shuffled options (recalculated each time pregunta changes).
  // FIX: las opciones traen {letra, texto} pero la correcta vive en pregunta.correcta.
  // Antes se pasaba "letra" a shuffleOptions y correctIndex quedaba en -1 (nunca acertaba).
  // Ahora se marca un flag booleano `correcta` por opción y se re-letran A-D en orden visual.
  const shuffled = useMezclaEstable(pregunta.id, () => {
    const conFlag = pregunta.opciones.map((o) => ({ ...o, correcta: o.letra === pregunta.correcta }));
    const r = shuffleOptions(conFlag, "correcta");
    const relettered = r.options.map((o, i) => ({ ...o, letra: String.fromCharCode(65 + i) }));
    return { ...r, options: relettered };
  });

  const respondida = seleccion !== null;
  const esCorrecta = seleccion === shuffled.correctIndex;

  function responder(index: number) {
    if (respondida) return;
    setSeleccion(index);
    const ok = index === shuffled.correctIndex;
    // Lo fallado entra al mazo de repaso espaciado, como en la cédula y el V/F.
    registrarRepaso(`alternativa:${pregunta.id}`, ok);
    if (ok) {
      sfx.oralCorrecta();
      setCorrectas((c) => c + 1);
    } else {
      sfx.warning();
    }
    setRespondidas((r) => r + 1);
    setHistorial((h) => [...h, { id: pregunta.id, correcto: ok }]);
    pushLog(`Alternativa ${ok ? "CORRECTA" : "INCORRECTA"}: ${pregunta.tema}`, ok ? "SKILL" : "WARN");
    if (correctas + (ok ? 1 : 0) >= 8) {
      desbloquearLogro({ id: "examen_maestro", titulo: "Maestro Examinado", descripcion: "8+ correctas en alternativas difíciles", articulo: "—", desbloqueado: true });
    }
  }

  function siguiente() {
    sfx.click();
    setSeleccion(null);
    setIdx((i) => {
      let ni = i;
      while (ni === i) ni = Math.floor(Math.random() * ALTERNATIVAS_DIFICIL.length);
      return ni;
    });
  }

  const pct = respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <button className="btn text-xs" onClick={onVolver}>◂ Volver</button>
        <div className="flex gap-4 text-[10px] font-mono-terminal">
          <span className="text-zona-cautelares">✓ {correctas}</span>
          <span className="text-zona-nulidad">✗ {respondidas - correctas}</span>
          <span className="text-doc-aged/40">{respondidas > 0 ? `${pct}%` : "—"}</span>
        </div>
      </div>

      <motion.div
        key={pregunta.id}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="terminal p-6 space-y-4"
      >
        <div>
          <div className="text-[9px] font-mono-terminal uppercase tracking-widest mb-1" style={{ color: `var(--zona-${pregunta.zona})` }}>
            {pregunta.tema}
          </div>
          <p className="font-serif-juridica text-doc-aged text-base leading-relaxed">{pregunta.enunciado}</p>
        </div>

        <div className="space-y-2">
          {shuffled.options.map((op, idx) => (
            <AlternativaButton
              key={`${pregunta.id}-${idx}`}
              letra={op.letra}
              texto={op.texto}
              seleccionada={seleccion === idx}
              respondida={respondida}
              feedback={
                !respondida
                  ? null
                  : idx === shuffled.correctIndex
                    ? "correcto"
                    : seleccion === idx
                      ? "incorrecto"
                      : null
              }
              onClick={() => responder(idx)}
              disabled={respondida}
            />
          ))}
        </div>

        {/* EXPLICACIÓN POST-RESPUESTA */}
        <AnimatePresence>
          {respondida && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div className={`p-3 border text-xs ${esCorrecta ? "border-zona-cautelares/40 bg-zona-cautelares/5" : "border-zona-nulidad/40 bg-zona-nulidad/5"}`}>
                <div className={`font-mono-terminal text-[9px] uppercase tracking-widest mb-2 ${esCorrecta ? "text-zona-cautelares" : "text-zona-nulidad"}`}>
                  {esCorrecta ? "✓ CORRECTO" : "✗ INCORRECTO — ANÁLISIS"}
                </div>
                <p className="font-serif-juridica italic text-doc-aged/80 leading-relaxed">{pregunta.explicacion}</p>
                {/* Sólo aparece si la pregunta tiene procedencia registrada. */}
                <FichaProcedencia procedencia={pregunta.procedencia} />
              </div>

              <div className="flex gap-2 flex-wrap text-[9px] font-mono-terminal text-doc-aged/40">
                {pregunta.normas.map((n) => (
                  <span key={n} className="border border-doc-aged/20 px-2 py-0.5">{n}</span>
                ))}
              </div>

              <button
                onClick={siguiente}
                onMouseEnter={() => sfx.hover()}
                className="btn w-full py-2"
              >
                SIGUIENTE PREGUNTA →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* BARRA PROGRESO */}
      {respondidas > 0 && (
        <div className="terminal p-3">
          <div className="flex justify-between text-[9px] font-mono-terminal text-doc-aged/40 mb-2">
            <span>RENDIMIENTO SESIÓN</span>
            <span className={pct >= 70 ? "text-zona-cautelares" : pct >= 50 ? "text-zona-prueba" : "text-zona-nulidad"}>{pct}%</span>
          </div>
          <div className="w-full bg-doc-aged/10 h-1">
            <div
              className="h-1 transition-all duration-500"
              style={{ width: `${pct}%`, background: pct >= 70 ? "var(--zona-cautelares)" : pct >= 50 ? "var(--zona-prueba)" : "var(--zona-nulidad)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
