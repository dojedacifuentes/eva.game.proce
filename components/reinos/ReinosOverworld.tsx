"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { REGIONES, SENDERO, getRegion } from "@/data/reinos/regiones";
import { desafiosPorRegion } from "@/data/reinos/desafios";
import { useReinos } from "@/store/useReinos";
import type { RegionId } from "@/types/reinos";

// ============================================================================
// REINOS — Overworld v2 (mundo de estrategia/RPG: Dofus + AoE + Pokémon cyber)
// Territorios de color por bioma, ruta con flujo, anillos de progreso por nodo,
// marcador "ir aquí" y barra de vista previa estilo consola (PS/Steam).
// Todo SVG + CSS, sin assets. La región final se sella hasta vencer las 6.
// ============================================================================

const C_RING = 2 * Math.PI * 27; // circunferencia del anillo de progreso

export default function ReinosOverworld() {
  const router = useRouter();
  const completadas = useReinos((s) => s.regionesCompletadas);
  const desafiosResueltos = useReinos((s) => s.desafiosResueltos);
  const [mounted, setMounted] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [foco, setFoco] = useState<string | null>(null);
  const [viajando, setViajando] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const estaCompletada = (id: string) => mounted && completadas.includes(id as any);
  const previas = REGIONES.filter((r) => r.id !== "tribunal_supremo");
  const supremoDesbloqueado = mounted && previas.every((r) => completadas.includes(r.id));
  const bloqueada = (id: string) => id === "tribunal_supremo" && !supremoDesbloqueado;

  const progresoDe = (id: string) => {
    const d = desafiosPorRegion(id as RegionId);
    const hechos = mounted ? d.filter((x) => desafiosResueltos.includes(x.id)).length : 0;
    return { hechos, total: d.length, pct: d.length ? hechos / d.length : 0 };
  };

  // región recomendada: la primera no conquistada y no sellada
  const recomendada = REGIONES.find((r) => mounted && !estaCompletada(r.id) && !bloqueada(r.id)) ?? REGIONES[0];
  const focoId = foco ?? recomendada.id;
  const focoRegion = getRegion(focoId)!;
  const focoProg = progresoDe(focoId);
  const focoBloqueada = bloqueada(focoId);
  const focoDone = estaCompletada(focoId);

  const entrar = (id: string) => {
    if (bloqueada(id)) {
      sfx.warning?.();
      setAviso("El Tribunal Supremo permanece sellado. Vence a los 6 jefes de las regiones para abrir el último estrado.");
      return;
    }
    sfx.whoosh?.();
    setViajando(id);
    setTimeout(() => router.push(`/reinos/${id}`), 650);
  };

  return (
    <div>
      {/* ═══ LIENZO DEL MUNDO ═══ */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-doc-aged/15"
        style={{ aspectRatio: "16 / 10", minHeight: 380, background: "radial-gradient(130% 100% at 50% -10%, rgba(75,231,255,0.05), transparent 55%), linear-gradient(180deg,#070910,#0b0e16 60%,#0e1119)" }}
      >
        {/* territorios de color (biomas) */}
        {REGIONES.map((r) => (
          <div
            key={`terr-${r.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              left: `${r.x}%`, top: `${r.y}%`, width: 150, height: 150,
              background: `radial-gradient(circle, ${r.paleta.primary}2e, ${r.paleta.secondary}12 45%, transparent 72%)`,
              filter: "blur(7px)",
              opacity: bloqueada(r.id) ? 0.25 : 0.9,
            }}
          />
        ))}

        {/* rejilla cyber */}
        <div className="absolute inset-0 opacity-[0.16] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(120,200,230,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,230,0.10) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* scanlines */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)" }} />

        {/* estrellas / partículas */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={`star${i}`} className="reino-twinkle absolute rounded-full pointer-events-none" style={{
            left: `${(i * 37) % 96 + 2}%`, top: `${(i * 53) % 64 + 3}%`,
            width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
            background: i % 3 === 0 ? "rgba(75,231,255,0.7)" : "rgba(236,201,75,0.65)", animationDelay: `${(i * 0.37) % 3}s`,
          }} />
        ))}

        {/* ═══ RUTA (doble capa: base + flujo) ═══ */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* base oscura */}
          {SENDERO.map(([from, to], i) => {
            const a = getRegion(from)!; const b = getRegion(to)!;
            const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2 - 4;
            return <path key={`base${i}`} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="4.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
          })}
          {/* flujo de color */}
          {SENDERO.map(([from, to], i) => {
            const a = getRegion(from)!; const b = getRegion(to)!;
            const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2 - 4;
            const sellada = to === "tribunal_supremo" && !supremoDesbloqueado;
            return (
              <path key={`flow${i}`} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`} fill="none"
                stroke={sellada ? "rgba(130,130,150,0.4)" : `${b.paleta.primary}cc`} strokeWidth="1.6"
                strokeDasharray={sellada ? "1.5 2.5" : "3 3"} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                style={{ filter: sellada ? "none" : `drop-shadow(0 0 2px ${b.paleta.primary})` }}>
                {!sellada && <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.1s" repeatCount="indefinite" />}
              </path>
            );
          })}
        </svg>

        {/* ═══ NODOS ═══ */}
        {REGIONES.map((r, i) => {
          const done = estaCompletada(r.id);
          const locked = bloqueada(r.id);
          const { pct } = progresoDe(r.id);
          const esRecom = mounted && r.id === recomendada.id && !done;
          const ringColor = done ? "#58F5B0" : r.paleta.primary;
          const ringPct = done ? 1 : pct;
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 180 }}
              onClick={() => entrar(r.id)}
              onMouseEnter={() => { setFoco(r.id); if (!locked) sfx.hover?.(); }}
              className="reino-node absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[78px] md:w-[100px]"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
              title={r.nombre}
            >
              {/* marcador "ir aquí" */}
              {esRecom && (
                <span className="reino-bob absolute -top-5 font-mono-terminal text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(6,7,11,.9)", border: `1px solid ${r.paleta.primary}`, color: r.paleta.primary, boxShadow: `0 0 10px ${r.paleta.primary}66` }}>▶ AQUÍ</span>
              )}

              <div className="relative" style={{ width: 64, height: 64 }}>
                {/* halo pulsante */}
                {!locked && <span className="reino-pulse absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${r.paleta.primary}33, transparent 70%)` }} />}
                {/* anillo de progreso */}
                <svg viewBox="0 0 64 64" className="absolute inset-0" style={{ filter: locked ? "none" : `drop-shadow(0 0 5px ${ringColor}55)` }}>
                  <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3.5" />
                  <circle cx="32" cy="32" r="27" fill="none" stroke={locked ? "rgba(120,120,140,.5)" : ringColor} strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={C_RING} strokeDashoffset={C_RING * (1 - (locked ? 0 : ringPct))} transform="rotate(-90 32 32)"
                    style={{ transition: "stroke-dashoffset .6s ease" } as any} />
                </svg>
                {/* disco */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
                  style={{ width: 42, height: 42, background: "rgba(8,10,16,0.94)", border: `2px solid ${locked ? "rgba(120,120,140,.6)" : r.paleta.primary}`, boxShadow: locked ? "none" : `0 0 14px ${r.paleta.primary}55, inset 0 0 10px ${r.paleta.primary}22`, filter: locked ? "grayscale(1)" : "none" }}>
                  <span className="text-xl">{locked ? "🔒" : r.icono}</span>
                </span>
                {/* corona */}
                {done && <span className="absolute -top-0.5 -right-0.5 text-sm" title="Región conquistada">👑</span>}
              </div>

              {/* etiqueta */}
              <span className="mt-1 font-mono-terminal text-center leading-tight px-1.5 rounded" style={{ fontSize: 13, fontWeight: 600, color: locked ? "rgba(200,208,218,.85)" : "#F4EEDD", background: "rgba(6,7,11,.92)", letterSpacing: ".02em", textShadow: "0 1px 3px #000" }}>
                {r.orden}. {r.nombre.replace("de las ", "").replace("de la ", "").replace("de los ", "").replace("de el ", "")}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ═══ BARRA DE VISTA PREVIA (estilo consola) ═══ */}
      <div className="mt-3 reino-card p-3 flex items-center gap-3 transition-colors duration-300" data-reino={focoId}>
          <span className="text-3xl md:text-4xl shrink-0">{focoBloqueada ? "🔒" : focoRegion.icono}</span>
          <div className="flex-1 min-w-0">
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest reino-fg">
              Región {focoRegion.orden} · {focoRegion.materia}
            </div>
            <div className="font-display-grave text-base md:text-lg text-doc-aged leading-tight truncate">{focoRegion.nombre}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-bg-steel rounded-full overflow-hidden max-w-[180px]">
                <div className="h-full reino-bar rounded-full" style={{ width: `${focoDone ? 100 : Math.round(focoProg.pct * 100)}%` }} />
              </div>
              <span className="font-mono-terminal text-[9px] reino-fg shrink-0">{focoDone ? "👑 conquistada" : `${focoProg.hechos}/${focoProg.total}`}</span>
            </div>
          </div>
          <button
            onClick={() => entrar(focoId)}
            disabled={focoBloqueada}
            className="btn text-[11px] px-4 py-2.5 shrink-0 disabled:opacity-40"
            style={{ borderColor: "color-mix(in srgb, var(--reino-primary) 55%, transparent)", color: "var(--reino-primary)", background: "color-mix(in srgb, var(--reino-primary) 10%, transparent)" }}
          >
            {focoBloqueada ? "Sellado" : "Viajar ▸"}
          </button>
      </div>

      {/* Aviso de bloqueo */}
      {aviso && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 border border-doc-aged/20 font-mono-terminal text-[11px] text-doc-aged/70 flex items-center justify-between gap-3">
          <span>🔒 {aviso}</span>
          <button onClick={() => setAviso(null)} className="text-doc-aged/40 hover:text-doc-aged">✕</button>
        </motion.div>
      )}

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono-terminal text-[10px] text-doc-aged/55">
        <span>👑 conquistada</span>
        <span>⌾ anillo = avance de la región</span>
        <span>▶ recomendada</span>
        <span>◷ {mounted ? completadas.length : 0}/{REGIONES.length} regiones</span>
      </div>

      {/* ═══ TRANSICIÓN DE VIAJE (feel consola) ═══ */}
      {viajando && (() => {
        const rv = getRegion(viajando)!;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-reino={viajando}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
            style={{ background: "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--reino-primary) 24%, #06070b), #06070b 72%)" }}
          >
            <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1.12, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }} className="text-7xl reino-bob">
              {rv.icono}
            </motion.div>
            <div className="mt-5 font-display-grave text-2xl md:text-3xl text-doc-aged" style={{ textShadow: "0 2px 14px rgba(0,0,0,.85)" }}>
              Viajando a {rv.nombre}
            </div>
            <div className="mt-3 w-40 h-1 rounded-full overflow-hidden bg-bg-steel">
              <motion.div className="h-full reino-bar rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.62 }} />
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
