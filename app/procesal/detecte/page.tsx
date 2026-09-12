"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { CASOS_ERROR, type CasoError } from "@/data/procesal/errores";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const N = 10;

export default function DetectePage() {
  const [casos, setCasos] = useState<CasoError[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);

  // Construye el set tras el montaje (hidratación segura).
  useEffect(() => {
    setCasos(shuffle(CASOS_ERROR).slice(0, N));
    setIdx(0); setElegida(null); setAciertos(0); setClaimed(false);
  }, [seed]);

  useEffect(() => {
    if (casos.length > 0 && idx >= casos.length && !claimed) {
      setClaimed(true);
      premio(aciertos * 4, aciertos);
      sfx.unlock?.();
    }
  }, [casos.length, idx, claimed, aciertos, premio]);

  if (casos.length === 0) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center" data-proc="ejecutivo">
        <div className="proc-heading text-lg proc-float">Abriendo expedientes…</div>
      </div>
    );
  }

  const fin = idx >= casos.length;
  const caso = !fin ? casos[idx] : null;
  const revelado = elegida !== null;
  const acerto = caso ? elegida === caso.tieneError : false;

  const responder = (dijoError: boolean) => {
    if (revelado || !caso) return;
    setElegida(dijoError);
    if (dijoError === caso.tieneError) { setAciertos((n) => n + 1); sfx.confirm?.(); }
    else sfx.warning?.();
  };
  const siguiente = () => { setElegida(null); setIdx((i) => i + 1); sfx.click?.(); };
  const reiniciar = () => { setSeed((s) => s + 1); sfx.click?.(); };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="ejecutivo">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Caza el vicio procesal</span>
      </header>

      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Detecte el Error</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Te pasan expedientes. Algunos están bien tramitados; otros esconden un vicio. Tu ojo de litigante debe decidir, y saber por qué.</p>
      </div>

      {!fin && caso ? (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="proc-tag">Expediente {idx + 1} / {casos.length}</div>
            <div className="font-mono-terminal text-[10px] proc-accent">★ {aciertos}</div>
          </div>

          <div className="proc-card p-4 mb-4">
            <div className="proc-tag mb-1.5">En la carpeta consta</div>
            <p className="font-serif-juridica text-[16px] leading-relaxed">{caso.escenario}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[false, true].map((v) => {
              let state: string | undefined;
              if (revelado) {
                if (v === caso.tieneError) state = "ok";
                else if (v === elegida) state = "bad";
                else state = "dim";
              }
              return (
                <button key={String(v)} onClick={() => responder(v)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt px-3 py-3 font-serif-juridica text-[14px] text-center">
                  {v ? "⚠ Hay un vicio" : "✓ Procedimiento correcto"}
                </button>
              );
            })}
          </div>

          {revelado && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="proc-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
                <div className="proc-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>
                  {acerto ? "✦ Bien visto" : "✗ Se te pasó"} · {caso.articulo}
                </div>
                <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{caso.veredicto}</p>
              </div>
              <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < casos.length ? "Siguiente expediente ▸" : "Ver resultado ▸"}</button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-3xl mb-1">{aciertos === casos.length ? "🕵️" : aciertos >= casos.length * 0.6 ? "✅" : "📚"}</div>
          <div className="proc-heading text-xl mb-1">Resultado</div>
          <p className="font-serif-juridica opacity-85 text-sm mb-2">Detectaste <span className="proc-accent">{aciertos}/{casos.length}</span> correctamente.</p>
          <div className="font-mono-terminal text-[11px] proc-accent mb-4">+{aciertos * 4} XP · 🔖 {aciertos}</div>
          <button onClick={reiniciar} className="proc-btn px-5 py-2.5 text-sm">↻ Otra ronda</button>
        </motion.div>
      )}
    </div>
  );
}
