"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { EDIFICIOS, SENDERO_PROC, getEdificio } from "@/data/procesal/edificios";
import { etapasDe } from "@/data/procesal/etapas";

const HABITANTES = [
  { icono: "📋", nombre: "Secretario" },
  { icono: "🏃", nombre: "Receptor" },
  { icono: "🕯️", nombre: "Ministro de fe" },
  { icono: "📢", nombre: "Relator" },
  { icono: "👨‍⚖️", nombre: "Juez" },
];

const MODOS = [
  { href: "/procesal/expediente", icono: "🗂️", nombre: "Expediente Vivo", desc: "Resuelve la carpeta: plazo, acción, recurso, consecuencia" },
  { href: "/procesal/ordena", icono: "🪜", nombre: "Ordena el Procedimiento", desc: "Reconstruye la secuencia de memoria" },
  { href: "/procesal/plazos", icono: "⏱️", nombre: "Plazos", desc: "Asocia cada actuación con su plazo" },
  { href: "/procesal/detecte", icono: "🔍", nombre: "Detecte el Error", desc: "Caza el vicio en el expediente" },
  { href: "/procesal/alzada", icono: "🏛️", nombre: "El Tribunal de Alzada", desc: "Apelación: efectos, en cuenta/vista, casación conjunta" },
  { href: "/procesal/examen", icono: "🎓", nombre: "Examen de Grado", desc: "Comisión oral: preguntas encadenadas de procesal" },
];
const MODOS_PRONTO: { icono: string; nombre: string }[] = [];

