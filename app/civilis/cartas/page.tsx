"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CARTAS_CIVIL, RAREZA_CARTA, getCarta } from "@/data/civilis/cartas";

export default function CartasPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const obtenidas = useCivilis((s) => s.cartasObtenidas);
  useEffect(() => setMounted(true), []);

  const tiene = (id: string) => mounted && obtenidas.includes(id);
  const total = CARTAS_CIVIL.length;
  const hechas = mounted ? CARTAS_CIVIL.filter((c) => obtenidas.includes(c.id)).length : 0;
  const carta = sel ? getCarta(sel) : undefined;

  return (
    <div className="px-3 md:px-6 py-4 max-w-5xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Mazo de Artículos</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">Cartas Jurídicas</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
          Cada artículo del Código que dominas se vuelve una carta. Caen al resolver casos y vencer jefes. Reúnelas todas.
        </p>
        <div className="flex items-center gap-3 max-w-md mt-3">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))" }} animate={{ width: `${(hechas / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] civ-accent">{hechas}/{total}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CARTAS_CIVIL.map((c) => {
          const unlocked = tiene(c.id);
          const rar = RAREZA_CARTA[c.rareza];
          return (
            <button
              key={c.id}
              onClick={() => { if (unlocked) { sfx.confirm?.(); setSel(c.id); } else sfx.warning?.(); }}
              onMouseEnter={() => unlocked && sfx.hover?.()}
              data-civ={c.region}
              className="relative rounded-lg p-3 text-center aspect-[3/4] flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
              style={{
                border: `2px solid ${unlocked ? rar.color : "rgba(120,120,120,0.3)"}`,
                background: unlocked
                  ? `linear-gradient(180deg, ${rar.color}1c, rgba(11,9,7,0.95) 70%)`
                  : "linear-gradient(180deg, rgba(20,20,24,0.9), rgba(8,8,10,0.95))",
                boxShadow: unlocked ? `0 0 18px ${rar.color}33` : undefined,
                cursor: unlocked ? "pointer" : "default",
              }}
            >
              {unlocked ? (
                <>
                  <div className="civ-heading text-2xl md:text-3xl" style={{ color: rar.color }}>{c.articulo.replace("Art. ", "").replace(" CC", "")}</div>
                  <div className="font-mono-terminal text-[8px] opacity-50">CC</div>
                  <div className="civ-heading text-[12px] leading-tight mt-2">{c.nombre}</div>
                  <div className="absolute top-1.5 right-1.5 font-mono-terminal text-[7px] uppercase tracking-wider px-1 py-0.5 border" style={{ color: rar.color, borderColor: `${rar.color}66` }}>{rar.label}</div>
                </>
              ) : (
                <>
                  <div className="text-3xl opacity-30">🂠</div>
                  <div className="font-mono-terminal text-[9px] opacity-40 mt-2">por obtener</div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* detalle de carta */}
      <AnimatePresence>
        {carta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(6,7,11,0.86)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ rotateY: 70, opacity: 0, scale: 0.9 }} animate={{ rotateY: 0, opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 90, damping: 13 }}
              onClick={(e) => e.stopPropagation()} data-civ={carta.region}
              className="rounded-xl p-6 max-w-sm w-full text-center" style={{ border: `2.5px solid ${RAREZA_CARTA[carta.rareza].color}`, background: `linear-gradient(180deg, ${RAREZA_CARTA[carta.rareza].color}22, rgba(11,9,7,0.97) 65%)`, boxShadow: `0 0 50px ${RAREZA_CARTA[carta.rareza].color}44` }}>
              <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: RAREZA_CARTA[carta.rareza].color }}>{RAREZA_CARTA[carta.rareza].label}</div>
              <div className="civ-heading text-5xl mt-1" style={{ color: RAREZA_CARTA[carta.rareza].color }}>{carta.articulo.replace("Art. ", "").replace(" CC", "")}</div>
              <div className="font-mono-terminal text-[10px] opacity-50">{carta.articulo}</div>
              <div className="civ-heading text-xl mt-2">{carta.nombre}</div>
              <p className="font-serif-juridica text-[14px] leading-relaxed opacity-90 mt-3">«{carta.texto}»</p>
              <button onClick={() => setSel(null)} className="civ-btn px-5 py-2 text-sm mt-5">Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
