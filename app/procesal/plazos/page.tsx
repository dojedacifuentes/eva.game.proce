"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { PLAZOS_PROC, PLAZOS_DISTINTOS, type PlazoItem } from "@/data/procesal/plazos";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Pregunta = { item: PlazoItem; opciones: string[] };
const N = 10;

export default function PlazosPage() {
  const [qs, setQs] = useState<Pregunta[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);

  // Construye las preguntas tras el montaje (evita mismatch de hidratación).
  useEffect(() => {
    const pool = shuffle(PLAZOS_PROC).slice(0, N);
    const preguntas = pool.map((item) => {
      const distract = shuffle(PLAZOS_DISTINTOS.filter((p) => p !== item.plazo)).slice(0, 3);
      return { item, opciones: shuffle([item.plazo, ...distract]) };
    });
    setQs(preguntas);
    setIdx(0); setElegida(null); setAciertos(0); setClaimed(false);
  }, [seed]);

  // Premia al terminar (post-render, una sola vez por ronda).
  useEffect(() => {
    if (qs.length > 0 && idx >= qs.length && !claimed) {
      setClaimed(true);
      premio(aciertos * 4, aciertos);
      sfx.unlock?.();
    }
  }, [qs.length, idx, claimed, aciertos, premio]);

  if (qs.length === 0) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center" data-proc="recursos">
        <div className="proc-heading text-lg proc-float">Barajando plazos…</div>
      </div>
    );
  }

  const fin = idx >= qs.length;
  const q = !fin ? qs[idx] : null;
  const revelado = elegida !== null;

  const elegir = (op: string) => {
    if (revelado || !q) return;
    setElegida(op);
    if (op === q.item.plazo) { setAciertos((n) => n + 1); sfx.confirm?.(); }
    else sfx.warning?.();
  };
  const siguiente = () => { setElegida(null); setIdx((i) => i + 1); sfx.click?.(); };
  const reiniciar = () => { setSeed((s) => s + 1); sfx.click?.(); };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="recursos">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Domina los plazos fatales</span>
      </header>

      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Plazos</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">¿Cuánto tienes para actuar? Asocia cada actuación o recurso con su plazo. En materia civil, casi todos son fatales.</p>
      </div>

      {!fin && q ? (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="proc-tag">Pregunta {idx + 1} / {qs.length}</div>
            <div className="font-mono-terminal text-[10px] proc-accent">★ {aciertos}</div>
          </div>
          <p className="font-serif-juridica text-[16px] leading-relaxed mb-1">¿Cuál es el plazo de…</p>
          <p className="proc-heading text-lg mb-3" style={{ color: "var(--proc-primary)" }}>{q.item.concepto}?</p>

          <div className="grid grid-cols-2 gap-2">
            {q.opciones.map((op) => {
              let state: string | undefined;
              if (revelado) {
                if (op === q.item.plazo) state = "ok";
                else if (op === elegida) state = "bad";
                else state = "dim";
              }
              return (
                <button key={op} onClick={() => elegir(op)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt px-3 py-3 font-mono-terminal text-[14px] text-center">
                  {op}
                </button>
              );
            })}
          </div>

          {revelado && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="proc-card p-3" style={{ borderColor: elegida === q.item.plazo ? "#5fb37a66" : "#c65b6e66" }}>
                <div className="proc-tag mb-1" style={{ color: elegida === q.item.plazo ? "#7ed79a" : "#f09aa8" }}>
                  {elegida === q.item.plazo ? "✦ Correcto" : `✗ Era: ${q.item.plazo}`} · {q.item.articulo}
                </div>
                <p className="font-serif-juridica text-[13px] opacity-85">{q.item.concepto}: <span className="proc-accent">{q.item.plazo}</span>.</p>
              </div>
              <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < qs.length ? "Siguiente ▸" : "Ver resultado ▸"}</button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-3xl mb-1">{aciertos === qs.length ? "🏅" : aciertos >= qs.length * 0.6 ? "✅" : "📚"}</div>
          <div className="proc-heading text-xl mb-1">Resultado</div>
          <p className="font-serif-juridica opacity-85 text-sm mb-2">Acertaste <span className="proc-accent">{aciertos}/{qs.length}</span> plazos.</p>
          <div className="font-mono-terminal text-[11px] proc-accent mb-4">+{aciertos * 4} XP · 🔖 {aciertos}</div>
          <button onClick={reiniciar} className="proc-btn px-5 py-2.5 text-sm">↻ Otra ronda</button>
        </motion.div>
      )}
    </div>
  );
}
