"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { CODEX_CIVIL, RAREZA_CIVIL } from "@/data/civilis/codex";
import { getRegionCivil } from "@/data/civilis/regiones";
import { getGancho } from "@/data/civilis/mnemotecnia";
import type { RegionCivilId } from "@/types/civilis";

export default function MnemotecniaPage() {
  const [filtro, setFiltro] = useState<RegionCivilId | "todas">("todas");
  const [flip, setFlip] = useState<Set<string>>(new Set());
  const [memo, setMemo] = useState<Set<string>>(new Set());

  const regiones = useMemo(() => [...new Set(CODEX_CIVIL.map((e) => e.region))], []);
  const lista = filtro === "todas" ? CODEX_CIVIL : CODEX_CIVIL.filter((e) => e.region === filtro);
  const total = CODEX_CIVIL.length;

  const toggleFlip = (id: string) => {
    setFlip((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    sfx.click?.();
  };
  const toggleMemo = (id: string) => {
    setMemo((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); sfx.click?.(); }
      else { n.add(id); sfx.confirm?.(); }
      return n;
    });
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-5xl mx-auto pb-16" data-civ="biblioteca">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Estampas para recordar</span>
      </header>

      <div className="mb-4">
        <h1 className="civ-heading text-3xl md:text-5xl">Mnemotecnia</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">Cada institución, una estampa con su gancho para fijarla en la memoria. Toca una carta para ver la pregunta de grado y márcala como memorizada.</p>
        {/* progreso */}
        <div className="flex items-center gap-3 max-w-md mt-3">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))" }} animate={{ width: `${(memo.size / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] civ-accent">{memo.size}/{total} memorizadas</span>
        </div>
      </div>

      {/* filtro por región */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => { setFiltro("todas"); sfx.hover?.(); }} className="font-mono-terminal text-[10px] px-2.5 py-1 rounded border transition-all" style={{ borderColor: "var(--civ-primary)", background: filtro === "todas" ? "var(--civ-primary)" : "transparent", color: filtro === "todas" ? "#0b0e16" : "var(--civ-primary)" }}>Todas</button>
        {regiones.map((r) => {
          const reg = getRegionCivil(r);
          const on = filtro === r;
          const col = reg?.paleta.primary ?? "#d9b24c";
          return (
            <button key={r} onClick={() => { setFiltro(r); sfx.hover?.(); }} data-civ={r} className="font-mono-terminal text-[10px] px-2.5 py-1 rounded border transition-all flex items-center gap-1" style={{ borderColor: col, background: on ? col : "transparent", color: on ? "#0b0e16" : col }}>
              <span>{reg?.icono}</span><span className="hidden sm:inline">{reg?.nombre?.split(" ").slice(-1)[0]}</span>
            </button>
          );
        })}
      </div>

      {/* estampas */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((e) => {
          const gancho = getGancho(e.id) ?? e.concepto;
          const memorizada = memo.has(e.id);
          const rar = RAREZA_CIVIL[e.rareza];
          return (
            <div key={e.id} data-civ={e.region} className="civ-flip h-[232px] cursor-pointer" data-flip={flip.has(e.id)} onClick={() => toggleFlip(e.id)} onMouseEnter={() => sfx.hover?.()}>
              <div className="civ-flip-inner">
                {/* FRENTE */}
                <div className="civ-flip-face civ-card flex flex-col items-center justify-center text-center p-4 overflow-hidden" style={memorizada ? { borderColor: "#5fb37a" } : undefined}>
                  <div className="absolute inset-0 civ-shimmer opacity-25 pointer-events-none" />
                  <div className="relative mb-2" style={{ width: 66, height: 66 }}>
                    <div className="absolute inset-0 rounded-full civ-aura" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--civ-primary) 55%, transparent), transparent 70%)" }} />
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full civ-orbit" style={{ background: "var(--civ-primary)", marginLeft: -3, marginTop: -3, animationDelay: `${i * 2.3}s` }} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl civ-float">{e.icono}</div>
                  </div>
                  <div className="civ-heading text-[14px] leading-tight" style={{ color: "var(--civ-primary)" }}>{e.institucion}</div>
                  <div className="font-serif-juridica text-[11.5px] opacity-80 mt-1 leading-snug px-1">{gancho}</div>
                  <div className="civ-tag mt-2">{e.fuente}</div>
                  <span className="absolute top-2 left-2 text-[8px] font-mono-terminal px-1.5 py-0.5 rounded" style={{ color: rar.color, border: `1px solid ${rar.color}66` }}>{rar.label}</span>
                  {memorizada && <span className="absolute top-2 right-2 text-sm" style={{ color: "#5fb37a", filter: "drop-shadow(0 0 5px #5fb37a)" }}>✓</span>}
                  <span className="absolute bottom-2 right-2 text-[9px] opacity-30 font-mono-terminal">voltear ↻</span>
                </div>
                {/* DORSO */}
                <div className="civ-flip-face civ-flip-back civ-card flex flex-col p-4 overflow-hidden" style={{ borderColor: "var(--civ-primary)" }}>
                  <div className="civ-tag mb-1.5">⚖️ Pregunta de grado</div>
                  <p className="font-serif-juridica text-[12.5px] opacity-90 leading-snug flex-1">{e.preguntaGrado}</p>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); toggleMemo(e.id); }}
                    className="civ-btn py-1.5 text-[11px] mt-2"
                    style={memorizada ? { borderColor: "#5fb37a", color: "#7ed79a" } : undefined}
                  >
                    {memorizada ? "✓ Memorizada" : "Marcar memorizada"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
