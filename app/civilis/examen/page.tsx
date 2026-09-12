"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { PROFESORES } from "@/data/civilis/examen";
import ExamenOral from "@/components/civilis/ExamenOral";

export default function ExamenPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const aprobados = useCivilis((s) => s.examenesAprobados);
  useEffect(() => setMounted(true), []);

  const profesor = PROFESORES.find((p) => p.id === sel);

  if (profesor) {
    return (
      <div className="px-3 md:px-6 py-6 pb-16">
        <ExamenOral key={profesor.id} profesor={profesor} />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Examen Oral de Grado</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">La Comisión te espera</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
          Elige a tu examinador. Cada profesor interroga distinto: no es un cuestionario, es un grado. Mantén la compostura.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PROFESORES.map((p) => {
          const aprobado = mounted && aprobados.includes(p.id);
          return (
            <motion.button
              key={p.id}
              onClick={() => { setSel(p.id); sfx.confirm?.(); }}
              onMouseEnter={() => sfx.hover?.()}
              whileHover={{ y: -4 }}
              className="civ-panel p-4 text-center"
              style={{ ["--civ-primary" as any]: p.color }}
            >
              <div className="text-5xl mb-2 civ-float inline-block" style={{ filter: `drop-shadow(0 0 12px ${p.color})` }}>{p.icono}</div>
              <div className="civ-heading text-lg" style={{ color: p.color }}>{p.nombre}</div>
              <div className="font-mono-terminal text-[10px] opacity-60 mb-2">{p.titulo}</div>
              <p className="font-serif-juridica text-[12.5px] opacity-80 leading-snug">{p.estilo}</p>
              <div className="mt-3 font-mono-terminal text-[10px]">
                {aprobado ? <span style={{ color: "#5fb37a" }}>✓ Aprobado</span> : <span className="opacity-50">{p.nPreguntas} preguntas</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
