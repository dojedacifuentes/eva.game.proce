"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import { JUEGO, PROYECTO, AUTOR } from "@/lib/brand";
import GameShell from "@/components/shell/GameShell";
import EvaMark from "@/components/shell/EvaMark";

// ============================================================================
// PORTADA — una sola acción principal, decidida por el estado real de la
// partida. v4: textos a tamaño de lectura (antes 8-10 px), accesos secundarios
// con objetivo táctil real y el plano de la ciudad de fondo.
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
        <div className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full" style={{ background: "#0B0F17", border: "1px solid #1F2A3C" }}>
          <EvaMark size={22} />
          <span className="rotulo txt-normal">{PROYECTO.presenta}</span>
        </div>

        {/* ─── Título ─── */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display-grave leading-[0.95] txt-fuerte"
          style={{ fontSize: "clamp(2.9rem, 11vw, 6.5rem)", letterSpacing: "0.06em", textShadow: "0 4px 30px #000" }}
        >
          {JUEGO.partes.uno}
          <br />
          <span style={{ color: "var(--zona-competencia)" }}>{JUEGO.partes.dos}</span>
          <span className="font-serif-juridica">{JUEGO.partes.tres}</span>
        </motion.h1>

        <p className="text-[16px] md:text-[18px] font-medium mt-3 mb-7 max-w-lg px-4" style={{ color: "#E3C27E" }}>
          {JUEGO.subtitulo}. Hostil. Vivo. Inevitable.
        </p>

        {/* ─── ACCIÓN PRINCIPAL ÚNICA ─── */}
        <div className="w-full max-w-sm px-4">
          {!hydrated ? (
            <div className="h-[64px] rounded-xl flex items-center justify-center rotulo" style={{ border: "1px solid #1F2A3C" }} aria-live="polite">
              Abriendo expediente…
            </div>
          ) : hayPartida ? (
            <AccionPrincipal href="/juego" label="Continuar partida" sub={`${personaje.nombre} · Nivel ${nivel}`} color="#58F5B0" />
          ) : (
            <AccionPrincipal href="/creacion" label="Comenzar" sub="Partida rápida en menos de un minuto" color="#4BE7FF" />
          )}
        </div>

        {/* ─── Secundarias, con menos peso pero tocables ─── */}
        {hydrated && (
          <nav className="flex flex-wrap items-center justify-center gap-2 mt-4 px-4" aria-label="Accesos">
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
              <Link key={o.href} href={o.href} onClick={() => sfx.click?.()} className="btn-secundario" style={{ minHeight: 44, fontSize: 15, padding: ".4rem 1rem" }}>
                {o.label}
              </Link>
            ))}
          </nav>
        )}

        {/* ─── Frase rotativa ─── */}
        <div className="mt-7 max-w-md px-4 min-h-[58px]" aria-live="off">
          <div className="rotulo" style={{ color: "#B39BFF" }}>{FRASES[fraseIdx].art}</div>
          <div className="cita text-[19px] mt-1">«{FRASES[fraseIdx].texto}»</div>
        </div>
      </div>

      {/* ─── Crédito ─── */}
      <footer className="shrink-0 pb-3 pt-2 text-center">
        <div className="t-meta font-semibold txt-normal">{AUTOR.credito}</div>
        <div className="t-micro txt-suave mt-0.5 px-4">{AUTOR.origen}</div>
      </footer>
    </GameShell>
  );
}

function AccionPrincipal({ href, label, sub, color }: { href: string; label: string; sub: string; color: string }) {
  return (
    <Link
      href={href}
      onClick={() => sfx.confirm?.()}
      className="btn-primario w-full flex-col"
      style={{ "--acento": color, minHeight: 66, boxShadow: `0 0 40px -8px ${color}` } as CSSProperties}
    >
      <span className="text-[19px] font-extrabold tracking-wide">{label.toUpperCase()}</span>
      <span className="text-[14px] font-semibold opacity-80">{sub}</span>
    </Link>
  );
}
