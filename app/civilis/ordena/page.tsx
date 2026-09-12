"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { SECUENCIAS_CIVIL, getSecuencia } from "@/data/civilis/secuencias";
import { getRegionCivil } from "@/data/civilis/regiones";
import OrdenaSecuencia from "@/components/civilis/OrdenaSecuencia";

export default function OrdenaPage() {
  const [sel, setSel] = useState<string | null>(null);
  const secuencia = sel ? getSecuencia(sel) : undefined;

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Ordena la secuencia</span>
      </header>

      {secuencia ? (
        <OrdenaSecuencia key={secuencia.id} secuencia={secuencia} onSalir={() => { setSel(null); sfx.click?.(); }} />
      ) : (
        <>
          <div className="mb-4">
            <h1 className="civ-heading text-3xl md:text-5xl">Ordena la secuencia</h1>
            <p className="font-serif-juridica opacity-70 text-sm mt-1">Reconstruye el orden correcto de cada institución: requisitos, etapas y métodos.</p>
          </div>
          <div className="space-y-2">
            {SECUENCIAS_CIVIL.map((s) => {
              const region = getRegionCivil(s.region);
              return (
                <motion.button key={s.id} onClick={() => { setSel(s.id); sfx.confirm?.(); }} onMouseEnter={() => sfx.hover?.()} whileHover={{ x: 3 }}
                  className="civ-card w-full p-3 flex items-center gap-3 text-left">
                  <span className="text-2xl shrink-0">{region?.icono}</span>
                  <div className="min-w-0">
                    <div className="civ-heading text-sm leading-tight">{s.titulo}</div>
                    <div className="font-mono-terminal text-[10px] opacity-55">{s.articulo} · {s.items.length} pasos</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
