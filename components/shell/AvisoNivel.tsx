"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { fx } from "@/lib/fx";
import { debeCelebrarNivel } from "@/lib/progreso";

// ============================================================================
// AVISO DE NIVEL
//
// Subir de nivel era invisible en el juego base: `store/useGame.ts` recalcula
// `nivel` dentro del `set()` de `gainXp` y `completarMision`, y nadie
// reaccionaba. La barra de la cabecera se llenaba y volvía a cero sin decir
// nada. La expansión Reinos sí avisaba; el núcleo no.
//
// Vive en `GlobalCanvas`, que se monta una vez en el layout raíz: así funciona
// en las 50 rutas sin repetir nada.
// ============================================================================

/** Cuánto queda en pantalla. Suficiente para leerlo sin llegar a estorbar. */
const DURACION_MS = 3600;

export default function AvisoNivel() {
  const hydrated = useHydrated();
  const nivel = useGame((s) => s.nivel);
  const xp = useGame((s) => s.xp);

  const [aviso, setAviso] = useState<{ nivel: number; xp: number } | null>(null);
  /** Nivel de referencia. `null` hasta que el guardado está leído. */
  const previo = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    const celebrar = debeCelebrarNivel(previo.current, nivel);
    // La referencia se actualiza siempre, se celebre o no: el primer render
    // con el guardado leído sólo sirve para fijarla.
    previo.current = nivel;
    if (!celebrar) return;

    setAviso({ nivel, xp });
    sfx.subidaNivel?.();
    haptica.hito();
    fx.reward();
  }, [hydrated, nivel, xp]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), DURACION_MS);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!aviso) return null;

  return (
    // `pointer-events: none`: celebra por encima de todo, pero nunca se come un
    // toque del jugador, ni siquiera si aparece sobre un botón.
    <div className="aviso-nivel" role="status" aria-live="polite">
      <div className="aviso-nivel-caja">
        <div className="aviso-nivel-rotulo font-mono-terminal">▲ Subiste de nivel</div>
        <div className="aviso-nivel-cifra font-display-grave level-up">Nivel {aviso.nivel}</div>
        <div className="aviso-nivel-pie font-mono-terminal">{aviso.xp} XP acumulada</div>
      </div>
    </div>
  );
}
