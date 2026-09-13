"use client";
import { useCallback, useEffect, useRef } from "react";
import { sfx } from "@/lib/audio";

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * MODAL — armazón único de todos los overlays del juego.
 *
 * Antes había catorce overlays y sólo uno (components/shell/Dialogo.tsx) tenía
 * semántica de diálogo. Los otros trece eran `<div>` sueltos: sin `role`, sin
 * foco atrapado, sin cierre por Escape, con tarjetas translúcidas —o sin fondo
 * ninguno, como el de NPC— y sin límite de alto, así que había que desplazarse
 * para llegar a los botones.
 *
 * Lo que este componente garantiza, por construcción:
 *
 *  · **Superficie opaca.** Usa los tokens --sup-*, el mismo estándar que
 *    .terminal y .reino-card. Nunca se transparenta el fondo animado.
 *  · **Cabe en pantalla.** Cabecera y pie son fijos; SÓLO el cuerpo se desplaza,
 *    en una región etiquetada y enfocable por teclado. La acción principal
 *    siempre está a la vista.
 *  · **Por encima de la atmósfera.** z-index --z-modal (120), por encima de las
 *    capas CRT (50/51) que antes lo cubrían con una viñeta negra.
 *  · **Accesible.** role="dialog", aria-modal, foco atrapado, Escape cierra y el
 *    foco vuelve a donde estaba.
 *  · **Sin overlay fantasma.** El padre lo monta condicionalmente y aquí no se
 *    usa AnimatePresence, que dejaba copias montadas en opacity 0 (gotcha
 *    documentado en el skill del repositorio).
 */
export default function Modal({
  titulo,
  subtitulo,
  retrato,
  acento = "var(--zona-competencia)",
  onCerrar,
  pie,
  etiquetaCuerpo = "Contenido del diálogo",
  ancho = "xl",
  children,
}: {
  titulo: string;
  subtitulo?: string;
  /** Retrato o emblema del interlocutor. */
  retrato?: React.ReactNode;
  /** Color de identidad del personaje o la zona. */
  acento?: string;
  onCerrar: () => void;
  /** Acciones fijas al pie: nunca entran en la zona desplazable. */
  pie?: React.ReactNode;
  etiquetaCuerpo?: string;
  ancho?: "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const previo = useRef<HTMLElement | null>(null);

  const alTeclado = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
        return;
      }
      if (e.key !== "Tab" || !caja.current) return;
      const focos = Array.from(caja.current.querySelectorAll<HTMLElement>(ENFOCABLES));
      if (focos.length === 0) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    },
    [onCerrar],
  );

  useEffect(() => {
    previo.current = document.activeElement as HTMLElement | null;
    const primero = caja.current?.querySelector<HTMLElement>(ENFOCABLES);
    primero?.focus();
    document.addEventListener("keydown", alTeclado);
    // Abrir y cerrar tienen su propio par de sonidos: un barrido que sube y el
    // mismo al revés. Antes ambos gestos sonaban igual que pulsar un botón.
    sfx.abrir?.();
    return () => {
      document.removeEventListener("keydown", alTeclado);
      previo.current?.focus?.();
      sfx.cerrar?.();
    };
  }, [alTeclado]);

  const anchos = { md: "28rem", lg: "36rem", xl: "44rem", "2xl": "54rem" }[ancho];

  return (
    <div
      className="modal-scrim"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="modal-caja"
        style={{ maxWidth: anchos, borderColor: `color-mix(in srgb, ${acento} 55%, transparent)` }}
      >
        {/* Cabecera fija */}
        <header
          className="modal-cabecera"
          style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${acento} 12%, transparent), transparent 70%)` }}
        >
          {retrato && <div className="shrink-0">{retrato}</div>}
          <div className="min-w-0 flex-1">
            <h2 id="modal-titulo" className="font-display-grave t-titulo leading-tight" style={{ color: acento }}>
              {titulo}
            </h2>
            {subtitulo && <p className="t-meta txt-suave mt-0.5 m-0">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="shrink-0 w-11 h-11 flex items-center justify-center border rounded text-lg transition-colors hover:bg-zona-nulidad/15"
            style={{ borderColor: "rgba(217,74,74,0.45)", color: "var(--zona-nulidad-txt)" }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        {/* Cuerpo: lo ÚNICO que se desplaza */}
        <div className="modal-cuerpo shell-scroll" tabIndex={0} role="region" aria-label={etiquetaCuerpo}>
          {children}
        </div>

        {/* Pie fijo: la acción principal nunca queda fuera de la vista */}
        {pie && <footer className="modal-pie">{pie}</footer>}
      </div>
    </div>
  );
}
