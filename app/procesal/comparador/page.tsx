"use client";
import Link from "next/link";
import { useState } from "react";
import { sfx } from "@/lib/audio";
import { PROC_COLS, FILAS_COMP } from "@/data/procesal/comparador";

const BG = "#0a0e16";
const BG_ALT = "#0c111b";
const HEAD = "#0b0f1a";

export default function ComparadorPage() {
  const [ocultas, setOcultas] = useState<Set<string>>(new Set());
  const [soloPlazos, setSoloPlazos] = useState(false);
  const [filaSel, setFilaSel] = useState<string | null>(null);

  const cols = PROC_COLS.filter((c) => !ocultas.has(c.id));

  const toggleCol = (id: string) => {
    setOcultas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (PROC_COLS.length - n.size > 1) n.add(id); // deja al menos 1
      return n;
    });
    sfx.click?.();
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-6xl mx-auto pb-16" data-proc="ordinario">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Procedimientos en paralelo</span>
      </header>

      <div className="mb-3">
        <h1 className="proc-heading text-3xl md:text-4xl">Comparador de Procedimientos</h1>
        <p className="font-serif-juridica opacity-75 text-sm mt-1 max-w-3xl">Los procesos civiles lado a lado, alineados por aspecto. Cada color es un procedimiento: entrénate a reconocerlos de un vistazo. Toca una fila para resaltarla.</p>
      </div>

      {/* controles */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {PROC_COLS.map((c) => {
          const on = !ocultas.has(c.id);
          return (
            <button key={c.id} onClick={() => toggleCol(c.id)} onMouseEnter={() => sfx.hover?.()} className="font-mono-terminal text-[10px] px-2.5 py-1.5 rounded border transition-all" style={{ borderColor: c.color, color: on ? "#0a0e16" : c.color, background: on ? c.color : "transparent", opacity: on ? 1 : 0.55 }}>
              {c.icono} {c.corto}
            </button>
          );
        })}
        <button onClick={() => { setSoloPlazos((v) => !v); sfx.click?.(); }} className="font-mono-terminal text-[10px] px-2.5 py-1.5 rounded border ml-auto transition-all" style={{ borderColor: "#c8a24c", color: soloPlazos ? "#0a0e16" : "#c8a24c", background: soloPlazos ? "#c8a24c" : "transparent" }}>
          ⏱ Resaltar plazos
        </button>
      </div>

      {/* tabla comparativa */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="border-separate w-full" style={{ borderSpacing: 0, minWidth: 120 + cols.length * 170 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-20 text-left p-2.5 align-bottom" style={{ background: HEAD, top: 0, minWidth: 120, maxWidth: 150 }}>
                <span className="proc-tag">Aspecto</span>
              </th>
              {cols.map((c) => (
                <th key={c.id} className="sticky z-10 p-2.5 text-left align-bottom" style={{ background: HEAD, top: 0, borderTop: `3px solid ${c.color}`, minWidth: 160 }}>
                  <div className="text-lg leading-none mb-1">{c.icono}</div>
                  <div className="proc-heading text-[12px] leading-tight" style={{ color: c.color }}>{c.nombre}</div>
                  <div className="font-mono-terminal text-[8px] opacity-50 mt-0.5">{c.norma}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS_COMP.map((f, ri) => {
              const sel = filaSel === f.id;
              const rowBg = ri % 2 ? BG_ALT : BG;
              return (
                <tr key={f.id}>
                  <th
                    onClick={() => { setFilaSel(sel ? null : f.id); sfx.click?.(); }}
                    className="sticky left-0 z-10 text-left p-2.5 cursor-pointer align-top"
                    style={{ background: sel ? "#151a26" : rowBg, borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="proc-heading text-[11.5px] leading-tight" style={{ color: sel ? "var(--proc-accent)" : "var(--proc-ink)" }}>{f.aspecto}</span>
                  </th>
                  {cols.map((c) => {
                    const cell = f.celdas[c.id];
                    const cellBg = sel ? `color-mix(in srgb, ${c.color} 15%, ${BG})` : rowBg;
                    return (
                      <td key={c.id} className="p-2.5 align-top" style={{ background: cellBg, borderTop: "1px solid rgba(255,255,255,0.06)", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                        {cell ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="font-serif-juridica text-[12px] leading-snug" style={{ opacity: soloPlazos && !cell.plazo ? 0.28 : 0.92 }}>{cell.texto}</span>
                            {cell.plazo && (
                              <span className="font-mono-terminal text-[10px] px-1.5 py-0.5 rounded self-start" style={{ border: `1px solid ${c.color}`, color: c.color, background: `color-mix(in srgb, ${c.color} 12%, transparent)`, boxShadow: soloPlazos ? `0 0 10px color-mix(in srgb, ${c.color} 50%, transparent)` : "none", fontWeight: soloPlazos ? 700 : 400 }}>
                                ⏱ {cell.plazo}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono-terminal text-[11px] opacity-25">— no aplica</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="font-mono-terminal text-[10px] opacity-45 mt-3">▸ {cols.length} de {PROC_COLS.length} procedimientos visibles · toca una fila para alinearla · «Resaltar plazos» compara los términos de un vistazo.</p>

      {/* lectura por columnas: rasgo distintivo destacado */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-5">
        {cols.map((c) => (
          <div key={c.id} className="proc-card p-3" style={{ borderColor: `color-mix(in srgb, ${c.color} 50%, transparent)` }}>
            <div className="proc-heading text-[13px] mb-1 flex items-center gap-1.5" style={{ color: c.color }}><span>{c.icono}</span> {c.nombre}</div>
            <p className="font-serif-juridica text-[12px] opacity-80 leading-snug">{FILAS_COMP.find((f) => f.id === "distintivo")?.celdas[c.id]?.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
