"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { npcsDeZona } from "@/data/npcs-v2";
import { getEventosInZona } from "@/data/eventos-mundo";

// ============================================================================
// ZONA CARD — v3 visual system
// Card de zona con NPCs y eventos. Usa CSS variables para colores.
// ============================================================================

interface ZonaCardProps {
  zonaId: string;
  zonaNombre: string;
  descripcion: string;
  href: string;
  emoji: string;
}

const EVENTO_TIPO_ICONS: Record<string, string> = {
  encuentro_npc: "👤",
  noticia_jurisprudencia: "📜",
  peligro_nulidad: "⚠️",
  oportunidad_caso: "💼",
  cambio_clima_juridico: "🌪️",
  conflicto_con_adversario: "⚔️",
  descubrimiento_doctrinal: "💡",
  crisis_economia: "📉",
};

export default function ZonaCard({
  zonaId,
  zonaNombre,
  descripcion,
  href,
  emoji,
}: ZonaCardProps) {
  const npcs = npcsDeZona(zonaId);
  const eventos = getEventosInZona(zonaId);
  const zonaColor = `var(--zona-${zonaId})`;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ type: "spring", damping: 18 }}
    >
      <Link
        href={href}
        className="block zona-card p-5 relative transition-all"
        style={{ "--zona-color": zonaColor } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            <div>
              <h3
                className="font-display-grave text-lg"
                style={{ color: zonaColor }}
              >
                {zonaNombre}
              </h3>
              <p
                className="text-[9px] font-mono-terminal uppercase tracking-widest text-doc-aged/40"
              >
                {zonaId.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-doc-aged/70 text-xs leading-relaxed mb-4 font-serif-juridica">
          {descripcion}
        </p>

        {/* NPCs */}
        {npcs.length > 0 && (
          <div className="mb-3 pb-3 border-b border-doc-aged/10">
            <div className="text-[9px] font-mono-terminal text-doc-aged/40 mb-1">
              👥 PERSONAJES ({npcs.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {npcs.map((npc) => (
                <span
                  key={npc.id}
                  className="text-[9px] font-mono-terminal px-2 py-0.5 border"
                  style={{
                    borderColor: `${zonaColor}40`,
                    color: `${zonaColor}cc`,
                    background: `${zonaColor}06`,
                  }}
                  title={npc.nombre}
                >
                  {npc.emoji} {npc.nombre.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {eventos.length > 0 && (
          <div className="pb-3">
            <div className="text-[9px] font-mono-terminal text-doc-aged/40 mb-1">
              📌 EVENTOS ({eventos.length})
            </div>
            <div className="space-y-1">
              {eventos.slice(0, 2).map((evento) => (
                <div
                  key={evento.id}
                  className="text-[10px] text-doc-aged/55 flex items-center gap-2 font-mono-terminal"
                >
                  <span>{EVENTO_TIPO_ICONS[evento.tipo] ?? "•"}</span>
                  <span className="line-clamp-1">{evento.titulo}</span>
                </div>
              ))}
              {eventos.length > 2 && (
                <div className="text-[9px] text-doc-aged/30 italic font-mono-terminal">
                  + {eventos.length - 2} más
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA footer */}
        <div
          className="mt-4 pt-3 border-t flex items-center justify-between"
          style={{ borderColor: `${zonaColor}20` }}
        >
          <span
            className="text-[9px] font-mono-terminal"
            style={{ color: `${zonaColor}80` }}
          >
            {npcs.length + eventos.length} encuentros posibles
          </span>
          <span
            className="text-sm font-display-grave"
            style={{ color: zonaColor }}
          >
            ▸
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
