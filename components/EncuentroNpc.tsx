"use client";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import Modal from "@/components/shell/Modal";
import RetratoNpc from "@/components/game/RetratoNpc";
import { getNpcV2, encuentroDe, retratoDe, type NpcId } from "@/data/npcs-v2";

// ============================================================================
// ENCUENTRO CON NPC — escena de conversación.
//
// Reescrito sobre components/shell/Modal.tsx. Lo que estaba roto antes:
//
//  · La tarjeta se pintaba con `bg-terminal-dark`, una clase que NO EXISTE
//    (el CSS define `.terminal-darker`, con «er»). El panel no tenía fondo y se
//    veía la página a través del texto.
//  · `{dialogo.efecto.reputacion && …}` con `reputacion: 0` imprimía un «0»
//    suelto —la caja vacía— porque en React `0 && x` evalúa a 0 y se renderiza.
//    El mismo falsy hacía que el botón anunciara «+Econ» en vez de «+Rep» y, lo
//    más grave, que al pulsarlo NO se aplicara ningún efecto.
//  · `AnimatePresence` envolvía un hijo sin `key` y sin `motion`, lo que dejaba
//    copias montadas del overlay (gotcha ya documentado en el repositorio).
//  · Sin role="dialog", sin foco atrapado y sin cierre por Escape.
//
// Los datos ahora salen de `data/npcs-v2.ts`, fuente única tras retirar el
// sistema paralelo de `data/npcs.ts`.
// ============================================================================

/** Etiqueta legible de un efecto. Distingue "sin efecto" de "efecto de 0". */
function describeEfecto(efecto?: { reputacion?: number; trauma?: number; nivelEconomico?: number }) {
  if (!efecto) return [];
  const partes: { texto: string; color: string }[] = [];
  const añade = (valor: number | undefined, nombre: string, color: string) => {
    if (valor === undefined) return;
    partes.push({
      texto: valor === 0 ? `${nombre} sin cambios` : `${valor > 0 ? "+" : ""}${valor} ${nombre}`,
      color: valor === 0 ? "var(--txt-tenue, rgba(232,223,197,.74))" : color,
    });
  };
  añade(efecto.reputacion, "Reputación", "var(--zona-cautelares)");
  añade(efecto.trauma, "Trauma", "var(--zona-nulidad-txt)");
  añade(efecto.nivelEconomico, "Economía", "var(--zona-prueba)");
  return partes;
}

