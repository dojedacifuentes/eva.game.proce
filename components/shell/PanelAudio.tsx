"use client";
import { useEffect, useState } from "react";
import {
  setMuted, setVolumen, getVolumen, sfx,
  startAmbienteHipnotico, stopAmbienteHipnotico, stopAmbient,
} from "@/lib/audio";
import { useModalAccesible } from "@/lib/useModalAccesible";

// ============================================================================
// PANEL DE AUDIO
//
// Sustituye al botón que ciclaba entre tres estados. Ciclar obliga a pulsar
// hasta acertar y no dice qué opciones hay; aquí las tres están a la vista y se
// elige la que se quiere.
//
// Trae además el control que faltaba: **volumen**. Antes sólo había encendido
// o apagado, con la ganancia fijada en el código.
// ============================================================================

export type ModoAudio = "apagado" | "efectos" | "estudio";

const MODOS: { id: ModoAudio; icono: string; titulo: string; detalle: string }[] = [
  { id: "apagado", icono: "🔇", titulo: "Silencio", detalle: "Nada de sonido" },
  { id: "efectos", icono: "🔊", titulo: "Efectos", detalle: "Sólo respuestas de la interfaz" },
  { id: "estudio", icono: "🌊", titulo: "Ambiente", detalle: "Efectos y cama sonora continua" },
];

export default function PanelAudio({
  modo,
  onModo,
  onCerrar,
}: {
  modo: ModoAudio;
  onModo: (m: ModoAudio) => void;
  onCerrar: () => void;
}) {
  const caja = useModalAccesible<HTMLDivElement>(onCerrar);
  const [vol, setVol] = useState(1);

  // El volumen guardado sólo se puede leer en el cliente.
  useEffect(() => { setVol(getVolumen()); }, []);

  function cambiarModo(m: ModoAudio) {
    onModo(m);
    setMuted(m === "apagado");
    if (m === "apagado") {
      stopAmbienteHipnotico();
      stopAmbient();
    } else if (m === "efectos") {
      stopAmbienteHipnotico();
      sfx.select?.();
    } else {
      startAmbienteHipnotico();
      sfx.select?.();
    }
  }

  function cambiarVolumen(v: number) {
    setVol(v);
    setVolumen(v);
  }

  return (
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-label="Sonido"
        className="modal-caja"
        style={{ maxWidth: "24rem", borderColor: "var(--zona-competencia)" }}
      >
        <div className="modal-cabecera">
          <span aria-hidden="true" className="text-xl">🎚</span>
          <h2 id="modal-titulo" className="font-display-grave t-titulo txt-fuerte m-0">Sonido</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="cabecera-boton ml-auto"
            aria-label="Cerrar el panel de sonido"
          >
            ✕
          </button>
        </div>

        <div className="modal-cuerpo shell-scroll" tabIndex={0}>
          <fieldset className="border-0 p-0 m-0">
            <legend className="t-meta font-mono-terminal txt-suave mb-2">Qué suena</legend>
            <div className="flex flex-col gap-2">
              {MODOS.map((m) => {
                const activo = m.id === modo;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => cambiarModo(m.id)}
                    aria-pressed={activo}
                    className="opcion text-left"
                    style={activo ? { borderColor: "var(--zona-competencia)" } : undefined}
                  >
                    <span aria-hidden="true" className="text-lg mr-2">{m.icono}</span>
                    <span className="txt-fuerte">{m.titulo}</span>
                    <span className="t-meta txt-suave block">{m.detalle}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4">
            <label htmlFor="volumen-audio" className="t-meta font-mono-terminal txt-suave block mb-2">
              Volumen · {Math.round(vol * 100)} %
            </label>
            <input
              id="volumen-audio"
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(vol * 100)}
              onChange={(e) => cambiarVolumen(Number(e.target.value) / 100)}
              disabled={modo === "apagado"}
              className="w-full"
              style={{ minHeight: 44, accentColor: "var(--zona-competencia)" }}
            />
            <p className="t-meta txt-suave mt-1 m-0">
              {modo === "apagado"
                ? "Elige «Efectos» o «Ambiente» para ajustar el volumen."
                : "Se recuerda en este navegador."}
            </p>
          </div>
        </div>

        <div className="modal-pie">
          <button type="button" onClick={onCerrar} className="btn ml-auto">Listo</button>
        </div>
      </div>
    </div>
  );
}
