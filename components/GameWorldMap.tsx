"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGame } from "@/store/useGame";
import { CAMPAÑA } from "@/data/campaign";
import { useRouter } from "next/navigation";
import { sfx } from "@/lib/audio";
import { MapDefs, CityBackdrop, MapAtmosphere, EnergyConduit } from "./MapCity";

// ============================================================================
// GAME WORLD MAP — Mapa visual estilo Pokémon/Mario overworld
// ============================================================================

type ZoneNode = {
  id: string;
  acto: number;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  icono: string;
  tipo: "zona" | "boss" | "start";
};

const MAP_NODES: ZoneNode[] = [
  { id: "start",        acto: 0, label: "INICIO",         sublabel: "Ciudad Judicial",   x: 80,  y: 250, color: "#4BE7FF", icono: "⚖️",  tipo: "start" },
  { id: "jurisdiccion", acto: 1, label: "JURISDICCIÓN",   sublabel: "art. 76 CPR",        x: 180, y: 250, color: "#4BE7FF", icono: "🏛️",  tipo: "zona"  },
  { id: "competencia",  acto: 1, label: "COMPETENCIA",    sublabel: "arts. 45-133",       x: 290, y: 200, color: "#4BE7FF", icono: "⚖️",  tipo: "zona"  },
  { id: "boss_1",       acto: 1, label: "ESFINGE",        sublabel: "Boss Acto I",        x: 380, y: 200, color: "#4BE7FF", icono: "🗿",  tipo: "boss"  },
  { id: "emplazamiento",acto: 2, label: "EMPLAZAMIENTO",  sublabel: "arts. 40-54",        x: 460, y: 150, color: "#7AD4E6", icono: "📬",  tipo: "zona"  },
  { id: "notificaciones",acto:2, label: "NOTIFICACIÓN",   sublabel: "art. 44 CPC",        x: 540, y: 200, color: "#7AD4E6", icono: "📮",  tipo: "zona"  },
  { id: "boss_2",       acto: 2, label: "RECEPTOR",       sublabel: "Boss Acto II",       x: 600, y: 150, color: "#7AD4E6", icono: "👻",  tipo: "boss"  },
  { id: "prueba",       acto: 3, label: "PRUEBA",         sublabel: "arts. 341-427",      x: 420, y: 310, color: "#D7B46A", icono: "📜",  tipo: "zona"  },
  { id: "discusion",    acto: 3, label: "DISCUSIÓN",      sublabel: "arts. 254-318",      x: 340, y: 360, color: "#D7B46A", icono: "⚡",  tipo: "zona"  },
  { id: "boss_3",       acto: 3, label: "ORÁCULO",        sublabel: "Boss Acto III",      x: 500, y: 360, color: "#D7B46A", icono: "🔎",  tipo: "boss"  },
  { id: "sentencia",    acto: 4, label: "SENTENCIA",      sublabel: "art. 158 CPC",       x: 580, y: 300, color: "#F2F2F0", icono: "⚒️", tipo: "zona"  },
  { id: "boss_4",       acto: 4, label: "JUEZ HIERRO",    sublabel: "Boss Acto IV",       x: 660, y: 250, color: "#F2F2F0", icono: "🤖",  tipo: "boss"  },
  { id: "recursos",     acto: 5, label: "RECURSOS",       sublabel: "arts. 766-810",      x: 660, y: 350, color: "#8A5CFF", icono: "⚔️",  tipo: "zona"  },
  { id: "boss_5",       acto: 5, label: "CORTE GLITCH",   sublabel: "Boss Acto V",        x: 720, y: 300, color: "#8A5CFF", icono: "🌀", tipo: "boss"  },
  { id: "ejecutivo",    acto: 6, label: "EJECUTIVO",      sublabel: "arts. 434-478",      x: 700, y: 400, color: "#FF8A3D", icono: "💼",  tipo: "zona"  },
  { id: "boss_6",       acto: 6, label: "LEVIATÁN",       sublabel: "Boss Acto VI",       x: 750, y: 450, color: "#FF8A3D", icono: "🐉",  tipo: "boss"  },
  { id: "examen",       acto: 7, label: "EXAMEN",         sublabel: "GRADO",              x: 750, y: 350, color: "#FF4FCF", icono: "🎓",  tipo: "zona"  },
  { id: "boss_final",   acto: 7, label: "COMISIÓN",       sublabel: "Boss Final",         x: 760, y: 250, color: "#FF4FCF", icono: "👨‍⚖️", tipo: "boss" },
];

