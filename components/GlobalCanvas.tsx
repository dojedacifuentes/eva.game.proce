"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AmbienteVivo from "./AmbienteVivo";
import HUDPersistente from "./HUDPersistente";
import BootSequence from "./BootSequence";
import AvisoNivel from "./shell/AvisoNivel";
import { useGame } from "@/store/useGame";
import { setEscenaAmbiente, type EscenaAmbiente } from "@/lib/audio";

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

  // La misma lectura de la ruta que ya guiaba el fondo animado ahora afina
  // también el ambiente sonoro. `lib/audio.ts` traía cinco escenas escritas
  // desde hacía tiempo y sólo sonaba una.
  const escena: EscenaAmbiente = (() => {
    if (!pathname) return "estudio";
    if (pathname.includes("/oral") || pathname.includes("/boss")) return "oral";
    if (pathname.includes("ejecutivo")) return "ejecutivo";
    if (pathname.includes("nulidad") || pathname.includes("casacion")) return "nulidad";
    if (pathname.includes("recurso") || pathname.includes("alzada")) return "recursos";
    if (pathname.includes("cautelar")) return "cautelares";
    return "estudio";
  })();

  useEffect(() => {
    // No enciende nada: si el ambiente está apagado sólo deja anotada la escena
    // para cuando el jugador lo encienda desde la cabecera.
    setEscenaAmbiente(escena);
  }, [escena]);

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
      <AvisoNivel />
      {/* Montaje condicional del padre: ver el gotcha del overlay fantasma. */}
      {!introHecha && <BootSequence onFin={finIntro} />}
    </>
  );
}
