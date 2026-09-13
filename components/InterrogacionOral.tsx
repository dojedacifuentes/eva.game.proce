"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import { BOSSES } from "@/data/bosses";
import { BOSSES_EXTRA } from "@/data/bosses-extra";
const TODOS = [...BOSSES, ...BOSSES_EXTRA];
import type { Boss, BossId } from "@/types/expansion";
import { AvatarBoss } from "@/components/AvataresJuridicos";
import { sfx } from "@/lib/audio";
import { fx } from "@/lib/fx";
import { haptica } from "@/lib/haptica";
import { shuffleOptions } from "@/lib/shuffleOptions";

// ============================================================================
// INTERROGACIÓN ORAL v3.0 — Combate procesal con fases y personalidad
// ============================================================================

// Frases por tipo de resultado, basadas en el id del boss
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

const PHASE_COLOR: Record<number, string> = {
  1: "var(--zona-oralidad)",
  2: "var(--zona-ejecutivo)",
  3: "var(--zona-nulidad)",
};

const PHASE_LABEL: Record<number, string> = {
  1: "FASE 1",
  2: "⚠ FASE 2 — ENOJADO",
  3: "🔥 FASE FINAL",
};

export default function InterrogacionOral({ bossId, onFin }: { bossId: BossId; onFin?: () => void }) {
  const game = useGame();
  const boss = TODOS.find((b) => b.id === bossId) ?? null;

  // ── TODOS LOS HOOKS PRIMERO (sin condicionales) ──────────────────────────
  const [saludBoss, setSaludBoss] = useState(boss?.saludInicial ?? 100);
  const [saludJugador, setSaludJugador] = useState(boss?.saludJugador ?? 70);
  const [ataqueIdx, setAtaqueIdx] = useState(0);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    explicacion: string;
    art: string;
    reaccion: string;
    damage: number;
  } | null>(null);
  const [terminado, setTerminado] = useState<"victoria" | "derrota" | null>(null);
  const [xpGanado, setXpGanado] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);
  // Daño flotante (juice arcade) — autocontenido con framer-motion
  const [floats, setFloats] = useState<{ id: number; text: string; color: string; side: "boss" | "player" }[]>([]);
  const spawnFloat = (text: string, color: string, side: "boss" | "player") => {
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, text, color, side }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 950);
  };

  // Orden barajado de los ataques: el boss ya no pregunta siempre lo mismo primero.
  const orden = useMemo(() => {
    const idxs = (boss?.ataques ?? []).map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs;
  }, [bossId]); // eslint-disable-line react-hooks/exhaustive-deps
  // Shuffle opciones del ataque actual — SIEMPRE llamado (React hooks rule)
  const ataque = boss?.ataques[orden[ataqueIdx]] ?? null;
  const shuffled = useMemo(() => {
    if (!ataque) return null;
    return shuffleOptions(ataque.opciones, "texto");
  }, [ataqueIdx, bossId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── RETORNO CONDICIONAL DESPUÉS DE TODOS LOS HOOKS ───────────────────────
  if (!boss) {
    return <div className="terminal p-6 text-doc-aged/60 font-mono-terminal">Boss no encontrado.</div>;
  }

  const phase = getPhase(saludBoss, boss.saludInicial);
  const phaseColor = PHASE_COLOR[phase];

  function responder(shuffledIdx: number) {
    if (!boss || !ataque || !shuffled) return;
    const originalOp = ataque.opciones[shuffled.originalIndices[shuffledIdx]];
    const reaccion = getReaccion(boss!.id, originalOp.correcta ? "acierto" : "fallo");
    const dmg = ataque.damage;

    setFeedback({ ok: originalOp.correcta, explicacion: originalOp.explicacion, art: originalOp.art, reaccion, damage: dmg });

    if (originalOp.correcta) {
      sfx.oralCorrecta();
      fx.reward();
      haptica.acierto();
      const nuevoSaludBoss = Math.max(0, saludBoss - dmg);
      setSaludBoss(nuevoSaludBoss);
      spawnFloat(`-${dmg}`, "var(--zona-cautelares)", "boss");
      game.pushLog(`✓ "${boss!.nombre}": ${originalOp.art}`, "ORAL");
      game.ajustarAtributo("conocimiento_procesal", 1);
      if (nuevoSaludBoss <= 0) {
        const xp = 150 + (phase - 1) * 25;
        const monedas = 40 + (phase - 1) * 10;
        setXpGanado(xp);
        setMonedasGanadas(monedas);
        fx.success();
        fx.xpGain(xp);
        fx.coinGain(monedas);
        haptica.hito();
        setTerminado("victoria");
        game.gainXp(xp);
        game.gainMonedas(monedas);
        game.ajustarReputacion(15);
        game.desbloquearLogro({
          id: `boss_${boss!.id}`,
          titulo: `Vencido: ${boss!.nombre}`,
          descripcion: boss!.derrotadoOtorga,
          articulo: `Art. ${ataque.articuloEsperado} CPC`,
          desbloqueado: true,
          fecha: Date.now(),
        });
        game.pushLog(`Derrotaste a ${boss!.nombre}. ${boss!.derrotadoOtorga}`, "VICTORIA");
      }
    } else {
      sfx.warning();
      fx.shake();
      haptica.error();
      const nuevoSaludJugador = Math.max(0, saludJugador - dmg);
      setSaludJugador(nuevoSaludJugador);
      spawnFloat(`-${dmg}`, "var(--zona-nulidad)", "player");
      game.ajustarTrauma(3);
      game.pushLog(`✗ "${boss!.nombre}" — ${originalOp.explicacion}`, "ORAL");
      if (nuevoSaludJugador <= 0) {
        fx.danger();
        game.ajustarTrauma(10);
        setTerminado("derrota");
      }
    }
  }

  function avanzar() {
    setFeedback(null);
    if (ataqueIdx + 1 < boss!.ataques.length) {
      sfx.click();
      setAtaqueIdx(ataqueIdx + 1);
    } else {
      setTerminado(saludBoss < saludJugador ? "victoria" : "derrota");
    }
  }

  // ── VICTORIA ──────────────────────────────────────────────────────────────
  if (terminado === "victoria") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="terminal p-8 text-center space-y-5"
        style={{ borderColor: "var(--zona-cautelares)", boxShadow: "0 0 60px var(--zona-cautelares)15" }}
      >
        <div className="text-[9px] font-mono-terminal text-zona-cautelares uppercase tracking-[.4em] animate-flicker">
          ★ VICTORIA ★
        </div>
        <h2 className="font-display-grave text-4xl text-doc-aged" style={{ textShadow: "0 0 30px var(--zona-cautelares)50" }}>
          {boss.nombre}
        </h2>
        <p className="font-serif-juridica italic text-doc-aged/70 text-base max-w-lg mx-auto">
          {boss.derrotadoOtorga}
        </p>

        {/* Recompensas */}
        <div className="flex justify-center gap-8 py-4">
          <div className="text-center">
            <div className="font-display-grave text-3xl text-zona-cautelares">+{xpGanado}</div>
            <div className="font-mono-terminal text-[9px] text-doc-aged/40 uppercase tracking-widest mt-1">XP</div>
          </div>
          <div className="text-center">
            <div className="font-display-grave text-3xl text-zona-prueba">+{monedasGanadas}</div>
            <div className="font-mono-terminal text-[9px] text-doc-aged/40 uppercase tracking-widest mt-1">🪙 Monedas</div>
          </div>
          <div className="text-center">
            <div className="font-display-grave text-3xl text-zona-recursos">+15</div>
            <div className="font-mono-terminal text-[9px] text-doc-aged/40 uppercase tracking-widest mt-1">Reputación</div>
          </div>
        </div>

        <div className="font-mono-terminal text-[8px] text-doc-aged/30 border border-zona-cautelares/20 px-4 py-2 inline-block">
          LOGRO DESBLOQUEADO: Vencido: {boss.nombre}
        </div>

        <button
          className="btn btn-cautelar px-8 py-3"
          onClick={() => { sfx.confirm(); onFin?.(); }}
        >
          ▸ Continuar
        </button>
      </motion.div>
    );
  }

  // ── DERROTA ───────────────────────────────────────────────────────────────
  if (terminado === "derrota") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="terminal p-8 text-center space-y-5"
        style={{ borderColor: "var(--zona-nulidad)", boxShadow: "0 0 60px var(--zona-nulidad)15" }}
      >
        <div className="text-[9px] font-mono-terminal text-zona-nulidad uppercase tracking-[.4em]">
          ✗ DERROTA
        </div>
        <h2 className="font-display-grave text-4xl text-doc-aged">
          {boss.nombre} te aniquila
        </h2>
        <p className="font-serif-juridica italic text-doc-aged/60 text-base max-w-lg mx-auto">
          «Vuelve cuando hayas leído el Cassarino. O el Maturana. O algo.»
        </p>
        <div className="font-mono-terminal text-[9px] text-zona-nulidad">
          +10 Trauma
        </div>
        <button
          className="btn btn-danger px-8 py-3"
          onClick={() => { sfx.click(); onFin?.(); }}
        >
          ▸ Retirarse con dignidad
        </button>
      </motion.div>
    );
  }

  // ── COMBATE ACTIVO ────────────────────────────────────────────────────────
  const saludBossPct = (saludBoss / boss.saludInicial) * 100;
  const saludJugadorPct = (saludJugador / boss.saludJugador) * 100;

  return (
    <div className="space-y-4">

      {/* ─── BOSS CARD ─── */}
      <motion.div
        className="terminal p-5 relative"
        style={{ borderColor: `${phaseColor}40`, boxShadow: `0 0 30px ${phaseColor}08` }}
        animate={{ borderColor: `${phaseColor}40` }}
        transition={{ duration: 0.5 }}
      >
        {/* daño flotante */}
        <div className="absolute inset-0 pointer-events-none z-20" style={{ overflow: "visible" }}>
          <AnimatePresence>
            {floats.map((f) => (
              <motion.span
                key={f.id}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: 1, y: -34, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute font-display-grave text-2xl"
                style={{ left: f.side === "boss" ? "7%" : "76%", top: f.side === "boss" ? "30%" : "72%", color: f.color, textShadow: "0 2px 6px rgba(0,0,0,.8)" }}
              >
                {f.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-5 flex-wrap items-start">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <AvatarBoss bossId={boss.id} size={130} />
            {phase >= 2 && (
              <div
                className="absolute -top-1 -right-1 text-[8px] font-mono-terminal px-1.5 py-0.5 border animate-flicker"
                style={{ borderColor: phaseColor, color: phaseColor, background: "var(--bg-deep)" }}
              >
                {PHASE_LABEL[phase]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-[180px]">
            <div
              className="text-[9px] font-mono-terminal uppercase tracking-[.3em] mb-1"
              style={{ color: phaseColor }}
            >
              {boss.rama.toUpperCase()} · {PHASE_LABEL[phase]}
            </div>
            <h2 className="font-display-grave text-2xl text-doc-aged">{boss.nombre}</h2>
            <p className="text-doc-aged/50 text-xs mt-1.5 italic font-serif-juridica line-clamp-2">{boss.ambientacion}</p>
          </div>

          {/* HP Bars */}
          <div className="space-y-3 min-w-[220px]">
            {/* Boss HP */}
            <div>
              <div className="flex justify-between text-[9px] font-mono-terminal mb-1">
                <span className="text-zona-nulidad uppercase tracking-widest">Salud boss</span>
                <span className="text-doc-aged/50">{saludBoss}/{boss.saludInicial}</span>
              </div>
              <div className="h-2.5 bg-bg-steel rounded">
                <motion.div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${saludBossPct}%`,
                    background: `linear-gradient(90deg, var(--zona-nulidad), ${phaseColor})`,
                    boxShadow: `0 0 8px var(--zona-nulidad)60`,
                  }}
                  animate={{ width: `${saludBossPct}%` }}
                />
              </div>
            </div>

            {/* Jugador HP */}
            <div>
              <div className="flex justify-between text-[9px] font-mono-terminal mb-1">
                <span className="text-zona-competencia uppercase tracking-widest">Salud mental</span>
                <span className="text-doc-aged/50">{saludJugador}/{boss.saludJugador}</span>
              </div>
              <div className="h-2.5 bg-bg-steel rounded">
                <motion.div
                  className="h-full rounded"
                  style={{
                    width: `${saludJugadorPct}%`,
                    background: "linear-gradient(90deg, var(--zona-competencia), var(--zona-cautelares))",
                    boxShadow: "0 0 8px var(--zona-competencia)60",
                  }}
                  animate={{ width: `${saludJugadorPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ataque counter */}
        <div className="flex items-center gap-1.5 mt-3">
          {boss.ataques.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded transition-all duration-300"
              style={{
                background: i < ataqueIdx ? phaseColor : i === ataqueIdx ? phaseColor : "var(--bg-steel)",
                opacity: i < ataqueIdx ? 0.3 : 1,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ─── PREGUNTA ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ataqueIdx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="terminal p-5 space-y-4"
        >
          {/* Ataque header */}
          <div className="flex items-center justify-between">
            <div
              className="text-[8px] font-mono-terminal uppercase tracking-widest px-2 py-0.5 border"
              style={{ borderColor: `${phaseColor}50`, color: phaseColor }}
            >
              ATAQUE {ataqueIdx + 1} · {ataque?.tipo?.toUpperCase() ?? "—"}
            </div>
            <div className="font-mono-terminal text-[8px] text-doc-aged/30">
              Daño: {ataque?.damage ?? 0} pts
            </div>
          </div>

          {/* Pregunta */}
          {ataque && (
          <div className="border-l-2 pl-4" style={{ borderColor: phaseColor }}>
            <p className="font-serif-juridica text-doc-aged text-base leading-relaxed">
              {ataque.pregunta}
            </p>
            {ataque.articuloEsperado && (
              <div className="font-mono-terminal text-[8px] text-doc-aged/30 mt-1">
                Área: Art. {ataque.articuloEsperado} CPC
              </div>
            )}
          </div>
          )}

          {/* Opciones */}
          {!feedback && shuffled && (
            <div className="space-y-2">
              {shuffled.options.map((op, i) => (
                <button
                  key={i}
                  onClick={() => responder(i)}
                  className="block w-full text-left p-3.5 border border-doc-aged/15 hover:border-zona-competencia/40 text-sm font-mono-terminal text-doc-aged/70 hover:text-doc-aged transition-all duration-150 hover:bg-zona-competencia/5"
                >
                  <span className="text-zona-competencia/60 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {(op as any).texto ?? (op as any).texto}
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                {/* Reacción del boss */}
                <div
                  className="p-3 border text-sm font-serif-juridica italic text-doc-aged/70"
                  style={{
                    borderColor: feedback.ok ? "var(--zona-cautelares)30" : "var(--zona-nulidad)30",
                    background: feedback.ok ? "var(--zona-cautelares)05" : "var(--zona-nulidad)05",
                  }}
                >
                  <div
                    className="font-mono-terminal text-[9px] uppercase tracking-widest mb-1 not-italic"
                    style={{ color: feedback.ok ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}
                  >
                    {feedback.ok ? "✓ CORRECTO" : "✗ INCORRECTO"}
                    &nbsp;·&nbsp;
                    <span className="text-doc-aged/40">{boss.nombre} dice:</span>
                  </div>
                  «{feedback.reaccion}»
                </div>

                {/* Explicación */}
                <div className="p-3 bg-bg-steel/30 text-xs font-mono-terminal text-doc-aged/70 leading-relaxed">
                  {feedback.explicacion}
                </div>

                {/* Art + damage */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono-terminal px-2 py-0.5 border"
                    style={{ borderColor: "var(--zona-nulidad)30", color: "var(--zona-nulidad)" }}
                  >
                    {feedback.art}
                  </span>
                  <span
                    className="font-mono-terminal text-[9px]"
                    style={{ color: feedback.ok ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}
                  >
                    {feedback.ok ? `−${feedback.damage} HP boss` : `−${feedback.damage} HP tú`}
                  </span>
                </div>

                <button
                  onClick={avanzar}
                  className="btn w-full py-2.5"
                >
                  ▸ Siguiente ataque
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
