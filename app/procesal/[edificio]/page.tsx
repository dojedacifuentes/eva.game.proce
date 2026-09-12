"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { getEdificio } from "@/data/procesal/edificios";
import { etapasDe } from "@/data/procesal/etapas";
import type { EdificioId, EtapaProc } from "@/types/procesal";

export default function EdificioPage(props: { params: Promise<{ edificio: string }> }) {
  const params = use(props.params);
  const edificio = getEdificio(params.edificio);
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);

  const etapasVistas = useProcesal((s) => s.etapasVistas);
  const edificiosCompletados = useProcesal((s) => s.edificiosCompletados);
  const xp = useProcesal((s) => s.xp);
  const sellos = useProcesal((s) => s.sellos);
  const verEtapa = useProcesal((s) => s.verEtapa);
  const completarEdificio = useProcesal((s) => s.completarEdificio);

  useEffect(() => setMounted(true), []);

  // Antes se recreaba en cada render, así que los `useMemo` y el `useEffect`
  // que dependen de ella se re-ejecutaban siempre: el efecto que llama a
  // `completarEdificio` corría en cada pintado.
  const etapas = useMemo(
    () => (edificio ? etapasDe(edificio.id as EdificioId) : []),
    [edificio],
  );

  // Agrupa etapas consecutivas por su "grupo" para el rail.
  const grupos = useMemo(() => {
    const out: { titulo: string; items: EtapaProc[] }[] = [];
    for (const e of etapas) {
      const g = e.grupo ?? "Etapas";
      const last = out[out.length - 1];
      if (!last || last.titulo !== g) out.push({ titulo: g, items: [e] });
      else last.items.push(e);
    }
    return out;
  }, [etapas]);

  const vistasN = mounted ? etapas.filter((e) => etapasVistas.includes(e.id)).length : 0;
  const completado = mounted && !!edificio && edificiosCompletados.includes(edificio.id);

  // Completa el edificio cuando todas sus etapas han sido estudiadas.
  useEffect(() => {
    if (!mounted || !edificio || edificio.enPrep) return;
    const allSeen = etapas.length > 0 && etapas.every((e) => etapasVistas.includes(e.id));
    if (allSeen && !edificiosCompletados.includes(edificio.id)) {
      completarEdificio(edificio.id, { xp: 40, sellos: 30 });
      sfx.unlock?.();
    }
  }, [mounted, etapasVistas, etapas, edificio, edificiosCompletados, completarEdificio]);

  if (!edificio) {
    return (
      <main className="px-4 py-10 max-w-2xl mx-auto text-center">
        <p className="proc-heading text-2xl mb-3">Edificio no encontrado</p>
        <Link href="/procesal" className="proc-btn px-4 py-2 text-sm inline-block">◂ Volver a la Ciudadela</Link>
      </main>
    );
  }

  const abrir = (id: string) => {
    setSel(id);
    verEtapa(id);
    sfx.click?.();
  };

  const etapa = etapas.find((e) => e.id === sel) ?? null;

  return (
    <main className="px-3 md:px-6 py-4 max-w-6xl mx-auto pb-16" data-proc={edificio.id}>
      {/* header */}
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <div className="flex items-center justify-end gap-2 font-mono-terminal text-[11px] flex-wrap">
          <span className="proc-card px-2 py-1">⭐ {mounted ? xp : 0} XP</span>
          <span className="proc-card px-2 py-1">🔖 {mounted ? sellos : 0}</span>
        </div>
      </header>

      {/* título */}
      <div className="mb-4">
        <div className="proc-tag">{edificio.subtitulo}</div>
        <h1 className="proc-heading text-2xl md:text-4xl flex items-center gap-2">
          <span className="proc-seal proc-float">{edificio.icono}</span> {edificio.nombre}
        </h1>
        <p className="font-serif-juridica opacity-75 text-sm md:text-[15px] max-w-3xl mt-1 leading-relaxed">{edificio.intro}</p>
      </div>

      {edificio.enPrep ? (
        <div className="proc-panel p-6 text-center">
          <div className="text-3xl mb-2 proc-float">🚧</div>
          <div className="proc-heading text-lg mb-1">Expediente en preparación</div>
          <p className="font-serif-juridica opacity-70 text-sm max-w-md mx-auto">
            Este procedimiento se está catalogando en el Archivo. Vuelve pronto: aquí encontrarás su expediente completo, etapa por etapa.
          </p>
          <Link href="/procesal" className="proc-btn px-4 py-2 text-sm inline-block mt-4">◂ Volver a la Ciudadela</Link>
        </div>
      ) : (
        <>
          {/* progreso */}
          <div className="flex items-center gap-3 max-w-md mb-4">
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--proc-secondary), var(--proc-primary))" }} animate={{ width: `${etapas.length ? (vistasN / etapas.length) * 100 : 0}%` }} />
            </div>
            <span className="font-mono-terminal text-[11px] proc-accent">{vistasN}/{etapas.length}{completado ? " ✓" : ""}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(220px,300px)_1fr]">
            {/* RAIL del expediente */}
            <div className="space-y-3">
              {grupos.map((g) => (
                <div key={g.titulo}>
                  <div className="proc-tag mb-1.5">{g.titulo}</div>
                  <div className="space-y-1.5 relative">
                    {g.items.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => abrir(e.id)}
                        onMouseEnter={() => sfx.hover?.()}
                        className="proc-node"
                        data-active={sel === e.id}
                        data-seen={mounted && etapasVistas.includes(e.id)}
                      >
                        <span className="proc-node-dot">{e.orden}</span>
                        <span className="text-base shrink-0">{e.icono}</span>
                        <span className="min-w-0">
                          <span className="block proc-heading text-[12px] leading-tight">{e.nombre}</span>
                          <span className="block font-serif-juridica text-[10.5px] opacity-55 leading-tight line-clamp-1">{e.resumen}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* DETALLE de la etapa */}
            <div>
              {etapa ? (
                <motion.div key={etapa.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-4 md:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl shrink-0">{etapa.icono}</span>
                    <div className="min-w-0">
                      <div className="proc-tag">{etapa.rol ? `Personaje · ${etapa.rol}` : `${etapa.grupo} · etapa ${etapa.orden}`}</div>
                      <h2 className="proc-heading text-xl leading-tight">{etapa.nombre}</h2>
                    </div>
                  </div>

                  <p className="font-serif-juridica text-[14.5px] leading-relaxed opacity-90 mb-3">{etapa.explicacion}</p>

                  {etapa.plazo && (
                    <div className="proc-card p-3 mb-3 flex items-start gap-2" style={{ borderColor: "color-mix(in srgb, var(--proc-primary) 55%, transparent)" }}>
                      <span className="text-lg shrink-0 proc-tick">⏱️</span>
                      <div>
                        <div className="proc-tag mb-0.5">Plazo</div>
                        <div className="font-serif-juridica text-[13.5px] leading-snug">{etapa.plazo}</div>
                      </div>
                    </div>
                  )}

                  {etapa.requisitos && etapa.requisitos.length > 0 && (
                    <Bloque titulo="Requisitos" items={etapa.requisitos} />
                  )}

                  {etapa.enumeracion && (
                    <Bloque titulo={etapa.enumeracion.titulo} items={etapa.enumeracion.items} />
                  )}

                  {etapa.efectos && etapa.efectos.length > 0 && (
                    <Bloque titulo="Efectos" items={etapa.efectos} />
                  )}

                  {etapa.preguntas && etapa.preguntas.length > 0 && (
                    <div className="mt-3">
                      <div className="proc-tag mb-1.5">⚖️ Preguntas de examen</div>
                      <ul className="space-y-1">
                        {etapa.preguntas.map((q, i) => (
                          <li key={i} className="font-serif-juridica text-[13px] opacity-80 pl-3 border-l-2" style={{ borderColor: "color-mix(in srgb, var(--proc-primary) 50%, transparent)" }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="proc-tag mt-4 pt-3 border-t border-white/10">{etapa.articulos}</div>
                </motion.div>
              ) : (
                <div className="proc-panel p-8 text-center h-full flex flex-col items-center justify-center min-h-[260px]">
                  <div className="text-3xl mb-2 proc-float">📂</div>
                  <p className="proc-heading text-base mb-1">Abre el expediente</p>
                  <p className="font-serif-juridica opacity-65 text-sm max-w-xs">Toca una etapa del camino para estudiar su explicación, plazo, artículos, efectos y preguntas de examen.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function Bloque({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div className="mt-3">
      <div className="proc-tag mb-1.5">{titulo}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="font-serif-juridica text-[13px] opacity-85 flex gap-2">
            <span className="proc-accent shrink-0">▸</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
