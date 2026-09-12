"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CasoInvestigativo, Pista } from "@/data/casos-investigativos";
import { calcularRelevancia, getPistasConectadas, descubrirPistaAleatoria } from "@/lib/investigacion";
import PistaCard from "./PistaCard";
import { sfx } from "@/lib/audio";
import { fx } from "@/lib/fx";
import { useModalAccesible } from "@/lib/useModalAccesible";

// ============================================================================
// TABLERO DE DEDUCCIÓN — v3 visual system
// Grid de evidencias con modal expandido y exploración de pistas.
// ============================================================================

interface TableroDeduccionProps {
  caso: CasoInvestigativo;
  pistasDescubiertas: Set<string>;
  hipótesisActual?: number;
  onExpandirPista: (pistaId: string) => void;
  onDescubrirPista: (pista: Pista) => void;
  expandedPista?: string | null;
  onCloseExpanded: () => void;
}

const TIPO_ICONS: Record<string, string> = {
  documento: "📄", testimonio: "🗣️", articulo: "⚖️", fechas: "📅", dialogo: "💬",
};

export default function TableroDeduccion({
  caso,
  pistasDescubiertas,
  hipótesisActual,
  onExpandirPista,
  onDescubrirPista,
  expandedPista,
  onCloseExpanded,
}: TableroDeduccionProps) {
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  // Foco atrapado, Escape y devolución del foco, conservando el arte
  // propio de este overlay (ver lib/useModalAccesible.ts).
  const cajaModal = useModalAccesible<HTMLDivElement>(onCloseExpanded);

  const pistaDescubiertaObj = expandedPista
    ? caso.pistas.find((p) => p.id === expandedPista)
    : null;

  const pistasList = caso.pistas.filter((p) => pistasDescubiertas.has(p.id));
  const pistasOcultas = caso.pistas.filter(
    (p) => !pistasDescubiertas.has(p.id) && p.descubierta === false
  );

  const handleExplorar = () => {
    const nuevaPista = descubrirPistaAleatoria(caso, pistasDescubiertas);
    if (nuevaPista) {
      sfx.oralCorrecta?.();
      fx.reward();
      onDescubrirPista(nuevaPista);
    }
  };

  const handleToggleSeleccion = (pistaId: string) => {
    const nueva = new Set(seleccionadas);
    if (nueva.has(pistaId)) nueva.delete(pistaId);
    else nueva.add(pistaId);
    setSeleccionadas(nueva);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="terminal p-4 space-y-3">
        <div>
          <div className="font-mono-terminal text-[9px] uppercase tracking-[.35em] text-zona-competencia mb-1">
            TABLERO DE DEDUCCIÓN
          </div>
          <p className="font-serif-juridica text-sm text-doc-aged/60 italic">
            Examina las pistas. Selecciona las relevantes para tu hipótesis.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-[9px] font-mono-terminal text-doc-aged/40">
          <span>DESCUBIERTAS: <span className="text-zona-cautelares">{pistasList.length}</span>/{caso.pistas.length}</span>
          <span>ACTIVAS: <span className="text-zona-recursos">{seleccionadas.size}</span></span>
          <span>OCULTAS: <span className="text-zona-nulidad">{pistasOcultas.length}</span></span>
        </div>

        {/* Explorar button */}
        <button
          onClick={handleExplorar}
          onMouseEnter={() => sfx.hover()}
          className="btn w-full text-xs"
          style={{
            borderColor: pistasOcultas.length > 0 ? "rgba(75,231,255,.4)" : "rgba(255,255,255,.1)",
            color: pistasOcultas.length > 0 ? "var(--zona-competencia)" : "rgba(255,255,255,.25)",
          }}
          disabled={pistasOcultas.length === 0}
        >
          {pistasOcultas.length > 0
            ? `🔍 Explorar expediente — ${pistasOcultas.length} pistas ocultas`
            : "✓ Todas las pistas descubiertas"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {pistasList.map((pista) => {
            const conectada =
              hipótesisActual !== undefined
                ? caso.hipótesis[hipótesisActual].pistas_requieren.includes(pista.id)
                : false;
            const relevancia =
              hipótesisActual !== undefined
                ? calcularRelevancia(pista, hipótesisActual, caso)
                : 0;
            return (
              <motion.div key={pista.id} layout>
                <PistaCard
                  pista={pista}
                  descubierta={true}
                  clickeable={true}
                  conectada={conectada}
                  relevancia={relevancia}
                  onClick={() => onExpandirPista(pista.id)}
                  onExpandir={() => onExpandirPista(pista.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Locked clues preview */}
        {pistasOcultas.slice(0, 3).map((pista) => (
          <motion.div key={`oculta-${pista.id}`} layout>
            <PistaCard pista={pista} descubierta={false} clickeable={false} />
          </motion.div>
        ))}
      </div>

      {/* Expanded pista modal */}
      <AnimatePresence>
        {expandedPista && pistaDescubiertaObj && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-scrim"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={onCloseExpanded}
          >
            <motion.div
              ref={cajaModal} role="dialog" aria-modal="true" aria-label="Pista ampliada"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              className="terminal max-w-2xl w-full overflow-hidden"
              style={{ borderColor: "var(--zona-competencia)", boxShadow: "0 0 40px rgba(75,231,255,.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div
                className="px-6 py-4 border-b flex items-start justify-between gap-4"
                style={{ borderColor: "rgba(75,231,255,.2)" }}
              >
                <div className="flex gap-3 items-start">
                  <span className="text-4xl">{TIPO_ICONS[pistaDescubiertaObj.tipo]}</span>
                  <div>
                    <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-competencia mb-0.5">
                      {pistaDescubiertaObj.tipo}
                    </div>
                    <h2 className="font-display-grave text-2xl text-doc-aged">
                      {pistaDescubiertaObj.titulo}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onCloseExpanded}
                  className="text-doc-aged/30 hover:text-doc-aged/70 text-xl transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Full content */}
                <div className="border-l-2 pl-4" style={{ borderColor: "rgba(75,231,255,.4)" }}>
                  <p className="font-serif-juridica text-doc-aged/90 text-base leading-relaxed">
                    {pistaDescubiertaObj.contenido}
                  </p>
                </div>

                {/* Articles */}
                <div>
                  <div className="text-[9px] font-mono-terminal uppercase tracking-widest text-zona-competencia mb-2">
                    Artículos citados
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pistaDescubiertaObj.articulos.map((art) => (
                      <span
                        key={art}
                        className="px-2 py-0.5 text-xs font-mono-terminal border"
                        style={{ borderColor: "rgba(75,231,255,.4)", color: "var(--zona-competencia)" }}
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connected clues */}
                {pistaDescubiertaObj.conectadoA && pistaDescubiertaObj.conectadoA.length > 0 && (
                  <div>
                    <div className="text-[9px] font-mono-terminal uppercase tracking-widest text-zona-recursos mb-2">
                      Conectada a
                    </div>
                    <div className="space-y-1">
                      {getPistasConectadas(caso, pistaDescubiertaObj.id).map((p) => (
                        <div key={p.id} className="text-xs text-doc-aged/60 flex gap-2 font-mono-terminal">
                          <span className="text-zona-recursos">→</span>
                          <span>{p.titulo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reveals */}
                <div
                  className="p-3"
                  style={{ background: "rgba(75,231,255,.04)", border: "1px solid rgba(75,231,255,.2)" }}
                >
                  <div className="text-[9px] font-mono-terminal uppercase tracking-widest text-zona-competencia mb-1">
                    Revela
                  </div>
                  <p className="text-xs text-doc-aged/70 italic font-mono-terminal">
                    {pistaDescubiertaObj.revelaSobre}
                  </p>
                </div>

                <button
                  onClick={onCloseExpanded}
                  onMouseEnter={() => sfx.hover()}
                  className="btn btn-cyan w-full"
                >
                  Volver al tablero
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
