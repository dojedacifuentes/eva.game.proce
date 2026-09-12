"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import GameWorldMap from "@/components/GameWorldMap";
import GameShell from "@/components/shell/GameShell";
import EvaPanel from "@/components/shell/EvaPanel";
import { leerProgreso, plural, siguientePaso } from "@/lib/eva";
import { CAMPAÑA, getBoss } from "@/data/campaign";

// ============================================================================
// HUB — CIUDAD JUDICIAL · una sola pantalla en escritorio.
//
// Qué cambió respecto de la versión anterior y por qué:
//  · Los tres portales de expansión (Reinos, Civilis, Procesal) ya no encabezan
//    el hub empujando el mapa fuera de la ventana: viven en /mundos, con sus
//    rutas y funciones intactas.
//  · Fuera del hub: atributos detallados, registro de actividad, reliquias
//    equipadas y logros. Siguen disponibles en Perfil (/inventario), que es
//    donde sirven.
//  · Fuera del producto: el panel "Noticias Jurídicas". Eran cuatro titulares
//    con forma de noticia real, sin fuente ni fecha verificables.
//  · "Eventos Activos" era un atajo duplicado a /oral, /inventario y /mundo;
//    esos destinos ya están en la navegación.
// ============================================================================

export default function Juego() {
  const hydrated = useHydrated();
  const personaje = useGame((s) => s.personaje);
  const xp = useGame((s) => s.xp);
  const nivel = useGame((s) => s.nivel);
  const misionesCompletadas = useGame((s) => s.misionesCompletadas);
  const finalizado = useGame((s) => s.finalizado);
  const logros = useGame((s) => s.logros);
  const [vista, setVista] = useState<"mapa" | "misiones">("mapa");

  // En pantallas estrechas el mapa SVG es poco manejable: se parte por la lista
  // de misiones, que es la alternativa clara para elegir a dónde ir.
  useEffect(() => {
    try {
      if (window.matchMedia("(max-width: 767px)").matches) setVista("misiones");
    } catch { /* sin matchMedia: se queda en el mapa */ }
  }, []);

  // Nada se decide hasta que el estado persistido esté leído: así no aparece
  // la pantalla de "sin personaje" a quien sí tiene partida guardada.
  if (!hydrated) return <CargandoExpediente />;
  if (!personaje.nombre) return <SinPersonaje />;

  const logrosIds = logros.map((l) => l.id);
  const progreso = leerProgreso(misionesCompletadas, logrosIds);
  const paso = siguientePaso({ tieneNombre: true, misionesCompletadas, logrosIds, finalizado });
  const boss = getBoss(progreso.actoActual.bossId);

  return (
    <GameShell variant="app" eyebrow="Ciudad Judicial" title={`Acto ${progreso.actoActual.numero} · ${progreso.actoActual.titulo}`}>
      <div className="flex-1 min-h-0 grid gap-3 grid-cols-1 lg:grid-cols-[clamp(230px,19vw,275px)_minmax(0,1fr)_clamp(255px,21vw,315px)] overflow-y-auto lg:overflow-hidden max-w-[1600px] w-full mx-auto">

        {/* ═══ IZQUIERDA — misión actual y progreso breve ═══ */}
        <aside className="order-3 lg:order-1 lg:shell-scroll lg:min-h-0 space-y-2.5">
          <Panel>
            <Etiqueta color="var(--zona-recursos)">Misión actual</Etiqueta>
            {progreso.misionActual ? (
              <div className="mt-1.5">
                <div className="font-display-grave text-sm text-doc-aged leading-tight">
                  {progreso.misionActual.titulo}
                </div>
                <p className="font-mono-terminal text-[9px] text-doc-aged/50 mt-1 leading-snug">
                  {progreso.misionActual.descripcion}
                </p>
                <Link
                  href={`/mision/${progreso.misionActual.id}`}
                  onClick={() => sfx.click?.()}
                  className="btn btn-recurso w-full text-[10px] py-2 mt-2.5 inline-block text-center"
                >
                  ▶ Atender
                </Link>
              </div>
            ) : (
              <p className="font-serif-juridica text-doc-aged/55 text-xs italic mt-1">
                Sin misiones pendientes en este acto.
              </p>
            )}
          </Panel>

          <Panel>
            <Etiqueta>Progreso de campaña</Etiqueta>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex-1 h-1.5 bg-bg-steel rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progreso.porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso de la campaña"
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--zona-competencia), var(--zona-recursos))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso.porcentaje}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="font-mono-terminal text-[10px] text-zona-prueba shrink-0">
                {progreso.porcentaje}%
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-1.5 mt-2.5 m-0">
              <Dato etiqueta="Misiones" valor={`${progreso.hechas}/${progreso.total}`} />
              <Dato etiqueta="Nivel" valor={`${nivel}`} />
              <Dato etiqueta="XP" valor={`${xp}`} />
            </dl>
            <Link
              href="/inventario"
              onClick={() => sfx.click?.()}
              className="block text-center font-mono-terminal text-[9px] text-doc-aged/40 hover:text-zona-competencia mt-2.5 transition-colors"
            >
              Atributos, logros y reliquias →
            </Link>
          </Panel>
        </aside>

        {/* ═══ CENTRO — mapa o lista de misiones ═══ */}
        <section className="order-2 lg:order-2 flex flex-col min-h-0 gap-2">
          <div className="shrink-0 flex items-center justify-between gap-2">
            <h2 className="font-mono-terminal text-[9px] uppercase tracking-[.25em] text-zona-competencia">
              {vista === "mapa" ? "Mapa · 7 distritos" : "Misiones de campaña"}
            </h2>
            {/* Alternativa explícita al mapa para elegir misión. */}
            <div className="flex border border-zona-competencia/20" role="group" aria-label="Modo de vista">
              {(["mapa", "misiones"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVista(v); sfx.click?.(); }}
                  aria-pressed={vista === v}
                  className="px-2.5 py-1.5 font-mono-terminal text-[9px] uppercase tracking-widest transition-colors"
                  style={{
                    color: vista === v ? "var(--zona-competencia)" : "rgba(232,223,197,0.45)",
                    background: vista === v ? "rgba(75,231,255,0.1)" : "transparent",
                  }}
                >
                  {v === "mapa" ? "Mapa" : "Lista"}
                </button>
              ))}
            </div>
          </div>

          {vista === "mapa" ? (
            <div className="flex-1 min-h-[240px] lg:min-h-0 flex flex-col">
              <GameWorldMap compacto />
            </div>
          ) : (
            <ListaMisiones misionesCompletadas={misionesCompletadas} />
          )}
        </section>

        {/* ═══ DERECHA — EVA y próxima acción ═══ */}
        <aside className="order-1 lg:order-3 lg:shell-scroll lg:min-h-0 space-y-2.5">
          <EvaPanel paso={paso} />

          {boss && paso.tipo !== "boss" && (
            <Panel borde={`${boss.color}45`}>
              <Etiqueta color={boss.color}>Jefe de este acto</Etiqueta>
              <div className="flex items-center gap-2.5 mt-2">
                <span
                  aria-hidden="true"
                  className="w-10 h-10 shrink-0 border-2 flex items-center justify-center text-xl"
                  style={{ borderColor: boss.color, color: boss.color, background: `${boss.color}14` }}
                >
                  {boss.icono}
                </span>
                <div className="min-w-0">
                  <div className="font-display-grave text-sm text-doc-aged leading-tight truncate">
                    {boss.nombre}
                  </div>
                  <div className="font-mono-terminal text-[8px] text-doc-aged/50">
                    {progreso.pendientesActo === 1 ? "Queda" : "Quedan"} {plural(progreso.pendientesActo, "misión", "misiones")}
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Acceso a las expansiones, ya no encima del mapa. */}
          <Link
            href="/mundos"
            onClick={() => sfx.click?.()}
            onMouseEnter={() => sfx.hover?.()}
            className="block p-3 border transition-all hover:brightness-125"
            style={{ borderColor: "rgba(138,92,255,0.3)", background: "rgba(138,92,255,0.06)" }}
          >
            <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-zona-recursos">
              Mundos y expansiones
            </div>
            <div className="font-display-grave text-sm text-doc-aged mt-1">
              Reinos · Civilis · Procesal
            </div>
            <div className="font-mono-terminal text-[8px] text-doc-aged/45 mt-0.5">
              13 mundos de campaña y 3 expansiones →
            </div>
          </Link>

          {finalizado && (
            <Link href="/epilogo" onClick={() => sfx.click?.()} className="btn btn-cautelar w-full text-[11px] py-2.5 inline-block text-center">
              ✓ Ver epílogo
            </Link>
          )}
        </aside>
      </div>
    </GameShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════

function CargandoExpediente() {
  return (
    <GameShell variant="app" eyebrow="Ciudad Judicial" title="Abriendo expediente">
      <div className="flex-1 min-h-0 flex items-center justify-center" aria-live="polite">
        <p className="font-mono-terminal text-[11px] uppercase tracking-[.3em] text-doc-aged/35">
          Leyendo partida guardada…
        </p>
      </div>
    </GameShell>
  );
}

function SinPersonaje() {
  return (
    <GameShell variant="app" eyebrow="Ciudad Judicial" title="Sin compareciente" headerCompacto>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <section className="w-full max-w-xl border border-zona-competencia/25 bg-bg-deep/80 p-6">
          <h2 className="font-display-grave text-2xl md:text-3xl text-doc-aged mb-3">
            Antes de litigar, constituye personaje.
          </h2>
          <p className="font-serif-juridica text-doc-aged/65 leading-relaxed text-sm">
            La Ciudad Judicial necesita un litigante para guardar progreso, reputación y logros.
            Se crea en menos de un minuto.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <Link href="/creacion" className="btn btn-recurso text-[11px] px-4 py-3">Crear personaje</Link>
            <Link href="/mundos" className="btn text-[11px] px-4 py-3">Explorar mundos</Link>
          </div>
        </section>
      </div>
    </GameShell>
  );
}

const TIPO_ICON: Record<string, string> = {
  investigacion: "🔍", arcade: "🎮", boss: "⚔️", npc: "🧑‍⚖️",
  puzzle: "🧩", dialogo: "💬", examen: "📋", ejecutivo: "💼",
};

function ListaMisiones({ misionesCompletadas }: { misionesCompletadas: string[] }) {
  const router = useRouter();
  return (
    <div
      className="shell-scroll flex-1 min-h-[240px] lg:min-h-0 rounded-lg border border-zona-competencia/12 p-3 space-y-4"
      tabIndex={0}
      role="region"
      aria-label="Lista de misiones de la campaña"
      style={{ background: "linear-gradient(180deg, rgba(13,15,23,0.7), rgba(8,10,17,0.85))" }}
    >
      {CAMPAÑA.map((acto) => {
        const hechas = acto.misiones.filter((m) => misionesCompletadas.includes(m.id)).length;
        return (
          <section key={acto.numero}>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos">
                Acto {acto.numero}: {acto.titulo}
              </h3>
              <span className="font-mono-terminal text-[8px] text-doc-aged/40">
                {hechas}/{acto.misiones.length}
              </span>
            </div>
            <ul className="space-y-1.5 list-none p-0 m-0">
              {acto.misiones.map((mision) => {
                const hecha = misionesCompletadas.includes(mision.id);
                return (
                  <li
                    key={mision.id}
                    className="flex items-center gap-2 p-2 border rounded"
                    style={{
                      borderColor: hecha ? "rgba(88,245,176,0.25)" : "rgba(75,231,255,0.1)",
                      background: hecha ? "rgba(88,245,176,0.03)" : "transparent",
                    }}
                  >
                    <span aria-hidden="true" className="text-sm shrink-0">{TIPO_ICON[mision.tipo] ?? "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display-grave text-xs text-doc-aged truncate">{mision.titulo}</div>
                      <div className="font-mono-terminal text-[8px] text-doc-aged/45 truncate">{mision.descripcion}</div>
                    </div>
                    {hecha ? (
                      <span className="text-[10px] text-zona-cautelares shrink-0">
                        <span aria-hidden="true">✓</span>
                        <span className="sr-only">Completada</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { sfx.click?.(); router.push(`/mision/${mision.id}`); }}
                        onMouseEnter={() => sfx.hover?.()}
                        className="shrink-0 text-[9px] font-mono-terminal px-2.5 py-1.5 border border-zona-competencia/40 text-zona-competencia hover:border-zona-competencia transition-all"
                      >
                        Jugar
                        <span className="sr-only"> {mision.titulo}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Panel({ children, borde }: { children: React.ReactNode; borde?: string }) {
  return (
    <div
      className="rounded-lg border p-2.5"
      style={{
        borderColor: borde ?? "rgba(75,231,255,0.12)",
        background: "linear-gradient(180deg, rgba(13,15,23,0.7), rgba(8,10,17,0.85))",
      }}
    >
      {children}
    </div>
  );
}

function Etiqueta({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="font-mono-terminal text-[8px] uppercase tracking-widest"
      style={{ color: color ?? "rgba(232,223,197,0.45)" }}
    >
      {children}
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="text-center border border-doc-aged/10 py-1">
      <dt className="font-mono-terminal text-[7px] uppercase tracking-widest text-doc-aged/35 m-0">{etiqueta}</dt>
      <dd className="font-mono-terminal text-[11px] text-zona-competencia m-0">{valor}</dd>
    </div>
  );
}
