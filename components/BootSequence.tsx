"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sfx, startAmbient } from "@/lib/audio";
import { JUEGO, PROYECTO, AUTOR } from "@/lib/brand";

// ============================================================================
// INTRO — breve, omitible y respetuosa con el movimiento reducido.
//
// Cambios respecto de la versión anterior: dura 1,4 s en vez de 3,3 s; el
// [ESC] que anunciaba ahora funciona de verdad (y también cualquier tecla o
// clic); se recuerda en localStorage, así que no se repite al abrir una pestaña
// nueva ni al volver por un enlace interno; y con `prefers-reduced-motion` no
// llega a montarse (ver GlobalCanvas).
// ============================================================================

const LINEAS = [
  "» CPR · COT · CPC cargados",
  "» 13 zonas procesales mapeadas",
  "» Terminal lista",
];

const DURACION = 1400;

export default function BootSequence({ onFin }: { onFin: () => void }) {
  const [lineas, setLineas] = useState<string[]>([]);
  const cerrado = useRef(false);

  useEffect(() => {
    function cerrar() {
      if (cerrado.current) return;
      cerrado.current = true;
      onFin();
    }

    sfx.boot?.();
    startAmbient("ambiente");

    const temporizadores = LINEAS.map((l, i) =>
      setTimeout(() => {
        sfx.beep?.();
        setLineas((arr) => [...arr, l]);
      }, 260 + i * 300),
    );
    const fin = setTimeout(cerrar, DURACION);

    // Cualquier tecla, clic o toque la omite.
    const porTecla = () => cerrar();
    window.addEventListener("keydown", porTecla);
    window.addEventListener("pointerdown", porTecla);

    return () => {
      temporizadores.forEach(clearTimeout);
      clearTimeout(fin);
      window.removeEventListener("keydown", porTecla);
      window.removeEventListener("pointerdown", porTecla);
    };
  }, [onFin]);

  return (
    // El padre monta condicionalmente; aquí sólo se anima la entrada. No se usa
    // AnimatePresence: dejaba overlays `fixed` montados en opacity 0 bloqueando
    // los clics (gotcha documentado en la guía del repositorio).
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-bg-deep flex flex-col items-center justify-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(75,231,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(75,231,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 text-center mb-6">
        <h1 className="font-display-grave text-4xl md:text-6xl text-doc-aged tracking-[.05em]">
          {JUEGO.partes.uno}
          <span className="text-zona-competencia">{JUEGO.partes.dos}</span>
          <span className="font-serif-juridica">{JUEGO.partes.tres}</span>
        </h1>
        <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em] text-doc-aged/45 mt-3">
          {PROYECTO.presenta}
        </div>
        <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em] text-doc-aged/30 mt-1">
          {AUTOR.credito}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-0.5 min-h-[54px]">
        {lineas.map((l) => (
          <div key={l} className="font-mono-terminal text-[11px] text-doc-aged/70 text-center">
            {l}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onFin}
        className="relative z-10 mt-6 px-4 py-2 font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/50 border border-doc-aged/20 hover:text-zona-competencia hover:border-zona-competencia/50 transition-colors"
      >
        Saltar intro
      </button>
    </motion.div>
  );
}