export default function ProcesalHub() {
  const [mounted, setMounted] = useState(false);
  const xp = useProcesal((s) => s.xp);
  const sellos = useProcesal((s) => s.sellos);
  const completados = useProcesal((s) => s.edificiosCompletados);
  const etapasVistas = useProcesal((s) => s.etapasVistas);
  useEffect(() => setMounted(true), []);

  return (
    <div className="px-3 md:px-6 py-4 max-w-6xl mx-auto pb-16">
      {/* header */}
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/juego" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudad Judicial</Link>
        <div className="flex items-center justify-end gap-2 font-mono-terminal text-[11px] flex-wrap">
          <span className="proc-card px-2 py-1">⭐ {mounted ? xp : 0} XP</span>
          <span className="proc-card px-2 py-1">🔖 {mounted ? sellos : 0} sellos</span>
        </div>
      </header>

      {/* título */}
      <div className="mb-3">
        <div className="proc-tag">Expansión · Derecho Procesal Civil</div>
        <h1 className="proc-heading text-3xl md:text-5xl">Archivos del Tiempo Procesal</h1>
        <p className="font-serif-juridica opacity-75 text-sm md:text-base max-w-3xl mt-1 leading-relaxed">
          Bienvenido a la <span className="proc-accent">Ciudadela de los Expedientes</span>. Cada edificio guarda un procedimiento vivo: recórrelo etapa por etapa y domina su secuencia, sus plazos y sus efectos hasta poder reconstruirlo de memoria.
        </p>
        <p className="font-mono-terminal text-[10px] opacity-50 mt-2">▸ Entra a un edificio para abrir su expediente</p>
      </div>

      {/* ── MAPA: CIUDADELA ── */}
      <div className="proc-panel relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10", minHeight: 320, maxHeight: 560 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <defs>
            <radialGradient id="proc-map-glow" cx="50%" cy="40%" r="62%">
              <stop offset="0%" stopColor="rgba(200,162,76,0.10)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#proc-map-glow)" />
          {/* estanterías tenues al fondo */}
          <g stroke="rgba(120,140,180,0.06)" strokeWidth="0.4">
            {[12, 24, 36, 48, 60, 72, 84].map((y) => (
              <line key={y} x1="4" y1={y} x2="96" y2={y} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          {/* senderos entre edificios */}
          {SENDERO_PROC.map(([a, b], i) => {
            const ra = getEdificio(a), rb = getEdificio(b);
            if (!ra || !rb) return null;
            return (
              <line key={i} x1={ra.x} y1={ra.y} x2={rb.x} y2={rb.y} stroke="rgba(200,162,76,0.32)" strokeWidth="0.5" strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" />
            );
          })}
        </svg>

        {/* reloj de plazos gigante (decorativo) */}
        <div className="absolute" style={{ left: "50%", top: "46%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-[0.10]">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a24c" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="2" fill="#c8a24c" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={50 + Math.sin(a) * 38} y1={50 - Math.cos(a) * 38} x2={50 + Math.sin(a) * 44} y2={50 - Math.cos(a) * 44} stroke="#c8a24c" strokeWidth="1" />;
            })}
            <line x1="50" y1="50" x2="50" y2="24" stroke="#c8a24c" strokeWidth="1.5" className="proc-spin" style={{ transformOrigin: "50px 50px" }} />
          </svg>
        </div>

        {/* nodos de edificio */}
        {EDIFICIOS.map((e) => {
          const total = etapasDe(e.id).length;
          const vistas = mounted ? etapasDe(e.id).filter((x) => etapasVistas.includes(x.id)).length : 0;
          const hecho = mounted && completados.includes(e.id);
          return (
            <Link
              key={e.id}
              href={`/procesal/${e.id}`}
              onClick={() => sfx.click?.()}
              onMouseEnter={() => sfx.hover?.()}
              data-proc={e.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
              title={e.nombre}
            >
              <div
                className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-2xl md:text-3xl transition-transform group-hover:scale-110 group-active:scale-95"
                style={{
                  border: "2px solid var(--proc-primary)",
                  background: "radial-gradient(circle at 50% 32%, color-mix(in srgb, var(--proc-primary) 26%, #0b0f1a), #0b0f1a)",
                  boxShadow: "0 0 18px color-mix(in srgb, var(--proc-primary) 45%, transparent)",
                }}
              >
                {e.icono}
                {hecho && (
                  <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#5fb37a", color: "#08120b" }}>✓</span>
                )}
                {e.enPrep && <span className="absolute -bottom-1 -right-1 text-[9px]">🚧</span>}
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded text-center" style={{ background: "rgba(8,10,18,0.8)", border: "1px solid color-mix(in srgb, var(--proc-primary) 40%, transparent)", maxWidth: 108 }}>
                <div className="proc-heading t-meta leading-tight" style={{ color: "color-mix(in srgb, var(--proc-primary) 52%, #F4EEDD)" }}>{e.nombre}</div>
                {!e.enPrep && total > 0 && (
                  <div className="font-mono-terminal text-[8px] opacity-55">{vistas}/{total}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── SECCIÓN ESPECIAL: LA SALA DE LA VERDAD (Prueba) ── */}
      <Link href="/procesal/prueba" onClick={() => sfx.click?.()} onMouseEnter={() => sfx.hover?.()} data-proc="prueba" className="block proc-panel proc-scan p-4 md:p-5 mt-5 transition-transform hover:-translate-y-0.5">
        <div className="flex items-center gap-4">
          <motion.div className="text-4xl md:text-5xl shrink-0 proc-float" style={{ filter: "drop-shadow(0 0 12px var(--proc-primary))" }}>⚖️</motion.div>
          <div className="flex-1 min-w-0">
            <div className="proc-tag">Sección especial · Derecho Probatorio</div>
            <h2 className="proc-heading text-xl md:text-2xl mt-0.5">La Sala de la Verdad</h2>
            <p className="font-serif-juridica text-[13px] opacity-70 mt-0.5 leading-snug">La prueba en el proceso civil, gamificada: clasifica de columna a columna, alternativas y V/F difíciles, y el archivo de medios. Un hecho no probado es un hecho que jamás ocurrió.</p>
          </div>
          <div className="proc-btn px-4 py-2 text-sm shrink-0 self-center">Entrar ▸</div>
        </div>
      </Link>

      {/* ── SECCIÓN ESPECIAL: COMPARADOR DE PROCEDIMIENTOS ── */}
      <Link href="/procesal/comparador" onClick={() => sfx.click?.()} onMouseEnter={() => sfx.hover?.()} className="block proc-panel p-4 md:p-5 mt-3 transition-transform hover:-translate-y-0.5">
        <div className="flex items-center gap-4">
          <motion.div className="text-4xl md:text-5xl shrink-0 proc-float" style={{ filter: "drop-shadow(0 0 12px var(--proc-primary))" }}>📊</motion.div>
          <div className="flex-1 min-w-0">
            <div className="proc-tag">Sección especial · Vista comparada</div>
            <h2 className="proc-heading text-xl md:text-2xl mt-0.5">Comparador de Procedimientos</h2>
            <p className="font-serif-juridica text-[13px] opacity-70 mt-0.5 leading-snug">Ordinario, sumario, ejecutivo, ejecución incidental y apelación, lado a lado: etapas, plazos y rasgos alineados por aspecto para verlos de un vistazo.</p>
          </div>
          <div className="proc-btn px-4 py-2 text-sm shrink-0 self-center">Comparar ▸</div>
        </div>
      </Link>

      {/* ── SECCIÓN ESPECIAL: ATLAS JURÍDICO (geografía de los códigos) ── */}
      <Link href="/procesal/atlas" onClick={() => sfx.click?.()} onMouseEnter={() => sfx.hover?.()} className="block proc-panel p-4 md:p-5 mt-3 transition-transform hover:-translate-y-0.5">
        <div className="flex items-center gap-4">
          <motion.div className="text-4xl md:text-5xl shrink-0 proc-float" style={{ filter: "drop-shadow(0 0 12px var(--proc-primary))" }}>🗺️</motion.div>
          <div className="flex-1 min-w-0">
            <div className="proc-tag">Sección especial · Geografía de los códigos</div>
            <h2 className="proc-heading text-xl md:text-2xl mt-0.5">Atlas Jurídico</h2>
            <p className="font-serif-juridica text-[13px] opacity-70 mt-0.5 leading-snug">La estructura sistemática del Código Civil, el CPC, la Constitución y las leyes 18.575 y 19.880: libros, capítulos, materias y la lógica de cada uno, con respuesta de grado. Conoce el mapa antes de recorrer el territorio.</p>
          </div>
          <div className="proc-btn px-4 py-2 text-sm shrink-0 self-center">Abrir ▸</div>
        </div>
      </Link>

      {/* habitantes del archivo */}
      <div className="mt-5">
        <div className="proc-tag mb-2">Habitantes del Archivo</div>
        <div className="flex flex-wrap gap-2">
          {HABITANTES.map((h) => (
            <div key={h.nombre} className="proc-card px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-base">{h.icono}</span>
              <span className="font-mono-terminal t-meta txt-normal">{h.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* modos de juego */}
      <div className="mt-5">
        <div className="proc-tag mb-2">Modos de juego</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODOS.map((m) => (
            <Link key={m.href} href={m.href} onClick={() => sfx.click?.()} onMouseEnter={() => sfx.hover?.()} className="proc-card p-3 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
              <span className="text-2xl shrink-0">{m.icono}</span>
              <div className="min-w-0">
                <div className="proc-heading text-[13px] leading-tight">{m.nombre}</div>
                <div className="font-serif-juridica text-[11px] opacity-60 leading-snug">{m.desc}</div>
              </div>
              <span className="ml-auto opacity-30 shrink-0">▸</span>
            </Link>
          ))}
        </div>
        {MODOS_PRONTO.length > 0 && (
          <>
            <div className="proc-tag mb-2 mt-3 opacity-70">Próximamente</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODOS_PRONTO.map((m) => (
                <div key={m.nombre} className="proc-card p-2.5 flex items-center gap-2.5 opacity-55">
                  <span className="text-xl shrink-0">{m.icono}</span>
                  <div className="min-w-0">
                    <div className="proc-heading text-[12px] leading-tight">{m.nombre}</div>
                    <div className="font-mono-terminal text-[8px] opacity-70">pronto</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
