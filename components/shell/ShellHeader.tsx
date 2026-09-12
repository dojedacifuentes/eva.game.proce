"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { isMuted, setMuted, startAmbient, stopAmbient, sfx } from "@/lib/audio";
import { JUEGO } from "@/lib/brand";
import EvaMark from "./EvaMark";

/**
 * Cabecera única del shell.
 *
 * Absorbe lo que antes dibujaba `HUDPersistente` en las cuatro esquinas con
 * `position:fixed` (identidad, nivel, XP, monedas, reloj, audio). Al vivir en el
 * grid deja de superponerse al contenido, que era la causa de parches como el
 * `pt-12 md:pt-0` de los layouts de expansión.
 */
export default function ShellHeader({
  eyebrow,
  title,
  back,
  compacto = false,
  extra,
}: {
  eyebrow?: string;
  title?: string;
  back?: { href: string; label: string };
  /** Oculta la ficha de jugador: para portada y creación. */
  compacto?: boolean;
  extra?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const personaje = useGame((s) => s.personaje);
  const nivel = useGame((s) => s.nivel);
  const xp = useGame((s) => s.xp);
  const monedas = useGame((s) => s.monedas);

  const [muted, setMutedState] = useState(true);
  useEffect(() => setMutedState(isMuted()), []);

  function alternarAudio() {
    const nuevo = !muted;
    setMutedState(nuevo);
    setMuted(nuevo);
    if (nuevo) stopAmbient();
    else { startAmbient("ambiente"); sfx.click?.(); }
  }

  // Hasta que el estado persistido esté leído no se afirma nada del jugador.
  const hayPartida = hydrated && !!personaje.nombre;
  const xpEnNivel = xp % 100;

  return (
    <header className="shell-header py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-4">
        {back && (
          <Link
            href={back.href}
            onClick={() => sfx.click?.()}
            className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 border border-zona-competencia/25 text-zona-competencia font-mono-terminal text-[10px] uppercase tracking-widest hover:border-zona-competencia transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">{back.label}</span>
            <span className="sr-only sm:hidden">{back.label}</span>
          </Link>
        )}

        {/* Marca: EVA + nombre del juego. Enlaza a la portada. */}
        <Link
          href="/"
          onClick={() => sfx.click?.()}
          className="shrink-0 flex items-center gap-2 group"
          aria-label={`${JUEGO.nombre} — ir a la portada`}
        >
          <EvaMark size={26} />
          <span className="hidden md:block leading-none">
            <span className="font-display-grave text-[13px] text-doc-aged tracking-widest">
              {JUEGO.partes.uno}
            </span>
            <span className="font-display-grave text-[13px] tracking-widest" style={{ color: "var(--zona-competencia)" }}>
              {JUEGO.partes.dos}
            </span>
            <span className="font-serif-juridica text-[13px] text-doc-aged">{JUEGO.partes.tres}</span>
          </span>
        </Link>

        {/* Título de la pantalla */}
        {(eyebrow || title) && (
          <div className="min-w-0 flex-1 border-l border-zona-competencia/15 pl-2 md:pl-4">
            {eyebrow && (
              <div className="font-mono-terminal text-[8px] uppercase tracking-[.25em] text-zona-competencia/80 truncate">
                {eyebrow}
              </div>
            )}
            {title && (
              <h1 className="font-display-grave text-sm md:text-lg text-doc-aged leading-tight truncate">
                {title}
              </h1>
            )}
          </div>
        )}

        {!eyebrow && !title && <div className="flex-1" />}

        {extra}

        {/* Ficha de jugador + monedas */}
        {!compacto && hayPartida && (
          <div className="shrink-0 flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-none gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display-grave text-[11px] text-doc-aged truncate max-w-[110px]">
                  {personaje.nombre}
                </span>
                <span className="font-mono-terminal text-[9px] text-zona-cautelares">Nv.{nivel}</span>
              </div>
              <div
                className="w-24 h-1 bg-bg-steel rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={xpEnNivel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Experiencia hacia el nivel ${nivel + 1}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${xpEnNivel}%`, background: "var(--zona-cautelares)" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-1 border border-zona-prueba/30">
              <span aria-hidden="true" className="text-[10px]">🪙</span>
              <span className="font-mono-terminal text-[10px] text-zona-prueba">{monedas}</span>
              <span className="sr-only">monedas</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={alternarAudio}
          aria-pressed={!muted}
          aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
          className={`shrink-0 w-9 h-9 flex items-center justify-center border transition-colors ${
            muted ? "border-doc-aged/25 text-doc-aged/40" : "border-zona-recursos/45 text-zona-recursos"
          }`}
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
        </button>
      </div>
    </header>
  );
}
