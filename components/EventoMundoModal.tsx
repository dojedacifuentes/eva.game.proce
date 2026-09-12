"use client";
import { useState } from "react";
import type { EventoMundo } from "@/data/eventos-mundo";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import Modal from "@/components/shell/Modal";

interface EventoMundoModalProps {
  evento: EventoMundo;
  onCerrar: () => void;
}

export default function EventoMundoModal({ evento, onCerrar }: EventoMundoModalProps) {
  const game = useGame();
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [aplicado, setAplicado] = useState(false);

  // Valores CSS, no nombres de clase: `border-${x}` se construía en tiempo de
  // ejecución y Tailwind, que escanea el código de forma estática, nunca
  // generaba esas reglas. El borde y el título salían sin color.
  const TIPO_COLOR: Record<string, string> = {
    encuentro_npc: "var(--zona-competencia)",
    noticia_jurisprudencia: "var(--zona-notificaciones)",
    peligro_nulidad: "var(--zona-nulidad-txt)",
    oportunidad_caso: "var(--zona-cautelares)",
    cambio_clima_juridico: "var(--zona-recursos-txt)",
    conflicto_con_adversario: "var(--zona-nulidad-txt)",
    descubrimiento_doctrinal: "var(--zona-prueba)",
    crisis_economia: "var(--zona-ejecutivo-txt)",
  };

  const TIPO_ICONO: Record<string, string> = {
    encuentro_npc: "👤",
    noticia_jurisprudencia: "📜",
    peligro_nulidad: "⚠️",
    oportunidad_caso: "💼",
    cambio_clima_juridico: "🌪️",
    conflicto_con_adversario: "⚔️",
    descubrimiento_doctrinal: "💡",
    crisis_economia: "📉",
  };

  const acento = TIPO_COLOR[evento.tipo] || "var(--zona-competencia)";
  const icono = TIPO_ICONO[evento.tipo] || "📋";

  const aplicarEfectosBaseYOpcion = (opcionIdx?: number) => {
    // Aplicar efectos base del evento
    if (evento.efectos.reputacion) {
      game.ajustarReputacion(evento.efectos.reputacion);
    }
    if (evento.efectos.trauma) {
      game.ajustarTrauma(evento.efectos.trauma);
    }
    if (evento.efectos.nivelEconomico) {
      game.setPersonaje({
        ...game.personaje,
        nivelEconomico: Math.max(0, Math.min(100, game.personaje.nivelEconomico + evento.efectos.nivelEconomico)),
      });
    }
    if (evento.efectos.cicloProcesal) {
      game.setPersonaje({
        ...game.personaje,
        cicloProcesal: Math.max(1, game.personaje.cicloProcesal + evento.efectos.cicloProcesal),
      });
    }

    // Aplicar efectos extras de la opción
    if (opcionIdx !== undefined && evento.opciones && evento.opciones[opcionIdx]) {
      const opcion = evento.opciones[opcionIdx];
      if (opcion.efectoExtra?.reputacion) {
        game.ajustarReputacion(opcion.efectoExtra.reputacion);
      }
      if (opcion.efectoExtra?.trauma) {
        game.ajustarTrauma(opcion.efectoExtra.trauma);
      }
      if (opcion.efectoExtra?.nivelEconomico) {
        game.setPersonaje({
          ...game.personaje,
          nivelEconomico: Math.max(0, Math.min(100, game.personaje.nivelEconomico + opcion.efectoExtra.nivelEconomico)),
        });
      }
    }

    // Log evento
    game.pushLog(`📌 EVENTO: ${evento.titulo}`);
    game.pushLog(evento.descripcion);
    if (evento.efectos.reputacion) game.pushLog(`${evento.efectos.reputacion > 0 ? '+' : ''}${evento.efectos.reputacion} Reputación`);
    if (evento.efectos.trauma) game.pushLog(`${evento.efectos.trauma > 0 ? '+' : ''}${evento.efectos.trauma} Trauma`);

    sfx.warning?.();
    setAplicado(true);
  };

  return (
    <Modal
      titulo={evento.titulo}
      subtitulo={evento.tipo.replace(/_/g, " ")}
      acento={acento}
      retrato={<span aria-hidden="true" className="text-4xl">{icono}</span>}
      onCerrar={onCerrar}
      etiquetaCuerpo={`Evento: ${evento.titulo}`}
      ancho="xl"
      pie={aplicado ? <button type="button" onClick={onCerrar} className="btn btn-cautelar px-5 ml-auto">Continuar</button> : undefined}
    >
      <div className="space-y-3">
        <p className="t-cuerpo txt-normal font-serif-juridica leading-relaxed m-0">{evento.descripcion}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 t-meta font-mono-terminal">
          {evento.efectos.reputacion !== undefined && (
            <div className="p-2 border rounded" style={{ color: "var(--zona-cautelares)", borderColor: "color-mix(in srgb, var(--zona-cautelares) 45%, transparent)" }}>
              REP: {evento.efectos.reputacion > 0 ? "+" : ""}{evento.efectos.reputacion}
            </div>
          )}
          {evento.efectos.trauma !== undefined && (
            <div className="p-2 border rounded" style={{ color: "var(--zona-nulidad-txt)", borderColor: "rgba(217,74,74,0.45)" }}>
              TRM: {evento.efectos.trauma > 0 ? "+" : ""}{evento.efectos.trauma}
            </div>
          )}
          {evento.efectos.nivelEconomico !== undefined && (
            <div className="p-2 border rounded" style={{ color: "var(--zona-prueba)", borderColor: "rgba(215,180,106,0.45)" }}>
              ECO: {evento.efectos.nivelEconomico > 0 ? "+" : ""}{evento.efectos.nivelEconomico}
            </div>
          )}
          {evento.efectos.cicloProcesal !== undefined && (
            <div className="p-2 border rounded" style={{ color: "var(--zona-recursos-txt)", borderColor: "rgba(138,92,255,0.45)" }}>
              CIC: {evento.efectos.cicloProcesal > 0 ? "+" : ""}{evento.efectos.cicloProcesal}
            </div>
          )}
        </div>

        {/* Opciones: cada una con su consecuencia a la vista */}
        {!aplicado ? (
          evento.opciones && evento.opciones.length > 0 ? (
            <div className="space-y-2">
              <p className="t-etiqueta txt-suave m-0">Elige tu acción</p>
              {evento.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setOpcionSeleccionada(idx); aplicarEfectosBaseYOpcion(idx); }}
                  className="w-full text-left p-3 border rounded transition-all t-base txt-normal hover:brightness-125 min-h-[44px]"
                  style={{
                    borderColor: opcionSeleccionada === idx ? acento : "rgba(232,223,197,0.22)",
                    background: opcionSeleccionada === idx ? "color-mix(in srgb, " + acento + " 16%, transparent)" : "transparent",
                  }}
                >
                  {opcionSeleccionada === idx && <span aria-hidden="true" className="mr-2">✓</span>}
                  {opcion.texto}
                  {opcion.efectoExtra && (
                    <span className="block t-meta txt-suave mt-1 font-mono-terminal">
                      {opcion.efectoExtra.reputacion ? `${opcion.efectoExtra.reputacion > 0 ? "+" : ""}${opcion.efectoExtra.reputacion} Reputación ` : ""}
                      {opcion.efectoExtra.trauma ? `${opcion.efectoExtra.trauma > 0 ? "+" : ""}${opcion.efectoExtra.trauma} Trauma` : ""}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => aplicarEfectosBaseYOpcion()} className="btn btn-recurso w-full">
              Aceptar evento
            </button>
          )
        ) : (
          <div
            className="p-3 border rounded text-center t-base font-mono-terminal"
            style={{ color: "var(--zona-cautelares)", borderColor: "rgba(88,245,176,0.5)", background: "rgba(88,245,176,0.08)" }}
            role="status"
          >
            ✓ Evento procesado
          </div>
        )}
      </div>
    </Modal>
  );
}
