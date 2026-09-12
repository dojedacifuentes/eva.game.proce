"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import { fx } from "@/lib/fx";
import { casosAleatoriosVoF, type PreguntaVoF } from "@/data/preguntas-vof";
import { useCallbackRef } from "@/lib/useCallbackRef";

// ============================================================================
// SPEEDRUN VERDADERO/FALSO — modo arcade con presión temporal extrema
// Sarcasmo, humor negro, respuestas tramposas.
// Visual horror cuando fallas: corrupción + glitch + chroma aberration.
// ============================================================================

const N_PREGUNTAS = 15;
const TIEMPO_BASE = 6;

export default function SpeedrunVoF() {
  const game = useGame();
  const [activo, setActivo] = useState(false);
  const [preguntas, setPreguntas] = useState<PreguntaVoF[]>([]);
  const [idx, setIdx] = useState(0);
  const [respuesta, setRespuesta] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [tiempo, setTiempo] = useState(TIEMPO_BASE);
  const [terminado, setTerminado] = useState(false);
  const [dificultad, setDificultad] = useState<1 | 2 | 3>(2);
  const [glitchPantalla, setGlitchPantalla] = useState(false);
  const tiempoMaxRef = useRef(TIEMPO_BASE);

  const actual = activo && !terminado ? preguntas[idx] : null;

  // Ver la nota de useCallbackRef: identidad estable, cuerpo siempre al día.
  const fallarEstable = useCallbackRef(() => fallar());
  useEffect(() => {
    if (!activo || terminado || respuesta !== null || !actual) return;
    const t = setInterval(() => {
      setTiempo((s) => {
        if (s <= 0.1) { fallarEstable(); return 0; }
        return s - 0.1;
      });
    }, 100);
    return () => clearInterval(t);
  }, [activo, terminado, respuesta, actual, fallarEstable]);

  function iniciar() {
    sfx.confirm();
    setPreguntas(casosAleatoriosVoF(N_PREGUNTAS, dificultad));
    setIdx(0);
    setAciertos(0);
    setFallos(0);
    setCombo(0);
    setMaxCombo(0);
    setTiempo(TIEMPO_BASE);
    tiempoMaxRef.current = TIEMPO_BASE;
    setRespuesta(null);
    setTerminado(false);
    setActivo(true);
  }

  function responder(r: boolean) {
    if (respuesta !== null || !actual) return;
    setRespuesta(r);
    const ok = r === actual.respuesta;
    if (ok) {
      sfx.combo(combo);
      fx.reward();
      setAciertos((a) => a + 1);
      setCombo((c) => { const n = c + 1; setMaxCombo((m) => Math.max(m, n)); return n; });
    } else {
      sfx.glitch();
      fx.shake();
      setFallos((f) => f + 1);
      setCombo(0);
      setGlitchPantalla(true);
      setTimeout(() => setGlitchPantalla(false), 600);
    }
    setTimeout(siguiente, 1500);
  }

  function fallar() {
    setRespuesta(null);
    sfx.plazoCritico();
    setFallos((f) => f + 1);
    setCombo(0);
    setTimeout(siguiente, 800);
  }

  function siguiente() {
    if (idx + 1 >= preguntas.length) {
      terminar();
      return;
    }
    setIdx((i) => i + 1);
    setRespuesta(null);
    // Dificultad creciente
    const nuevo = Math.max(3, TIEMPO_BASE - Math.floor(combo / 4) * 0.5);
    tiempoMaxRef.current = nuevo;
    setTiempo(nuevo);
  }

  function terminar() {
    setTerminado(true);
    setActivo(false);
    const score = aciertos * 100 + maxCombo * 50;
    sfx.confirm();
    game.pushLog(`Speedrun V/F: ${aciertos}/${preguntas.length} · combo ×${maxCombo} · ${score} pts`, "V/F");
    if (aciertos >= preguntas.length * 0.8) {
      game.ajustarReputacion(8);
      game.desbloquearLogro({ id: `vof_${dificultad}`, titulo: `V/F Dif ${dificultad} dominada`, descripcion: `${aciertos}/${preguntas.length} aciertos`, articulo: "—", desbloqueado: true });
    }
  }

  // ─────────────── PANTALLA INICIO ───────────────
  if (!activo && !terminado) {
    return (
      <div className="space-y-4">
        <div className="terminal p-6">
          <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-oralidad mb-2 animate-flicker">
            ★ MODO PRESIÓN TEMPORAL ★
          </div>
          <h2 className="font-display-grave text-4xl text-doc-aged mb-2 chroma" data-text="VERDADERO O FALSO">
            VERDADERO o FALSO
          </h2>
          <p className="font-serif-juridica italic text-zona-prueba/80 mb-5">
            «No te confíes. La respuesta obvia suele ser la incorrecta. El art. 64 hace su trabajo en segundos.»
          </p>

          <div className="mb-5">
            <div className="font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/50 mb-2">DIFICULTAD</div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((d) => (
                <button key={d}
                  onClick={() => { setDificultad(d as 1 | 2 | 3); sfx.click(); }}
                  onMouseEnter={() => sfx.hover()}
                  className={`p-3 border text-left font-mono-terminal text-xs ${
                    dificultad === d ? "border-zona-oralidad bg-zona-oralidad/10 text-zona-oralidad" : "border-bg-steel text-doc-aged/60"
                  }`}>
                  <div className="font-display-grave text-lg">{d === 1 ? "ALPHA" : d === 2 ? "OMEGA" : "PESADILLA"}</div>
                  <div className="opacity-60">{d === 1 ? "Conceptos básicos" : d === 2 ? "Trampas comunes" : "Doctrina fina"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5 text-xs font-mono-terminal">
            <div className="border border-bg-steel p-2 text-center">
              <div className="text-doc-aged/50">Preguntas</div>
              <div className="font-display-grave text-2xl text-zona-competencia">{N_PREGUNTAS}</div>
            </div>
            <div className="border border-bg-steel p-2 text-center">
              <div className="text-doc-aged/50">Tiempo c/u</div>
              <div className="font-display-grave text-2xl text-zona-prueba">{TIEMPO_BASE}s</div>
            </div>
            <div className="border border-bg-steel p-2 text-center">
              <div className="text-doc-aged/50">Mínimo</div>
              <div className="font-display-grave text-2xl text-zona-nulidad">3.0s</div>
            </div>
          </div>

          <button onClick={iniciar} onMouseEnter={() => sfx.hover()} className="btn btn-oral text-base px-6 py-3">
            ▶ COMENZAR
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── PANTALLA FINAL ───────────────
  if (terminado) {
    const pct = (aciertos / preguntas.length) * 100;
    const veredicto =
      pct >= 90 ? { texto: "MAESTRÍA", color: "var(--zona-cautelares)", comentario: "La doctrina te respeta. Hasta el Ministro Formalista bajaría la cabeza." } :
      pct >= 70 ? { texto: "APROBADO", color: "var(--zona-prueba)", comentario: "Pasable. La comisión asentirá con cansancio." } :
      pct >= 50 ? { texto: "MEDIOCRE", color: "var(--zona-ejecutivo)", comentario: "Aprobaste de raspón. Couture te juzga desde la tumba." } :
      { texto: "INADMISIBLE", color: "var(--zona-nulidad)", comentario: "La Corte declaró inadmisible tu existencia. Vuelve al codex y reza al 768." };

    return (
      <div className="terminal p-8 text-center">
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.4em] text-zona-recursos mb-4">DICTAMEN</div>
        <div className="my-6">
          <div className="font-display-grave text-6xl glitch-text mb-2" style={{ color: veredicto.color, textShadow: `0 0 30px ${veredicto.color}` }}>
            {veredicto.texto}
          </div>
          <div className="font-serif-juridica italic text-doc-aged/80 max-w-md mx-auto">{veredicto.comentario}</div>
        </div>
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto text-xs">
          <Stat label="Aciertos" v={aciertos} color="cautelares" />
          <Stat label="Fallos" v={fallos} color="nulidad" />
          <Stat label="Max combo" v={`×${maxCombo}`} color="ejecutivo" />
          <Stat label="Score" v={(aciertos * 100 + maxCombo * 50).toLocaleString()} color="recursos" />
        </div>
        <button onClick={iniciar} onMouseEnter={() => sfx.hover()} className="btn btn-oral mt-6">↻ OTRA RONDA</button>
      </div>
    );
  }

  // ─────────────── PANTALLA DE JUEGO ───────────────
  if (!actual) return null;
  const tiempoPct = (tiempo / tiempoMaxRef.current) * 100;

  return (
    <div className={`space-y-3 ${glitchPantalla ? "glitch-frame" : ""}`}>
      {/* HUD */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <HUD label="PROGRESO" val={`${idx + 1}/${preguntas.length}`} color="competencia" />
        <HUD label="ACIERTOS" val={aciertos} color="cautelares" />
        <HUD label="FALLOS" val={fallos} color="nulidad" />
        <HUD label="COMBO" val={combo > 0 ? `×${combo}` : "—"} color="ejecutivo" />
      </div>

      {/* Timer crítico */}
      <div className="h-2 bg-bg-deep border border-bg-steel relative overflow-hidden">
        <motion.div
          animate={{ width: `${tiempoPct}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
          className="h-full"
          style={{
            background: tiempoPct > 50 ? "var(--zona-cautelares)" : tiempoPct > 25 ? "var(--zona-prueba)" : "var(--zona-nulidad)",
            boxShadow: tiempoPct < 25 ? "0 0 12px var(--zona-nulidad)" : "none",
          }}
        />
      </div>

      {/* Enunciado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.2 }}
          className="zona-card p-6"
          style={{ "--zona-color": `var(--zona-${actual.zona})` } as React.CSSProperties}
        >
          <div className="flex justify-between items-start mb-4">
            <span className={`tag tag-${actual.zona === "incidentes" ? "incidente" : actual.zona === "cosajuzgada" ? "cosajuzgada" : actual.zona}`}>
              {actual.zona} · dif {actual.dificultad}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono-terminal text-doc-aged/40">
              {actual.art}
            </span>
          </div>
          <div className="font-display-grave text-xl md:text-2xl text-doc-aged leading-tight mb-6 min-h-[5rem]">
            «{actual.enunciado}»
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => responder(true)}
              onMouseEnter={() => sfx.hover()}
              disabled={respuesta !== null}
              className={`p-6 border-2 transition-all font-display-grave text-3xl tracking-widest ${
                respuesta === null ? "border-zona-cautelares text-zona-cautelares hover:bg-zona-cautelares/10" :
                respuesta === true && actual.respuesta === true ? "border-zona-cautelares bg-zona-cautelares/20 text-zona-cautelares" :
                respuesta === true && actual.respuesta === false ? "border-zona-nulidad bg-zona-nulidad/20 text-zona-nulidad" :
                "border-bg-steel opacity-30"
              }`}
            >
              ✓ VERDADERO
            </button>
            <button
              onClick={() => responder(false)}
              onMouseEnter={() => sfx.hover()}
              disabled={respuesta !== null}
              className={`p-6 border-2 transition-all font-display-grave text-3xl tracking-widest ${
                respuesta === null ? "border-zona-nulidad text-zona-nulidad hover:bg-zona-nulidad/10" :
                respuesta === false && actual.respuesta === false ? "border-zona-cautelares bg-zona-cautelares/20 text-zona-cautelares" :
                respuesta === false && actual.respuesta === true ? "border-zona-nulidad bg-zona-nulidad/20 text-zona-nulidad" :
                "border-bg-steel opacity-30"
              }`}
            >
              ✗ FALSO
            </button>
          </div>

          {respuesta !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 border-l-2 font-mono-terminal text-xs text-doc-aged/80"
              style={{ borderColor: respuesta === actual.respuesta ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}
            >
              {actual.explicacion}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HUD({ label, val, color }: { label: string; val: string | number; color: string }) {
  return (
    <div className="zona-card p-2" style={{ "--zona-color": `var(--zona-${color})` } as React.CSSProperties}>
      <div className="text-[9px] uppercase tracking-widest text-doc-aged/50 font-mono-terminal">{label}</div>
      <div className="font-display-grave text-xl" style={{ color: `var(--zona-${color})` }}>{val}</div>
    </div>
  );
}

function Stat({ label, v, color }: { label: string; v: string | number; color: string }) {
  return (
    <div className="border border-bg-steel p-2">
      <div className="text-[9px] uppercase tracking-widest text-doc-aged/50">{label}</div>
      <div className="font-display-grave text-2xl" style={{ color: `var(--zona-${color})` }}>{v}</div>
    </div>
  );
}
