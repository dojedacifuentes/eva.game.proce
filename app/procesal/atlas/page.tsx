"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { CODIGOS } from "@/data/procesal/atlas";

export default function AtlasPage() {
  const [selId, setSelId] = useState<string | null>(null);
  const codigo = CODIGOS.find((c) => c.id === selId) ?? null;

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16" data-proc="ordinario" style={codigo ? ({ ["--proc-primary" as any]: codigo.color }) : undefined}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        {codigo ? (
          <button onClick={() => { setSelId(null); sfx.click?.(); }} className="proc-btn text-xs px-3 py-1.5">◂ Todos los códigos</button>
        ) : (
          <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        )}
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Geografía de los códigos</span>
      </header>

      {!codigo ? (
        <>
          <div className="mb-4">
            <h1 className="proc-heading text-3xl md:text-5xl">Atlas Jurídico</h1>
            <p className="font-serif-juridica opacity-80 text-sm md:text-[15px] mt-1 max-w-3xl leading-relaxed">
              La <span className="proc-accent">geografía</span> de los códigos: su estructura sistemática y la lógica que distribuye sus materias. A los civilistas les encanta que conozcas el mapa antes de recorrer el territorio. Extraña costumbre, pero útil.
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {CODIGOS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelId(c.id); sfx.confirm?.(); }}
                onMouseEnter={() => sfx.hover?.()}
                className="proc-card p-4 text-left flex items-center gap-3 transition-transform hover:-translate-y-0.5"
                style={{ ["--proc-primary" as any]: c.color }}
              >
                <span className="text-3xl shrink-0" style={{ filter: "drop-shadow(0 0 8px var(--proc-primary))" }}>{c.icono}</span>
                <div className="min-w-0 flex-1">
                  <div className="proc-heading text-[15px] leading-tight">{c.nombre}</div>
                  {c.autor && <div className="font-mono-terminal text-[9px] opacity-55">{c.autor}</div>}
                  <div className="font-mono-terminal text-[8px] opacity-50 uppercase tracking-widest mt-1">{c.divisiones.length} divisiones · {c.sigla}</div>
                </div>
                <span className="opacity-30 shrink-0">▸</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <motion.div key={codigo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* cabecera del código */}
          <div className="proc-panel p-4 md:p-5 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl shrink-0" style={{ filter: "drop-shadow(0 0 10px var(--proc-primary))" }}>{codigo.icono}</span>
              <div className="min-w-0">
                <div className="proc-tag">{codigo.sigla}{codigo.autor ? ` · ${codigo.autor}` : ""}</div>
                <h1 className="proc-heading text-2xl md:text-3xl leading-tight">{codigo.nombre}</h1>
              </div>
            </div>
            <p className="font-serif-juridica text-[14px] opacity-85 leading-relaxed">{codigo.resumen}</p>
          </div>

          {/* mapa: divisiones por grupo */}
          <div className="proc-tag mb-2">El mapa · {codigo.divisiones.length} divisiones</div>
          <div className="space-y-2 mb-5">
            {codigo.divisiones.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="proc-panel p-3.5">
                <div className="flex items-start gap-3">
                  <span className="proc-node-dot shrink-0 mt-0.5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="proc-heading text-[14px] leading-tight">{d.nombre}</div>
                      <span className="proc-tag shrink-0">{d.arts}</span>
                    </div>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {d.materias.map((m, j) => (
                        <li key={j} className="font-serif-juridica text-[11.5px] px-2 py-0.5 rounded" style={{ background: "color-mix(in srgb, var(--proc-primary) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--proc-primary) 30%, transparent)" }}>{m}</li>
                      ))}
                    </ul>
                    {d.nota && <p className="font-serif-juridica italic text-[12px] opacity-70 mt-2 leading-snug">{d.nota}</p>}
                    {d.relacion && (
                      d.relacion.href ? (
                        <Link href={d.relacion.href} onClick={() => sfx.click?.()} className="inline-flex items-center gap-1 mt-2 proc-tag" style={{ color: "var(--proc-accent)" }}>🔗 {d.relacion.texto} ▸</Link>
                      ) : (
                        <div className="mt-2 proc-tag" style={{ color: "var(--proc-accent)" }}>🔗 {d.relacion.texto}</div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* lógica del sistema */}
          <div className="proc-card p-4 mb-4">
            <div className="proc-tag mb-2">⚙️ Lógica del sistema</div>
            <ol className="space-y-1.5">
              {codigo.logica.map((l, i) => (
                <li key={i} className="font-serif-juridica text-[13.5px] opacity-90 flex gap-2">
                  <span className="proc-accent font-mono-terminal text-[11px] shrink-0">{i + 1}.</span>
                  <span>{l}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* respuesta de grado */}
          <div className="proc-panel p-4 md:p-5" style={{ borderColor: "var(--proc-primary)" }}>
            <div className="proc-tag mb-2">🎓 Respuesta de grado</div>
            <p className="font-serif-juridica text-[14.5px] leading-relaxed" style={{ color: "var(--proc-ink)" }}>“{codigo.respuestaGrado}”</p>
            {codigo.tip && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="proc-tag" style={{ color: "var(--proc-accent)" }}>Tip de examinador</span>
                <p className="font-serif-juridica italic text-[12.5px] opacity-75 mt-1 leading-snug">{codigo.tip}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