const MAP_PATHS = [
  ["start", "jurisdiccion"],
  ["jurisdiccion", "competencia"],
  ["competencia", "boss_1"],
  ["boss_1", "emplazamiento"],
  ["emplazamiento", "notificaciones"],
  ["notificaciones", "boss_2"],
  ["boss_1", "discusion"],
  ["discusion", "prueba"],
  ["prueba", "boss_3"],
  ["boss_2", "sentencia"],
  ["boss_3", "sentencia"],
  ["sentencia", "boss_4"],
  ["boss_4", "recursos"],
  ["recursos", "boss_5"],
  ["boss_4", "ejecutivo"],
  ["ejecutivo", "boss_6"],
  ["boss_5", "examen"],
  ["boss_6", "examen"],
  ["examen", "boss_final"],
];

// ─── Routing: qué módulo de /expansion abre cada zona ────────────────────────
// El ID debe coincidir con el type Modulo de expansion/page.tsx
const ZONE_MODULE: Record<string, string> = {
  jurisdiccion:   "arcade",
  competencia:    "inhibitoria",
  emplazamiento:  "comparecencia",
  notificaciones: "investigacion",
  prueba:         "duelo",
  discusion:      "timeline",
  sentencia:      "sentencia",
  recursos:       "ataque",
  ejecutivo:      "ejecutivo_full",
};

const ZONE_WORLD_ROUTE: Record<string, string> = {
  jurisdiccion: "/mundo/jurisdiccion",
  competencia: "/mundo/competencia",
  emplazamiento: "/mundo/emplazamiento",
  notificaciones: "/mundo/emplazamiento",
  prueba: "/mundo/prueba",
  discusion: "/mundo/discusion",
  sentencia: "/mundo/sentencia",
  recursos: "/mundo/recursos",
  ejecutivo: "/mundo/juicio_ejecutivo",
  examen: "/examen",
};

