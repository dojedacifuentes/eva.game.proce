"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { EDIFICIOS } from "@/data/procesal/edificios";
import { etapasDe } from "@/data/procesal/etapas";
import type { EdificioId } from "@/types/procesal";

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OrdenaPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<EdificioId | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [errores, setErrores] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);
  useEffect(() => setMounted(true), []);

  const correct = useMemo(() => (sel ? etapasDe(sel) : []), [sel]);
  const correctOrder = useMemo(() => correct.map((e) => e.id), [correct]);
  const byId = useMemo(() => Object.fromEntries(correct.map((e) => [e.id, e])), [correct]);
  const shuffled = useMemo(() => (sel ? seededShuffle(correctOrder, seed + correctOrder.length) : []), [sel, seed, correctOrder]);

  const done = placed.length > 0 && placed.length === correctOrder.length;
  const nextId = correctOrder[placed.length];

  useEffect(() => {
    if (done && !claimed) {
      setClaimed(true);
      premio(correctOrder.length * 4, 12);
      sfx.unlock?.();
    }
  }, [done, claimed, correctOrder.length, premio]);

  const elegir = (id: EdificioId) => {
    setSel(id); setPlaced([]); setErrores(0); setClaimed(false); setWrong(null); setSeed((s) => s + 1);
    sfx.confirm?.();
  };
  const reintentar = () => {
    setPlaced([]); setErrores(0); setClaimed(false); setWrong(null); setSeed((s) => s + 1);
    sfx.click?.();
  };

  const tap = (id: string) => {
    if (done) return;
    if (id === nextId) {
      setPlaced((p) => [...p, id]);
      sfx.confirm?.();
    } else {
      setErrores((n) => n + 1);
      setWrong(id);
      sfx.warning?.();
      setTimeout(() => setWrong((w) => (w === id ? null : w)), 450);
    }
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16" data-proc={sel ?? "ordinario"}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Reconstruye el expediente</span>
      </header>

      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Ordena el Procedimiento</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Toca las etapas en su orden correcto y reconstruye el procedimiento de memoria. Cada acierto encadena la siguiente; los errores se cuentan.</p>
      </div>

      {!sel ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {EDIFICIOS.map((e) => (
            <button key={e.id} onClick={() => elegir(e.id)} onMouseEnter={() => sfx.hover?.()} data-proc={e.id} className="proc-card p-3 text-left flex items-center gap-3 transition-transform hover:-translate-y-0.5">
              <span className="text-2xl shrink-0">{e.icono}</span>
              <div className="min-w-0">
                <div className="proc-heading text-sm leading-tight">{e.nombre}</div>
                <div className="font-mono-terminal text-[9px] opacity-55">{etapasDe(e.id).length} etapas</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 max-w-md mb-4">
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--proc-secondary), var(--proc-primary))" }} animate={{ width: `${(placed.length / correctOrder.length) * 100}%` }} />
            </div>
            <span className="font-mono-terminal text-[11px] proc-accent">{placed.length}/{correctOrder.length}</span>
            <span className="font-mono-terminal text-[10px] opacity-60">✗ {errores}</span>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-5 text-center mb-4">
              <div className="text-3xl mb-1">{errores === 0 ? "🏅" : "✅"}</div>
              <div className="proc-heading text-xl mb-1">¡Procedimiento reconstruido!</div>
              <p className="font-serif-juridica opacity-80 text-sm">{errores === 0 ? "Secuencia perfecta, sin un solo error." : `Lo lograste con ${errores} ${errores === 1 ? "error" : "errores"}.`}</p>
              <div className="font-mono-terminal text-[11px] proc-accent mt-2">+{correctOrder.length * 4} XP · 🔖 12</div>
              <div className="flex gap-2 max-w-sm mx-auto mt-4">
                <button onClick={reintentar} className="proc-btn flex-1 py-2.5 text-sm">↻ Reintentar</button>
                <button onClick={() => { setSel(null); sfx.click?.(); }} className="proc-btn flex-1 py-2.5 text-sm">Cambiar ▸</button>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* armado */}
              <div>
                <div className="proc-tag mb-2">Secuencia armada</div>
                <div className="space-y-1.5">
                  {placed.map((id, i) => (
                    <div key={id} className="proc-node" data-seen="true">
                      <span className="proc-node-dot">{i + 1}</span>
                      <span className="text-base shrink-0">{byId[id]?.icono}</span>
                      <span className="proc-heading text-[12px] leading-tight">{byId[id]?.nombre}</span>
                    </div>
                  ))}
                  {placed.length === 0 && <p className="font-serif-juridica opacity-45 text-xs italic">Aún no colocas etapas…</p>}
                </div>
              </div>
              {/* piezas */}
              <div>
                <div className="proc-tag mb-2">Etapas por colocar</div>
                <div className="space-y-1.5">
                  {shuffled.filter((id) => !placed.includes(id)).map((id) => (
                    <button
                      key={id}
                      onClick={() => tap(id)}
                      onMouseEnter={() => sfx.hover?.()}
                      className="proc-node w-full"
                      style={wrong === id ? { borderColor: "#c65b6e", background: "rgba(198,91,110,0.10)" } : undefined}
                    >
                      <span className="text-base shrink-0">{byId[id]?.icono}</span>
                      <span className="proc-heading text-[12px] leading-tight text-left">{byId[id]?.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
