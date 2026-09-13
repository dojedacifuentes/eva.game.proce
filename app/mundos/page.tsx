"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useGame } from "@/store/useGame";
import { useReinos } from "@/store/useReinos";
import { useCivilis } from "@/store/useCivilis";
import { useProcesal } from "@/store/useProcesal";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";
import { leerProgreso } from "@/lib/eva";
import { tituloFrase } from "@/components/MapaFlujo";
import { REGIONES } from "@/data/reinos/regiones";
import { REGIONES_CIVIL } from "@/data/civilis/regiones";
import { EDIFICIOS } from "@/data/procesal/edificios";

// ============================================================================
// MUNDOS — casa de la campaña y de las tres expansiones.
//
// v4: filas legibles con barra de progreso, sin tarjetas tintadas con alfa, y
// accesos directos en rejilla de dos columnas. Todo cabe en una pantalla de
// teléfono.
//
// El progreso sale del store de cada expansión, que sigue siendo independiente
// del juego base.
// ============================================================================

export default function Mundos() {
  // Los stores de expansión leen localStorage: en el servidor no hay valores.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const misionesCompletadas = useGame((s) => s.misionesCompletadas);
  const logros = useGame((s) => s.logros);
  const reinosCompletadas = useReinos((s) => s.regionesCompletadas);
  const reinosDesbloqueado = useReinos((s) => s.desbloqueado);
  const civilisCompletadas = useCivilis((s) => s.regionesCompletadas);
  const civilisDesbloqueado = useCivilis((s) => s.desbloqueado);
  const procesalCompletados = useProcesal((s) => s.edificiosCompletados);
  const procesalDesbloqueado = useProcesal((s) => s.desbloqueado);

  const campaña = leerProgreso(misionesCompletadas, logros.map((l) => l.id));

  const expansiones = [
    {
      href: "/reinos",
      icono: "🏰",
      nombre: "Reinos del Derecho",
      sub: "Overworld de 7 regiones · combate por respuestas",
      hechas: montado ? reinosCompletadas.length : 0,
      total: REGIONES.length,
      visitado: montado && reinosDesbloqueado,
      color: "#58F5B0",
    },
    {
      href: "/civilis",
      icono: "📗",
      nombre: "Civilis",
      sub: "Derecho Civil · casos, flashcards y cartas",
      hechas: montado ? civilisCompletadas.length : 0,
      total: REGIONES_CIVIL.length,
      visitado: montado && civilisDesbloqueado,
      color: "#D7B46A",
    },
    {
      href: "/procesal",
      icono: "🗂️",
      nombre: "Archivos del Tiempo Procesal",
      sub: "Etapas, plazos, alzada y derecho probatorio",
      hechas: montado ? procesalCompletados.length : 0,
      total: EDIFICIOS.length,
      visitado: montado && procesalDesbloqueado,
      color: "#A98CFF",
    },
  ];

  const accesos = [
    { href: "/mundo", icono: "🗺️", nombre: "Zonas vivas", sub: "Personajes y eventos", color: "#7AD4E6" },
    { href: "/expansion", icono: "🎯", nombre: "Entrenar", sub: "21 módulos", color: "#FF8A3D" },
    { href: "/codex", icono: "📚", nombre: "Codex", sub: "Artículos y cuadros", color: "#4BE7FF" },
    { href: "/examen", icono: "📋", nombre: "Modo examen", sub: "20 preguntas", color: "#FF85DC" },
  ];

  return (
    <GameShell variant="focus" eyebrow="Contenido" title="Mundos" scrollLabel="Mundos y expansiones">
      <div className="max-w-4xl w-full mx-auto pt-2 pb-4 space-y-5">
        <section aria-labelledby="t-campana">
          <h2 id="t-campana" className="rotulo mb-2" style={{ color: "#4BE7FF" }}>Campaña principal</h2>
          <Link href="/juego" onClick={() => sfx.click?.()} className="fila" style={{ "--acento": "#4BE7FF" } as CSSProperties}>
            <span className="fila-icono" aria-hidden="true">🏙️</span>
            <span className="fila-texto">
              <span className="fila-titulo">Ciudad Judicial</span>
              <span className="fila-sub">Acto {campaña.actoActual.numero}: {tituloFrase(campaña.actoActual.titulo)}</span>
              <Progreso hechas={campaña.hechas} total={campaña.total} color="#4BE7FF" unidad="misiones" />
            </span>
            <span className="fila-chevron" aria-hidden="true">›</span>
          </Link>
        </section>

        <section aria-labelledby="t-exp">
          <h2 id="t-exp" className="rotulo mb-2" style={{ color: "#A98CFF" }}>Expansiones</h2>
          <div className="grid gap-2 lg:grid-cols-3">
            {expansiones.map((e) => (
              <Link key={e.href} href={e.href} onClick={() => sfx.click?.()} className="fila" style={{ "--acento": e.color } as CSSProperties}>
                <span className="fila-icono" aria-hidden="true">{e.icono}</span>
                <span className="fila-texto">
                  <span className="fila-titulo">{e.nombre}</span>
                  <span className="fila-sub">{e.sub}</span>
                  {e.visitado ? (
                    <Progreso hechas={e.hechas} total={e.total} color={e.color} unidad="regiones" />
                  ) : (
                    <span className="fila-meta">Sin visitar</span>
                  )}
                </span>
                <span className="fila-chevron" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="t-zonas">
          <h2 id="t-zonas" className="rotulo mb-2" style={{ color: "#E3C27E" }}>Accesos directos</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {accesos.map((a) => (
              <Link key={a.href} href={a.href} onClick={() => sfx.click?.()} className="fila flex-col items-start gap-2" style={{ "--acento": a.color } as CSSProperties}>
                <span className="fila-icono" aria-hidden="true">{a.icono}</span>
                <span className="fila-texto">
                  <span className="fila-titulo">{a.nombre}</span>
                  <span className="fila-sub">{a.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </GameShell>
  );
}

function Progreso({ hechas, total, color, unidad }: { hechas: number; total: number; color: string; unidad: string }) {
  const pct = total ? (hechas / total) * 100 : 0;
  return (
    <span className="flex items-center gap-2 mt-1.5">
      <span className="medidor flex-1" style={{ height: 6 }} aria-hidden="true">
        <span style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="font-datos t-micro txt-normal shrink-0">{hechas}/{total} {unidad}</span>
    </span>
  );
}