// ────────────────────────────────────────────
function MapNode({
  node,
  activo,
  completado,
  locked,
  onClick,
}: {
  node: ZoneNode;
  activo: boolean;
  completado: boolean;
  locked: boolean;
  onClick: (e: React.MouseEvent<SVGGElement>) => void;
}) {
  // El mapa era sólo para ratón: los <g> con onClick no recibían foco ni
  // respondían al teclado. Ahora cada nodo es un botón con nombre accesible.
  const isBoss = node.tipo === "boss";
  const size = node.tipo === "boss" ? 30 : node.tipo === "start" ? 24 : 26;
  const r = size / 2;
  const baseColor = locked ? "rgba(60,70,90,0.8)" : node.color;

  const labelW = node.label.length * 5.2 + 10;

  return (
    <motion.g
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          (onClick as unknown as (ev: unknown) => void)({
            stopPropagation: () => {},
          });
        }
      }}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked || undefined}
      aria-label={`${node.label}${node.sublabel ? `. ${node.sublabel}` : ""}${
        completado ? ". Completado" : ""
      }${locked ? ". Bloqueado" : ""}`}
      style={{ cursor: locked ? "not-allowed" : "pointer", outlineOffset: 4 }}
      whileHover={!locked ? { scale: 1.16 } : {}}
      whileTap={!locked ? { scale: 0.95 } : {}}
    >
      {/* footprint en el suelo */}
      <ellipse cx={node.x} cy={node.y + r + 3} rx={r * 0.95} ry={r * 0.3}
        fill={locked ? "rgba(0,0,0,0.45)" : `${node.color}22`} />

      {/* halo radial: el nodo irradia */}
      {!locked && (
        <circle cx={node.x} cy={node.y} r={r + 6} fill={node.color}
          opacity={isBoss ? 0.3 : 0.2} filter="url(#softGlow)" />
      )}

      {/* aura pulsante (boss / nodo activo) */}
      {(activo || isBoss) && !locked && (
        <motion.circle
          cx={node.x} cy={node.y} r={r + 6} fill="none" stroke={node.color} strokeWidth="1.3"
          animate={{ r: [r + 5, r + 13, r + 5], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: isBoss ? 1.8 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* haz vertical bajo el waypoint */}
      {!locked && (
        <rect x={node.x - 1} y={node.y} width={2} height={r + 11} fill={node.color} opacity="0.18" />
      )}

      {/* disco del waypoint */}
      <circle
        cx={node.x} cy={node.y} r={r}
        fill={locked ? "rgba(18,22,34,0.92)" : "rgba(8,12,20,0.93)"}
        stroke={baseColor} strokeWidth={activo ? 2.6 : 1.6}
        style={{ filter: !locked ? `drop-shadow(0 0 9px ${node.color}88)` : undefined }}
      />
      {/* anillo giratorio para boss */}
      {isBoss && !locked && (
        <circle cx={node.x} cy={node.y} r={r - 4} fill="none" stroke={`${node.color}66`} strokeWidth="0.75" strokeDasharray="2 3">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="9s" repeatCount="indefinite" />
        </circle>
      )}

      {completado && (
        <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="14" fill="#58F5B0">✓</text>
      )}
      {locked && (
        <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.3)">🔒</text>
      )}
      {!completado && !locked && (
        <text x={node.x} y={node.y + (isBoss ? 6 : 5)} textAnchor="middle" fontSize={isBoss ? 18 : 14}>{node.icono}</text>
      )}

      {/* etiqueta holográfica */}
      {!locked && (
        <g>
          <rect x={node.x - labelW / 2} y={node.y + r + 6} width={labelW} height={11}
            rx="2" fill="rgba(6,10,18,0.74)" stroke={`${node.color}40`} strokeWidth="0.5" />
          <text x={node.x} y={node.y + r + 14} textAnchor="middle" fontSize="8"
            fontFamily="JetBrains Mono, monospace" fill={node.color} letterSpacing="1">
            {node.label}
          </text>
          <text x={node.x} y={node.y + r + 24} textAnchor="middle" fontSize="6.5"
            fontFamily="JetBrains Mono, monospace" fill="rgba(232,223,197,0.5)">
            {node.sublabel}
          </text>
        </g>
      )}
    </motion.g>
  );
}

// ────────────────────────────────────────────
// Panel de detalle del nodo seleccionado
// ────────────────────────────────────────────
const TIPO_MISION_ICON: Record<string, string> = {
  investigacion: "🔍",
  arcade:        "🎮",
  boss:          "⚔️",
  npc:           "🧑‍⚖️",
  puzzle:        "🧩",
  dialogo:       "💬",
  examen:        "📋",
  ejecutivo:     "💼",
};

