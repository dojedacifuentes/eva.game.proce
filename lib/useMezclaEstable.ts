"use client";
import { useRef } from "react";

/**
 * Calcula un valor UNA VEZ por clave y lo conserva mientras la clave no cambie.
 *
 * Existe para los barajados de opciones. El patrón que había era
 * `useMemo(() => shuffle(pregunta.opciones), [pregunta.id])`: la intención
 * («mezcla una vez por pregunta») era correcta, pero dejaba fuera de las
 * dependencias justo lo que el cálculo lee, y `react-hooks/exhaustive-deps` lo
 * marcaba. Añadir el objeto a las dependencias tampoco sirve: si el padre lo
 * recrea en cada render, las opciones se rebarajan solas delante del jugador.
 *
 * Con una ref la semántica queda explícita y no depende de la identidad de
 * ningún objeto: se recalcula si, y sólo si, cambia la clave.
 */
export function useMezclaEstable<T>(clave: string | number, calcular: () => T): T {
  const ref = useRef<{ clave: string | number; valor: T } | null>(null);
  if (ref.current === null || ref.current.clave !== clave) {
    ref.current = { clave, valor: calcular() };
  }
  return ref.current.valor;
}
