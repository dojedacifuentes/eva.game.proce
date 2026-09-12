"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { LOGROS_CIVIL, logrosDesbloqueados } from "@/data/civilis/logros";

export default function LogrosPage() {
  const [mounted, setMounted] = useState(false);
  const estado = useCivilis();
  useEffect(() => setMounted(true), []);

  const desbloq = mounted ? logrosDesbloqueados(estado) : [];
  const total = LOGROS_CIVIL.length;
  const n = desbloq.length;

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16" data-civ="compraventa">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Salón de Trofeos</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">Logros</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">Tu camino de Litigante Novato a leyenda del Reino. Cada hito queda registrado.</p>
        <div className="flex items-center gap-3 max-w-md mt-3">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))" }} animate={{ width: `${(n / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] civ-accent">{n}/{total}</span>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {LOGROS_CIVIL.map((l) => {
          const ok = desbloq.includes(l.id);
          return (
            <div key={l.id} className="civ-card p-3 flex items-center gap-3" style={{ opacity: ok ? 1 : 0.5, borderColor: ok ? "var(--civ-primary)" : undefined }}>
              <span className="text-3xl shrink-0" style={ok ? { filter: "drop-shadow(0 0 8px var(--civ-primary))" } : { filter: "grayscale(1)" }}>{ok ? l.icono : "🔒"}</span>
              <div className="min-w-0">
                <div className="civ-heading text-sm leading-tight" style={{ color: ok ? "var(--civ-primary)" : undefined }}>{l.nombre}</div>
                <div className="font-serif-juridica text-[12px] opacity-75 leading-snug">{l.desc}</div>
              </div>
              {ok && <span className="ml-auto text-lg shrink-0" style={{ color: "#5fb37a" }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
