"use client";
import { useEffect } from "react";
import { useCallbackRef } from "./useCallbackRef";

// ============================================================================
// ATAJOS DE ALTERNATIVAS
//
// Para estudiar de verdad hay que poder ir rápido. En escritorio, responder
// obligaba a llevar la mano al ratón en cada pregunta; con las teclas 1-9 se
// hace una tanda entera sin soltar el teclado.
//
// No sustituye a nada: los botones siguen ahí, y la pista de la tecla se dibuja
// dentro de cada uno, así que el atajo se descubre solo.
// ============================================================================

/** Letra de la opción número `i` (base 0): 0 → A, 1 → B… */
export function letraDeOpcion(i: number): string {
  return String.fromCharCode(65 + i);
}

/**
 * Índice de opción que corresponde a una tecla, o -1 si no corresponde a
 * ninguna. Acepta el número y la letra, porque unas pantallas rotulan las
 * opciones con dígitos y otras con letras, y el jugador no tiene por qué
 * recordar cuál es cuál.
 */
export function indiceDeTecla(tecla: string, cantidad: number): number {
  const tope = Math.min(cantidad, 9);
  const n = Number(tecla);
  if (Number.isInteger(n) && n >= 1 && n <= tope) return n - 1;
  if (tecla.length === 1) {
    const i = tecla.toUpperCase().charCodeAt(0) - 65;
    if (i >= 0 && i < tope) return i;
  }
  return -1;
}

/**
 * Enlaza las teclas 1..N y A..N con `onElegir`.
 *
 * @param activo Pásalo en false mientras hay respuesta en pantalla o la
 *   actividad no ha empezado; si no, una tecla pulsada de más contesta la
 *   pregunta siguiente sin que al jugador le haya dado tiempo a leerla.
 */
export function useAtajosAlternativas(
  cantidad: number,
  onElegir: (indice: number) => void,
  activo = true,
) {
  // Identidad estable, cuerpo siempre al día: el listener no se vuelve a montar
  // en cada render y aun así no se queda con un estado caducado.
  const elegir = useCallbackRef(onElegir);

  useEffect(() => {
    if (!activo || cantidad <= 0) return;

    const alTeclado = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Nunca robar teclas a quien está escribiendo.
      const foco = document.activeElement as HTMLElement | null;
      const etiqueta = foco?.tagName;
      if (etiqueta === "INPUT" || etiqueta === "TEXTAREA" || foco?.isContentEditable) return;
      // Ni a un diálogo abierto, que tiene su propio foco atrapado.
      if (document.querySelector('[role="dialog"]')) return;

      const i = indiceDeTecla(e.key, cantidad);
      if (i < 0) return;
      e.preventDefault();
      elegir(i);
    };

    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [cantidad, activo, elegir]);
}
