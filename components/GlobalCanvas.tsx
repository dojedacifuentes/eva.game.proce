"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AmbienteVivo from "./AmbienteVivo";
import HUDPersistente from "./HUDPersistente";
import BootSequence from "./BootSequence";
import { useGame } from "@/store/useGame";

// ============================================================================
// GLOBAL CANVAS — fondo animado, realimentación efímera e intro.
// ============================================================================

/** Clave en localStorage (no sessionStorage): así la intro no se repite al
 *  abrir una pestaña nueva. */
const CLAVE_INTRO = "foro-invisible:intro-vista";

export default function GlobalCanvas() {
  const pathname = usePathname();
  const personaje = useGame((s) => s.personaje);
  const trauma = personaje.trauma || 0;
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

  const modoZona: "ambiente" | "oral" | "ejecutivo" | "nulidad" = (() => {
    if (!pathname) return "ambiente";
    if (pathname.includes("/oral")) return "oral";
    if (pathname.includes("ejecutivo")) return "ejecutivo";
    if (pathname.includes("nulidad")) return "nulidad";
    return "ambiente";
  })();

  const intensidad = Math.min(100, 40 + trauma);

  function finIntro() {
    try { localStorage.setItem(CLAVE_INTRO, "1"); } catch { /* sin persistencia */ }
    setIntroHecha(true);
  }

  if (!hydrated) return null;

  return (
    <>
      <AmbienteVivo intensidad={intensidad} corrupcion={trauma} modo={modoZona} />
      <HUDPersistente />
      {/* Montaje condicional del padre: ver el gotcha del overlay fantasma. */}
      {!introHecha && <BootSequence onFin={finIntro} />}
    </>
  );
}
