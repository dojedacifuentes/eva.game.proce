"use client";
import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import MapaFlujo, { colorActo, tituloFrase } from "@/components/MapaFlujo";
import GameShell from "@/components/shell/GameShell";
import EvaPanel from "@/components/shell/EvaPanel";
import EvaMark from "@/components/shell/EvaMark";
import { leerProgreso, plural, siguientePaso } from "@/lib/eva";
import { getBoss } from "@/data/campaign";

// ============================================================================
// HUB — CIUDAD JUDICIAL. Una pantalla en todos los tamaños.
//
//  · Teléfono: franja de progreso, el mapa de flujo ocupando el alto disponible
//    y, abajo, la acción de EVA («tu próximo paso») siempre a la vista. Antes el
//    teléfono mostraba EVA, jefe, expansiones, misión y progreso apilados: había
//    que bajar varios pantallazos y el mapa se sustituía por una lista.
//  · Escritorio: mapa a la izquierda y columna de EVA a la derecha.
// ============================================================================

export default function Juego() {
  const hydrated = useHydrated();
  const personaje = useGame((s) => s.personaje);
  const misionesCompletadas = useGame((s) => s.misionesCompletadas);
  const finalizado = useGame((s) => s.finalizado);
  const logros = useGame((s) => s.logros);
  const logrosIds = useMemo(() => logros.map((l) => l.id), [logros]);

  // Nada se decide hasta que el estado persistido esté leído: así no aparece
  // la pantalla de "sin personaje" a quien sí tiene partida guardada.
  if (!hydrated) return <CargandoExpediente />;
  if (!personaje.nombre) return <SinPersonaje />;

  const progreso = leerProgreso(misionesCompletadas, logrosIds);
  const paso = siguientePaso({ tieneNombre: true, misionesCompletadas, logrosIds, finalizado });
  const boss = getBoss(progreso.actoActual.bossId);
  const col = colorActo(progreso.actoActual.zona);

  return (
    <GameShell
      variant="app"
      eyebrow={`Acto ${progreso.actoActual.numero} de 7`}
      title={tituloFrase(progreso.actoActual.titulo)}
    >
      <div className="hub">
        <div className="hub-progreso">
          <span className="rotulo">Campaña</span>
          <div
            className="medidor"
            role="progressbar"
            aria-valuenow={progreso.porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de la campaña"
          >
            <span style={{ width: `${progreso.porcentaje}%`, background: "linear-gradient(90deg, #4BE7FF, #58F5B0)" }} />
          </div>
          <span className="font-datos t-meta txt-normal shrink-0">
            {progreso.hechas}/{progreso.total} · {progreso.porcentaje}%
          </span>
        </div>

        <section className="hub-mapa" aria-label="Mapa de la campaña">
          <MapaFlujo misionesCompletadas={misionesCompletadas} logrosIds={logrosIds} />
        </section>

        {/* ═══ Escritorio: EVA y contexto ═══ */}
        <aside className="hub-lateral" aria-label="Tu próximo paso">
          <EvaPanel paso={paso} />

          {boss && paso.tipo !== "boss" && (
            <div className="tarjeta p-3" style={{ borderColor: `${col.c}55` }}>
              <div className="rotulo" style={{ color: col.txt }}>Jefe de este acto</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="fila-icono" style={{ "--acento": col.c } as CSSProperties} aria-hidden="true">{boss.icono}</span>
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold txt-fuerte leading-tight">{boss.nombre}</div>
                  <div className="t-meta txt-suave">
                    {progreso.pendientesActo === 1 ? "Queda" : "Quedan"} {plural(progreso.pendientesActo, "misión", "misiones")}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Link href="/mundos" onClick={() => sfx.click?.()} className="fila" style={{ "--acento": "#8A5CFF" } as CSSProperties}>
            <span className="fila-icono" aria-hidden="true">🌐</span>
            <span className="fila-texto">
              <span className="fila-titulo">Mundos y expansiones</span>
              <span className="fila-sub">Reinos · Civilis · Procesal</span>
            </span>
            <span className="fila-chevron" aria-hidden="true">›</span>
          </Link>

          {finalizado && (
            <Link href="/epilogo" onClick={() => sfx.click?.()} className="btn-secundario w-full">
              ✓ Ver epílogo
            </Link>
          )}
        </aside>

        {/* ═══ Teléfono: la acción que hace avanzar, siempre a la vista ═══ */}
        <div className="hub-accion" role="region" aria-label="Tu próximo paso">
          <span className="self-start pt-1"><EvaMark size={26} /></span>
          <div className="hub-accion-texto">
            <div className="rotulo" style={{ color: "var(--eva-accent)" }}>Próximo paso</div>
            <div className="hub-accion-titulo">{paso.titulo}</div>
            <div className="hub-accion-razon">{paso.razon}</div>
          </div>
          <Link
            href={paso.href}
            onClick={() => sfx.confirm?.()}
            className="btn-primario shrink-0 px-4"
            style={{ "--acento": "var(--eva-accent)" } as CSSProperties}
            aria-label={`${paso.cta}: ${paso.titulo}`}
          >
            {paso.tipo === "mision" ? "▶ Jugar" : paso.tipo === "boss" ? "⚔ Combatir" : paso.cta}
          </Link>
        </div>
      </div>
    </GameShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════

function CargandoExpediente() {
  return (
    <GameShell variant="app" eyebrow="Ciudad Judicial" title="Abriendo expediente">
      <div className="flex-1 min-h-0 flex items-center justify-center" aria-live="polite">
        <p className="rotulo">Leyendo partida guardada…</p>
      </div>
    </GameShell>
  );
}

function SinPersonaje() {
  return (
    <GameShell variant="app" eyebrow="Ciudad Judicial" title="Sin compareciente" headerCompacto>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <section className="tarjeta w-full max-w-xl p-5">
          <h2 className="font-display-grave text-2xl md:text-3xl txt-fuerte mb-3">
            Antes de litigar, constituye personaje.
          </h2>
          <p className="t-cuerpo txt-normal leading-relaxed">
            La Ciudad Judicial necesita un litigante para guardar progreso, reputación y logros.
            Se crea en menos de un minuto.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <Link href="/creacion" className="btn-primario">Crear personaje</Link>
            <Link href="/mundos" className="btn-secundario">Explorar mundos</Link>
          </div>
        </section>
      </div>
    </GameShell>
  );
}
