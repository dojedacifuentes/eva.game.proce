"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HUDPersistente from "./HUDPersistente";
import BootSequence from "./BootSequence";
import AvisoNivel from "./shell/AvisoNivel";
import { setEscenaAmbiente, type EscenaAmbiente } from "@/lib/audio";

// ============================================================================
// GLOBAL CANVAS — realimentación efímera e intro.
//
// El fondo animado (AmbienteVivo: lluvia, artículos girando y barrido dibujados
// en un <canvas> a pantalla completa en cada fotograma) se retiró. En un
// teléfono era el mayor consumo de CPU del juego y restaba contraste a todo lo
// que tenía encima. El fondo es ahora el plano estático de components/FondoCiudad.
//
// Lo que queda vive aquí porque el layout raíz lo monta una sola vez: sirve para
// todas las rutas sin repetirse en ninguna.
// ============================================================================

/** Clave en localStorage (no sessionStorage): así la intro no se repite al
 *  abrir una pestaña nueva. */
const CLAVE_INTRO = "foro-invisible:intro-vista";

/**
 * Escena sonora según dónde esté el jugador. Es la misma lectura de la ruta que
 * antes elegía el modo del fondo animado; al retirarse aquél, sobrevive para
 * afinar el ambiente, que traía cinco escenas escritas y sonaba siempre igual.
 */
function escenaDeRuta(pathname: string | null): EscenaAmbiente {
  if (!pathname) return "estudio";
  if (pathname.includes("/oral") || pathname.includes("/boss")) return "oral";
  if (pathname.includes("ejecutivo")) return "ejecutivo";
  if (pathname.includes("nulidad") || pathname.includes("casacion")) return "nulidad";
  if (pathname.includes("recurso") || pathname.includes("alzada")) return "recursos";
  if (pathname.includes("cautelar")) return "cautelares";
  return "estudio";
}

export default function GlobalCanvas() {
  const pathname = usePathname();
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

  const escena = escenaDeRuta(pathname);
  useEffect(() => {
    // No enciende nada: si el ambiente está apagado sólo deja anotada la escena
    // para cuando el jugador lo encienda desde la cabecera.
    setEscenaAmbiente(escena);
  }, [escena]);

  function finIntro() {
    try { localStorage.setItem(CLAVE_INTRO, "1"); } catch { /* sin persistencia */ }
    setIntroHecha(true);
  }

  if (!hydrated) return null;

  return (
    <>
      <HUDPersistente />
      <AvisoNivel />
      {/* Montaje condicional del padre: ver el gotcha del overlay fantasma. */}
      {!introHecha && <BootSequence onFin={finIntro} />}
    </>
  );
}
