"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CASOS_CIVIL } from "@/data/civilis/casos";
import type { CasoCivil } from "@/types/civilis";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]; let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 16807) % 2147483647; const j = Math.floor((s / 2147483647) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const hashId = (id: string) => id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

const BASE: Record<number, number> = { 1: 10, 2: 20, 3: 30 };
const DURACION = 60;
function multCombo(c: number) { return c >= 15 ? 5 : c >= 10 ? 4 : c >= 6 ? 3 : c >= 3 ? 2 : 1; }
function tierColor(c: number) { return c >= 15 ? "#ff4d4d" : c >= 10 ? "#ff7a2a" : c >= 6 ? "#ffae34" : c >= 3 ? "#ffd23a" : "var(--civ-primary)"; }

export default function CascadaPage() {
  const recompensa = useCivilis((s) => s.recompensa);
  const [estado, setEstado] = useState<"idle" | "playing" | "fin">("idle");
  const [pool, setPool] = useState<CasoCivil[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [score, setScore] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [tiempo, setTiempo] = useState(DURACION);
  const [flota, setFlota] = useState<{ k: number; txt: string } | null>(null);
  const [shakeK, setShakeK] = useState(0);
  const flotaK = useRef(0);
  const premiado = useRef(false);

  // reloj del juego
  useEffect(() => {
    if (estado !== "playing") return;
    if (tiempo <= 0) { setEstado("fin"); return; }
    const t = setTimeout(() => setTiempo((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [estado, tiempo]);

  // premio al terminar (una vez)
  useEffect(() => {
    if (estado === "fin" && !premiado.current) {
      premiado.current = true;
      const xp = Math.floor(score / 8); const oro = Math.floor(score / 16);
      if (xp > 0 || oro > 0) recompensa(xp, oro);
      sfx.unlock?.();
    }
  }, [estado, score, recompensa]);

  const comenzar = () => {
    premiado.current = false;
    setPool(shuffle(CASOS_CIVIL)); setIdx(0); setElegida(null);
    setCombo(0); setBest(0); setScore(0); setAciertos(0); setTiempo(DURACION);
    setEstado("playing"); sfx.click?.();
  };

  const caso = pool.length ? pool[idx % pool.length] : undefined;
  const cats = useMemo(() => (caso ? seededShuffle(caso.categorias, hashId(caso.id) + idx) : []), [caso, idx]);
  const mult = multCombo(combo);

  const responder = (catId: string) => {
    if (elegida !== null || estado !== "playing" || !caso) return;
    setElegida(catId);
    if (catId === caso.correcta) {
      const nc = combo + 1; const m = multCombo(nc);
      const pts = (BASE[caso.dificultad] ?? 10) * m;
      setCombo(nc); setBest((b) => Math.max(b, nc)); setScore((s) => s + pts); setAciertos((a) => a + 1);
      flotaK.current += 1; setFlota({ k: flotaK.current, txt: `+${pts}${m > 1 ? `  ×${m}` : ""}` });
      sfx.confirm?.(); if (nc % 5 === 0) sfx.powerUp?.();
      setTimeout(() => { setElegida(null); setIdx((i) => i + 1); }, 300);
    } else {
      setCombo(0); setShakeK((x) => x + 1); sfx.warning?.();
      setTimeout(() => { setElegida(null); setIdx((i) => i + 1); }, 1200);
    }
  };

  // ── IDLE ──
  if (estado === "idle") {
    return (
      <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-civ="extincion">
        <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
          <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Contrarreloj</span>
        </header>
        <div className="civ-panel p-6 md:p-8 text-center">
          <div className="text-5xl mb-3 civ-float">🔥</div>
          <h1 className="civ-heading text-3xl md:text-4xl">Cascada Jurídica</h1>
          <p className="font-serif-juridica opacity-80 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {DURACION} segundos. Clasifica casos lo más rápido que puedas. Cada acierto encadena un <span className="civ-accent">combo</span> que multiplica tu puntaje (×2, ×3… ×5). Un error rompe la racha y cuesta tiempo. Los casos difíciles valen más.
          </p>
          <button onClick={comenzar} className="civ-btn px-6 py-3 text-base mt-5">Comenzar ▸</button>
        </div>
      </div>
    );
  }

  // ── FIN ──
  if (estado === "fin") {
    const xp = Math.floor(score / 8); const oro = Math.floor(score / 16);
    return (
      <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-civ="extincion">
        <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
          <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Resultado</span>
        </header>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="civ-panel p-6 md:p-8 text-center">
          <div className="text-5xl mb-2">{best >= 10 ? "🏆" : best >= 5 ? "🔥" : "📚"}</div>
          <div className="civ-tag">Cascada Jurídica</div>
          <h1 className="civ-heading text-4xl md:text-5xl mt-1">{score}</h1>
          <p className="font-mono-terminal text-[11px] opacity-60 mt-1">puntos</p>
          <div className="flex justify-center gap-6 mt-4 font-mono-terminal text-[12px]">
            <div><div className="civ-accent text-lg">{aciertos}</div><div className="opacity-50 text-[10px]">aciertos</div></div>
            <div><div className="civ-accent text-lg">×{multCombo(best)}</div><div className="opacity-50 text-[10px]">mejor combo (×{best})</div></div>
            <div><div className="civ-accent text-lg">+{xp}</div><div className="opacity-50 text-[10px]">XP · 🪙 {oro}</div></div>
          </div>
          <button onClick={comenzar} className="civ-btn px-6 py-3 text-base mt-5">↻ Otra ronda</button>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING ──
  const bajo = tiempo <= 10;
  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-civ={caso?.region ?? "extincion"}>
      {/* HUD */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-mono-terminal text-[13px]">
          <span className={bajo ? "civ-twinkle" : ""} style={{ color: bajo ? "#ff5a5a" : "var(--civ-ink)" }}>⏱ {tiempo}s</span>
        </div>
        <div className="relative font-mono-terminal text-[13px]">
          <span className="civ-accent">{score}</span> pts
          {flota && (
            <span key={flota.k} className="civ-rise absolute right-0 -top-1 font-mono-terminal text-sm whitespace-nowrap" style={{ color: tierColor(combo) }}>{flota.txt}</span>
          )}
        </div>
        <div className="font-mono-terminal text-[13px]">
          {combo >= 1 ? (
            <span key={combo} className="civ-pop inline-block" style={{ color: tierColor(combo) }}>
              <span className={combo >= 6 ? "civ-fire inline-block" : "inline-block"}>🔥 {combo}</span>{mult > 1 ? <span className="ml-1 font-bold">×{mult}</span> : null}
            </span>
          ) : <span className="opacity-40">sin combo</span>}
        </div>
      </div>
      {/* barra de tiempo */}
      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full" style={{ width: `${(tiempo / DURACION) * 100}%`, background: bajo ? "#ff5a5a" : "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))", transition: "width 1s linear" }} />
      </div>

      {caso && (
        <motion.div key={`${caso.id}-${idx}-${shakeK}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`civ-panel p-4 md:p-5 ${elegida && elegida !== caso.correcta ? "civ-shake" : ""}`} data-civ={caso.region}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl shrink-0 civ-float">{caso.iconoEnemigo}</span>
            <div className="min-w-0">
              <div className="civ-tag">{caso.enemigo} · dif. {caso.dificultad}</div>
            </div>
          </div>
          <p className="font-serif-juridica text-[15px] leading-relaxed mb-1">{caso.enunciado}</p>
          <div className="civ-tag mt-2 mb-2">{caso.pregunta}</div>
          <div className="space-y-2">
            {cats.map((cat) => {
              let state: string | undefined;
              if (elegida) { if (cat.id === caso.correcta) state = "ok"; else if (cat.id === elegida) state = "bad"; else state = "dim"; }
              return (
                <button key={cat.id} onClick={() => responder(cat.id)} disabled={elegida !== null} data-state={state} className="civ-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2">
                  {elegida && cat.id === caso.correcta && <span className="shrink-0">✓</span>}
                  {elegida && cat.id === elegida && cat.id !== caso.correcta && <span className="shrink-0">✗</span>}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          {elegida && elegida !== caso.correcta && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif-juridica text-[12.5px] opacity-80 mt-3 pt-2 border-t border-white/10">
              <span className="civ-accent">{caso.articulo}.</span> {caso.explicacion}
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}
