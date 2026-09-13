"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// AVANCE AUTOMÁTICO CON SALIDA ANTICIPADA
//
// Varias actividades esperaban un tiempo fijo entre preguntas
// (`setTimeout(siguiente, 1500)`). En una tanda de veinte son treinta segundos
// mirando una pantalla que ya no dice nada nuevo, y no había forma de saltarlos.
//
// Aquí el tiempo pasa a ser un *máximo*, no una imposición: cualquier toque,
// Enter, espacio o flecha derecha adelanta el paso. Quien necesita leer la
// explicación la lee entera; quien ya la entendió sigue a su ritmo.
// ============================================================================

/** Margen antes de escuchar: si no, el mismo clic que respondió avanzaría. */
const GRACIA_MS = 180;

export function useAvanceAutomatico() {
  const [pendiente, setPendiente] = useState(false);
  /** Cuánto dura la espera en curso, para dibujar la barra de progreso. */
  const [duracion, setDuracion] = useState(0);

  const accion = useRef<(() => void) | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desde = useRef(0);

  const limpiar = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  /** Ejecuta ya lo que estuviera pendiente. Idempotente. */
  const ahora = useCallback(() => {
    const fn = accion.current;
    accion.current = null;
    limpiar();
    setPendiente(false);
    fn?.();
  }, [limpiar]);

  /** Programa `fn` dentro de `ms`, adelantable por el jugador. */
  const programar = useCallback((fn: () => void, ms: number) => {
    limpiar();
    accion.current = fn;
    desde.current = Date.now();
    setDuracion(ms);
    setPendiente(true);
    temporizador.current = setTimeout(ahora, ms);
  }, [ahora, limpiar]);

  /** Cancela sin ejecutar: para desmontar o reiniciar la actividad. */
  const cancelar = useCallback(() => {
    accion.current = null;
    limpiar();
    setPendiente(false);
  }, [limpiar]);

  useEffect(() => {
    if (!pendiente) return;

    const adelantar = () => {
      if (Date.now() - desde.current < GRACIA_MS) return;
      ahora();
    };
    const porTecla = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        adelantar();
      }
    };

    window.addEventListener("pointerdown", adelantar);
    window.addEventListener("keydown", porTecla);
    return () => {
      window.removeEventListener("pointerdown", adelantar);
      window.removeEventListener("keydown", porTecla);
    };
  }, [pendiente, ahora]);

  // Al desmontar no debe quedar ningún temporizador vivo apuntando a un
  // componente que ya no existe.
  useEffect(() => limpiar, [limpiar]);

  return { pendiente, duracion, programar, ahora, cancelar };
}
