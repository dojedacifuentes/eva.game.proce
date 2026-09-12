"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useReinos } from "@/store/useReinos";
import { useCivilis } from "@/store/useCivilis";
import { useProcesal } from "@/store/useProcesal";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";
import { leerProgreso } from "@/lib/eva";
import { REGIONES } from "@/data/reinos/regiones";
import { REGIONES_CIVIL } from "@/data/civilis/regiones";
import { EDIFICIOS } from "@/data/procesal/edificios";

// ============================================================================
// MUNDOS — casa de la campaña y de las tres expansiones.
//
// Los portales PortalReinos, PortalCivilis y PortalProcesal encabezaban el hub y
// empujaban el mapa fuera de la ventana. Aquí tienen pantalla propia, con sus
// rutas (/reinos, /civilis, /procesal) y sus mecánicas intactas: lo único que
// cambia es desde dónde se llega.
//
// El progreso sale del store de cada expansión, que sigue siendo independiente
// del juego base (ver la regla de aislamiento del skill del repositorio).
// ============================================================================

export default function Mundos() {
  // Los stores de expansión leen localStorage: en el servidor no hay valores.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const misionesCompletadas = useGame((s) => s.misionesCompletadas);
  const reinosCompletadas = useReinos((s) => s.regionesCompletadas);
  const reinosDesbloqueado = useReinos((s) => s.desbloqueado);
  const civilisCompletadas = useCivilis((s) => s.regionesCompletadas);
  const civilisDesbloqueado = useCivilis((s) => s.desbloqueado);
  const procesalCompletados = useProcesal((s) => s.edificiosCompletados);
  const procesalDesbloqueado = useProcesal((s) => s.desbloqueado);

  const campaña = leerProgreso(misionesCompletadas);

  const expansiones = [
    {
      href: "/reinos",
      icono: "🏰",
      nombre: "Reinos del Derecho",
      sub: "Overworld de 7 regiones · combate por respuestas",
      hechas: montado ? reinosCompletadas.length : 0,
      total: REGIONES.length,
      visitado: montado && reinosDesbloqueado,
      color: "var(--zona-cautelares)",
    },
    {
      href: "/civilis",
      icono: "📗",
      nombre: "Civilis",
      sub: "Derecho Civil · casos, flashcards y cartas",
      hechas: montado ? civilisCompletadas.length : 0,
      total: REGIONES_CIVIL.length,
      visitado: montado && civilisDesbloqueado,
      color: "var(--zona-prueba)",
    },
    {
      href: "/procesal",
      icono: "🗂️",
      nombre: "Archivos del Tiempo Procesal",
      sub: "Etapas, plazos, alzada y derecho probatorio",
      hechas: montado ? procesalCompletados.length : 0,
      total: EDIFICIOS.length,
      visitado: montado && procesalDesbloqueado,
      color: "var(--zona-recursos)",
    },
  ];

  return (
    <GameShell variant="focus" eyebrow="Contenido" title="Mundos" scrollLabel="Mundos y expansiones">
      <div className="max-w-5xl w-full mx-auto space-y-5 pb-4">
        <section aria-labelledby="t-campana">
          <h2 id="t-campana" className="font-mono-terminal text-[10px] uppercase tracking-[.25em] text-zona-competencia mb-2">
            Campaña principal
          </h2>
          <Link
            href="/juego"
            onClick={() => sfx.click?.()}
            onMouseEnter={() => sfx.hover?.()}
            className="block p-4 border transition-all hover:brightness-125"
            style={{ borderColor: "rgba(75,231,255,0.3)", background: "rgba(75,231,255,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-3xl shrink-0">🏙️</span>
              <div className="flex-1 min-w-0">
                <div className="font-display-grave text-lg text-doc-aged leading-tight">Ciudad Judicial</div>
                <div className="font-mono-terminal text-[9px] text-doc-aged/50">
                  7 actos · Acto {campaña.actoActual.numero}: {campaña.actoActual.titulo}
                </div>
              </div>
              <Contador hechas={campaña.hechas} total={campaña.total} color="var(--zona-competencia)" unidad="misiones" />
            </div>
          </Link>
        </section>

        <section aria-labelledby="t-exp">
          <h2 id="t-exp" className="font-mono-terminal text-[10px] uppercase tracking-[.25em] text-zona-recursos mb-2">
            Expansiones
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {expansiones.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => sfx.click?.()}
                onMouseEnter={() => sfx.hover?.()}
                className="flex flex-col p-3.5 border transition-all hover:brightness-125"
                style={{ borderColor: `${e.color}45`, background: `${e.color}09` }}
              >
                <div className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="text-3xl shrink-0">{e.icono}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display-grave text-sm text-doc-aged leading-tight">{e.nombre}</div>
                    <div className="font-mono-terminal text-[8px] text-doc-aged/45 leading-snug mt-0.5">{e.sub}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono-terminal text-[8px] uppercase tracking-widest" style={{ color: e.color }}>
                    {!e.visitado ? "Sin visitar" : `${e.hechas}/${e.total} regiones`}
                  </span>
                  <span aria-hidden="true" className="font-mono-terminal text-[10px]" style={{ color: e.color }}>→</span>
                </div>
                <div className="mt-1.5 h-1 bg-bg-steel rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${e.total ? (e.hechas / e.total) * 100 : 0}%`, background: e.color }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="t-zonas">
          <h2 id="t-zonas" className="font-mono-terminal text-[10px] uppercase tracking-[.25em] text-zona-prueba mb-2">
            Mundos sueltos
          </h2>
          <p className="font-mono-terminal text-[9px] text-doc-aged/40 mb-2">
            Las zonas del juego base, accesibles sin seguir el orden de la campaña.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/mundo" onClick={() => sfx.click?.()} className="btn text-[11px] px-4 py-2.5">Ver las zonas</Link>
            <Link href="/expansion" onClick={() => sfx.click?.()} className="btn text-[11px] px-4 py-2.5">Módulos de entrenamiento</Link>
            <Link href="/codex" onClick={() => sfx.click?.()} className="btn text-[11px] px-4 py-2.5">Codex</Link>
            <Link href="/examen" onClick={() => sfx.click?.()} className="btn text-[11px] px-4 py-2.5">Modo examen</Link>
          </div>
        </section>
      </div>
    </GameShell>
  );
}

function Contador({ hechas, total, color, unidad }: { hechas: number; total: number; color: string; unidad: string }) {
  return (
    <div className="shrink-0 text-right">
      <div className="font-mono-terminal text-sm" style={{ color }}>
        {hechas}<span className="text-doc-aged/30">/{total}</span>
      </div>
      <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/35">{unidad}</div>
    </div>
  );
}
