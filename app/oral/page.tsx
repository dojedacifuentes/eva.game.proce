"use client";
import Link from "next/link";
import { useState } from "react";
import { BOSSES } from "@/data/bosses";
import { BOSSES_EXTRA } from "@/data/bosses-extra";
const TODOS_BOSSES = [...BOSSES, ...BOSSES_EXTRA];
import type { BossId, Boss as OralBoss } from "@/types/expansion";
import InterrogacionOral from "@/components/InterrogacionOral";
import { AvatarBoss } from "@/components/AvataresJuridicos";
import { useGame } from "@/store/useGame";
import { isBossUnlocked, getBossGate } from "@/lib/unlock-gates";
import { motion } from "framer-motion";
import BossEntry from "@/components/BossEntry";
import type { Boss as CampaignBoss } from "@/data/campaign";
import GameShell from "@/components/shell/GameShell";

// ─────────────────────────────────────────────────────────────────────────────
// Adaptador: convierte un OralBoss al formato esperado por BossEntry
// ─────────────────────────────────────────────────────────────────────────────
const RAMA_COLORS: Record<string, string> = {
  recursos: "var(--zona-recursos)",
  notificaciones: "var(--zona-notificaciones, #7AD4E6)",
  competencia: "var(--zona-competencia)",
  prueba: "var(--zona-prueba)",
  ejecucion: "var(--zona-ejecutivo, #FF8A3D)",
  cautelares: "var(--zona-cautelares)",
  nulidad: "var(--zona-nulidad)",
};

const RAMA_ICONS: Record<string, string> = {
  recursos: "⚔️",
  notificaciones: "📬",
  competencia: "🏛️",
  prueba: "📜",
  ejecucion: "💼",
  cautelares: "🛡️",
  nulidad: "💀",
};

