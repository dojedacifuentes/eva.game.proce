"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { EXAMINADOR, POOL_EXAMEN, veredictoExamen, type PreguntaExamen } from "@/data/procesal/examenProc";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Fase = "intro" | "pregunta" | "fin";

export default function ExamenProcPage() {
  const [fase, setFase] = useState<Fase>("intro");
  const [qs, setQs] = useState<PreguntaExamen[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [compostura, setCompostura] = useState(100);
  const [claimed, setClaimed] = useState(false);
  const aprobarExamen = useProcesal((s) => s.aprobarExamen);
  const aprobadoAntes = useProcesal((s) => s.examenesAprobados.includes(EXAMINADOR.id));

  const total = qs.length;
  const v = fase === "fin" ? veredictoExamen(aciertos, total) : null;

  useEffect(() => {
    if (fase === "fin" && v && v.aprobado && !claimed) {
      setClaimed(true);
      aprobarExamen(EXAMINADOR.id, { xp: 80, sellos: 40 });
      sfx.unlock?.();
    }
  }, [fase, v, claimed, aprobarExamen]);

  const comenzar = () => {
    const pool = shuffle(POOL_EXAMEN).slice(0, EXAMINADOR.nPreguntas).map((q) => ({ ...q, opciones: shuffle(q.opciones) }));
    setQs(pool); setIdx(0); setElegida(null); setAciertos(0); setCompostura(100); setClaimed(false);
    setFase("pregunta"); sfx.confirm?.();
  };

  const q = fase === "pregunta" ? qs[idx] : null;
  const revelado = elegida !== null;

  const responder = (id: string) => {
    if (revelado || !q) return;
    setElegida(id);
    if (id === q.correcta) { setAciertos((n) => n + 1); sfx.confirm?.(); }
    else { setCompostura((c) => Math.max(0, c - Math.ceil(100 / Math.max(total, 1)) - 6)); sfx.warning?.(); }
  };
  const siguiente = () => {
    setElegida(null);
    if (idx + 1 < qs.length) setIdx((i) => i + 1);
    else setFase("fin");
    sfx.click?.();
  };
  const reiniciar = () => { setFase("intro"); setQs([]); sfx.click?.(); };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="ordinario" style={{ ["--proc-primary" as any]: EXAMINADOR.color }}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">{EXAMINADOR.cargo}</span>
      </header>

      {/* ── INTRO ── */}
      {fase === "intro" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-5 md:p-6 text-center">
          <div className="text-5xl mb-2 proc-float">👨‍⚖️</div>
          <div className="proc-tag mb-1">{EXAMINADOR.cargo}</div>
          <h1 className="proc-heading text-2xl md:text-3xl mb-1">{EXAMINADOR.nombre}</h1>
          {aprobadoAntes && <div className="font-mono-terminal text-[10px] proc-accent mb-2">✓ ya aprobado</div>}
          <p className="font-serif-juridica opacity-85 text-[14.5px] leading-relaxed max-w-lg mx-auto mb-4">“{EXAMINADOR.intro}”</p>
          <p className="font-mono-terminal text-[10px] opacity-55 mb-4">{EXAMINADOR.nPreguntas} preguntas · necesitas 60% para aprobar</p>
          <button onClick={comenzar} className="proc-btn px-6 py-2.5 text-sm">Rendir el examen ▸</button>
        </motion.div>
      )}

      {/* ── PREGUNTA ── */}
      {fase === "pregunta" && q && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="proc-tag shrink-0">Compostura</div>
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: compostura > 50 ? "linear-gradient(90deg,#3f9d6b,#5fb37a)" : compostura > 25 ? "#d9a521" : "#c65b6e" }} animate={{ width: `${compostura}%` }} />
            </div>
            <span className="font-mono-terminal text-[10px] proc-accent shrink-0">{idx + 1}/{qs.length}</span>
          </div>

          <motion.div key={idx} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="proc-panel p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👨‍⚖️</span>
              <div className="proc-tag">El examinador pregunta</div>
            </div>
            <p className="font-serif-juridica text-[16px] leading-relaxed mb-3">{q.pregunta}</p>
            <div className="space-y-2">
              {q.opciones.map((op) => {
                let state: string | undefined;
                if (revelado) {
                  if (op.id === q.correcta) state = "ok";
                  else if (op.id === elegida) state = "bad";
                  else state = "dim";
                }
                return (
                  <button key={op.id} onClick={() => responder(op.id)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2">
                    {revelado && op.id === q.correcta && <span className="shrink-0">✓</span>}
                    {revelado && op.id === elegida && op.id !== q.correcta && <span className="shrink-0">✗</span>}
                    <span>{op.texto}</span>
                  </button>
                );
              })}
            </div>
            {revelado && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <div className="proc-card p-3" style={{ borderColor: elegida === q.correcta ? "#5fb37a66" : "#c65b6e66" }}>
                  <div className="proc-tag mb-1" style={{ color: elegida === q.correcta ? "#7ed79a" : "#f09aa8" }}>{elegida === q.correcta ? "✦ Correcto" : "✗ Incorrecto"}</div>
                  <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{q.explicacion}</p>
                </div>
                <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < qs.length ? "Siguiente pregunta ▸" : "Escuchar el veredicto ▸"}</button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── FIN ── */}
      {fase === "fin" && v && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-4xl mb-1">{v.aprobado ? "🎓" : "📚"}</div>
          <div className="proc-heading text-2xl mb-1" style={{ color: v.aprobado ? "#7ed79a" : "#f09aa8" }}>{v.titulo}</div>
          <p className="font-serif-juridica opacity-85 text-sm max-w-md mx-auto mb-2">{v.texto}</p>
          <div className="font-mono-terminal text-[12px] proc-accent mb-1">Aciertos: {aciertos}/{total}</div>
          {v.aprobado && <div className="font-mono-terminal text-[11px] proc-accent mb-3">+80 XP · 🔖 40</div>}
          <button onClick={reiniciar} className="proc-btn px-5 py-2.5 text-sm mt-2">↻ Rendir de nuevo</button>
        </motion.div>
      )}
    </div>
  );
}
