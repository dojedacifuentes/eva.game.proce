"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { useGame } from "@/store/useGame";
import { CAMPAÑA } from "@/data/campaign";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";
import GestorPartida from "@/components/shell/GestorPartida";
import { colorActo } from "@/components/MapaFlujo";

// ============================================================================
// PERFIL — expediente del litigante.
//
// v4: ocho paneles apilados (en el teléfono, cuatro o cinco pantallazos) pasan
// a una ficha fija con nivel, experiencia y monedas, y cuatro pestañas cortas.
// ============================================================================

const PESTAÑAS = [
  { id: "resumen", nombre: "Resumen" },
  { id: "logros", nombre: "Logros" },
  { id: "bitacora", nombre: "Bitácora" },
  { id: "respaldo", nombre: "Respaldo" },
] as const;
type Pestaña = (typeof PESTAÑAS)[number]["id"];

const CLAVE = "foro-invisible:perfil-pestana";

export default function Inventario() {
  const { personaje, expedientesArchivados, flags, logros, log, xp, nivel, monedas, misionesCompletadas } = useGame();
  const [pestaña, setPestaña] = useState<Pestaña>("resumen");

  useEffect(() => {
    try {
      const t = localStorage.getItem(CLAVE);
      if (PESTAÑAS.some((p) => p.id === t)) setPestaña(t as Pestaña);
    } catch { /* sin almacenamiento */ }
  }, []);

  const elegir = (id: Pestaña) => {
    sfx.click?.();
    setPestaña(id);
    try { localStorage.setItem(CLAVE, id); } catch { /* sin almacenamiento */ }
  };

  const totalMisiones = CAMPAÑA.reduce((s, a) => s + a.misiones.length, 0);
  const progresoCampaña = Math.round((misionesCompletadas.length / totalMisiones) * 100);
  const xpEnNivel = xp % 100;

  return (
    <GameShell variant="focus" eyebrow="Perfil" title="Expediente del litigante" scrollLabel="Expediente, logros y respaldo" scrollKey={pestaña}>
      <div className="max-w-4xl w-full mx-auto pb-4">
        {/* ── Ficha: siempre visible ── */}
        <div className="hud-fijo space-y-2.5">
          <div className="flex items-center gap-3">
            <span className="fila-icono" style={{ "--acento": "#58F5B0" } as CSSProperties} aria-hidden="true">⚖️</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[19px] font-bold txt-fuerte leading-tight truncate m-0">{personaje.nombre || "Sin personaje"}</h2>
              <div className="t-meta txt-suave capitalize truncate">
                {personaje.rol?.replace(/_/g, " ")} · {personaje.origen?.replace(/_/g, " ")}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[18px] font-extrabold" style={{ color: "#58F5B0" }}>Nv {nivel}</div>
              <div className="t-meta font-semibold" style={{ color: "#E3C27E" }}>🪙 {monedas}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="medidor flex-1" role="progressbar" aria-label={`Experiencia hacia el nivel ${nivel + 1}`} aria-valuenow={xpEnNivel} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${xpEnNivel}%`, background: "#58F5B0" }} />
            </div>
            <span className="font-datos t-micro txt-normal shrink-0">{xp} XP</span>
          </div>
          <div className="segmentado" role="tablist" aria-label="Secciones del perfil">
            {PESTAÑAS.map((p) => (
              <button key={p.id} type="button" role="tab" aria-selected={pestaña === p.id} aria-controls="panel-perfil" onClick={() => elegir(p.id)}>
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        <div id="panel-perfil" role="tabpanel" className="pt-3 space-y-3">
          {pestaña === "resumen" && (
            <>
              <section className="tarjeta p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="rotulo m-0" style={{ color: "#4BE7FF" }}>Campaña</h3>
                  <span className="font-datos t-meta txt-normal">{misionesCompletadas.length}/{totalMisiones} · {progresoCampaña}%</span>
                </div>
                <div className="medidor mt-2" aria-hidden="true">
                  <span style={{ width: `${progresoCampaña}%`, background: "linear-gradient(90deg, #4BE7FF, #58F5B0)" }} />
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                  {CAMPAÑA.map((acto) => {
                    const hechas = acto.misiones.filter((m) => misionesCompletadas.includes(m.id)).length;
                    const col = colorActo(acto.zona);
                    return (
                      <div key={acto.numero} className="flex items-center gap-2">
                        <span className="font-datos t-meta w-14 shrink-0" style={{ color: col.txt }}>Acto {acto.numero}</span>
                        <span className="medidor flex-1" style={{ height: 6 }} aria-hidden="true">
                          <span style={{ width: `${(hechas / acto.misiones.length) * 100}%`, background: col.c }} />
                        </span>
                        <span className="font-datos t-micro txt-normal w-8 text-right shrink-0">{hechas}/{acto.misiones.length}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-3">
                <section className="tarjeta p-4">
                  <h3 className="rotulo m-0" style={{ color: "#A98CFF" }}>Atributos</h3>
                  <div className="space-y-2.5 mt-3">
                    {(Object.entries(personaje.atributos || {}) as [string, number][]).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between t-meta">
                          <span className="txt-normal capitalize">{k.replace(/_/g, " ")}</span>
                          <span className="font-datos" style={{ color: "#7AD4E6" }}>{v}/10</span>
                        </div>
                        <div className="medidor mt-1" style={{ height: 6 }} aria-hidden="true">
                          <span style={{ width: `${v * 10}%`, background: "#4BE7FF" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="tarjeta p-4 space-y-4">
                  <div>
                    <h3 className="rotulo m-0" style={{ color: "#A98CFF" }}>Telemetría</h3>
                    <Medida etiqueta="Reputación" valor={`${personaje.reputacion} / 100`} pct={Math.max(0, (personaje.reputacion + 100) / 2)} color="#A98CFF" />
                    <Medida etiqueta="Trauma" valor={`${personaje.trauma} / 100`} pct={personaje.trauma} color="#F08585" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Dato etiqueta="Ganados" valor={personaje.expedientesGanados} color="#58F5B0" />
                    <Dato etiqueta="Perdidos" valor={personaje.expedientesPerdidos} color="#F08585" />
                    <Dato etiqueta="Ciclo" valor={`#${personaje.cicloProcesal}`} color="#E8DFC5" />
                  </div>
                </section>
              </div>
            </>
          )}

          {pestaña === "logros" && (
            <>
              <section className="tarjeta p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="rotulo m-0" style={{ color: "#58F5B0" }}>Logros</h3>
                  <span className="font-datos t-meta txt-normal">{logros.length}</span>
                </div>
                {logros.length === 0 ? (
                  <p className="t-base txt-suave mt-2 mb-0">Sin logros todavía. Completa misiones para desbloquearlos.</p>
                ) : (
                  <ul className="list-none p-0 m-0 mt-2 divide-y divide-[#1F2A3C]">
                    {logros.map((l) => (
                      <li key={l.id} className="flex items-start gap-3 py-2.5">
                        <span className="mt-0.5" style={{ color: "#58F5B0" }} aria-hidden="true">✓</span>
                        <div className="min-w-0">
                          <div className="t-base font-semibold txt-fuerte">{l.titulo}</div>
                          <div className="t-meta txt-suave">{l.descripcion}</div>
                          {l.articulo && l.articulo !== "—" && <div className="font-datos t-micro mt-0.5" style={{ color: "#F08585" }}>{l.articulo}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="tarjeta p-4">
                <h3 className="rotulo m-0" style={{ color: "#FFA76B" }}>Expedientes archivados ({expedientesArchivados.length})</h3>
                {expedientesArchivados.length === 0 ? (
                  <p className="t-base txt-suave mt-2 mb-0">Sin expedientes archivados.</p>
                ) : (
                  <ul className="list-none p-0 m-0 mt-2 divide-y divide-[#1F2A3C]">
                    {expedientesArchivados.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <div className="font-datos t-base txt-fuerte">{e.rol}</div>
                          <div className="t-meta txt-suave">{e.materia}</div>
                        </div>
                        <span className="t-meta font-semibold capitalize" style={{ color: e.resultado === "ganado" ? "#58F5B0" : "#F08585" }}>{e.resultado}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {pestaña === "bitacora" && (
            <>
              <section className="tarjeta p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="rotulo m-0" style={{ color: "#4BE7FF" }}>Bitácora</h3>
                  <span className="font-datos t-meta txt-normal">{log.length} entradas</span>
                </div>
                {log.length === 0 ? (
                  <p className="t-base txt-suave mt-2 mb-0">La bitácora está en silencio.</p>
                ) : (
                  <ul className="list-none p-0 m-0 mt-2 space-y-1.5">
                    {log.slice(0, 60).map((l, i) => (
                      <li key={i} className="flex items-start gap-2 t-meta txt-normal leading-snug">
                        <span style={{ color: "#4BE7FF" }} aria-hidden="true">›</span>
                        <span className="flex-1">{l.texto}</span>
                        {l.tag && <span className="chip font-datos shrink-0" style={{ minHeight: 24, fontSize: 13 }}>{l.tag}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {flags.length > 0 && (
                <section className="tarjeta p-4">
                  <h3 className="rotulo m-0" style={{ color: "#F08585" }}>Marcas activas ({flags.length})</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {flags.map((f) => <span key={f} className="chip font-datos">{f}</span>)}
                  </div>
                </section>
              )}
            </>
          )}

          {pestaña === "respaldo" && <GestorPartida />}
        </div>
      </div>
    </GameShell>
  );
}

function Medida({ etiqueta, valor, pct, color }: { etiqueta: string; valor: string; pct: number; color: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between t-meta">
        <span className="txt-normal">{etiqueta}</span>
        <span className="font-datos" style={{ color }}>{valor}</span>
      </div>
      <div className="medidor mt-1" style={{ height: 6 }} aria-hidden="true">
        <span style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, color }: { etiqueta: string; valor: number | string; color: string }) {
  return (
    <div className="rounded-xl py-2" style={{ background: "#0D1118", border: "1px solid #1F2A3C" }}>
      <div className="text-[20px] font-extrabold" style={{ color }}>{valor}</div>
      <div className="rotulo">{etiqueta}</div>
    </div>
  );
}
