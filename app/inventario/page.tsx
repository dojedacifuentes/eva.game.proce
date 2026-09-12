"use client";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { CAMPAÑA } from "@/data/campaign";
import GameShell from "@/components/shell/GameShell";
import GestorPartida from "@/components/shell/GestorPartida";

// ============================================================================
// INVENTARIO — Estado completo del litigante
// v3.0: visual actualizada al sistema actual
// ============================================================================

export default function Inventario() {
  const { personaje, expedientesArchivados, cautelares, incidentes, flags, logros, log, xp, nivel, monedas, misionesCompletadas } = useGame();

  const totalMisiones = CAMPAÑA.reduce((s, a) => s + a.misiones.length, 0);
  const progresoCampaña = Math.round((misionesCompletadas.length / totalMisiones) * 100);

  return (
    <GameShell variant="focus" eyebrow="Perfil" title="Expediente del litigante" back={{ href: "/juego", label: "Hub" }} scrollLabel="Expediente, logros y reliquias">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <div>
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-cautelares mb-1">
            INVENTARIO
          </div>
          <h1 className="font-display-grave text-3xl text-doc-aged">
            {personaje.nombre || "—"}
          </h1>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <GestorPartida />

        {/* ─── PERFIL ─── */}
        <div className="terminal p-4 space-y-3">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-3">
            PERFIL
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono-terminal">
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">Nivel</div>
              <div className="text-zona-cautelares font-display-grave text-lg">{nivel}</div>
            </div>
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">XP Total</div>
              <div className="text-zona-prueba">{xp} XP</div>
            </div>
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">Monedas</div>
              <div className="text-zona-competencia">🪙 {monedas}</div>
            </div>
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">Ciclo</div>
              <div className="text-doc-aged">#{personaje.cicloProcesal}</div>
            </div>
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">Rol</div>
              <div className="text-doc-aged capitalize">{personaje.rol?.replace(/_/g, " ")}</div>
            </div>
            <div>
              <div className="text-doc-aged/40 text-[8px] uppercase mb-0.5">Origen</div>
              <div className="text-doc-aged capitalize">{personaje.origen?.replace(/_/g, " ")}</div>
            </div>
          </div>

          {/* Win / Loss */}
          <div className="flex gap-4 pt-2 border-t border-doc-aged/10">
            <div>
              <div className="text-[8px] font-mono-terminal text-doc-aged/40 uppercase mb-0.5">Ganados</div>
              <div className="text-zona-cautelares font-display-grave text-xl">{personaje.expedientesGanados}</div>
            </div>
            <div>
              <div className="text-[8px] font-mono-terminal text-doc-aged/40 uppercase mb-0.5">Perdidos</div>
              <div className="text-zona-nulidad font-display-grave text-xl">{personaje.expedientesPerdidos}</div>
            </div>
          </div>
        </div>

        {/* ─── ATRIBUTOS ─── */}
        <div className="terminal p-4">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-3">
            ATRIBUTOS
          </div>
          <div className="space-y-2.5">
            {(Object.entries(personaje.atributos || {}) as [string, number][]).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-[9px] font-mono-terminal mb-1">
                  <span className="text-doc-aged/60 capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="text-zona-competencia">{v}/10</span>
                </div>
                <div className="h-1 bg-bg-steel rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${v * 10}%`, backgroundColor: "var(--zona-competencia)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CAMPAÑA PROGRESS ─── */}
        <div className="terminal p-4">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-3">
            PROGRESO CAMPAÑA
          </div>
          <div className="flex justify-between text-[9px] font-mono-terminal mb-2">
            <span className="text-doc-aged/60">{misionesCompletadas.length} / {totalMisiones} misiones</span>
            <span className="text-zona-prueba">{progresoCampaña}%</span>
          </div>
          <div className="h-2 bg-bg-steel rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progresoCampaña}%`,
                background: "linear-gradient(90deg, var(--zona-competencia), var(--zona-cautelares))",
              }}
            />
          </div>
          <div className="space-y-1">
            {CAMPAÑA.map((acto) => {
              const completadas = acto.misiones.filter(m => misionesCompletadas.includes(m.id)).length;
              const pct = Math.round((completadas / acto.misiones.length) * 100);
              return (
                <div key={acto.numero} className="flex items-center gap-2">
                  <span className="font-mono-terminal text-[8px] text-doc-aged/40 w-12 shrink-0">
                    Acto {acto.numero}
                  </span>
                  <div className="flex-1 h-0.5 bg-bg-steel rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "var(--zona-cautelares)" }}
                    />
                  </div>
                  <span className="font-mono-terminal text-[7px] text-doc-aged/30 shrink-0">{completadas}/{acto.misiones.length}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── LOGROS ─── */}
        <div className="terminal p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-cautelares">
              LOGROS
            </div>
            <span className="font-mono-terminal text-[8px] text-doc-aged/40">{logros.length} desbloqueados</span>
          </div>
          {logros.length === 0 ? (
            <p className="text-doc-aged/30 italic text-xs font-mono-terminal">Sin logros todavía. Completa misiones para desbloquear.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logros.map((l) => (
                <div key={l.id} className="flex items-start gap-2 border-b border-doc-aged/8 pb-2">
                  <span className="text-zona-cautelares text-[10px] mt-0.5">✓</span>
                  <div>
                    <div className="font-display-grave text-xs text-doc-aged">{l.titulo}</div>
                    <div className="font-mono-terminal text-[8px] text-doc-aged/40">{l.descripcion}</div>
                    {l.articulo && l.articulo !== "—" && (
                      <div className="font-mono-terminal text-[7px] text-zona-nulidad mt-0.5">{l.articulo}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── REPUTACIÓN + TRAUMA ─── */}
        <div className="terminal p-4">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-3">
            TELEMETRÍA PSICOLÓGICA
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[9px] font-mono-terminal mb-1">
                <span className="text-doc-aged/60">Reputación</span>
                <span className="text-zona-recursos">{personaje.reputacion} / 100</span>
              </div>
              <div className="h-1.5 bg-bg-steel rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(0, (personaje.reputacion + 100) / 2)}%`,
                    backgroundColor: "var(--zona-recursos)",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono-terminal mb-1">
                <span className="text-doc-aged/60">Trauma</span>
                <span className="text-zona-nulidad">{personaje.trauma} / 100</span>
              </div>
              <div className="h-1.5 bg-bg-steel rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${personaje.trauma}%`, backgroundColor: "var(--zona-nulidad)" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── EXPEDIENTES ARCHIVADOS ─── */}
        <div className="terminal p-4">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-ejecutivo mb-3">
            EXPEDIENTES ARCHIVADOS ({expedientesArchivados.length})
          </div>
          {expedientesArchivados.length === 0 ? (
            <p className="text-doc-aged/30 italic text-xs font-mono-terminal">Sin expedientes archivados.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {expedientesArchivados.map((e) => (
                <div key={e.id} className="flex items-center justify-between border-b border-doc-aged/8 pb-1.5">
                  <div>
                    <div className="font-mono-terminal text-xs text-doc-aged">{e.rol}</div>
                    <div className="font-mono-terminal text-[8px] text-doc-aged/40">{e.materia}</div>
                  </div>
                  <span
                    className="font-mono-terminal text-[9px] uppercase"
                    style={{ color: e.resultado === "ganado" ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}
                  >
                    {e.resultado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── BITÁCORA ─── */}
        <div className="terminal p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-competencia">
              BITÁCORA
            </div>
            <span className="font-mono-terminal text-[8px] text-doc-aged/40">{log.length} entradas</span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-0.5 text-[10px] font-mono-terminal">
            {log.slice(0, 50).map((l, i) => (
              <div key={i} className="flex items-start gap-2 text-doc-aged/50">
                <span className="text-zona-competencia shrink-0">›</span>
                <span className="leading-relaxed">{l.texto}</span>
                {l.tag && (
                  <span
                    className="shrink-0 text-[7px] px-1 border ml-auto"
                    style={{ borderColor: "rgba(75,231,255,.2)", color: "var(--zona-competencia)" }}
                  >
                    {l.tag}
                  </span>
                )}
              </div>
            ))}
            {log.length === 0 && (
              <div className="text-doc-aged/25 italic">La bitácora está en silencio.</div>
            )}
          </div>
        </div>

        {/* ─── FLAGS ACTIVOS ─── */}
        {flags.length > 0 && (
          <div className="terminal p-4 md:col-span-2">
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-nulidad mb-3">
              FLAGS ACTIVOS ({flags.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span
                  key={f}
                  className="font-mono-terminal text-[8px] px-2 py-0.5 border"
                  style={{ borderColor: "rgba(217,74,74,.3)", color: "var(--zona-nulidad)" }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </GameShell>
  );
}
