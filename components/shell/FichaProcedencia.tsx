"use client";
import type { Procedencia } from "@/types/procedencia";

/**
 * Muestra la procedencia de un contenido jurídico. Si no hay `procedencia`, NO
 * dibuja nada: la ausencia de sello es información honesta, no un hueco.
 */
export default function FichaProcedencia({ procedencia }: { procedencia?: Procedencia }) {
  if (!procedencia) return null;

  const { estado, norma, url, revisadoEl, revisadoPor, nota } = procedencia;
  const color =
    estado === "verificado" ? "var(--zona-cautelares)"
    : estado === "doctrinal" ? "var(--zona-prueba)"
    : "var(--zona-nulidad)";
  const etiqueta =
    estado === "verificado" ? "Contrastado con fuente oficial"
    : estado === "doctrinal" ? "Depende de interpretación doctrinal"
    : "Pendiente de revisión";

  return (
    <aside
      className="mt-3 p-2 border font-mono-terminal text-[9px] leading-snug"
      style={{ borderColor: `${color}40`, background: `${color}08` }}
    >
      <div className="uppercase tracking-widest" style={{ color }}>
        {etiqueta}
      </div>
      <div className="text-doc-aged/60 mt-1">
        {norma}
        {url && (
          <>
            {" · "}
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zona-competencia">
              fuente
            </a>
          </>
        )}
        {" · revisado el "}
        <time dateTime={revisadoEl}>{revisadoEl}</time>
        {revisadoPor && ` por ${revisadoPor}`}
      </div>
      {nota && <div className="text-doc-aged/45 mt-1">{nota}</div>}
    </aside>
  );
}
