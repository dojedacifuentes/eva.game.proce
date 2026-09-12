"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CASOS_CIVIL, getCaso } from "@/data/civilis/casos";
import { REGIONES_CIVIL } from "@/data/civilis/regiones";

export default function BestiarioPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const resueltos = useCivilis((s) => s.casosResueltos);
  useEffect(() => setMounted(true), []);

  const vencido = (id: string) => mounted && resueltos.includes(id);
  const total = CASOS_CIVIL.length;
  const hechos = mounted ? CASOS_CIVIL.filter((c) => resueltos.includes(c.id)).length : 0;
  const caso = sel ? getCaso(sel) : undefined;
  const regiones = REGIONES_CIVIL.filter((r) => CASOS_CIVIL.some((c) => c.region === r.id));

  return (
    <div className="px-3 md:px-6 py-4 max-w-5xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Bestiario Jurídico</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">Bestiario</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
          Las criaturas del Reino son instituciones jurídicas. Cada enemigo vencido revela el concepto que encarnaba y su pregunta de grado.
        </p>
        <div className="flex items-center gap-3 max-w-md mt-3">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))" }} animate={{ width: `${(hechos / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] civ-accent">{hechos}/{total}</span>
        </div>
      </div>

      <div className="space-y-6">
        {regiones.map((region) => {
          const enemigos = CASOS_CIVIL.filter((c) => c.region === region.id);
          return (
            <div key={region.id} data-civ={region.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{region.icono}</span>
                <h2 className="civ-heading text-lg" style={{ color: "var(--civ-primary)" }}>{region.nombre}</h2>
                <span className="font-mono-terminal text-[9px] opacity-40">{enemigos.filter((e) => vencido(e.id)).length}/{enemigos.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {enemigos.map((e) => {
                  const ok = vencido(e.id);
                  return (
                    <button key={e.id} onClick={() => { if (ok) { sfx.confirm?.(); setSel(e.id); } else sfx.warning?.(); }} onMouseEnter={() => ok && sfx.hover?.()}
                      className="civ-card p-3 text-center" style={{ cursor: ok ? "pointer" : "default", opacity: ok ? 1 : 0.55 }}>
                      <div className="text-3xl mb-1" style={ok ? { filter: "drop-shadow(0 0 6px var(--civ-primary))" } : { filter: "grayscale(1)" }}>{ok ? e.iconoEnemigo : "❓"}</div>
                      <div className="civ-heading text-[12px] leading-tight">{ok ? e.enemigo : "???"}</div>
                      <div className="font-mono-terminal text-[8px] opacity-50 mt-0.5">{ok ? e.articulo : `dif. ${e.dificultad}`}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {caso && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(6,7,11,0.86)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} onClick={(ev) => ev.stopPropagation()} data-civ={caso.region}
              className="civ-panel p-5 md:p-6 max-w-lg w-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl civ-float" style={{ filter: "drop-shadow(0 0 8px var(--civ-primary))" }}>{caso.iconoEnemigo}</span>
                <div>
                  <div className="civ-tag">Enemigo vencido · {caso.articulo}</div>
                  <div className="civ-heading text-xl leading-tight">{caso.enemigo}</div>
                </div>
                <button onClick={() => setSel(null)} className="ml-auto opacity-40 hover:opacity-90 font-mono-terminal">✕</button>
              </div>
              <div className="civ-card p-3 mb-3">
                <p className="font-serif-juridica text-[14px] leading-relaxed opacity-90">{caso.explicacion}</p>
              </div>
              <div className="civ-card p-2.5" style={{ borderColor: "var(--civ-primary)" }}>
                <div className="civ-tag mb-1">Lo que pregunta</div>
                <p className="font-serif-juridica text-[13.5px]">{caso.pregunta}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
