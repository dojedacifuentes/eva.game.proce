"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { CASOS_PRUEBA, type CasoPrueba } from "@/data/procesal/prueba";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function CasosPruebaPage() {
  const [casos, setCasos] = useState<CasoPrueba[]>([]);
  const [cIdx, setCIdx] = useState(0);
  const [pIdx, setPIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fin, setFin] = useState(false);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);

  useEffect(() => {
    setCasos(shuffle(CASOS_PRUEBA));
    setCIdx(0); setPIdx(0); setElegida(null); setAciertos(0); setFin(false); setClaimed(false);
  }, [seed]);

  useEffect(() => {
    if (fin && !claimed) { setClaimed(true); premio(aciertos * 5, aciertos); sfx.unlock?.(); }
  }, [fin, claimed, aciertos, premio]);

  if (casos.length === 0) return <div className="px-4 py-16 text-center" data-proc="prueba"><div className="proc-heading proc-float">Instruyendo la causa…</div></div>;

  const total = casos.reduce((n, c) => n + c.preguntas.length, 0);
  const hechas = casos.slice(0, cIdx).reduce((n, c) => n + c.preguntas.length, 0) + pIdx;
  const caso = casos[cIdx];
  const pregunta = caso?.preguntas[pIdx];
  const revelado = elegida !== null;
  const acerto = pregunta ? elegida === pregunta.correcta : false;

  const responder = (id: string) => { if (revelado || !pregunta) return; setElegida(id); if (id === pregunta.correcta) { setAciertos((n) => n + 1); sfx.confirm?.(); } else sfx.warning?.(); };
  const siguiente = () => {
    setElegida(null);
    if (pIdx + 1 < caso.preguntas.length) setPIdx(pIdx + 1);
    else if (cIdx + 1 < casos.length) { setCIdx(cIdx + 1); setPIdx(0); }
    else setFin(true);
    sfx.click?.();
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal/prueba" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Sala de la Verdad</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Resolución de casos</span>
      </header>
      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Casos de la Verdad</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Te entregan un caso con un problema probatorio. Resuélvelo paso a paso: carga, medio idóneo, valor y consecuencia.</p>
      </div>

      {fin ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-3xl mb-1">{aciertos === total ? "🏅" : aciertos >= total * 0.6 ? "✅" : "📚"}</div>
          <div className="proc-heading text-xl mb-1">Causa resuelta</div>
          <p className="font-serif-juridica opacity-85 text-sm mb-2">Resolviste <span className="proc-accent">{aciertos}/{total}</span> cuestiones probatorias.</p>
          <div className="font-mono-terminal text-[11px] proc-accent mb-4">+{aciertos * 5} XP · 🔖 {aciertos}</div>
          <button onClick={() => setSeed((s) => s + 1)} className="proc-btn px-5 py-2.5 text-sm">↻ Nuevos casos</button>
        </motion.div>
      ) : pregunta ? (
        <div>
          <div className="flex items-center gap-3 max-w-md mb-3">
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--proc-secondary), var(--proc-primary))" }} animate={{ width: `${(hechas / total) * 100}%` }} />
            </div>
            <span className="font-mono-terminal text-[10px] proc-accent">★ {aciertos}</span>
          </div>

          <div className="proc-panel proc-scan p-4 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg proc-float">🔎</span>
              <div className="proc-tag">Caso {cIdx + 1} / {casos.length} · {caso.titulo}</div>
            </div>
            <p className="font-serif-juridica text-[15px] leading-relaxed">{caso.situacion}</p>
          </div>

          <motion.div key={`${cIdx}-${pIdx}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="proc-card p-4">
            <div className="proc-tag mb-2" style={{ color: "var(--proc-accent)" }}>● {pregunta.eje}</div>
            <p className="font-serif-juridica text-[15.5px] leading-relaxed mb-3">{pregunta.pregunta}</p>
            <div className="space-y-2">
              {pregunta.opciones.map((op) => {
                let state: string | undefined;
                if (revelado) state = op.id === pregunta.correcta ? "ok" : op.id === elegida ? "bad" : "dim";
                return (
                  <button key={op.id} onClick={() => responder(op.id)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2">
                    {revelado && op.id === pregunta.correcta && <span className="shrink-0">✓</span>}
                    {revelado && op.id === elegida && op.id !== pregunta.correcta && <span className="shrink-0">✗</span>}
                    <span>{op.texto}</span>
                  </button>
                );
              })}
            </div>
            {revelado && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <div className="proc-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
                  <div className="proc-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>{acerto ? "✦ Correcto" : "✗ Incorrecto"} · {pregunta.articulo}</div>
                  <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{pregunta.explicacion}</p>
                </div>
                <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{hechas + 1 < total ? "Siguiente ▸" : "Cerrar la causa ▸"}</button>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