export default function EncuentroNpc({ npcId, onCerrar }: { npcId: NpcId; onCerrar: () => void }) {
  const npc = getNpcV2(npcId);
  const encuentro = encuentroDe(npcId);
  const game = useGame();
  const [idx, setIdx] = useState(0);
  const [aplicado, setAplicado] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);

  if (!npc || !encuentro) return null;

  const total = encuentro.dialogos.length + 1;
  const dialogo = idx === 0 ? encuentro.dialogo_inicial : encuentro.dialogos[idx - 1];
  const efectos = describeEfecto(dialogo.efecto);
  const acento = "var(--zona-competencia)";

  // `!== undefined`, no truthiness: un efecto de 0 es un efecto declarado.
  const hayEfectoReal =
    (dialogo.efecto?.reputacion ?? 0) !== 0 ||
    (dialogo.efecto?.trauma ?? 0) !== 0 ||
    (dialogo.efecto?.nivelEconomico ?? 0) !== 0;

  const estado = !aplicado ? "neutral" : (dialogo.efecto?.trauma ?? 0) > 0 ? "tenso" : "favorable";

  function escuchar() {
    if (aplicado) return;
    const e = dialogo.efecto;
    // Antes esto iba dentro de `if (efecto.reputacion)`, así que con 0 no se
    // ejecutaba NADA: ni el ajuste ni la entrada en la bitácora.
    if (e?.reputacion) { game.ajustarReputacion(e.reputacion); sfx.oralCorrecta?.(); }
    if (e?.trauma) { game.ajustarTrauma(e.trauma); sfx.warning?.(); }
    if (!hayEfectoReal) sfx.click?.();

    game.pushLog(`${npc!.nombre}: "${dialogo.texto}"`, "npc");
    if (e?.reputacion) game.pushLog(`${e.reputacion > 0 ? "+" : ""}${e.reputacion} Reputación`, "npc");
    if (e?.trauma) game.pushLog(`${e.trauma > 0 ? "+" : ""}${e.trauma} Trauma`, "npc");

    setHistorial((h) => [...h, dialogo.texto]);
    setAplicado(true);
  }

  function avanzar() {
    if (idx < encuentro!.dialogos.length) {
      setIdx(idx + 1);
      setAplicado(false);
      sfx.click?.();
    } else {
      onCerrar();
    }
  }

  return (
    <Modal
      titulo={npc.nombre}
      subtitulo={npc.titulo}
      acento={acento}
      retrato={<RetratoNpc emoji={retratoDe(npcId)} acento={acento} estado={estado} />}
      onCerrar={onCerrar}
      etiquetaCuerpo={`Conversación con ${npc.nombre}`}
      ancho="xl"
      pie={
        <>
          <span className="t-meta txt-suave self-center mr-auto font-mono-terminal">
            {idx + 1} de {total}
          </span>
          {!aplicado ? (
            <button type="button" onClick={escuchar} className="btn btn-recurso px-5">
              Escuchar
            </button>
          ) : (
            <button type="button" onClick={avanzar} className="btn btn-cautelar px-5">
              {idx < encuentro.dialogos.length ? "Seguir hablando →" : "Terminar"}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-3">
        {/* Rasgo del personaje, como etiqueta y no como párrafo suelto */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="t-meta px-2.5 py-1.5 border rounded"
            style={{ borderColor: "rgba(215,180,106,0.45)", color: "var(--zona-prueba)" }}
          >
            <span className="t-micro font-mono-terminal uppercase tracking-wider opacity-80 mr-1.5">Carácter</span>
            {npc.personalidad}
          </span>
        </div>

        <p className="t-cuerpo txt-suave leading-relaxed m-0">{npc.descripcion}</p>

        {/* Registro de conversación: lo ya dicho queda arriba, atenuado */}
        {historial.slice(0, -1).map((t, i) => (
          <blockquote
            key={i}
            className="m-0 pl-3 border-l-2 t-base txt-tenue font-serif-juridica leading-snug"
            style={{ borderColor: "rgba(232,223,197,0.2)" }}
          >
            «{t}»
          </blockquote>
        ))}

        {/* Voz actual, en serif y con peso */}
        <blockquote
          className="m-0 pl-3.5 border-l-4 t-cuerpo txt-normal font-serif-juridica leading-relaxed"
          style={{ borderColor: acento }}
        >
          «{dialogo.texto}»
        </blockquote>

        {/* Consecuencia visible, como pide la dirección de arte */}
        {efectos.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-live="polite">
            {efectos.map((e) => (
              <span
                key={e.texto}
                className="t-meta font-mono-terminal px-2.5 py-1.5 border rounded"
                style={{ color: e.color, borderColor: "color-mix(in srgb, currentColor 45%, transparent)" }}
              >
                {aplicado ? "✓ " : ""}{e.texto}
              </span>
            ))}
          </div>
        )}

        {/* Misión como tarjeta de recompensa */}
        {encuentro.mision && (
          <section
            className="p-3 border rounded"
            style={{ borderColor: "rgba(138,92,255,0.42)", background: "rgba(138,92,255,0.07)" }}
          >
            <h3 className="t-etiqueta text-zona-recursos m-0">⚔ Misión disponible</h3>
            <div className="font-display-grave t-titulo txt-fuerte mt-1">{encuentro.mision.titulo}</div>
            <p className="t-base txt-suave leading-snug mt-1 m-0">{encuentro.mision.descripcion}</p>
            <div className="t-meta font-mono-terminal text-zona-recursos mt-2">
              Recompensa: {encuentro.mision.recompensa}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
