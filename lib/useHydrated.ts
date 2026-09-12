"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";

/**
 * ¿Terminó `persist` de leer localStorage?
 *
 * Antes, `/juego` evaluaba `!personaje.nombre` en el primer render y enseñaba la
 * pantalla de "sin personaje" durante un instante a quien SÍ tenía partida.
 *
 * Se consulta la API oficial de `persist` en lugar de una bandera propia: es la
 * fuente de verdad y no depende del orden en que se inicialice el módulo. En el
 * servidor devuelve `false`, igual que en el primer render del cliente, así que
 * no hay discrepancia de hidratación; el efecto la pone a `true` en cuanto la
 * lectura termina.
 */
export function useHydrated(): boolean {
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    // Si la rehidratación ya había terminado antes de montar, no habrá evento.
    if (useGame.persist.hasHydrated()) {
      setHidratado(true);
      return;
    }
    return useGame.persist.onFinishHydration(() => setHidratado(true));
  }, []);

  return hidratado;
}
