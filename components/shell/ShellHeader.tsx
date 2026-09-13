"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import {
  isMuted, setMuted, stopAmbient, sfx,
  startAmbienteHipnotico, stopAmbienteHipnotico,
} from "@/lib/audio";
import { JUEGO } from "@/lib/brand";
import EvaMark from "./EvaMark";

/** Preferencia de audio del jugador, recordada entre sesiones. */
const CLAVE_AUDIO = "foro-invisible:audio";

/**
 * Destino del botón de volver: una ruta, o una acción dentro de la misma
 * pantalla (volver del combate a la lista de jefes, del módulo al menú).
 */
export type Volver =
  | { href: string; label: string }
  | { onClick: () => void; label: string };

/**
 * Cabecera única del shell. Una sola fila de 56 px en el teléfono: volver,
 * título, ficha del jugador y sonido. Sin textos cortados a media palabra
 * con espaciado de versalitas.
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
  back?: Volver;
  /** Oculta la ficha de jugador: para portada y creación. */
  compacto?: boolean;
  extra?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const personaje = useGame((s) => s.personaje);
  const nivel = useGame((s) => s.nivel);
  const xp = useGame((s) => s.xp);
  const monedas = useGame((s) => s.monedas);

  // Tres estados en un solo control:
  //   apagado → sólo efectos → efectos + ambiente de estudio
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
    apagado: { icono: "🔇", etiqueta: "Sonido apagado. Activar efectos" },
    efectos: { icono: "🔊", etiqueta: "Efectos activos. Activar ambiente de estudio" },
    estudio: { icono: "🌊", etiqueta: "Ambiente de estudio activo. Apagar el sonido" },
  }[audio];

  // Hasta que el estado persistido esté leído no se afirma nada del jugador.
  const hayPartida = hydrated && !!personaje.nombre;
  const xpEnNivel = xp % 100;

  return (
    <header className="shell-header">
      <div className="cabecera">
        {back && ("href" in back ? (
          <Link
            href={back.href}
            onClick={() => sfx.click?.()}
            className="cabecera-boton"
            aria-label={`Volver: ${back.label}`}
          >
            <span aria-hidden="true">←</span>
            <span className="hidden md:inline">{back.label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => { sfx.click?.(); back.onClick(); }}
            className="cabecera-boton"
            aria-label={`Volver: ${back.label}`}
          >
            <span aria-hidden="true">←</span>
            <span className="hidden md:inline">{back.label}</span>
          </button>
        ))}

        {/* Marca: en el teléfono cede su sitio al título si hay botón de volver. */}
        <Link
          href="/"
          onClick={() => sfx.click?.()}
          className={`shrink-0 items-center gap-2 ${back ? "hidden md:flex" : "flex"}`}
          aria-label={`${JUEGO.nombre} — ir a la portada`}
        >
          <EvaMark size={30} />
          <span className="hidden xl:block leading-none font-display-grave t-titulo txt-fuerte">
            {JUEGO.partes.uno}
            <span style={{ color: "var(--zona-competencia)" }}>{JUEGO.partes.dos}</span>
            <span className="font-serif-juridica">{JUEGO.partes.tres}</span>
          </span>
        </Link>

        {(eyebrow || title) ? (
          <div className="cabecera-titulo">
            {eyebrow && <div className="cabecera-eyebrow">{eyebrow}</div>}
            {title && <h1 className="cabecera-h1">{title}</h1>}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {extra}

        {!compacto && hayPartida && (
          <Link
            href="/inventario"
            onClick={() => sfx.click?.()}
            className="cabecera-ficha"
            aria-label={`${personaje.nombre}, nivel ${nivel}, ${monedas} monedas. Abrir perfil`}
          >
            <span className="hidden lg:flex flex-col items-end gap-1 leading-none">
              <span className="truncate max-w-[9rem]">{personaje.nombre}</span>
              <span className="medidor w-24" style={{ height: 5 }} aria-hidden="true">
                <span style={{ width: `${xpEnNivel}%`, background: "var(--zona-cautelares)" }} />
              </span>
            </span>
            <span className="nivel">Nv {nivel}</span>
            <span className="monedas hidden min-[430px]:inline"><span aria-hidden="true">🪙</span> {monedas}</span>
          </Link>
        )}

        <button
          type="button"
          onClick={alternarAudio}
          aria-label={ESTADO_AUDIO.etiqueta}
          title={ESTADO_AUDIO.etiqueta}
          className="cabecera-boton text-lg"
        >
          <span aria-hidden="true">{ESTADO_AUDIO.icono}</span>
        </button>
      </div>
    </header>
  );
}
