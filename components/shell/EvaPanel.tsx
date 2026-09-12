"use client";
import Link from "next/link";
import { sfx } from "@/lib/audio";
import { EVA } from "@/lib/brand";
import type { PasoEva } from "@/lib/eva";
import EvaMark from "./EvaMark";

/**
 * Panel de EVA. Muestra una recomendación y —siempre— por qué la hace.
 *
 * La `razon` viene calculada por `lib/eva.ts` a partir del progreso real. Se
 * enseña junto al consejo a propósito: EVA no debe parecer que sabe más de lo
 * que sabe.
 */
export default function EvaPanel({
  paso,
  compacto = false,
}: {
  paso: PasoEva;
  compacto?: boolean;
}) {
  return (
    <section
      aria-labelledby="eva-titulo"
      className="rounded-lg border p-3 flex flex-col gap-2"
      style={{
        borderColor: "rgba(122,212,230,0.28)",
        background: "linear-gradient(160deg, rgba(122,212,230,0.07), rgba(8,10,17,0.85) 65%)",
      }}
    >
      <div className="flex items-center gap-2">
        <EvaMark size={22} />
        <div className="leading-none">
          <h2 id="eva-titulo" className="font-mono-terminal text-[9px] uppercase tracking-[.25em]" style={{ color: EVA.color }}>
            {EVA.nombre} · Tu próximo paso
          </h2>
        </div>
      </div>

      {paso.contexto && (
        <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/40">
          {paso.contexto}
        </div>
      )}

      <div className="font-display-grave text-doc-aged leading-tight text-[15px]">{paso.titulo}</div>

      {/* El porqué, siempre visible. */}
      <p className="font-serif-juridica text-doc-aged/70 text-xs leading-snug not-italic">
        {paso.razon}
      </p>

      <Link
        href={paso.href}
        onClick={() => sfx.click?.()}
        onMouseEnter={() => sfx.hover?.()}
        className="mt-auto block text-center font-display-grave text-[13px] py-2.5 border transition-all hover:brightness-125"
        style={{
          borderColor: "var(--eva-accent)",
          color: "var(--eva-accent)",
          background: "rgba(122,212,230,0.1)",
        }}
      >
        {paso.cta}
      </Link>

      {!compacto && (
        <div className="font-mono-terminal text-[8px] text-doc-aged/30 leading-snug">
          Recomendación calculada con tu progreso guardado. Sin análisis externo.
        </div>
      )}
    </section>
  );
}
