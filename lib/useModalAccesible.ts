"use client";
import { useCallback, useEffect, useRef } from "react";
import { sfx } from "./audio";

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de diálogo para overlays que YA tienen arte propio.
 *
 * `components/shell/Modal.tsx` aporta armazón + comportamiento, y es lo que usan
 * los diálogos nuevos. Pero varios overlays del juego tienen una identidad
 * visual que vale la pena conservar —las cartas con color de rareza, el giro 3D
 * del bestiario, el halo del artículo legendario—, y meterlos en el armazón
 * genérico los aplanaría.
 *
 * Este hook les da lo único que les faltaba, sin tocar su aspecto:
 *   · foco atrapado dentro del diálogo,
 *   · Escape cierra,
 *   · el foco vuelve al elemento que lo abrió.
 *
 * El fondo debe llevar además la clase `.modal-scrim`, que lo sitúa por encima
 * de las capas CRT (z 50/51). Sin eso, el ruido y la viñeta negra del ambiente
 * se pintaban por encima del modal.
 *
 * Uso:
 *   const caja = useModalAccesible(onCerrar);
 *   <div className="modal-scrim" onClick={…}>
 *     <div ref={caja} role="dialog" aria-modal="true" aria-label="…"> … </div>
 *   </div>
 */
export function useModalAccesible<T extends HTMLElement = HTMLDivElement>(
  onCerrar: () => void,
  activo = true,
) {
  const caja = useRef<T>(null);
  const previo = useRef<HTMLElement | null>(null);

  const alTeclado = useCallback(
    (e: KeyboardEvent) => {
      if (!activo) return;
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
    [onCerrar, activo],
  );

  useEffect(() => {
    if (!activo) return;
    previo.current = document.activeElement as HTMLElement | null;
    caja.current?.querySelector<HTMLElement>(ENFOCABLES)?.focus();
    document.addEventListener("keydown", alTeclado);
    // El mismo par de sonidos que Modal.tsx: abrir y cerrar suenan igual en
    // todo el juego, conserve o no el overlay su arte propio.
    sfx.abrir?.();
    return () => {
      document.removeEventListener("keydown", alTeclado);
      previo.current?.focus?.();
      sfx.cerrar?.();
    };
  }, [alTeclado, activo]);

  return caja;
}
