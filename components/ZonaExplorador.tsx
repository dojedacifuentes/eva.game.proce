"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { npcsDeZona, retratoDe, type NpcId } from "@/data/npcs-v2";
import { getEventosInZona, type EventoMundo } from "@/data/eventos-mundo";
import EncuentroNpc from "./EncuentroNpc";
import EventoMundoModal from "./EventoMundoModal";
import RetratoNpc from "./game/RetratoNpc";

// ============================================================================
// EXPLORADOR DE ZONA — habitantes y eventos de un mundo.
//
// Antes abría el modal del NPC SOLO, en el primer render, tapando el contenido
// de la zona antes de que el jugador pudiera verlo. Ahora los habitantes se
// presentan como tarjetas y el encuentro lo abre quien quiere hablar.
// ============================================================================

export default function ZonaExplorador({
  zona,
  children,
}: {
  zona: string;
  children?: React.ReactNode;
}) {
  const [npcs, setNpcs] = useState<NpcId[]>([]);
  const [eventos, setEventos] = useState<EventoMundo[]>([]);
  const [npcActual, setNpcActual] = useState<NpcId | null>(null);
  const [eventoActual, setEventoActual] = useState<EventoMundo | null>(null);

  useEffect(() => {
    setNpcs(npcsDeZona(zona).map((n) => n.id));
    setEventos(getEventosInZona(zona));
  }, [zona]);

  const habitantes = npcsDeZona(zona);

  return (
    <>
      {/* Habitantes de la zona: el encuentro es una decisión, no una emboscada */}
      {habitantes.length > 0 && (
        <section className="mb-4" aria-labelledby="titulo-habitantes">
          <h2 id="titulo-habitantes" className="t-etiqueta text-zona-competencia mb-2">
            Quién está aquí
          </h2>
          <div className="flex flex-wrap gap-2">
            {habitantes.map((npc) => (
              <motion.button
                key={npc.id}
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => { setNpcActual(npc.id); sfx.click?.(); }}
                onMouseEnter={() => sfx.hover?.()}
                className="panel flex items-center gap-3 p-3 text-left transition-all hover:brightness-125 min-h-[44px]"
                style={{ maxWidth: "22rem" }}
              >
                <RetratoNpc emoji={retratoDe(npc.id)} acento="var(--zona-competencia)" size={46} />
                <span className="min-w-0">
                  <span className="block font-display-grave t-base txt-fuerte leading-tight truncate">
                    {npc.nombre}
                  </span>
                  <span className="block t-meta txt-suave truncate">{npc.titulo}</span>
                  <span className="block t-micro font-mono-terminal text-zona-competencia mt-0.5">
                    Hablar →
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Eventos de la zona */}
      {eventos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {eventos.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => { setEventoActual(ev); sfx.click?.(); }}
              className="btn text-zona-oralidad border-zona-oralidad/45"
            >
              ⚠ {ev.titulo ?? "Atender evento"}
            </button>
          ))}
        </div>
      )}

      {children}

      {/* Montaje condicional del padre: nada de AnimatePresence, que dejaba
          copias del overlay montadas en opacity 0. */}
      {npcActual && <EncuentroNpc npcId={npcActual} onCerrar={() => setNpcActual(null)} />}
      {eventoActual && (
        <EventoMundoModal evento={eventoActual} onCerrar={() => setEventoActual(null)} />
      )}
    </>
  );
}
