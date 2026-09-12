"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { NARRADOR, MEDIOS_PRUEBA, DECKS_CLASIFICA, MC_PRUEBA, VF_PRUEBA, CASOS_PRUEBA } from "@/data/procesal/prueba";

const MODOS = [
  { href: "/procesal/prueba/clasifica", icono: "🧪", nombre: "Clasifica la Prueba", desc: "Arrastra cada elemento de una columna a otra", tag: `${DECKS_CLASIFICA.length} tableros` },
  { href: "/procesal/prueba/alternativas", icono: "🎯", nombre: "Alternativas de la Verdad", desc: "Preguntas de alternativas difíciles", tag: `${MC_PRUEBA.length} preguntas` },
  { href: "/procesal/prueba/vof", icono: "⚖️", nombre: "Verdadero o Falso", desc: "Detecta el matiz que reprueba a muchos", tag: `${VF_PRUEBA.length} afirmaciones` },
  { href: "/procesal/prueba/casos", icono: "🔎", nombre: "Casos de la Verdad", desc: "Resuelve un problema probatorio paso a paso", tag: `${CASOS_PRUEBA.length} casos` },
  { href: "/procesal/prueba/codex", icono: "📚", nombre: "Archivo de Medios", desc: "Los medios de prueba y su valoración", tag: `${MEDIOS_PRUEBA.length} fichas` },
];

export default function PruebaHub() {
  const [mounted, setMounted] = useState(false);
  const [fraseIdx, setFraseIdx] = useState(0);
  const xp = useProcesal((s) => s.xp);
  const sellos = useProcesal((s) => s.sellos);
  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setFraseIdx((i) => (i + 1) % NARRADOR.frases.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-3 md:px-6 py-4 max-w-5xl mx-auto pb-16" data-proc="prueba">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <div className="flex items-center justify-end gap-2 font-mono-terminal text-[11px] flex-wrap">
          <span className="proc-card px-2 py-1">⭐ {mounted ? xp : 0} XP</span>
          <span className="proc-card px-2 py-1">🔖 {mounted ? sellos : 0}</span>
        </div>
      </header>

      {/* HERO con narrador */}
      <div className="proc-panel proc-scan p-5 md:p-6 mb-4 overflow-hidden">
        <div className="flex items-start gap-4">
          <motion.div className="text-5xl md:text-6xl shrink-0 proc-float" style={{ filter: "drop-shadow(0 0 14px var(--proc-primary))" }}>{NARRADOR.icono}</motion.div>
          <div className="min-w-0">
            <div className="proc-tag">Derecho Probatorio · Sección especial</div>
            <h1 className="proc-heading text-3xl md:text-5xl leading-none">La Sala de la Verdad</h1>
            <p className="font-serif-juridica opacity-85 text-sm md:text-[15px] mt-2 leading-relaxed max-w-3xl">“{NARRADOR.intro}”</p>
            <div className="font-mono-terminal text-[10px] opacity-55 mt-1">— {NARRADOR.nombre}</div>
          </div>
        </div>
        {/* frase rotativa humor negro */}
        <div className="mt-4 border-t border-white/10 pt-3 min-h-[36px]">
          <motion.p key={fraseIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-serif-juridica italic text-[13px] proc-accent">
            “{NARRADOR.frases[fraseIdx]}”
          </motion.p>
        </div>
      </div>

      {/* MODOS */}
      <div className="proc-tag mb-2">Pon a prueba tu prueba</div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {MODOS.map((m) => (
          <Link key={m.href} href={m.href} onClick={() => sfx.click?.()} onMouseEnter={() => sfx.hover?.()} className="proc-card p-4 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
            <span className="text-3xl shrink-0" style={{ filter: "drop-shadow(0 0 8px var(--proc-primary))" }}>{m.icono}</span>
            <div className="min-w-0 flex-1">
              <div className="proc-heading text-[15px] leading-tight">{m.nombre}</div>
              <div className="font-serif-juridica text-[12px] opacity-65 leading-snug">{m.desc}</div>
              <div className="font-mono-terminal text-[8px] opacity-50 uppercase tracking-widest mt-1">{m.tag}</div>
            </div>
            <span className="opacity-30 shrink-0">▸</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
