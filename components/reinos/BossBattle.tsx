"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { shuffleOptions } from "@/lib/shuffleOptions";
import type { BossReino, AtaqueBoss } from "@/types/reinos";
import { useReinos } from "@/store/useReinos";
import { getArticulo, RAREZA_META } from "@/data/reinos/articulos";
import ReinoSprite from "@/components/reinos/ReinoSprite";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

// ============================================================================
// REINOS — Duelo de Boss · arena estilo Pokémon / arcade SNES
// Variedad: cada combate extrae un SUBCONJUNTO de ataques en ORDEN ALEATORIO
// (nunca la misma pregunta primero). Juice: golpes, flash, screen-shake, daño
// flotante, combos y secuencias cinemáticas de intro y victoria.
// ============================================================================

type Fase = "intro" | "combate" | "victoria" | "derrota";
type Float = { id: number; text: string; color: string; side: "boss" | "player" };

const DURACION_S = 20;   // segundos por ataque antes de recibir un golpe por demora
const TIMEOUT_DMG = 10;  // daño por dejar correr el tiempo

function pickRonda(boss: BossReino): AtaqueBoss[] {
  const n = Math.min(boss.hp, boss.ataques.length);
  return (shuffleOptions(boss.ataques as any[]).options as AtaqueBoss[]).slice(0, n);
}

interface Props {
  boss: BossReino;
  onClose: () => void;
}

