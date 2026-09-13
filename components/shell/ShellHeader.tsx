"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import {
  isMuted, setMuted, stopAmbient, sfx,
  startAmbienteHipnotico, stopAmbienteHipnotico,
} from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { JUEGO } from "@/lib/brand";
import EvaMark from "./EvaMark";

/** Preferencia de audio del jugador, recordada entre sesiones. */
const CLAVE_AUDIO = "foro-invisible:audio";

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

  // Tres estados en un solo control, en vez de dos botones distintos:
  //   apagado → sólo efectos → efectos + ambiente de estudio
  // El ambiente de estudio es el colchón hipnótico de lib/audio.ts: pensado
  // para acompañar mientras se estudia, no para ambientar una escena.
  const [audio, setAudio] = useState<"apagado" | "efectos" | "estudio">("apagado");
  useEffect(() => {
    if (isMuted()) return;
    try {
      setAudio(localStorage.getItem(CLAVE_AUDIO) === "estudio" ? "estudio" : "efectos");
    } catch {
      setAudio("efectos");
    }
  }, []);

  function alternarAudio() {
    const siguiente: Record<typeof audio, typeof audio> = {
      apagado: "efectos",
      efectos: "estudio",
      estudio: "apagado",
    };
    const nuevo = siguiente[audio];
    setAudio(nuevo);
    setMuted(nuevo === "apagado");
    try { localStorage.setItem(CLAVE_AUDIO, nuevo); } catch { /* sin persistencia */ }

    if (nuevo === "apagado") {
      stopAmbienteHipnotico();
      stopAmbient();
    } else if (nuevo === "efectos") {
      stopAmbienteHipnotico();
      sfx.click?.();
    } else {
      startAmbienteHipnotico();
    }
  }

  const ESTADO_AUDIO = {
    apagado: { icono: "🔇", etiqueta: "Sonido apagado. Activar efectos", color: "border-doc-aged/35 text-doc-aged/70" },
    efectos: { icono: "🔊", etiqueta: "Efectos activos. Activar ambiente de estudio", color: "border-zona-recursos/60 text-zona-recursos" },
    estudio: { icono: "🌊", etiqueta: "Ambiente de estudio activo. Apagar el sonido", color: "border-zona-cautelares/70 text-zona-cautelares" },
  }[audio];

  // Hasta que el estado persistido esté leído no se afirma nada del jugador.
  const hayPartida = hydrated && !!personaje.nombre;
  const xpEnNivel = xp % 100;

  return (
    <header className="shell-header py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-4">
        {back && (
          <Link
            href={back.href}
            // Descendente: el oído distingue volver de avanzar.
            onClick={() => { sfx.back?.(); haptica.toque(); }}
            className="shrink-0 flex items-center gap-1.5 px-3 min-h-[44px] border border-zona-competencia/40 text-zona-competencia t-meta font-mono-terminal uppercase tracking-wider hover:bg-zona-competencia/10 hover:border-zona-competencia transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">{back.label}</span>
            <span className="sr-only sm:hidden">{back.label}</span>
          </Link>
        )}

        {/* Marca: EVA + nombre del juego. Enlaza a la portada. */}
        <Link
          href="/"
          onClick={() => { sfx.tap?.(); haptica.toque(); }}
          className="shrink-0 flex items-center gap-2 group"
          aria-label={`${JUEGO.nombre} — ir a la portada`}
        >
          <EvaMark size={30} />
          <span className="hidden md:block leading-none">
            <span className="font-display-grave t-titulo txt-fuerte tracking-widest">
              {JUEGO.partes.uno}
            </span>
            <span className="font-display-grave t-titulo tracking-widest" style={{ color: "var(--zona-competencia)" }}>
              {JUEGO.partes.dos}
            </span>
            <span className="font-serif-juridica t-titulo txt-fuerte">{JUEGO.partes.tres}</span>
          </span>
        </Link>

        {/* Título de la pantalla */}
        {(eyebrow || title) && (
          <div className="min-w-0 flex-1 border-l border-zona-competencia/15 pl-2 md:pl-4">
            {eyebrow && (
              <div className="t-etiqueta text-zona-competencia truncate">
                {eyebrow}
              </div>
            )}
            {title && (
              <h1 className="font-display-grave t-titulo md:text-[1.45rem] txt-fuerte leading-tight truncate">
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
                <span className="font-display-grave t-base txt-fuerte truncate max-w-[130px]">
                  {personaje.nombre}
                </span>
                <span className="t-meta font-mono-terminal text-zona-cautelares">Nv.{nivel}</span>
              </div>
              <div
                className="w-28 h-1.5 bg-bg-steel rounded-full overflow-hidden"
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
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zona-prueba/45 rounded">
              <span aria-hidden="true" className="text-base">🪙</span>
              <span className="t-base font-mono-terminal text-zona-prueba">{monedas}</span>
              <span className="sr-only">monedas</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={alternarAudio}
          aria-label={ESTADO_AUDIO.etiqueta}
          title={ESTADO_AUDIO.etiqueta}
          className={`shrink-0 w-11 h-11 flex items-center justify-center border rounded text-lg transition-colors ${ESTADO_AUDIO.color}`}
        >
          <span aria-hidden="true">{ESTADO_AUDIO.icono}</span>
        </button>
      </div>
    </header>
  );
}