function adaptarBoss(b: OralBoss): CampaignBoss {
  return {
    id: b.id,
    nombre: b.nombre,
    titulo: b.arquetipo.slice(0, 80), // primera línea del arquetipo como subtítulo
    articulo: b.ataques[0]?.articuloEsperado
      ? `Art. ${b.ataques[0].articuloEsperado} CPC`
      : "CPC",
    descripcion: b.descripcion,
    icono: RAMA_ICONS[b.rama] ?? "⚖️",
    color: RAMA_COLORS[b.rama] ?? "var(--zona-oralidad)",
    vidaMax: b.saludInicial,
    ataques: b.ataques.slice(0, 3).map((a) => a.pregunta.slice(0, 80)),
    debilidad: b.derrotadoOtorga,
    recompensa: { xp: 150, monedas: 40, skill: `Derrotar ${b.nombre}` },
    href: "/oral",
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OralPage() {
  const game = useGame();
  const [bossActivo, setBossActivo] = useState<BossId | null>(null);
  const [showEntry, setShowEntry] = useState<BossId | null>(null);
  const derrotados = game.logros
    .filter((l) => l.id.startsWith("boss_"))
    .map((l) => l.id.replace("boss_", ""));
  const logrosIds = game.logros.map((l) => l.id);
  const nivel = game.nivel;

  // ── Estado 1: Entrada cinemática del boss ──
  if (showEntry) {
    const bossData = TODOS_BOSSES.find((b) => b.id === showEntry);
    if (bossData) {
      return (
        <BossEntry
          boss={adaptarBoss(bossData)}
          onStart={() => {
            setBossActivo(showEntry);
            setShowEntry(null);
          }}
          onCancel={() => setShowEntry(null)}
        />
      );
    }
  }

  // ── Estado 2: Combate activo ──
  if (bossActivo) {
    return (
      <GameShell variant="focus" eyebrow="Combate" title="Interrogatorio oral" back={{ href: "/juego", label: "Hub" }} scrollLabel="Interrogatorio">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex justify-between mb-4">
          <button className="btn btn-danger" onClick={() => setBossActivo(null)}>
            ◂ Retirarse
          </button>
          <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-oralidad animate-flicker">
            ANFITEATRO TRIBUNALICIO · TRANSMISIÓN ACTIVA
          </div>
        </div>
        <InterrogacionOral bossId={bossActivo} onFin={() => setBossActivo(null)} />
      </div>
    </GameShell>
    );
  }

  // ── Estado 3: Menú de bosses ──
  return (
    <GameShell variant="focus" eyebrow="Combate" title="Interrogatorio oral" back={{ href: "/juego", label: "Hub" }} scrollLabel="Interrogatorio">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <Link href="/juego" className="btn">◂ Ciudad Judicial</Link>
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-oralidad">
          COMISIÓN EXAMINADORA · {TODOS_BOSSES.length} INSTANCIAS
        </div>
      </header>

      <div className="mb-10">
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.4em] text-zona-recursos mb-3">
          ANFITEATRO JUDICIAL CYBERPUNK
        </div>
        <h1 className="font-display-grave text-4xl md:text-5xl text-doc-aged mb-3 glitch-text-oral">
          La Comisión te espera
        </h1>
        <p className="text-doc-aged/60 text-sm font-mono-terminal max-w-2xl">
          Seis arquetipos del examen de grado chileno. Cada uno ataca con cadenas:
          <span className="text-zona-recursos"> pregunta directa</span> →
          <span className="text-zona-prueba"> repregunta</span> →
          <span className="text-zona-nulidad"> trampa</span> →
          <span className="text-zona-cautelares"> derivación</span>.
          <br />Aciertos dañan al boss. Fallos consumen tu salud mental.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {TODOS_BOSSES.map((b, i) => {
          const vencido = derrotados.includes(b.id);
          const ramaColor = RAMA_COLORS[b.rama] ?? "var(--zona-oralidad)";
          const unlocked = isBossUnlocked(b.id, nivel, logrosIds);
          const gate = !unlocked ? getBossGate(b.id) : null;

          if (!unlocked) {
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="zona-card p-4 text-left overflow-hidden cursor-not-allowed"
                style={{ "--zona-color": "rgba(60,60,80,.4)", borderColor: "rgba(60,60,80,.2)", opacity: 0.45 } as React.CSSProperties}
              >
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-[90px] h-[90px] flex items-center justify-center border border-doc-aged/10 text-3xl">
                    🔒
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono-terminal text-[8px] text-doc-aged/30 uppercase tracking-widest mb-2">
                      INSTANCIA BLOQUEADA
                    </div>
                    <h3 className="font-display-grave text-lg text-doc-aged/30 mb-2">???</h3>
                    <p className="text-doc-aged/30 text-[10px] font-mono-terminal leading-relaxed">
                      {gate?.label ?? "Requiere progresión"}
                    </p>
                    {gate?.hint && (
                      <p className="text-doc-aged/20 text-[9px] font-serif-juridica italic mt-1">
                        {gate.hint}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setShowEntry(b.id as BossId)}
              className="zona-card p-4 text-left transition-all overflow-hidden hover:brightness-110"
              style={{ "--zona-color": ramaColor } as React.CSSProperties}
            >
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <AvatarBoss bossId={b.id} size={90} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="tag tag-oralidad text-[9px]">{b.rama}</span>
                    {vencido && (
                      <span className="tag tag-cautelar text-[9px]">★ VENCIDO</span>
                    )}
                  </div>
                  <h3 className="font-display-grave text-lg text-doc-aged tracking-wider leading-tight mb-2">
                    {b.nombre}
                  </h3>
                  <p className="text-doc-aged/60 text-[11px] font-serif-juridica italic line-clamp-3">
                    {b.arquetipo}
                  </p>
                  <div className="flex gap-2 mt-3 text-[9px] font-mono-terminal">
                    <span className="text-zona-nulidad">♥ {b.saludInicial}</span>
                    <span className="text-zona-competencia">◇ {b.saludJugador}</span>
                    <span className="text-zona-recursos">{b.ataques.length} ataques</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="terminal p-5">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-mono-terminal text-[10px] uppercase tracking-widest text-zona-recursos">
              Progreso comisión
            </div>
            <div className="font-display-grave text-2xl text-doc-aged">
              {derrotados.length}{" "}
              <span className="text-doc-aged/40">/ {TODOS_BOSSES.length}</span>
            </div>
          </div>
          {derrotados.length >= BOSSES.length && (
            <div className="text-zona-oralidad text-sm font-display-grave glitch-text-oral animate-flicker">
              ★ COMISIÓN VENCIDA · MODO PESADILLA DESBLOQUEADO
            </div>
          )}
        </div>
        <div className="h-1 bg-bg-deep border border-bg-steel mt-2">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${(derrotados.length / TODOS_BOSSES.length) * 100}%`,
              background: "var(--zona-oralidad)",
            }}
          />
        </div>
      </div>
    </div>
    </GameShell>
  );
}
