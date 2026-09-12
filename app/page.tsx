"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import { JUEGO, PROYECTO, AUTOR } from "@/lib/brand";
import GameShell from "@/components/shell/GameShell";
import EvaMark from "@/components/shell/EvaMark";

// ============================================================================
// PORTADA — una sola acción principal.
//
// Antes había cuatro botones del mismo peso (NUEVA CAMPAÑA / CONTINUAR / NUEVO
// JUEGO / BOSSES / SISTEMAS) más cuatro accesos al pie. Ahora manda una sola
// acción, decidida por el estado real de la partida, y el resto baja de rango.
// ============================================================================

const FRASES = [
  { art: "art. 768 CPC", texto: "La forma es sustancia." },
  { art: "art. 64 CPC", texto: "Los plazos son fatales. No hay clemencia." },
  { art: "art. 152 CPC", texto: "Seis meses sin gestión útil. Abandono consumado." },
  { art: "art. 545 COT", texto: "La queja es para faltas graves. ¿Lo es?" },
  { art: "art. 254 CPC", texto: "Cinco menciones. Sin excepciones." },
  { art: "art. 76 CPR", texto: "Solo el Estado tiene jurisdicción." },
];

export default function Home() {
  const hydrated = useHydrated();
  const personaje = useGame((s) => s.personaje);
  const nivel = useGame((s) => s.nivel);
  const [fraseIdx, setFraseIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setFraseIdx((x) => (x + 1) % FRASES.length), 5000);
    return () => clearInterval(i);
  }, []);

  const hayPartida = hydrated && !!personaje.nombre;

  return (
    <GameShell variant="app" header={false} nav={false}>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center py-4">
        {/* ─── Marca que presenta ─── */}
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <EvaMark size={20} />
          <span className="font-mono-terminal text-[9px] md:text-[10px] uppercase tracking-[.35em] text-doc-aged/50">
            {PROYECTO.presenta}
          </span>
        </div>

        {/* ─── Título ─── */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display-grave leading-[0.95] text-doc-aged"
          style={{ fontSize: "clamp(2.75rem, 9vw, 6.5rem)", letterSpacing: "0.08em" }}
        >
          {JUEGO.partes.uno}
          <br />
          <span style={{ color: "var(--zona-competencia)", textShadow: "0 0 40px rgba(75,231,255,.45)" }}>
            {JUEGO.partes.dos}
          </span>
          <span className="font-serif-juridica text-doc-aged">{JUEGO.partes.tres}</span>
        </motion.h1>

        <p className="font-serif-juridica italic text-zona-prueba text-sm md:text-base mt-3 mb-6 md:mb-8 max-w-lg px-4">
          {JUEGO.subtitulo}. Hostil. Vivo. Inevitable.
        </p>

        {/* ─── ACCIÓN PRINCIPAL ÚNICA ─── */}
        <div className="w-full max-w-sm px-4">
          {!hydrated ? (
            // Estado de carga breve y estable: nunca se enseña "empezar de cero"
            // a quien tiene partida guardada.
            <div
              className="h-[62px] border border-doc-aged/10 flex items-center justify-center font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/30"
              aria-live="polite"
            >
              Abriendo expediente…
            </div>
          ) : hayPartida ? (
            <AccionPrincipal
              href="/juego"
              label="Continuar partida"
              sub={`${personaje.nombre} · Nivel ${nivel}`}
              glow="var(--zona-cautelares)"
            />
          ) : (
            <AccionPrincipal
              href="/creacion"
              label="Comenzar"
              sub="Partida rápida en menos de un minuto"
              glow="var(--zona-competencia)"
            />
          )}
        </div>

        {/* ─── Secundarias, con menos peso ─── */}
        {hydrated && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 px-4">
            {(hayPartida
              ? [
                  { href: "/creacion", label: "Nueva partida" },
                  { href: "/mundos", label: "Mundos" },
                  { href: "/codex", label: "Codex" },
                ]
              : [
                  { href: "/mundos", label: "Ver mundos" },
                  { href: "/codex", label: "Codex" },
                ]
            ).map((o) => (
              <Link
                key={o.href}
                href={o.href}
                onClick={() => sfx.click?.()}
                className="font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/45 hover:text-zona-competencia transition-colors underline-offset-4 hover:underline"
              >
                {o.label}
              </Link>
            ))}
          </div>
        )}

        {/* ─── Frase rotativa ─── */}
        <div className="mt-6 md:mt-8 max-w-md px-4 min-h-[42px]">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos/70">
            {FRASES[fraseIdx].art}
          </div>
          <div className="font-serif-juridica italic text-doc-aged/60 text-sm mt-0.5">
            «{FRASES[fraseIdx].texto}»
          </div>
        </div>
      </div>

      {/* ─── Crédito ─── */}
      <footer className="shrink-0 pb-3 text-center">
        <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em] text-doc-aged/40">
          {AUTOR.credito}
        </div>
        <div className="font-mono-terminal text-[8px] text-doc-aged/25 mt-1">{AUTOR.origen}</div>
      </footer>
    </GameShell>
  );
}

function AccionPrincipal({
  href,
  label,
  sub,
  glow,
}: {
  href: string;
  label: string;
  sub: string;
  glow: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => sfx.confirm?.()}
      onMouseEnter={() => sfx.hover?.()}
      className="group block w-full px-6 py-4 border text-center transition-all duration-300 hover:brightness-125"
      style={{
        borderColor: glow,
        background: `${glow}14`,
        boxShadow: `0 0 32px ${glow}30, inset 0 1px 0 ${glow}20`,
      }}
    >
      <div className="font-display-grave tracking-[.2em] text-base" style={{ color: glow }}>
        {label.toUpperCase()}
      </div>
      <div className="font-mono-terminal text-[9px] text-doc-aged/50 mt-1">{sub}</div>
    </Link>
  );
}