function NodeDetailPanel({
  node,
  misionesCompletadas,
  onClose,
  onNavigate,
}: {
  node: ZoneNode;
  misionesCompletadas: string[];
  onClose: () => void;
  onNavigate: (url: string) => void;
}) {
  const acto = CAMPAÑA.find((a) => a.numero === node.acto);
  const misiones = acto?.misiones ?? [];
  const isBoss = node.tipo === "boss";
  const bossId = acto?.bossId;

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="mt-4 terminal p-4 border"
      style={{ borderColor: `${node.color}40` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl shrink-0">{node.icono}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono-terminal text-[8px] uppercase tracking-widest" style={{ color: node.color }}>
              {isBoss ? "⚔ BOSS" : "🗺 ZONA"} · ACTO {node.acto}
            </span>
          </div>
          <h3 className="font-display-grave text-lg text-doc-aged leading-tight">{node.label}</h3>
          <p className="font-mono-terminal text-[9px] text-doc-aged/40">{node.sublabel}</p>
        </div>
        <button
          onClick={onClose}
          className="text-doc-aged/30 hover:text-doc-aged/70 font-mono-terminal text-xs shrink-0"
        >
          ✕
        </button>
      </div>

      {/* BOSS: botón directo */}
      {isBoss && (
        <button
          onClick={() => { sfx.click?.(); onNavigate(bossId ? `/boss/${bossId}` : "/oral"); }}
          onMouseEnter={() => sfx.hover?.()}
          className="w-full py-2.5 font-display-grave text-sm border transition-all hover:brightness-125"
          style={{
            borderColor: node.color,
            color: node.color,
            background: `${node.color}10`,
            boxShadow: `0 0 16px ${node.color}20`,
          }}
        >
          ⚔ COMBATIR BOSS DE CAMPAÑA
        </button>
      )}

      {/* ZONA: lista de misiones del acto */}
      {!isBoss && node.tipo !== "start" && (
        <div className="space-y-1.5">
          <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/40 mb-2">
            MISIONES DEL ACTO
          </div>
          {misiones.length === 0 ? (
            <p className="font-mono-terminal text-[9px] text-doc-aged/30">Sin misiones registradas.</p>
          ) : (
            misiones.map((mision) => {
              const done = misionesCompletadas.includes(mision.id);
              const url = `/mision/${mision.id}`;

              return (
                <div
                  key={mision.id}
                  className="flex items-center gap-2 p-2 border rounded transition-all"
                  style={{
                    borderColor: done ? "rgba(88,245,176,0.25)" : `${node.color}20`,
                    background: done ? "rgba(88,245,176,0.03)" : "transparent",
                  }}
                >
                  <span className="text-sm shrink-0">
                    {TIPO_MISION_ICON[mision.tipo] ?? "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display-grave text-xs text-doc-aged truncate">{mision.titulo}</div>
                    <div className="font-mono-terminal text-[8px] text-doc-aged/40 truncate">{mision.descripcion}</div>
                    <div className="font-mono-terminal text-[7px] mt-0.5" style={{ color: node.color }}>
                      +{mision.recompensa.xp} XP · 🪙{mision.recompensa.monedas}
                      {mision.recompensa.articulo && ` · ${mision.recompensa.articulo}`}
                    </div>
                  </div>
                  {done ? (
                    <span className="text-[10px] text-zona-cautelares shrink-0">✓</span>
                  ) : url ? (
                    <button
                      onClick={() => { sfx.click?.(); onNavigate(url); }}
                      onMouseEnter={() => sfx.hover?.()}
                      className="shrink-0 text-[9px] font-mono-terminal px-2 py-1 border transition-all hover:brightness-125"
                      style={{ borderColor: `${node.color}50`, color: node.color }}
                    >
                      JUGAR
                    </button>
                  ) : (
                    <span className="text-[8px] text-doc-aged/20 shrink-0 font-mono-terminal">—</span>
                  )}
                </div>
              );
            })
          )}

          {/* Botón directo al módulo principal de la zona */}
          {(ZONE_WORLD_ROUTE[node.id] || ZONE_MODULE[node.id]) && (
            <button
              onClick={() => { sfx.click?.(); onNavigate(ZONE_WORLD_ROUTE[node.id] ?? `/expansion?m=${ZONE_MODULE[node.id]}`); }}
              onMouseEnter={() => sfx.hover?.()}
              className="w-full py-2 mt-2 font-mono-terminal text-[9px] uppercase tracking-wider border transition-all hover:brightness-125"
              style={{ borderColor: `${node.color}30`, color: `${node.color}90` }}
            >
              ▶ Explorar zona completa →
            </button>
          )}
        </div>
      )}

      {/* START node */}
      {node.tipo === "start" && (
        <div className="space-y-3">
          <p className="font-serif-juridica text-doc-aged/60 text-xs italic">
            Ciudad Judicial. El punto de partida de todo proceso.
          </p>
          <button
            onClick={() => { sfx.click?.(); onNavigate("/mundo"); }}
            onMouseEnter={() => sfx.hover?.()}
            className="w-full py-2.5 font-mono-terminal text-[10px] uppercase tracking-wider border transition-all hover:brightness-125"
            style={{ borderColor: "#4BE7FF50", color: "#4BE7FF", background: "#4BE7FF10" }}
          >
            ▶ Explorar zonas vivas
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ────────────────────────────────────────────
// Panel de nodo bloqueado
// ────────────────────────────────────────────
function LockedPanel({
  node,
  actoActual,
  onClose,
}: {
  node: ZoneNode;
  actoActual: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      key={`locked-${node.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="mt-4 terminal p-4 border border-dashed border-doc-aged/20"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <h3 className="font-display-grave text-base text-doc-aged/50">{node.label}</h3>
          <p className="font-mono-terminal text-[9px] text-doc-aged/30 mt-0.5">
            ACTO {node.acto} · Desbloqueado en Acto {actoActual + 1} o superior
          </p>
          <p className="font-mono-terminal text-[8px] text-doc-aged/20 mt-1">
            Completa las misiones de los actos anteriores para acceder.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-doc-aged/20 hover:text-doc-aged/50 font-mono-terminal text-xs"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Componente principal
// ============================================================================
export default function GameWorldMap({ compacto = false }: { compacto?: boolean } = {}) {
  const [selectedNode, setSelectedNode] = useState<ZoneNode | null>(null);
  const [lockedNode, setLockedNode] = useState<ZoneNode | null>(null);
  const misionesCompletadas = useGame((s) => s.misionesCompletadas);
  const router = useRouter();

  // ── Parallax de puntero (capas de ciudad) ────────────────────────────────
  const svgRef = useRef<SVGSVGElement>(null);
  const pmx = useMotionValue(0);
  const pmy = useMotionValue(0);
  const sx = useSpring(pmx, { stiffness: 60, damping: 18 });
  const sy = useSpring(pmy, { stiffness: 60, damping: 18 });
  const farX = useTransform(sx, (v) => v * 12);
  const farY = useTransform(sy, (v) => v * 7);
  const fgX = useTransform(sx, (v) => v * -30);
  const fgY = useTransform(sy, (v) => v * -16);
  const onMapMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    pmx.set((e.clientX - rect.left) / rect.width - 0.5);
    pmy.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMapLeave = () => { pmx.set(0); pmy.set(0); };

  // Acto actual: primer acto que aún tiene misiones sin completar
  const actoActual = (() => {
    for (const acto of CAMPAÑA) {
      const completadas = acto.misiones.filter((m) => misionesCompletadas.includes(m.id)).length;
      if (completadas < acto.misiones.length) return acto.numero;
    }
    return CAMPAÑA.length;
  })();

  const isCompletado = useCallback((nodeId: string) => {
    const node = MAP_NODES.find((n) => n.id === nodeId);
    if (!node || node.acto === 0) return false;
    const acto = CAMPAÑA.find((a) => a.numero === node.acto);
    if (!acto) return false;
    return acto.misiones.every((m) => misionesCompletadas.includes(m.id));
  }, [misionesCompletadas]);

  // Todos los nodos son accesibles — cualquier zona puede estudiarse libremente
  const isLocked = useCallback((_node: ZoneNode) => {
    return false;
  }, []);

  const getNodeById = (id: string) => MAP_NODES.find((n) => n.id === id);

  const getPathD = (fromId: string, toId: string) => {
    const from = getNodeById(fromId);
    const to = getNodeById(toId);
    if (!from || !to) return "";
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 20;
    return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
  };

  // ── Handlers con stopPropagation ─────────────────────────────────────────
  const handleCampaignNodeClick = (e: React.MouseEvent<SVGGElement>, node: ZoneNode) => {
    e.stopPropagation();
    sfx.click?.();

    if (isLocked(node)) {
      setSelectedNode(null);
      setLockedNode(node);
      return;
    }

    setLockedNode(null);
    setSelectedNode(node);
  };

  const handleNavigate = (url: string) => {
    router.push(url);
  };

  return (
    // En modo compacto el mapa llena el alto que le deja el shell y el panel de
    // detalle se dibuja en capa sobre él, en vez de empujar el documento hacia
    // abajo como hacía antes (`mt-4` debajo del SVG).
    <div
      className={compacto ? "relative w-full flex-1 min-h-0 flex flex-col" : "relative w-full"}
      onClick={(e) => e.stopPropagation()}
    >
      {/* MAPA — Ciudad Judicial cyberpunk */}
      <div
        className={`relative w-full rounded-lg overflow-hidden ${compacto ? "flex-1 min-h-0" : ""}`}
        onMouseMove={onMapMove}
        onMouseLeave={onMapLeave}
        style={{ border: "1px solid rgba(75,231,255,0.14)", boxShadow: "inset 0 0 70px rgba(4,7,14,0.9), 0 0 26px rgba(75,231,255,0.06)" }}
      >
        <svg
          ref={svgRef}
          viewBox="30 100 780 380"
          className="w-full block"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Mapa de la Ciudad Judicial. Cada distrito abre sus misiones."
          style={compacto ? { height: "100%", minHeight: 180 } : { minHeight: 320, maxHeight: 500 }}
        >
          <MapDefs />

          {/* Capa lejana: skyline + megaestructura (parallax lento) */}
          <motion.g style={{ x: farX, y: farY }}>
            <CityBackdrop />
          </motion.g>

          {/* Distritos: plataformas de neón por acto */}
          {[1, 2, 3, 4, 5, 6, 7].map((acto) => {
            const nodes = MAP_NODES.filter((n) => n.acto === acto);
            if (nodes.length === 0) return null;
            const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
            const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
            const color = nodes[0].color;
            return (
              <g key={acto}>
                <ellipse cx={cx} cy={cy} rx={80} ry={30} fill={`${color}0c`} stroke={`${color}22`} strokeWidth="1" />
                <ellipse cx={cx} cy={cy} rx={80} ry={30} fill="none" stroke={`${color}10`} strokeWidth="6" />
              </g>
            );
          })}

          {/* Conductos de energía entre nodos */}
          {MAP_PATHS.map(([from, to], i) => {
            const fromNode = getNodeById(from);
            const toNode = getNodeById(to);
            if (!fromNode || !toNode) return null;
            return <EnergyConduit key={i} d={getPathD(from, to)} color={fromNode.color} dim={isLocked(toNode)} />;
          })}

          {/* Nodos (waypoints) */}
          {MAP_NODES.map((node) => (
            <MapNode
              key={node.id}
              node={node}
              activo={selectedNode?.id === node.id}
              completado={isCompletado(node.id)}
              locked={isLocked(node)}
              onClick={(e) => handleCampaignNodeClick(e, node)}
            />
          ))}

          {/* Atmósfera de primer plano: lluvia digital + artículos (parallax rápido) */}
          <motion.g style={{ x: fgX, y: fgY }}>
            <MapAtmosphere />
          </motion.g>
        </svg>
      </div>

      {/* Detail / Locked panels */}
      <div
        className={
          compacto
            ? "absolute inset-x-0 bottom-0 z-20 max-h-[70%] shell-scroll rounded-b-lg"
            : ""
        }
      >
      <AnimatePresence mode="wait">
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            misionesCompletadas={misionesCompletadas}
            onClose={() => setSelectedNode(null)}
            onNavigate={handleNavigate}
          />
        )}
        {!selectedNode && lockedNode && (
          <LockedPanel
            node={lockedNode}
            actoActual={actoActual}
            onClose={() => setLockedNode(null)}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
