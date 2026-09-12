"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CODEX_CIVIL, RAREZA_CIVIL, getEntradaCodex } from "@/data/civilis/codex";
import { REGIONES_CIVIL } from "@/data/civilis/regiones";

export default function CodexCivilPage() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const desbloqueado = useCivilis((s) => s.codexDesbloqueado);
  useEffect(() => setMounted(true), []);

  const tiene = (id: string) => mounted && desbloqueado.includes(id);
  const total = CODEX_CIVIL.length;
  const hechas = mounted ? CODEX_CIVIL.filter((e) => desbloqueado.includes(e.id)).length : 0;
  const entrada = sel ? getEntradaCodex(sel) : undefined;

  const regionesConCodex = REGIONES_CIVIL.filter((r) => CODEX_CIVIL.some((e) => e.region === r.id));

  return (
    <div className="px-3 md:px-6 py-4 max-w-5xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Codex Civilis</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">Codex Civilis</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
          La enciclopedia jurídica viva del Reino. Cada institución que clasifiques correctamente se inscribe aquí, lista para el examen de grado.
        </p>
        <div className="flex items-center gap-3 max-w-md mt-3">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--civ-secondary), var(--civ-primary))" }} animate={{ width: `${(hechas / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] civ-accent">{hechas}/{total}</span>
        </div>
      </div>

      <div className="space-y-7">
        {regionesConCodex.map((region) => {
          const entradas = CODEX_CIVIL.filter((e) => e.region === region.id);
          return (
            <div key={region.id} data-civ={region.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{region.icono}</span>
                <h2 className="civ-heading text-lg" style={{ color: "var(--civ-primary)" }}>{region.nombre}</h2>
                <span className="font-mono-terminal text-[9px] opacity-40">{entradas.filter((e) => tiene(e.id)).length}/{entradas.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {entradas.map((e) => {
                  const unlocked = tiene(e.id);
                  const rar = RAREZA_CIVIL[e.rareza];
                  return (
                    <button
                      key={e.id}
                      onClick={() => { if (unlocked) { sfx.confirm?.(); setSel(e.id); } else sfx.warning?.(); }}
                      onMouseEnter={() => unlocked && sfx.hover?.()}
                      className="civ-card p-3 text-left relative h-full"
                      style={{ borderColor: unlocked ? `${rar.color}66` : undefined, cursor: unlocked ? "pointer" : "default", boxShadow: unlocked ? `0 0 14px ${rar.color}22` : undefined }}
                    >
                      {unlocked ? (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{e.icono}</span>
                            <span className="font-mono-terminal text-[7px] uppercase tracking-wider px-1.5 py-0.5 border" style={{ color: rar.color, borderColor: `${rar.color}66` }}>{rar.label}</span>
                          </div>
                          <div className="civ-heading text-sm leading-tight">{e.institucion}</div>
                          <div className="font-mono-terminal text-[9px] opacity-50 mt-0.5">{e.fuente}</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 opacity-50">
                          <span className="text-2xl grayscale mb-1">🔒</span>
                          <span className="font-mono-terminal text-[9px] opacity-50">por descubrir</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* detalle */}
      <AnimatePresence>
        {entrada && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSel(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(6,7,11,0.86)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }}
              onClick={(ev) => ev.stopPropagation()}
              data-civ={entrada.region}
              className="civ-panel p-5 md:p-6 max-w-lg w-full max-h-[88vh] overflow-y-auto"
              style={{ borderColor: `${RAREZA_CIVIL[entrada.rareza].color}77` }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{entrada.icono}</span>
                  <div>
                    <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: RAREZA_CIVIL[entrada.rareza].color }}>{RAREZA_CIVIL[entrada.rareza].label} · {entrada.fuente}</div>
                    <div className="civ-heading text-xl leading-tight">{entrada.institucion}</div>
                  </div>
                </div>
                <button onClick={() => setSel(null)} className="opacity-40 hover:opacity-90 font-mono-terminal">✕</button>
              </div>

              <p className="font-serif-juridica text-[15px] leading-relaxed opacity-90 border-l-2 pl-3 mb-3" style={{ borderColor: "var(--civ-primary)" }}>{entrada.concepto}</p>

              <CodexLista titulo="Características" items={entrada.caracteristicas} />
              <CodexLista titulo="Requisitos" items={entrada.requisitos} />
              <CodexLista titulo="Clasificaciones" items={entrada.clasificaciones} />
              <CodexLista titulo="Efectos" items={entrada.efectos} />
              <CodexLista titulo="Excepciones" items={entrada.excepciones} />

              {entrada.casoFrecuente && (
                <div className="civ-card p-2.5 mt-3 font-serif-juridica text-[12.5px] italic opacity-80">⚖ {entrada.casoFrecuente}</div>
              )}

              <div className="civ-card p-2.5 mt-3" style={{ borderColor: "var(--civ-primary)" }}>
                <div className="civ-tag mb-1">Pregunta de grado</div>
                <p className="font-serif-juridica text-[13.5px]">{entrada.preguntaGrado}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodexLista({ titulo, items }: { titulo: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-2.5">
      <div className="civ-tag mb-1">{titulo}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="font-serif-juridica text-[13px] opacity-85 flex gap-2">
            <span className="civ-accent shrink-0">▸</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
