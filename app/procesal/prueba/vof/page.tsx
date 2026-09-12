"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { VF_PRUEBA, type VFItem } from "@/data/procesal/prueba";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const N = 10;
const PENSAR_SEG = 5;

export default function VofPruebaPage() {
  const [items, setItems] = useState<VFItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [fase, setFase] = useState<"pensar" | "responder">("pensar");
  const [seg, setSeg] = useState(PENSAR_SEG);
  const premio = useProcesal((s) => s.premio);

  useEffect(() => {
    setItems(shuffle(VF_PRUEBA).slice(0, N));
    setIdx(0); setElegida(null); setAciertos(0); setClaimed(false);
  }, [seed]);

  // "Pensar primero": cuenta regresiva para razonar antes de habilitar la respuesta.
  useEffect(() => {
    if (items.length === 0 || idx >= items.length) return;
    setFase("pensar"); setSeg(PENSAR_SEG);
    const t = setInterval(() => {
      setSeg((s) => { if (s <= 1) { clearInterval(t); setFase("responder"); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, items.length]);

  useEffect(() => {
    if (items.length > 0 && idx >= items.length && !claimed) { setClaimed(true); premio(aciertos * 5, aciertos); sfx.unlock?.(); }
  }, [items.length, idx, claimed, aciertos, premio]);

  if (items.length === 0) return <div className="px-4 py-16 text-center" data-proc="prueba"><div className="proc-heading proc-float">Depurando afirmaciones…</div></div>;

  const fin = idx >= items.length;
  const it = !fin ? items[idx] : null;
  const revelado = elegida !== null;
  const acerto = it ? elegida === it.verdadero : false;

  const responder = (v: boolean) => { if (revelado || !it) return; setElegida(v); if (v === it.verdadero) { setAciertos((n) => n + 1); sfx.confirm?.(); } else sfx.warning?.(); };
  const siguiente = () => { setElegida(null); setIdx((i) => i + 1); sfx.click?.(); };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal/prueba" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Sala de la Verdad</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Verdadero o Falso difícil</span>
      </header>
      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">¿Verdadero o Falso?</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">El matiz reprueba. Lee con cuidado: muchas afirmaciones son trampas casi verdaderas.</p>
      </div>

      {!fin && it ? (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel proc-scan p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="proc-tag">Afirmación {idx + 1} / {items.length}</div>
            <div className="font-mono-terminal text-[10px] proc-accent">★ {aciertos}</div>
          </div>
          <div className="proc-card p-4 mb-4">
            <p className="font-serif-juridica text-[16px] leading-relaxed">{it.afirmacion}</p>
          </div>
          {fase === "pensar" && !revelado ? (
            <div className="text-center py-2">
              <div className="proc-tag mb-2">Lee y formula tu hipótesis… ¿verdadero o falso?</div>
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-16 h-16" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--proc-primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray={94.2} strokeDashoffset={94.2 * (1 - seg / PENSAR_SEG)} style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center proc-heading text-xl">{seg}</div>
              </div>
              <button onClick={() => { setFase("responder"); sfx.click?.(); }} className="proc-btn px-4 py-2 text-sm">Responder ahora ▸</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((v) => {
                let state: string | undefined;
                if (revelado) state = v === it.verdadero ? "ok" : v === elegida ? "bad" : "dim";
                return (
                  <button key={String(v)} onClick={() => responder(v)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt px-3 py-3 font-serif-juridica text-[15px] text-center">
                    {v ? "✓ Verdadero" : "✗ Falso"}
                  </button>
                );
              })}
            </div>
          )}
          {revelado && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="proc-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
                <div className="proc-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>{acerto ? "✦ Correcto" : `✗ Era ${it.verdadero ? "Verdadero" : "Falso"}`} · {it.articulo}</div>
                <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{it.explicacion}</p>
              </div>
              <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < items.length ? "Siguiente ▸" : "Ver resultado ▸"}</button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
          <div className="text-3xl mb-1">{aciertos === items.length ? "🏅" : aciertos >= items.length * 0.6 ? "✅" : "📚"}</div>
          <div className="proc-heading text-xl mb-1">Resultado</div>
          <p className="font-serif-juridica opacity-85 text-sm mb-2">Acertaste <span className="proc-accent">{aciertos}/{items.length}</span>.</p>
          <div className="font-mono-terminal text-[11px] proc-accent mb-4">+{aciertos * 5} XP · 🔖 {aciertos}</div>
          <button onClick={() => setSeed((s) => s + 1)} className="proc-btn px-5 py-2.5 text-sm">↻ Otra ronda</button>
        </motion.div>
      )}
    </div>
  );
}
