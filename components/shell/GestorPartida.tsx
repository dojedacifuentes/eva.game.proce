"use client";
import { useRef, useState } from "react";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import Modal from "./Modal";

/**
 * Respaldo de partida: exportar a JSON e importar.
 *
 * Existe por dos razones concretas:
 *  1. Las partidas viven en localStorage, que es POR DOMINIO. Quien jugara en
 *     el sitio original no tiene forma de llevarse su avance a la copia nueva;
 *     esto se la da.
 *  2. Es la red de seguridad frente a cualquier cambio futuro del formato de
 *     guardado.
 *
 * La descarga usa un Blob local: no se envía nada a ningún servidor.
 */
export default function GestorPartida() {
  const exportarPartida = useGame((s) => s.exportarPartida);
  const importarPartida = useGame((s) => s.importarPartida);
  const personaje = useGame((s) => s.personaje);

  const archivo = useRef<HTMLInputElement>(null);
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function exportar() {
    sfx.click?.();
    const json = exportarPartida();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    const limpio = (personaje.nombre || "partida").replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase();
    a.href = url;
    a.download = `foro-invisible-${limpio}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAviso("Partida exportada.");
  }

  function alElegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => setPendiente(String(lector.result));
    lector.onerror = () => setAviso("No se pudo leer el archivo.");
    lector.readAsText(f);
  }

  function confirmarImportacion() {
    if (!pendiente) return;
    const ok = importarPartida(pendiente);
    setPendiente(null);
    setAviso(ok ? "Partida importada." : "El archivo no contiene una partida válida.");
    if (ok) sfx.confirm?.();
  }

  return (
    <section className="tarjeta p-4 space-y-3">
      <h2 className="rotulo m-0" style={{ color: "#4BE7FF" }}>
        Respaldo de partida
      </h2>
      <p className="t-base txt-normal leading-snug m-0">
        Tu progreso se guarda en este navegador y en este dominio. Expórtalo para conservarlo o llevarlo a otro
        equipo.
      </p>

      <div className="grid sm:grid-cols-2 gap-2">
        <button type="button" onClick={exportar} className="btn-secundario">
          ↓ Exportar partida
        </button>
        <button
          type="button"
          onClick={() => { sfx.click?.(); archivo.current?.click(); }}
          className="btn-secundario"
        >
          ↑ Importar partida
        </button>
        <label htmlFor="archivo-partida" className="sr-only">
          Archivo de partida en formato JSON
        </label>
        <input
          id="archivo-partida"
          ref={archivo}
          type="file"
          accept="application/json,.json"
          onChange={alElegirArchivo}
          className="sr-only"
        />
      </div>

      {aviso && (
        <p className="t-meta m-0" style={{ color: "#58F5B0" }} role="status" aria-live="polite">
          {aviso}
        </p>
      )}

      {/* Importar reemplaza la partida actual: se pregunta antes. */}
      {pendiente && (
        <Modal
          titulo="Importar reemplaza tu partida"
          acento="var(--zona-nulidad-txt)"
          ancho="md"
          etiquetaCuerpo="Confirmación de importación de partida"
          onCerrar={() => setPendiente(null)}
          pie={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button type="button" onClick={() => setPendiente(null)} className="btn-secundario flex-1">
                Cancelar
              </button>
              <button type="button" onClick={confirmarImportacion} className="btn btn-danger flex-1">
                Importar y reemplazar
              </button>
            </div>
          }
        >
          <p className="t-cuerpo txt-normal leading-relaxed m-0">
            Se sustituirá el progreso actual{personaje.nombre ? ` de ${personaje.nombre}` : ""} por el del
            archivo. Exporta antes si quieres conservarlo.
          </p>
        </Modal>
      )}
    </section>
  );
}
