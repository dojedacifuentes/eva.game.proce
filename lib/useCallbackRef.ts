"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Devuelve una función con identidad ESTABLE que siempre invoca la última
 * versión de `fn`.
 *
 * Para qué: los temporizadores de los minijuegos llamaban a `fallar()` desde
 * dentro de un `setInterval` sin declararla como dependencia del efecto. Eso
 * dispara `react-hooks/exhaustive-deps` y además esconde un fallo real: el
 * intervalo se queda con la versión de `fallar` del render en que se creó, y
 * por tanto con valores de combo, índice o puntaje ya caducados.
 *
 * Meterla en las dependencias sin más recrearía el intervalo en cada render y
 * el contador se reiniciaría solo. Con este envoltorio la referencia no cambia
 * nunca, así que el efecto puede declararla y el temporizador sigue llamando al
 * código actual.
 */
export function useCallbackRef<A extends unknown[], R>(fn: (...args: A) => R) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}
