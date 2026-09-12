"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { MEDIOS_PRUEBA } from "@/data/procesal/prueba";

export default function CodexPruebaPage() {
  const [abierto, setAbierto] = useState<string | null>(MEDIOS_PRUEBA[0]?.id ?? null);

  return (
    <div className="px-3 md:px-6 py-4 max-w-3xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/procesal/prueba" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Sala de la Verdad</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Archivo de Medios de Prueba</span>
      </header>

      <div className="mb-4">
        <h1 className="proc-heading text-3xl md:text-4xl">Archivo de Medios</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-2xl">La estructura del Derecho Probatorio en fichas: qué es cada medio, cómo se valora y sus claves de examen. Toca una ficha para abrirla.</p>
      </div>

      <div className="space-y-2">
        {MEDIOS_PRUEBA.map((m) => {
          const open = abierto === m.id;
          return (
            <div key={m.id} className="proc-card overflow-hidden">
              <button onClick={() => { setAbierto(open ? null : m.id); sfx.click?.(); }} onMouseEnter={() => sfx.hover?.()} className="w-full p-3 flex items-center gap-3 text-left">
                <span className="text-2xl shrink-0" style={{ filter: "drop-shadow(0 0 6px var(--proc-primary))" }}>{m.icono}</span>
                <div className="min-w-0 flex-1">
                  <div className="proc-heading text-[15px] leading-tight">{m.nombre}</div>
                  {m.valoracion !== "—" && <div className="font-mono-terminal text-[9px] proc-accent uppercase tracking-wider">{m.valoracion}</div>}
                </div>
                <span className="opacity-40 shrink-0 text-sm">{open ? "▾" : "▸"}</span>
              </button>
              {open && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-3 pb-3">
                  <p className="font-serif-juridica text-[14px] leading-relaxed opacity-90 mb-2">{m.definicion}</p>
                  <ul className="space-y-1 mb-2">
                    {m.clave.map((c, i) => (
                      <li key={i} className="font-serif-juridica text-[13px] opacity-85 flex gap-2"><span className="proc-accent shrink-0">▸</span><span>{c}</span></li>
                    ))}
                  </ul>
                  <div className="proc-tag pt-2 border-t border-white/10">{m.articulos}</div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
