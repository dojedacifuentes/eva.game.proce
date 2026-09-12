"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { DECKS_CLASIFICA } from "@/data/procesal/prueba";

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

export default function ClasificaPage() {
  const [selId, setSelId] = useState<string | null>(null);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [comprobado, setComprobado] = useState(false);
  const [seed, setSeed] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const premio = useProcesal((s) => s.premio);

  const deck = DECKS_CLASIFICA.find((d) => d.id === selId) ?? null;
  const items = useMemo(() => deck?.items ?? [], [deck]);
  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const order = useMemo(() => (deck ? seededShuffle(items.map((i) => i.id), seed + items.length) : []), [deck, seed, items]);

  const pool = order.filter((id) => !assign[id]);
  const enBin = (binId: string) => order.filter((id) => assign[id] === binId);
  const allAssigned = items.length > 0 && items.every((i) => assign[i.id]);
  const correctos = items.filter((i) => assign[i.id] === i.bin).length;

  useEffect(() => {
    if (comprobado && !claimed) { setClaimed(true); premio(correctos * 5, correctos); sfx.unlock?.(); }
  }, [comprobado, claimed, correctos, premio]);

  const elegirDeck = (id: string) => { setSelId(id); setAssign({}); setPicked(null); setComprobado(false); setClaimed(false); setSeed((s) => s + 1); sfx.confirm?.(); };
  const reset = () => { setAssign({}); setPicked(null); setComprobado(false); setClaimed(false); setSeed((s) => s + 1); sfx.click?.(); };

  const tapPool = (id: string) => { if (comprobado) return; setPicked((p) => (p === id ? null : id)); sfx.hover?.(); };
  const tapBin = (binId: string) => {
    if (comprobado || !picked) return;
    setAssign((a) => ({ ...a, [picked]: binId }));
    setPicked(null);
    sfx.confirm?.();
  };
  const sacar = (id: string) => { if (comprobado) return; setAssign((a) => { const n = { ...a }; delete n[id]; return n; }); sfx.click?.(); };

  const chip = (id: string, where: "pool" | "bin") => (
    <motion.button
      key={id}
      layoutId={id}
      layout
      onClick={() => (where === "pool" ? tapPool(id) : sacar(id))}
      disabled={comprobado}
      data-sel={picked === id}
      data-ok={comprobado ? String(assign[id] === byId[id]?.bin) : undefined}
      className="proc-chip px-2.5 py-2 text-left font-serif-juridica text-[12.5px] leading-snug"
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      {comprobado && (assign[id] === byId[id]?.bin ? "✓ " : "✗ ")}
      {byId[id]?.texto}
    </motion.button>
  );

  return (
    <main className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal/prueba" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Sala de la Verdad</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Clasifica de columna a columna</span>
      </header>

      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Clasifica la Prueba</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Toca un elemento sin clasificar y luego la columna donde va. La verdad se ordena o no es nada.</p>
      </div>

      {!deck ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {DECKS_CLASIFICA.map((d) => (
            <button key={d.id} onClick={() => elegirDeck(d.id)} onMouseEnter={() => sfx.hover?.()} className="proc-card p-3 text-left transition-transform hover:-translate-y-0.5">
              <div className="proc-heading text-sm leading-tight">{d.titulo}</div>
              <div className="font-serif-juridica text-[11px] opacity-60 mt-0.5">{d.instruccion}</div>
              <div className="font-mono-terminal text-[8px] opacity-50 mt-1">{d.items.length} elementos · {d.columnas.length} columnas</div>
            </button>
          ))}
        </div>
      ) : (
        <LayoutGroup>
          {/* progreso / barra */}
          <div className="flex items-center gap-3 max-w-md mb-3">
            <div className="proc-tag shrink-0">{deck.titulo}</div>
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--proc-secondary), var(--proc-primary))" }} animate={{ width: `${(Object.keys(assign).length / items.length) * 100}%` }} />
            </div>
          </div>

          {/* POOL */}
          <div className="proc-card proc-scan p-3 mb-3 min-h-[64px]">
            <div className="proc-tag mb-2">Sin clasificar</div>
            <div className="flex flex-wrap gap-2">
              {pool.map((id) => chip(id, "pool"))}
              {pool.length === 0 && <span className="font-mono-terminal text-[10px] opacity-45">— todo clasificado —</span>}
            </div>
          </div>

          {/* COLUMNAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deck.columnas.map((col) => (
              <button key={col.id} onClick={() => tapBin(col.id)} disabled={comprobado || !picked} className="proc-bin p-3 text-left min-h-[140px] align-top" data-active={!!picked && !comprobado}>
                <div className="proc-heading text-[13px] mb-2 flex items-center gap-1.5" style={{ color: "var(--proc-primary)" }}>
                  <span>📥</span> {col.label}
                </div>
                <div className="flex flex-col gap-2">
                  {enBin(col.id).map((id) => chip(id, "bin"))}
                  {enBin(col.id).length === 0 && <span className="font-mono-terminal text-[10px] opacity-35">{picked ? "toca aquí para colocar" : "vacío"}</span>}
                </div>
              </button>
            ))}
          </div>

          {/* acciones / resultado */}
          {!comprobado ? (
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setComprobado(true); sfx.confirm?.(); }} disabled={!allAssigned} className="proc-btn flex-1 py-2.5 text-sm" style={{ opacity: allAssigned ? 1 : 0.4 }}>Comprobar ✓</button>
              <button onClick={() => setSelId(null)} className="proc-btn px-4 py-2.5 text-sm">Cambiar</button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-4 mt-4 text-center">
              <div className="text-2xl mb-1">{correctos === items.length ? "🏅" : correctos >= items.length * 0.6 ? "✅" : "📚"}</div>
              <div className="proc-heading text-lg">{correctos}/{items.length} bien clasificados</div>
              <div className="font-mono-terminal text-[11px] proc-accent mt-1 mb-3">+{correctos * 5} XP · 🔖 {correctos}</div>
              <div className="flex gap-2 max-w-sm mx-auto">
                <button onClick={reset} className="proc-btn flex-1 py-2.5 text-sm">↻ Reintentar</button>
                <button onClick={() => setSelId(null)} className="proc-btn flex-1 py-2.5 text-sm">Otro tablero ▸</button>
              </div>
            </motion.div>
          )}
        </LayoutGroup>
      )}
    </main>
  );
}
