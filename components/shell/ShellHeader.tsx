"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { isMuted, sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { rachaVigente } from "@/lib/racha";
import { JUEGO } from "@/lib/brand";
import EvaMark from "./EvaMark";
import Icono from "@/components/game/Icono";
import PanelAudio, { type ModoAudio } from "./PanelAudio";

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
  const rachaDias = useGame((s) => s.rachaDias);
  const mejorRacha = useGame((s) => s.mejorRacha);
  const ultimoDiaJugado = useGame((s) => s.ultimoDiaJugado);
  const actividadesHoy = useGame((s) => s.actividadesHoy);

  // El modo de sonido se elige en un panel, no ciclando un botón: ciclar obliga
  // a pulsar hasta acertar y nunca dice qué opciones existen.
  const [audio, setAudio] = useState<ModoAudio>("apagado");
  const [panelAudio, setPanelAudio] = useState(false);
  useEffect(() => {
    if (isMuted()) return;
    try {
      setAudio(localStorage.getItem(CLAVE_AUDIO) === "estudio" ? "estudio" : "efectos");
    } catch {
      setAudio("efectos");
    }
  }, []);

  function elegirModo(m: ModoAudio) {
    setAudio(m);
    try { localStorage.setItem(CLAVE_AUDIO, m); } catch { /* sin persistencia */ }
  }

  const ESTADO_AUDIO = {
    apagado: { icono: "silencio" as const, etiqueta: "Sonido apagado. Abrir ajustes de sonido" },
    efectos: { icono: "altavoz" as const, etiqueta: "Efectos activos. Abrir ajustes de sonido" },
    estudio: { icono: "onda" as const, etiqueta: "Ambiente de estudio activo. Abrir ajustes de sonido" },
  }[audio];

  // Hasta que el estado persistido esté leído no se afirma nada del jugador.
  const hayPartida = hydrated && !!personaje.nombre;
  const xpEnNivel = xp % 100;
  // Mirar la racha no la reescribe: sólo se actualiza cuando el jugador estudia.
  const racha = hydrated ? rachaVigente({ rachaDias, mejorRacha, ultimoDiaJugado, actividadesHoy }) : 0;

  return (
    <header className="shell-header">
      <div className="cabecera">
        {back && ("href" in back ? (
          <Link
            href={back.href}
            // Descendente: el oído distingue volver de avanzar.
            onClick={() => { sfx.back?.(); haptica.toque(); }}
            className="cabecera-boton"
            aria-label={`Volver: ${back.label}`}
          >
            <span aria-hidden="true">←</span>
            <span className="hidden md:inline">{back.label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => { sfx.back?.(); haptica.toque(); back.onClick(); }}
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
          onClick={() => { sfx.tap?.(); haptica.toque(); }}
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
            <span className="monedas hidden min-[430px]:inline"><Icono nombre="moneda" tam={15} /> {monedas}</span>
          </Link>
        )}

        {/* Racha: sólo aparece cuando hay algo que celebrar. Un «0 días» a la
            vista desanima más de lo que motiva. */}
        {!compacto && hayPartida && racha > 0 && (
          <span
            className="cabecera-racha"
            title={`${racha} ${racha === 1 ? "día seguido" : "días seguidos"} estudiando · mejor marca: ${mejorRacha}`}
          >
            <Icono nombre="racha" tam={17} />
            <span>{racha}</span>
            <span className="sr-only">
              {racha === 1 ? "día seguido" : "días seguidos"} estudiando. Mejor marca: {mejorRacha}.
            </span>
          </span>
        )}

        <button
          type="button"
          onClick={() => { sfx.tap?.(); setPanelAudio(true); }}
          aria-label={ESTADO_AUDIO.etiqueta}
          aria-haspopup="dialog"
          title={ESTADO_AUDIO.etiqueta}
          className="cabecera-boton text-lg"
        >
          <Icono nombre={ESTADO_AUDIO.icono} tam={20} />
        </button>
      </div>

      {/* Montaje condicional del padre: ver el gotcha del overlay fantasma. */}
      {panelAudio && (
        <PanelAudio modo={audio} onModo={elegirModo} onCerrar={() => setPanelAudio(false)} />
      )}
    </header>
  );
}
