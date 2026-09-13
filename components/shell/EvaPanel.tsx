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
      className="panel-alto p-3.5 flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <EvaMark size={26} />
        <div className="leading-none">
          <h2 id="eva-titulo" className="t-etiqueta" style={{ color: EVA.color }}>
            {EVA.nombre} · Tu próximo paso
          </h2>
        </div>
      </div>

      {paso.contexto && (
        <div className="t-meta font-mono-terminal uppercase tracking-wider txt-suave">
          {paso.contexto}
        </div>
      )}

      <div className="font-display-grave txt-fuerte leading-tight t-titulo">{paso.titulo}</div>

      {/* El porqué, siempre visible. */}
      <p className="font-serif-juridica txt-normal t-cuerpo leading-snug not-italic">
        {paso.razon}
      </p>

      <Link
        href={paso.href}
        onClick={() => sfx.confirm?.()}
        className="btn-primario w-full mt-auto"
        style={{ "--acento": "var(--eva-accent)" } as React.CSSProperties}
      >
        {paso.cta}
      </Link>

      {!compacto && (
        <div className="t-micro font-mono-terminal txt-tenue leading-snug">
          Recomendación calculada con tu progreso guardado. Sin análisis externo.
        </div>
      )}
    </section>
  );
}
