"use client";
import { useState, useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import { BOSSES } from "@/data/bosses";
import { BOSSES_EXTRA } from "@/data/bosses-extra";
import type { BossId } from "@/types/expansion";
import { AvatarBoss } from "@/components/AvataresJuridicos";
import { sfx } from "@/lib/audio";
import { fx } from "@/lib/fx";
import { shuffleOptions } from "@/lib/shuffleOptions";

const TODOS = [...BOSSES, ...BOSSES_EXTRA];

// ============================================================================
// INTERROGACIÓN ORAL v4 — combate procesal con fases y personalidad.
//
// Cambios de presentación (la mecánica es la misma):
//  · HUD compacto pegado arriba: retrato de 56 px (antes 130), vidas y ataques.
//  · Opciones como botones grandes; tras responder se marcan la elegida y la
//    correcta, y el área normativa se revela DESPUÉS (antes se veía antes).
//  · «Siguiente ataque» pegado abajo, siempre a la vista.
// ============================================================================

const REACCIONES: Record<string, { acierto: string[]; fallo: string[] }> = {
  ministro_formalista: {
    acierto: ["Correcto. El 768 no perdona, pero usted tampoco.", "Bien. Siga."],
    fallo: ["Art. 769. Léalo esta noche.", "La causal existe. La ignorancia, también."],
  },
  profesor_hostil: {
    acierto: ["Bien. Por ahora.", "Aceptable. La siguiente es más difícil."],
    fallo: ["Su padre habría sabido eso.", "Veintiocho años lo he visto y nunca mejora."],
  },
  jueza_tecnica: {
    acierto: ["Correcto. Continúe.", "Eso lo sabían mis alumnos de hace diez años."],
    fallo: ["No es una pregunta de memoria. Es una de lógica.", "¿Estudió el manual o lo hojeó?"],
  },
  receptor_fantasma: {
    acierto: ["Notificado correctamente.", "Buen intento."],
    fallo: ["El demandado nunca lo supo. Como usted.", "Invalidado por ignorancia."],
  },
};

const REACCION_GENERICA = {
  acierto: ["Correcto.", "Bien argumentado.", "Continúe."],
  fallo: ["Incorrecto.", "Revise el código.", "Eso no corresponde."],
};

function getReaccion(bossId: string, tipo: "acierto" | "fallo"): string {
  const r = REACCIONES[bossId] ?? REACCION_GENERICA;
  const arr = r[tipo];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPhase(hp: number, maxHp: number): 1 | 2 | 3 {
  const pct = hp / maxHp;
  if (pct > 0.5) return 1;
  if (pct > 0.25) return 2;
  return 3;
}

const PHASE_COLOR: Record<number, string> = { 1: "#FF85DC", 2: "#FFA76B", 3: "#F08585" };
const PHASE_LABEL: Record<number, string> = { 1: "Fase 1", 2: "Fase 2 · enojado", 3: "Fase final" };

type Opcion = { texto: string; correcta: boolean; explicacion: string; art: string };

export default function InterrogacionOral({ bossId, onFin }: { bossId: BossId; onFin?: () => void }) {
  const game = useGame();
  const boss = TODOS.find((b) => b.id === bossId) ?? null;

  // ── TODOS LOS HOOKS PRIMERO (sin condicionales) ──────────────────────────
  const [saludBoss, setSaludBoss] = useState(boss?.saludInicial ?? 100);
  const [saludJugador, setSaludJugador] = useState(boss?.saludJugador ?? 70);
  const [ataqueIdx, setAtaqueIdx] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; explicacion: string; art: string; reaccion: string; damage: number } | null>(null);
  const [terminado, setTerminado] = useState<"victoria" | "derrota" | null>(null);
  const [xpGanado, setXpGanado] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);
  const [floats, setFloats] = useState<{ id: number; text: string; color: string; side: "boss" | "player" }[]>([]);
  const spawnFloat = (text: string, color: string, side: "boss" | "player") => {
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, text, color, side }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 950);
  };

  // Orden barajado de los ataques: el boss no pregunta siempre lo mismo primero.
  const orden = useMemo(() => {
    const idxs = (boss?.ataques ?? []).map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs;
  }, [bossId]); // eslint-disable-line react-hooks/exhaustive-deps
  const ataque = boss?.ataques[orden[ataqueIdx]] ?? null;
  const shuffled = useMemo(() => {
    if (!ataque) return null;
    return shuffleOptions(ataque.opciones, "correcta");
  }, [ataqueIdx, bossId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── RETORNO CONDICIONAL DESPUÉS DE TODOS LOS HOOKS ───────────────────────
  if (!boss) {
    return <div className="tarjeta p-5 t-cuerpo txt-normal">Boss no encontrado.</div>;
  }

  const phase = getPhase(saludBoss, boss.saludInicial);
  const phaseColor = PHASE_COLOR[phase];

  function responder(shuffledIdx: number) {
    if (!boss || !ataque || !shuffled || feedback) return;
    const originalOp = ataque.opciones[shuffled.originalIndices[shuffledIdx]] as Opcion;
    const reaccion = getReaccion(boss.id, originalOp.correcta ? "acierto" : "fallo");
    const dmg = ataque.damage;

    setElegida(shuffledIdx);
    setFeedback({ ok: originalOp.correcta, explicacion: originalOp.explicacion, art: originalOp.art, reaccion, damage: dmg });

    if (originalOp.correcta) {
      sfx.oralCorrecta();
      fx.reward();
      const nuevoSaludBoss = Math.max(0, saludBoss - dmg);
      setSaludBoss(nuevoSaludBoss);
      spawnFloat(`-${dmg}`, "#58F5B0", "boss");
      game.pushLog(`✓ "${boss.nombre}": ${originalOp.art}`, "ORAL");
      game.ajustarAtributo("conocimiento_procesal", 1);
      if (nuevoSaludBoss <= 0) {
        const xp = 150 + (phase - 1) * 25;
        const monedas = 40 + (phase - 1) * 10;
        setXpGanado(xp);
        setMonedasGanadas(monedas);
        fx.success();
        game.gainXp(xp);
        game.gainMonedas(monedas);
        game.ajustarReputacion(15);
        game.desbloquearLogro({
          id: `boss_${boss.id}`,
          titulo: `Vencido: ${boss.nombre}`,
          descripcion: boss.derrotadoOtorga,
          articulo: `Art. ${ataque.articuloEsperado} CPC`,
          desbloqueado: true,
          fecha: Date.now(),
        });
        game.pushLog(`Derrotaste a ${boss.nombre}. ${boss.derrotadoOtorga}`, "VICTORIA");
      }
    } else {
      sfx.warning();
      fx.shake();
      const nuevoSaludJugador = Math.max(0, saludJugador - dmg);
      setSaludJugador(nuevoSaludJugador);
      spawnFloat(`-${dmg}`, "#F08585", "player");
      game.ajustarTrauma(3);
      game.pushLog(`✗ "${boss.nombre}" — ${originalOp.explicacion}`, "ORAL");
      if (nuevoSaludJugador <= 0) {
        fx.danger();
        game.ajustarTrauma(10);
      }
    }
  }

  function avanzar() {
    sfx.click();
    if (saludBoss <= 0) { setTerminado("victoria"); return; }
    if (saludJugador <= 0) { setTerminado("derrota"); return; }
    setFeedback(null);
    setElegida(null);
    if (ataqueIdx + 1 < boss!.ataques.length) {
      setAtaqueIdx(ataqueIdx + 1);
    } else {
      setTerminado(saludBoss < saludJugador ? "victoria" : "derrota");
    }
  }

  // ── VICTORIA ──────────────────────────────────────────────────────────────
  if (terminado === "victoria") {
    return (
      <div className="flex flex-col min-h-full">
        <section className="tarjeta p-6 text-center space-y-3 mt-3" style={{ borderColor: "#58F5B0" }}>
          <div className="rotulo" style={{ color: "#58F5B0" }}>★ Victoria</div>
          <h2 className="font-display-grave text-3xl txt-fuerte m-0">{boss.nombre}</h2>
          <p className="t-cuerpo txt-normal m-0">{boss.derrotadoOtorga}</p>
          <div className="flex justify-center gap-6 pt-2">
            <Premio valor={`+${xpGanado}`} etiqueta="XP" color="#58F5B0" />
            <Premio valor={`+${monedasGanadas}`} etiqueta="Monedas" color="#E3C27E" />
            <Premio valor="+15" etiqueta="Reputación" color="#A98CFF" />
          </div>
          <p className="chip mx-auto mb-0">Logro desbloqueado: Vencido · {boss.nombre}</p>
        </section>
        <div className="barra-accion">
          <button className="btn-primario" style={{ "--acento": "#58F5B0" } as CSSProperties} onClick={() => { sfx.confirm(); onFin?.(); }}>
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  // ── DERROTA ───────────────────────────────────────────────────────────────
  if (terminado === "derrota") {
    return (
      <div className="flex flex-col min-h-full">
        <section className="tarjeta p-6 text-center space-y-3 mt-3" style={{ borderColor: "#F08585" }}>
          <div className="rotulo" style={{ color: "#F08585" }}>✗ Derrota</div>
          <h2 className="font-display-grave text-3xl txt-fuerte m-0">{boss.nombre} te aniquila</h2>
          <p className="cita m-0">«Vuelve cuando hayas leído el Cassarino. O el Maturana. O algo.»</p>
          <p className="t-meta m-0" style={{ color: "#F08585" }}>+10 trauma</p>
        </section>
        <div className="barra-accion">
          <button className="btn-secundario" onClick={() => { sfx.click(); onFin?.(); }}>
            Retirarse con dignidad
          </button>
        </div>
      </div>
    );
  }

  // ── COMBATE ACTIVO ────────────────────────────────────────────────────────
  const saludBossPct = (saludBoss / boss.saludInicial) * 100;
  const saludJugadorPct = (saludJugador / boss.saludJugador) * 100;

  return (
    <div className="flex flex-col min-h-full">
      {/* ─── HUD ─── */}
      <div className="hud-fijo relative">
        <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
          <AnimatePresence>
            {floats.map((f) => (
              <motion.span
                key={f.id}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: 1, y: -24, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute text-2xl font-extrabold"
                style={{ left: f.side === "boss" ? "22%" : "80%", top: "30%", color: f.color, textShadow: "0 2px 6px rgba(0,0,0,.9)" }}
              >
                {f.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-14 h-14 rounded-xl overflow-hidden grid place-items-center" style={{ background: "#111723", border: `2px solid ${phaseColor}` }}>
            <AvatarBoss bossId={boss.id} size={56} />
          </span>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex justify-between gap-2 t-micro">
              <span className="font-datos uppercase tracking-wider truncate" style={{ color: phaseColor }}>{boss.rama} · {PHASE_LABEL[phase]}</span>
              <span className="font-datos txt-suave shrink-0">Ataque {ataqueIdx + 1}/{boss.ataques.length}</span>
            </div>
            <Barra etiqueta="Examinador" valor={saludBoss} max={boss.saludInicial} pct={saludBossPct} color={`linear-gradient(90deg, #F08585, ${phaseColor})`} />
            <Barra etiqueta="Tu mente" valor={saludJugador} max={boss.saludJugador} pct={saludJugadorPct} color="linear-gradient(90deg, #4BE7FF, #58F5B0)" />
          </div>
        </div>
      </div>

      {/* ─── PREGUNTA ─── */}
      <motion.div
        key={ataqueIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 pt-3 space-y-4"
      >
        <div className="rotulo" style={{ color: phaseColor }}>
          {ataque?.tipo ? `Ataque · ${ataque.tipo}` : "Ataque"} · daño {ataque?.damage ?? 0}
        </div>
        {ataque && (
          <h2 className="text-[19px] md:text-[21px] font-semibold txt-fuerte leading-snug m-0">{ataque.pregunta}</h2>
        )}

        {shuffled && (
          <div className="space-y-2.5" role="group" aria-label="Opciones">
            {(shuffled.options as Opcion[]).map((op, i) => {
              const estado = !feedback ? undefined
                : op.correcta ? "ok"
                : elegida === i ? "mal"
                : "apagada";
              return (
                <button key={`${ataqueIdx}-${i}`} type="button" disabled={!!feedback} onClick={() => responder(i)} className="opcion" data-estado={estado}>
                  <span className="opcion-letra" aria-hidden="true">{estado === "ok" ? "✓" : estado === "mal" ? "✗" : String.fromCharCode(65 + i)}</span>
                  <span>{op.texto}</span>
                </button>
              );
            })}
          </div>
        )}

        {feedback && (
          <div className="space-y-3" aria-live="polite">
            <section className="tarjeta p-4" style={{ borderColor: feedback.ok ? "#58F5B0" : "#F08585" }}>
              <div className="text-[16px] font-bold" style={{ color: feedback.ok ? "#58F5B0" : "#F08585" }}>
                {feedback.ok ? `Correcto · −${feedback.damage} al examinador` : `Incorrecto · −${feedback.damage} a tu mente`}
              </div>
              <p className="cita text-[18px] mt-2 mb-0">«{feedback.reaccion}» <span className="t-meta not-italic txt-suave" style={{ fontFamily: "var(--font-sans)" }}>— {boss.nombre}</span></p>
            </section>
            <section className="tarjeta p-4">
              <p className="t-cuerpo txt-normal leading-snug m-0">{feedback.explicacion}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="chip font-datos">{feedback.art}</span>
                {ataque?.articuloEsperado && <span className="chip font-datos">Área: art. {ataque.articuloEsperado} CPC</span>}
              </div>
            </section>
          </div>
        )}
      </motion.div>

      <div className="barra-accion">
        {feedback ? (
          <button type="button" onClick={avanzar} className="btn-primario" style={{ "--acento": saludBoss <= 0 ? "#58F5B0" : saludJugador <= 0 ? "#F08585" : "#FF85DC" } as CSSProperties}>
            {saludBoss <= 0 ? "¡Victoria! Ver resultado →" : saludJugador <= 0 ? "Ver resultado" : "Siguiente ataque →"}
          </button>
        ) : (
          <p className="t-meta txt-suave m-0 self-center">Elige tu respuesta.</p>
        )}
      </div>
    </div>
  );
}

function Barra({ etiqueta, valor, max, pct, color }: { etiqueta: string; valor: number; max: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="t-micro txt-suave w-[5.5rem] shrink-0">{etiqueta}</span>
      <div className="medidor flex-1" role="progressbar" aria-label={etiqueta} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={max}>
        <span style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-datos t-micro txt-normal w-14 text-right shrink-0">{valor}/{max}</span>
    </div>
  );
}

function Premio({ valor, etiqueta, color }: { valor: string; etiqueta: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold" style={{ color }}>{valor}</div>
      <div className="rotulo mt-1">{etiqueta}</div>
    </div>
  );
}