export default function BossBattle({ boss, onClose }: Props) {
  const derrotarBoss = useReinos((s) => s.derrotarBoss);
  const yaDerrotado = useReinos((s) => s.bossesDerrotados.includes(boss.id));

  const [fase, setFase] = useState<Fase>("intro");
  const [rondaKey, setRondaKey] = useState(0);
  const [ronda, setRonda] = useState<AtaqueBoss[]>(() => pickRonda(boss));
  const [idx, setIdx] = useState(0);
  const [vida, setVida] = useState(boss.vidaJugador);
  const [intentos, setIntentos] = useState<number[]>([]);
  const [acertada, setAcertada] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [bossHitting, setBossHitting] = useState(false);
  const [disparo, setDisparo] = useState(0); // proyectil de ataque: incrementa en cada acierto
  const [arenaShake, setArenaShake] = useState(false);
  const [redFlash, setRedFlash] = useState(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const [timeLeft, setTimeLeft] = useState(100);
  const floatId = useRef(0);

  const articulo = boss.recompensaArticuloId ? getArticulo(boss.recompensaArticuloId) : undefined;
  const totalGolpes = ronda.length;
  const ataque = ronda[idx % ronda.length];
  const golpesDados = idx; // ataques resueltos antes del actual (avanza con "siguiente")
  const bossHp = Math.max(0, totalGolpes - golpesDados - (acertada ? 1 : 0));
  const bossPct = Math.round((bossHp / totalGolpes) * 100);
  const vidaPct = Math.max(0, Math.round((vida / boss.vidaJugador) * 100));
  const comboBonus = comboMax * 3;

  const opciones = useMezclaEstable(
    `${boss.id}:${idx}:${rondaKey}`,
    () => shuffleOptions(ataque.opciones as any[]).options as typeof ataque.opciones,
  );

  const hp = (pct: number) => (pct > 55 ? "high" : pct > 25 ? "mid" : "low");

  const spawnFloat = (text: string, color: string, side: "boss" | "player") => {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, text, color, side }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1000);
  };

  const empezar = () => { sfx.bossEntrada?.(); setFase("combate"); };

  const reiniciar = useCallback(() => {
    setRonda(pickRonda(boss));
    setRondaKey((k) => k + 1);
    setVida(boss.vidaJugador);
    setIdx(0);
    setIntentos([]);
    setAcertada(false);
    setCombo(0);
    setComboMax(0);
    setFloats([]);
    setFase("combate");
  }, [boss]);

  const handleElegir = (i: number) => {
    if (acertada || intentos.includes(i) || fase !== "combate") return;
    const op = opciones[i];

    if (op.correcta) {
      const nuevoCombo = combo + 1;
      setCombo(nuevoCombo);
      setComboMax((m) => Math.max(m, nuevoCombo));
      setAcertada(true);
      setBossHitting(true);
      setDisparo((d) => d + 1);
      setTimeout(() => setBossHitting(false), 420);
      spawnFloat(nuevoCombo > 1 ? `¡ACIERTO! ×${nuevoCombo}` : "¡ACIERTO!", "var(--zona-cautelares)", "boss");
      if (nuevoCombo > 1) sfx.combo?.(nuevoCombo); else sfx.oralCorrecta?.();

      const nuevoHp = totalGolpes - golpesDados - 1;
      if (nuevoHp <= 0) {
        sfx.casacion?.();
        derrotarBoss(boss.id, boss.region, {
          cristales: boss.recompensaCristales + comboBonus,
          articuloId: boss.recompensaArticuloId,
        });
        setTimeout(() => setFase("victoria"), 700);
      }
    } else {
      setCombo(0);
      setIntentos((prev) => [...prev, i]);
      setArenaShake(true);
      setRedFlash((r) => r + 1);
      setTimeout(() => setArenaShake(false), 400);
      sfx.glitch?.();
      const nuevaVida = Math.max(0, vida - ataque.dano);
      spawnFloat(`-${ataque.dano}`, "var(--zona-nulidad)", "player");
      setVida(nuevaVida);
      if (nuevaVida <= 0) setTimeout(() => setFase("derrota"), 500);
    }
  };

  const siguiente = () => {
    setIdx((v) => v + 1);
    setIntentos([]);
    setAcertada(false);
    sfx.click?.();
  };

  // ── Presión de tiempo: barra que corre por ataque ─────────────────────────
  useEffect(() => {
    if (fase !== "combate" || acertada) return;
    setTimeLeft(100);
    let t = 100;
    const step = 100 / (DURACION_S * 20); // 20 ticks/seg
    const iv = setInterval(() => {
      t -= step;
      if (t <= 0) {
        // golpe por demora: rompe combo, daña y reinicia la ventana
        setCombo(0);
        setArenaShake(true);
        setTimeout(() => setArenaShake(false), 400);
        setRedFlash((r) => r + 1);
        sfx.plazoCritico?.();
        spawnFloat(`-${TIMEOUT_DMG} ⏰`, "var(--zona-ejecutivo)", "player");
        setVida((v) => {
          const nv = Math.max(0, v - TIMEOUT_DMG);
          if (nv <= 0) setTimeout(() => setFase("derrota"), 400);
          return nv;
        });
        t = 100;
      }
      setTimeLeft(t);
    }, 50);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, acertada, fase, rondaKey]);

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="reino-arena p-6 md:p-10 text-center" style={{ minHeight: 360 }}>
        {/* banner sweep */}
        <div className="absolute inset-x-0 top-6 flex justify-center pointer-events-none">
          <div className="reino-banner-sweep font-display-grave text-sm md:text-lg uppercase tracking-[.3em]" style={{ color: "var(--reino-primary)" }}>
            ¡Un adversario bloquea el paso!
          </div>
        </div>
        <motion.div className="relative inline-block mt-10 mb-5">
          <div className="reino-platform absolute -bottom-3 left-1/2 -translate-x-1/2" style={{ width: 130, height: 30 }} />
          <div className="reino-boss-enter inline-block">
            <ReinoSprite bossId={boss.id} size={150} />
          </div>
        </motion.div>
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] reino-fg mb-2">
          ⚔ Boss de Región · {boss.arquetipo}
        </div>
        <h2 className="font-display-grave text-3xl md:text-5xl text-doc-aged mb-3">{boss.nombre}</h2>
        <p className="font-serif-juridica text-doc-aged/65 text-sm max-w-xl mx-auto mb-3 leading-relaxed">{boss.descripcion}</p>
        <div className="reino-chip inline-block font-mono-terminal text-[10px] px-3 py-1.5 mb-6">
          {boss.problemaJuridico}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={empezar} className="btn btn-oral text-sm px-7 py-3">
            ⚔ {yaDerrotado ? "Volver a desafiar" : "¡Combatir!"}
          </motion.button>
          <button onClick={() => { sfx.click?.(); onClose(); }} className="btn text-xs px-4 py-3">◂ Huir</button>
        </div>
        {yaDerrotado && (
          <div className="font-mono-terminal text-[9px] text-doc-aged/40 mt-4">Ya lo venciste. Las preguntas se barajan: cada duelo es distinto.</div>
        )}
      </motion.div>
    );
  }

  // ── VICTORIA ─────────────────────────────────────────────────────────────
  if (fase === "victoria") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="reino-arena p-6 md:p-10 text-center" style={{ minHeight: 360 }}>
        {/* chispas */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="reino-spark text-lg" style={{
            left: `${50 + (Math.random() * 40 - 20)}%`, top: `${40 + (Math.random() * 20 - 10)}%`,
            ["--sx" as any]: `${Math.random() * 80 - 40}px`, ["--sy" as any]: `${-40 - Math.random() * 60}px`,
            animationDelay: `${Math.random() * 0.4}s`,
          }}>{["✦", "✧", "★", "💥"][i % 4]}</span>
        ))}
        <div className="text-7xl mb-3">🏆</div>
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em]" style={{ color: "var(--zona-cautelares)" }}>Boss derrotado</div>
        <h2 className="font-display-grave text-3xl text-doc-aged mt-2 mb-2">{boss.nombre} ha caído</h2>
        <div className="flex items-center justify-center gap-4 font-mono-terminal text-sm mb-5">
          <span className="reino-fg">💎 +{boss.recompensaCristales + comboBonus}</span>
          {comboMax > 1 && <span style={{ color: "var(--zona-oralidad)" }}>combo máx ×{comboMax} (+{comboBonus})</span>}
        </div>

        {articulo && (
          <motion.div initial={{ opacity: 0, y: 14, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.25 }}
            className="max-w-md mx-auto p-4 mb-6 border" style={{ borderColor: `${RAREZA_META[articulo.rareza].color}66`, background: `${RAREZA_META[articulo.rareza].color}10` }}>
            <div className="text-3xl mb-2">{articulo.icono}</div>
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: RAREZA_META[articulo.rareza].color }}>
              Artículo {RAREZA_META[articulo.rareza].label} desbloqueado
            </div>
            <div className="font-display-grave text-lg text-doc-aged">{articulo.etiqueta} — {articulo.titulo}</div>
            <p className="font-serif-juridica text-doc-aged/60 text-xs mt-2 leading-relaxed">{articulo.texto}</p>
          </motion.div>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => { sfx.confirm?.(); onClose(); }} className="btn btn-cautelar text-sm px-6 py-3">Reclamar y volver ▸</button>
          <button onClick={reiniciar} className="btn text-xs px-4 py-3">↻ Revancha</button>
        </div>
      </motion.div>
    );
  }

  // ── DERROTA ──────────────────────────────────────────────────────────────
  if (fase === "derrota") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="reino-arena p-6 md:p-10 text-center" style={{ minHeight: 360 }}>
        <div className="flex justify-center mb-3">
          <div className="reino-boss-idle" style={{ filter: "grayscale(.7) brightness(.7)" }}>
            <ReinoSprite bossId={boss.id} size={96} />
          </div>
        </div>
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em]" style={{ color: "var(--zona-nulidad)" }}>Has sido refutado</div>
        <h2 className="font-display-grave text-2xl text-doc-aged mt-2 mb-3">El expediente se desploma</h2>
        <p className="font-serif-juridica text-doc-aged/60 text-sm max-w-md mx-auto mb-6">
          {boss.nombre} desarticuló tu defensa. Reordena tus argumentos: ningún artículo se pierde y las preguntas se barajan.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.05 }} onClick={reiniciar} className="btn btn-oral text-sm px-6 py-3">↻ Reintentar duelo</motion.button>
          <button onClick={() => { sfx.click?.(); onClose(); }} className="btn text-xs px-4 py-3">◂ Volver</button>
        </div>
      </motion.div>
    );
  }

  // ── COMBATE ──────────────────────────────────────────────────────────────
  return (
    <div className={`reino-arena ${arenaShake ? "reino-arena-shake" : ""}`} style={{ padding: "1rem" }}>
      {/* flash rojo al recibir daño */}
      {redFlash > 0 && <span key={redFlash} className="reino-redflash" />}

      {/* daño flotante */}
      <AnimatePresence>
        {floats.map((f) => (
          <span key={f.id} className="reino-dmgfloat font-display-grave text-2xl"
            style={{ color: f.color, left: f.side === "boss" ? "62%" : "24%", top: f.side === "boss" ? "16%" : "60%" }}>
            {f.text}
          </span>
        ))}
      </AnimatePresence>

      {/* ESCENA: jugador (abajo-izq) vs jefe (arriba-der) */}
      <div className="relative" style={{ minHeight: 150 }}>
        {/* Jefe */}
        <div className="absolute right-1 md:right-3 top-1 flex flex-col items-center w-[116px] md:w-[150px]">
          <div className="w-full mb-2">
            <div className="flex items-center justify-between font-mono-terminal text-[8px] mb-1">
              <span className="text-doc-aged/70 truncate">{boss.nombre}</span>
              <span className="reino-fg">HP</span>
            </div>
            <div className="reino-hpbar">
              <div className="reino-hpbar-fill" data-h={hp(bossPct)} style={{ width: `${bossPct}%` }} />
            </div>
          </div>
          <div className="relative">
            <div className="reino-platform absolute -bottom-2 left-1/2 -translate-x-1/2" style={{ width: 90, height: 22 }} />
            <div className={`reino-bsprite inline-block ${bossHitting ? "reino-boss-hit" : "reino-boss-idle"}`}>
              <ReinoSprite bossId={boss.id} size={92} />
            </div>
          </div>
        </div>

        {/* Jugador */}
        <div className="absolute left-1 md:left-3 bottom-0 flex flex-col items-center w-[112px] md:w-[140px]">
          <div className="relative mb-2">
            <div className="reino-platform absolute -bottom-2 left-1/2 -translate-x-1/2" style={{ width: 70, height: 18 }} />
            <span className="text-4xl md:text-5xl inline-block">🧑‍⚖️</span>
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between font-mono-terminal text-[8px] mb-1">
              <span style={{ color: "var(--zona-cautelares)" }}>TÚ</span>
              <span className="text-doc-aged/60">{vida}</span>
            </div>
            <div className="reino-hpbar">
              <div className="reino-hpbar-fill" data-h={hp(vidaPct)} style={{ width: `${vidaPct}%` }} />
            </div>
          </div>
        </div>

        {/* Combo + progreso */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
          <AnimatePresence mode="wait">
            {combo > 1 && (
              <motion.div key={combo} className="reino-combo-pop font-display-grave text-xl" style={{ color: "var(--zona-oralidad)" }}>
                COMBO ×{combo}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hidden md:block font-mono-terminal text-[8px] text-doc-aged/40 mt-1">Ataque {idx + 1}/{totalGolpes}</div>
        </div>

        {/* Proyectil de ataque del jugador → vuela hacia el jefe y revienta en impacto */}
        {disparo > 0 && (
          <motion.span
            key={`proj-${disparo}`}
            className="absolute z-30 rounded-full pointer-events-none"
            initial={{ left: "20%", top: "64%", opacity: 0.95, scale: 0.5 }}
            animate={{ left: "74%", top: "26%", opacity: [0.95, 1, 0], scale: [0.5, 1, 1.3] }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            style={{ width: 16, height: 16, marginLeft: -8, marginTop: -8, background: "radial-gradient(circle, #fff 0%, var(--reino-primary) 70%)", boxShadow: "0 0 18px 4px var(--reino-primary)" }}
          />
        )}
        {disparo > 0 && (
          <motion.span
            key={`imp-${disparo}`}
            className="absolute z-30 rounded-full pointer-events-none"
            initial={{ left: "74%", top: "26%", opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.2, 1.7, 2.2] }}
            transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
            style={{ width: 54, height: 54, marginLeft: -27, marginTop: -27, border: "2.5px solid var(--reino-primary)", boxShadow: "0 0 20px var(--reino-primary)" }}
          />
        )}
      </div>

      {/* CAJA DE COMANDO: pregunta + opciones */}
      <div className="reino-card mt-2 p-4" style={{ background: "linear-gradient(180deg, rgba(8,10,16,.96), rgba(6,7,11,.98))" }}>
        {!acertada && (
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-terminal text-[9px]" style={{ color: timeLeft > 40 ? "var(--reino-primary)" : timeLeft > 20 ? "var(--zona-prueba)" : "var(--zona-nulidad)" }}>⏱</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${timeLeft}%`, background: timeLeft > 40 ? "var(--reino-primary)" : timeLeft > 20 ? "var(--zona-prueba)" : "var(--zona-nulidad)", boxShadow: timeLeft <= 20 ? "0 0 8px var(--zona-nulidad)" : "none" }} />
            </div>
          </div>
        )}
        <div className="font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/55 mb-1">
          <span className="md:hidden">Ataque {idx + 1}/{totalGolpes} · </span>{boss.nombre} contraataca{acertada && ataque.articulo ? ` · ${ataque.articulo}` : ""}
        </div>
        <p className="reino-question text-[18px] md:text-[21px] mb-4">{ataque.enunciado}</p>

        <div className="space-y-2">
          {opciones.map((op, i) => {
            const esError = intentos.includes(i);
            const esCorrecta = acertada && op.correcta;
            const bloqueada = acertada || esError;
            return (
              <motion.button
                key={`${rondaKey}-${idx}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={!bloqueada ? { scale: 1.01, x: 2 } : {}}
                onClick={() => handleElegir(i)}
                onMouseEnter={() => !bloqueada && sfx.hover?.()}
                disabled={bloqueada}
                className="reino-opt w-full text-left p-3.5 border transition-colors duration-150"
                style={{
                  borderColor: esCorrecta ? "var(--zona-cautelares)" : esError ? "var(--zona-nulidad)" : "color-mix(in srgb, var(--reino-primary) 28%, transparent)",
                  background: esCorrecta ? "rgba(88,245,176,0.08)" : esError ? "rgba(217,74,74,0.08)" : "rgba(255,255,255,0.015)",
                  opacity: esError && !esCorrecta ? 0.65 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="reino-badge mt-0.5" data-state={esCorrecta ? "ok" : esError ? "bad" : undefined}>
                    {esCorrecta ? "✓" : esError ? "✕" : String.fromCharCode(65 + i)}
                  </span>
                  <span className="reino-optext text-[14px] md:text-[15px] text-doc-aged">{op.texto}</span>
                </div>
                <AnimatePresence>
                  {(esError || esCorrecta) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="reino-explain text-[13px] md:text-[14.5px] mt-2.5 pl-[38px] pr-1 leading-relaxed"
                      style={{ color: esCorrecta ? "rgba(176,246,214,0.96)" : "rgba(242,176,176,0.92)" }}>
                      {op.explicacion}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-doc-aged/10 flex items-center justify-between gap-3">
          <button onClick={() => { sfx.click?.(); onClose(); }} className="btn text-[10px] px-3 py-1.5">◂ Huir</button>
          {acertada && bossHp > 0 && (
            <motion.button initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.04 }}
              onClick={siguiente} className="btn btn-oral text-[11px] px-4 py-2 reino-pulse">
              Siguiente ataque ▸
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
