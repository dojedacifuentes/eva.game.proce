"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CASOS_GRADO } from "@/data/civilis/grado";
import { getRegionCivil } from "@/data/civilis/regiones";
import CasoGradoEngine from "@/components/civilis/CasoGradoEngine";
import type { CasoGrado } from "@/types/civilis";

export default function GradoPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<CasoGrado | null>(null);
  const resueltos = useCivilis((s) => s.casosGradoResueltos);
  useEffect(() => setMounted(true), []);

  const n = mounted ? CASOS_GRADO.filter((c) => resueltos.includes(c.id)).length : 0;

  return (
    <div className="px-3 md:px-6 py-4 max-w-3xl mx-auto pb-16" data-civ={sel ? sel.region : "biblioteca"}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Sala de Comisiones</span>
      </header>

      {sel ? (
        <CasoGradoEngine caso={sel} onClose={() => { setSel(null); sfx.click?.(); }} />
      ) : (
        <>
          <div className="mb-5">
            <h1 className="civ-heading text-3xl md:text-5xl">Casos de Grado</h1>
            <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
              Casos integrados como en el examen de grado: un relato de hechos y una cadena de decisiones razonadas. Defiende tu postura ante la comisión.
            </p>
            <div className="font-mono-terminal text-[11px] civ-accent mt-2">Rendidos: {n}/{CASOS_GRADO.length}</div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {CASOS_GRADO.map((c) => {
              const region = getRegionCivil(c.region);
              const ok = mounted && resueltos.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => { setSel(c); sfx.confirm?.(); }}
                  onMouseEnter={() => sfx.hover?.()}
                  data-civ={c.region}
                  className="civ-card p-3 text-left transition-transform hover:-translate-y-0.5"
                  style={ok ? { borderColor: "var(--civ-primary)" } : undefined}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl shrink-0">{region?.icono ?? "⚖️"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="civ-heading text-sm leading-tight">{c.titulo}</div>
                      <div className="font-mono-terminal text-[9px] opacity-50 uppercase tracking-wider">{region?.nombre ?? c.region} · {c.pasos.length} pasos</div>
                    </div>
                    {ok && <span className="shrink-0 text-sm" style={{ color: "#5fb37a" }}>✓</span>}
                  </div>
                  <p className="font-serif-juridica text-[12px] opacity-65 leading-snug line-clamp-2">{c.relato}</p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
