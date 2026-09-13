"use client";
import { useEffect, useState } from "react";
import HUDPersistente from "./HUDPersistente";
import BootSequence from "./BootSequence";

// ============================================================================
// GLOBAL CANVAS — realimentación efímera e intro.
//
// El fondo animado (AmbienteVivo: lluvia, artículos girando y barrido dibujados
// en un <canvas> a pantalla completa en cada fotograma) se retiró. En un
// teléfono era el mayor consumo de CPU del juego y restaba contraste a todo lo
// que tenía encima. El fondo es ahora el plano estático de components/FondoCiudad.
// ============================================================================

/** Clave en localStorage (no sessionStorage): así la intro no se repite al
 *  abrir una pestaña nueva. */
const CLAVE_INTRO = "foro-invisible:intro-vista";

export default function GlobalCanvas() {
  const [introHecha, setIntroHecha] = useState(true); // por defecto, no molestar
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    let reduce = false;
    try {
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* navegadores sin matchMedia: se trata como "sin preferencia" */
    }
    if (reduce) {
      // Con movimiento reducido la intro no se muestra en absoluto.
      setIntroHecha(true);
      return;
    }
    try {
      setIntroHecha(localStorage.getItem(CLAVE_INTRO) === "1");
    } catch {
      setIntroHecha(true); // almacenamiento bloqueado: no bloquear el acceso
    }
  }, []);

  function finIntro() {
    try { localStorage.setItem(CLAVE_INTRO, "1"); } catch { /* sin persistencia */ }
    setIntroHecha(true);
  }

  if (!hydrated) return null;

  return (
    <>
      <HUDPersistente />
      {/* Montaje condicional del padre: ver el gotcha del overlay fantasma. */}
      {!introHecha && <BootSequence onFin={finIntro} />}
    </>
  );
}
