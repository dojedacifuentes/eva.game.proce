"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { MC_PRUEBA, type MCItem } from "@/data/procesal/prueba";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const N = 10;

export default function AlternativasPage() {
  const [qs, setQs] = useState<MCItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);

  useEffect(() => {
    setQs(shuffle(MC_PRUEBA).slice(0, N).map((q) => ({ ...q, opciones: shuffle(q.opciones) })));
    setIdx(0); setElegida(null); setAciertos(0); setClaimed(false);
  }, [seed]);

  useEffect(() => {
    if (qs.length > 0 && idx >= qs.length && !claimed) { setClaimed(true); premio(aciertos * 5, aciertos); sfx.unlock?.(); }
  }, [qs.length, idx, claimed, aciertos, premio]);

  if (qs.length === 0) return <div className="px-4 py-16 text-center" data-proc="prueba"><div className="proc-heading proc-float">Citando la prueba…</div></div>;

  const fin = idx >= qs.length;
  const q = !fin ? qs[idx] : null;
  const revelado = elegida !== null;

  const elegir = (id: string) => { if (revelado || !q) return; setElegida(id); if (id === q.correcta) { setAciertos((n) => n + 1); sfx.confirm?.(); } else sfx.warning?.(); };
  const siguiente = () => { setElegida(null); setIdx((i) => i + 1); sfx.click?.(); };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal/prueba" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Sala de la Verdad</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Alternativas difíciles</span>
      </header>
      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Alternativas de la Verdad</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Cada pregunta tiene una sola respuesta correcta y dos trampas plausibles. Elige con criterio.</p>
      </div>

      {!fin && q ? (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel proc-scan p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="proc-tag">Pregunta {idx + 1} / {qs.length}</div>
            <div className="font-mono-terminal text-[10px] proc-accent">★ {aciertos}</div>
          </div>
          <p className="font-serif-juridica text-[16px] leading-relaxed mb-3">{q.pregunta}</p>
          <div className="space-y-2">
            {q.opciones.map((op) => {
              let state: string | undefined;
              if (revelado) state = op.id === q.correcta ? "ok" : op.id === elegida ? "bad" : "dim";
              return (
                <button key={op.id} onClick={() => elegir(op.id)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2">
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
                <div className="proc-tag mb-1" style={{ color: elegida === q.correcta ? "#7ed79a" : "#f09aa8" }}>{elegida === q.correcta ? "✦ Correcto" : "✗ Incorrecto"} · {q.articulo}</div>
                <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{q.explicacion}</p>
              </div>
              <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < qs.length ? "Siguiente ▸" : "Ver resultado ▸"}</button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-3xl mb-1">{aciertos === qs.length ? "🏅" : aciertos >= qs.length * 0.6 ? "✅" : "📚"}</div>
          <div className="proc-heading text-xl mb-1">Resultado</div>
          <p className="font-serif-juridica opacity-85 text-sm mb-2">Acertaste <span className="proc-accent">{aciertos}/{qs.length}</span>.</p>
          <div className="font-mono-terminal text-[11px] proc-accent mb-4">+{aciertos * 5} XP · 🔖 {aciertos}</div>
          <button onClick={() => setSeed((s) => s + 1)} className="proc-btn px-5 py-2.5 text-sm">↻ Otra ronda</button>
        </motion.div>
      )}
    </div>
  );
}
