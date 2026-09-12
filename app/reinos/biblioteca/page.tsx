"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { ARTICULOS, articulosPorRegion, RAREZA_META, getArticulo } from "@/data/reinos/articulos";
import { REGIONES } from "@/data/reinos/regiones";
import { useReinos } from "@/store/useReinos";
import { useModalAccesible } from "@/lib/useModalAccesible";

// ============================================================================
// REINOS — Biblioteca del Litigante (coleccionables: artículos legendarios)
// ============================================================================

export default function BibliotecaPage() {
  const desbloqueados = useReinos((s) => s.articulosDesbloqueados);
  const [mounted, setMounted] = useState(false);
  // Foco atrapado, Escape y devolución del foco, conservando el arte
  // propio de este overlay (ver lib/useModalAccesible.ts).
  const cajaModal = useModalAccesible<HTMLDivElement>(() => setSel(null));
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const tiene = (id: string) => mounted && desbloqueados.includes(id);
  const total = ARTICULOS.length;
  const conseguidos = mounted ? ARTICULOS.filter((a) => desbloqueados.includes(a.id)).length : 0;
  const articuloSel = sel ? getArticulo(sel) : undefined;

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <Link href="/reinos" className="btn text-xs" onClick={() => sfx.click?.()}>◂ Overworld</Link>
        <span className="font-mono-terminal text-[9px] text-doc-aged/40 uppercase tracking-widest">BIBLIOTECA DEL LITIGANTE</span>
      </header>

      <div className="mb-6">
        <h1 className="font-display-grave text-3xl md:text-5xl text-doc-aged mb-2">Artículos Legendarios</h1>
        <p className="font-serif-juridica text-doc-aged/60 max-w-2xl leading-relaxed mb-3">
          Cada desafío y cada jefe vencido suelta un artículo del Código Civil, del CPC, del COT o de la Constitución.
          Colecciónalos todos para dominar el examen de grado.
        </p>
        <div className="flex items-center gap-3 max-w-md">
          <div className="flex-1 h-2 bg-bg-steel rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full reino-rift" animate={{ width: `${(conseguidos / total) * 100}%` }} />
          </div>
          <span className="font-mono-terminal text-[11px] reino-fg">{conseguidos}/{total}</span>
        </div>
      </div>

      {/* Colección por región */}
      <div className="space-y-8">
        {REGIONES.map((region) => {
          const arts = articulosPorRegion(region.id);
          if (arts.length === 0) return null;
          return (
            <div key={region.id} data-reino={region.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{region.icono}</span>
                <h2 className="font-display-grave text-lg reino-fg">{region.nombre}</h2>
                <span className="font-mono-terminal text-[9px] text-doc-aged/35">
                  {arts.filter((a) => tiene(a.id)).length}/{arts.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {arts.map((a, i) => {
                  const unlocked = tiene(a.id);
                  const rar = RAREZA_META[a.rareza];
                  const brilla = unlocked && (a.rareza === "epica" || a.rareza === "legendaria");
                  return (
                    <button
                      key={a.id}
                      onClick={() => { if (unlocked) { sfx.confirm?.(); setSel(a.id); } else { sfx.warning?.(); } }}
                      onMouseEnter={() => unlocked && sfx.hover?.()}
                      className={`reino-card p-3 text-left relative h-full ${brilla ? "reino-cardshine" : ""}`}
                      style={{ borderColor: unlocked ? `${rar.color}66` : undefined, boxShadow: unlocked ? `0 0 14px ${rar.color}22` : undefined, cursor: unlocked ? "pointer" : "default", ["--shine" as any]: brilla ? `${rar.color}55` : undefined, ["--shine-delay" as any]: `${(i % 4) * 0.7}s` }}
                    >
                      {unlocked ? (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{a.icono}</span>
                            <span className="font-mono-terminal text-[7px] uppercase tracking-wider px-1.5 py-0.5 border" style={{ color: rar.color, borderColor: `${rar.color}66` }}>
                              {rar.label}
                            </span>
                          </div>
                          <div className="font-display-grave text-sm text-doc-aged leading-tight">{a.etiqueta}</div>
                          <div className="font-serif-juridica text-doc-aged/55 text-xs italic mt-0.5">{a.titulo}</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 opacity-50">
                          <span className="text-2xl grayscale mb-1">🔒</span>
                          <span className="font-mono-terminal text-[9px] text-doc-aged/40">??? · {a.codigo}</span>
                          <span className="font-mono-terminal text-[7px] text-doc-aged/25 mt-1">por descubrir</span>
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

      {/* Detalle del artículo */}
      <AnimatePresence>
        {articuloSel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSel(null)}
            className="modal-scrim"
            style={{ perspective: 1100 }}
          >
            {/* halo de rareza detrás de la carta */}
            <motion.div
              ref={cajaModal} role="dialog" aria-modal="true" aria-label="Artículo legendario"
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute left-1/2 top-1/2 pointer-events-none rounded-full"
              style={{ width: 460, height: 460, marginLeft: -230, marginTop: -230, filter: "blur(72px)", background: `radial-gradient(circle, ${RAREZA_META[articuloSel.rareza].color}, transparent 70%)` }}
            />
            <motion.div
              initial={{ rotateY: 78, opacity: 0, scale: 0.9 }} animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 85, damping: 13 }}
              onClick={(e) => e.stopPropagation()}
              className="reino-card reino-parchment p-6 max-w-lg w-full relative overflow-hidden"
              data-reino={articuloSel.region}
              style={{ borderColor: `${RAREZA_META[articuloSel.rareza].color}77`, transformStyle: "preserve-3d" }}
            >
              {/* destello que barre la carta al revelarla */}
              <motion.span
                initial={{ x: "-130%" }} animate={{ x: "160%" }}
                transition={{ duration: 0.85, delay: 0.28, ease: "easeOut" }}
                className="absolute inset-y-0 w-1/3 pointer-events-none z-10"
                style={{ background: `linear-gradient(100deg, transparent, ${RAREZA_META[articuloSel.rareza].color}40, transparent)`, transform: "skewX(-18deg)" }}
              />
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{articuloSel.icono}</span>
                  <div>
                    <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: RAREZA_META[articuloSel.rareza].color }}>
                      {RAREZA_META[articuloSel.rareza].label} · {articuloSel.codigo}
                    </div>
                    <div className="font-display-grave text-2xl text-doc-aged leading-none">{articuloSel.etiqueta}</div>
                    <div className="reino-explain italic text-doc-aged/75 text-[15px]">{articuloSel.titulo}</div>
                  </div>
                </div>
                <button onClick={() => setSel(null)} className="text-doc-aged/40 hover:text-doc-aged font-mono-terminal">✕</button>
              </div>
              <div className="font-mono-terminal text-[9px] uppercase tracking-[.2em] text-doc-aged/45 mt-4 mb-1">📖 Texto del artículo</div>
              <p className="reino-explain text-doc-aged/90 text-[15px] md:text-base leading-relaxed border-l-2 pl-3 mb-3" style={{ borderColor: RAREZA_META[articuloSel.rareza].color }}>
                «{articuloSel.texto}»
              </p>
              <div className="reino-lesson p-2.5 font-mono-terminal text-[11px] reino-fg flex items-center gap-2">
                <span>✦</span><span className="text-doc-aged/80">{articuloSel.efecto}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
