"use client";
import { useCallback, useEffect, useRef } from "react";

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal con gestión de foco.
 *
 * - Atrapa el tabulador dentro del diálogo.
 * - Escape cierra.
 * - Al cerrarse devuelve el foco al elemento que lo abrió.
 *
 * El padre lo monta condicionalmente (`{abierto && <Dialogo …/>}`) en vez de
 * usar AnimatePresence: framer-motion puede dejar un `fixed inset-0` montado en
 * opacity 0 que se come los clics.
 */
export default function Dialogo({
  titulo,
  descripcion,
  onCerrar,
  children,
}: {
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
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
    return () => {
      document.removeEventListener("keydown", alTeclado);
      previo.current?.focus?.();
    };
  }, [alTeclado]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(3,4,8,0.82)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        aria-describedby={descripcion ? "dialogo-desc" : undefined}
        className="w-full max-w-md border bg-bg-deep p-5 shell-scroll"
        style={{ borderColor: "rgba(217,74,74,0.4)", maxHeight: "85dvh" }}
      >
        <h2 id="dialogo-titulo" className="font-display-grave text-lg text-doc-aged mb-2">
          {titulo}
        </h2>
        {descripcion && (
          <p id="dialogo-desc" className="font-serif-juridica text-doc-aged/70 text-sm leading-snug not-italic mb-4">
            {descripcion}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
