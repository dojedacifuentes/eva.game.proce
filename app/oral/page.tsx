"use client";
import { useState, type CSSProperties } from "react";
import { BOSSES } from "@/data/bosses";
import { BOSSES_EXTRA } from "@/data/bosses-extra";
import type { BossId, Boss as OralBoss } from "@/types/expansion";
import InterrogacionOral from "@/components/InterrogacionOral";
import { AvatarBoss } from "@/components/AvataresJuridicos";
import { useGame } from "@/store/useGame";
import { isBossUnlocked, getBossGate } from "@/lib/unlock-gates";
import BossEntry from "@/components/BossEntry";
import type { Boss as CampaignBoss } from "@/data/campaign";
import GameShell from "@/components/shell/GameShell";
import { sfx } from "@/lib/audio";

const TODOS_BOSSES = [...BOSSES, ...BOSSES_EXTRA];

// ─────────────────────────────────────────────────────────────────────────────
// Adaptador: convierte un OralBoss al formato esperado por BossEntry
// ─────────────────────────────────────────────────────────────────────────────
const RAMA_COLORS: Record<string, string> = {
  recursos: "#A98CFF",
  notificaciones: "#7AD4E6",
  competencia: "#4BE7FF",
  prueba: "#D7B46A",
  ejecucion: "#FF8A3D",
  cautelares: "#58F5B0",
  nulidad: "#F08585",
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
    titulo: b.arquetipo.slice(0, 80),
    articulo: b.ataques[0]?.articuloEsperado ? `Art. ${b.ataques[0].articuloEsperado} CPC` : "CPC",
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

// ============================================================================
// ORAL — la comisión examinadora.
//
// v4: la parrilla de tarjetas con retratos de 90 px y el titular de 48 px
// pasan a una lista de filas; el combate usa el botón de volver de la cabecera
// (antes había un «Retirarse» y un rótulo parpadeante encima del combate).
// ============================================================================

export default function OralPage() {
  const game = useGame();
  const [bossActivo, setBossActivo] = useState<BossId | null>(null);
  const [showEntry, setShowEntry] = useState<BossId | null>(null);
  const derrotados = game.logros.filter((l) => l.id.startsWith("boss_")).map((l) => l.id.replace("boss_", ""));
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
    const b = TODOS_BOSSES.find((x) => x.id === bossActivo);
    return (
      <GameShell
        variant="focus"
        eyebrow="Interrogatorio oral"
        title={b?.nombre ?? "Combate"}
        back={{ onClick: () => setBossActivo(null), label: "Comisión" }}
        scrollLabel="Interrogatorio"
        scrollKey={bossActivo}
      >
        <div className="max-w-3xl w-full mx-auto">
          <InterrogacionOral bossId={bossActivo} onFin={() => setBossActivo(null)} />
        </div>
      </GameShell>
    );
  }

  // ── Estado 3: Lista de la comisión ──
  const pct = (derrotados.length / TODOS_BOSSES.length) * 100;

  return (
    <GameShell variant="focus" eyebrow="Combate" title="La Comisión te espera" back={{ href: "/juego", label: "Mapa" }} scrollLabel="Lista de examinadores">
      <div className="max-w-6xl w-full mx-auto pt-2 pb-4 space-y-3">
        <section className="tarjeta p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="rotulo" style={{ color: "#FF85DC" }}>Progreso de la comisión</div>
            <div className="font-datos t-base txt-fuerte">
              {derrotados.length}<span className="txt-suave"> / {TODOS_BOSSES.length}</span>
            </div>
          </div>
          <div className="medidor mt-2" aria-hidden="true">
            <span style={{ width: `${pct}%`, background: "#FF4FCF" }} />
          </div>
          <p className="t-meta txt-suave mt-2 mb-0">
            Cada examinador ataca en cadena: pregunta directa → repregunta → trampa → derivación. Los aciertos le
            restan vida; los errores, salud mental.
          </p>
          {derrotados.length >= BOSSES.length && (
            <p className="t-meta font-semibold mt-2 mb-0" style={{ color: "#FF85DC" }}>
              ★ Comisión vencida · modo pesadilla desbloqueado
            </p>
          )}
        </section>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {TODOS_BOSSES.map((b) => {
            const vencido = derrotados.includes(b.id);
            const color = RAMA_COLORS[b.rama] ?? "#FF85DC";
            const unlocked = isBossUnlocked(b.id, nivel, logrosIds);
            const gate = !unlocked ? getBossGate(b.id) : null;

            if (!unlocked) {
              return (
                <div key={b.id} className="fila" style={{ "--acento": "#5A6478", opacity: 0.85 } as CSSProperties} aria-disabled="true">
                  <span className="fila-icono" aria-hidden="true">🔒</span>
                  <span className="fila-texto">
                    <span className="fila-titulo">Instancia bloqueada</span>
                    <span className="fila-sub">{gate?.label ?? "Requiere progresión"}</span>
                    {gate?.hint && <span className="fila-meta">{gate.hint}</span>}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => { sfx.confirm?.(); setShowEntry(b.id as BossId); }}
                className="fila"
                style={{ "--acento": color } as CSSProperties}
              >
                <span
                  className="shrink-0 w-14 h-14 rounded-xl overflow-hidden grid place-items-center"
                  style={{ background: "#111723", border: `1px solid ${color}66` }}
                  aria-hidden="true"
                >
                  <AvatarBoss bossId={b.id as BossId} size={56} />
                </span>
                <span className="fila-texto">
                  <span className="fila-titulo">{b.nombre}</span>
                  <span className="fila-sub" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {b.arquetipo}
                  </span>
                  <span className="fila-meta">
                    {b.rama} · ♥ {b.saludInicial} · {b.ataques.length} ataques{vencido ? " · ★ vencido" : ""}
                  </span>
                </span>
                <span className="fila-chevron" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
