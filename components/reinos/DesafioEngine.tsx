"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { shuffleOptions } from "@/lib/shuffleOptions";
import type { Desafio } from "@/types/reinos";
import { TIPO_DESAFIO_META } from "@/data/reinos/desafios";
import { getArticulo, RAREZA_META } from "@/data/reinos/articulos";
import { useReinos } from "@/store/useReinos";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

// ============================================================================
// REINOS — Motor de Desafío (encuentro individual)
// Acertar otorga recompensa (region page persiste); fallar invoca onWrong
// (region page descuenta vida). En modo "review" solo revela la solución.
// ============================================================================

interface Props {
  desafio: Desafio;
  yaResuelto: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onClose: () => void;
}

export default function DesafioEngine({ desafio, yaResuelto, onCorrect, onWrong, onClose }: Props) {
  const meta = TIPO_DESAFIO_META[desafio.tipo];
  const [intentos, setIntentos] = useState<number[]>([]);
  const [elegida, setElegida] = useState<number | null>(null);
  const [resuelto, setResuelto] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [eliminadas, setEliminadas] = useState<number[]>([]);
  const [pistaUsada, setPistaUsada] = useState(false);
  const cristales = useReinos((s) => s.cristales);
  const gastarCristales = useReinos((s) => s.gastarCristales);

  // Mezcla las opciones una vez por encuentro: mata el sesgo posicional.
  const opciones = useMezclaEstable(
    desafio.id,
    () => shuffleOptions(desafio.opciones as any[]).options as Desafio["opciones"],
  );

  const review = yaResuelto; // ya resuelto antes: modo repaso
  const articuloPremio = desafio.recompensa.articuloId ? getArticulo(desafio.recompensa.articuloId) : undefined;

  const handleElegir = (i: number) => {
    if (resuelto || review || intentos.includes(i) || eliminadas.includes(i)) return;
    const op = opciones[i];
    setElegida(i);
    if (op.correcta) {
      setResuelto(true);
      sfx.oralCorrecta?.();
      if (desafio.recompensa.articuloId) setTimeout(() => sfx.unlock?.(), 350);
      onCorrect();
    } else {
      setIntentos((prev) => [...prev, i]);
      setShakeKey((k) => k + 1);
      sfx.oralIncorrecta?.();
      onWrong();
    }
  };

  const mostrarComoCorrecta = (i: number) => (resuelto || review) && opciones[i].correcta;
  const mostrarComoError = (i: number) => intentos.includes(i);

  // Pista: gasta cristales para descartar una opción incorrecta
  const COSTO_PISTA = 15;
  const candidatasPista = opciones.map((_, i) => i).filter((i) => !opciones[i].correcta && !eliminadas.includes(i) && !intentos.includes(i));
  const usarPista = () => {
    if (pistaUsada || resuelto || review || candidatasPista.length === 0) return;
    if (!gastarCristales(COSTO_PISTA)) { sfx.warning?.(); return; }
    const pick = candidatasPista[Math.floor(Math.random() * candidatasPista.length)];
    setEliminadas((p) => [...p, pick]);
    setPistaUsada(true);
    sfx.confirm?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="reino-card p-5 md:p-6"
    >
      {/* ── Cabecera del encuentro ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0">{desafio.iconoEnemigo}</span>
          <div className="min-w-0">
            <div className="font-mono-terminal text-[9px] uppercase tracking-widest reino-fg">
              {meta.icono} {meta.label} · {"★".repeat(desafio.dificultad)}
            </div>
            <div className="font-display-grave text-base text-doc-aged leading-tight truncate">
              {desafio.enemigo}
            </div>
          </div>
        </div>
        {(resuelto || review) ? (
          <span className="reino-chip font-mono-terminal text-[9px] px-2 py-1 shrink-0">
            {desafio.articuloClave}
          </span>
        ) : (
          <span className="font-mono-terminal text-[9px] px-2 py-1 shrink-0 text-doc-aged/30 border border-doc-aged/15">
            ¿qué norma rige?
          </span>
        )}
      </div>

      {/* ── Verbo del reto ── */}
      <div className="font-mono-terminal text-[11px] uppercase tracking-[.2em] reino-fg mb-2 opacity-90">
        ▸ {meta.verbo}
      </div>

      {/* ── Contexto + enunciado ── */}
      {desafio.contexto && (
        <p className="reino-explain italic text-doc-aged/70 text-sm md:text-[15px] mb-2.5">{desafio.contexto}</p>
      )}
      <motion.p
        key={shakeKey}
        className={`reino-question text-[19px] md:text-[22px] mb-5 ${shakeKey ? "reino-shake" : ""}`}
      >
        {desafio.enunciado}
      </motion.p>

      {/* ── Pista: gasta cristales para descartar una incorrecta ── */}
      {!resuelto && !review && (
        <div className="flex justify-end mb-2.5">
          <button
            onClick={usarPista}
            onMouseEnter={() => !pistaUsada && cristales >= COSTO_PISTA && sfx.hover?.()}
            disabled={pistaUsada || cristales < COSTO_PISTA || candidatasPista.length === 0}
            className="font-mono-terminal text-[10px] px-3 py-1.5 border transition-all disabled:opacity-40"
            style={{ borderColor: "color-mix(in srgb, var(--reino-primary) 40%, transparent)", color: "var(--reino-primary)", background: "color-mix(in srgb, var(--reino-primary) 7%, transparent)" }}
            title="Descarta una opción incorrecta"
          >
            {pistaUsada ? "💡 Pista usada" : `💡 Pista · descartar 1 (${COSTO_PISTA} 💎)`}
          </button>
        </div>
      )}

      {/* ── Opciones ── */}
      <div className="space-y-2.5">
        {opciones.map((op, i) => {
          const esCorrecta = mostrarComoCorrecta(i);
          const esError = mostrarComoError(i);
          const esEliminada = eliminadas.includes(i);
          const bloqueada = resuelto || review || esError || esEliminada;
          return (
            <div key={i} className="reino-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <button
                onClick={() => handleElegir(i)}
                onMouseEnter={() => !bloqueada && sfx.hover?.()}
                disabled={bloqueada}
                className="reino-opt w-full text-left p-3.5 border transition-all duration-150"
                style={{
                  borderColor: esCorrecta
                    ? "var(--zona-cautelares)"
                    : esError
                    ? "var(--zona-nulidad)"
                    : "color-mix(in srgb, var(--reino-primary) 28%, transparent)",
                  background: esCorrecta
                    ? "rgba(88,245,176,0.08)"
                    : esError
                    ? "rgba(217,74,74,0.08)"
                    : "rgba(255,255,255,0.015)",
                  cursor: bloqueada ? "default" : "pointer",
                  opacity: esEliminada ? 0.32 : esError && !esCorrecta ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="reino-badge mt-0.5" data-state={esCorrecta ? "ok" : esError || esEliminada ? "bad" : undefined}>
                    {esCorrecta ? "✓" : esError || esEliminada ? "✕" : String.fromCharCode(65 + i)}
                  </span>
                  <span className="reino-optext text-[14px] md:text-[15px] text-doc-aged" style={esEliminada ? { textDecoration: "line-through" } : undefined}>{op.texto}</span>
                </div>
                {/* Explicación: al fallar esa opción o al revelar la correcta */}
                <AnimatePresence>
                  {(esError || esCorrecta) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="reino-explain text-[13px] md:text-[14.5px] mt-2.5 pl-[38px] pr-1 leading-relaxed"
                      style={{ color: esCorrecta ? "rgba(176,246,214,0.96)" : "rgba(242,176,176,0.92)" }}
                    >
                      {op.explicacion}
                      {op.art && <span className="reino-optext text-[11px] opacity-80"> · {op.art}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Resultado / recompensa ── */}
      <AnimatePresence>
        {(resuelto || review) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 pt-4 border-t border-doc-aged/10"
          >
            {/* Norma clave a memorizar — el aprendizaje primero */}
            <div className="reino-lesson p-3 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="reino-norma text-[12px]">📖 {desafio.articuloClave}</span>
              <span className="reino-explain text-doc-aged/75 text-[13px]">Norma clave de este desafío — fíjala en tu memoria.</span>
            </div>
            {review ? (
              <div className="font-mono-terminal text-[10px] uppercase tracking-widest text-doc-aged/40 mb-3">
                ✓ Desafío ya superado — repaso
              </div>
            ) : (
              <div className="relative flex flex-wrap items-center gap-3 mb-3">
                {/* chispas de victoria */}
                {Array.from({ length: 6 }).map((_, k) => (
                  <span key={k} className="reino-spark text-sm" style={{
                    left: `${6 + k * 7}%`, top: "10%",
                    ["--sx" as any]: `${Math.random() * 40 - 20}px`, ["--sy" as any]: `${-26 - Math.random() * 24}px`,
                    animationDelay: `${k * 0.05}s`,
                  }}>{["✦", "✧", "★"][k % 3]}</span>
                ))}
                <motion.span
                  initial={{ scale: 0.6, rotate: -4 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="font-display-grave text-lg"
                  style={{ color: "var(--zona-cautelares)" }}
                >
                  ¡Enemigo derrotado!
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-mono-terminal text-[11px] reino-fg-2">+{desafio.recompensa.xp} XP</motion.span>
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="font-mono-terminal text-[11px] reino-fg">💎 {desafio.recompensa.cristales} cristales</motion.span>
              </div>
            )}

            {articuloPremio && (
              <div
                className="flex items-center gap-3 p-3 mb-3 border"
                style={{ borderColor: `${RAREZA_META[articuloPremio.rareza].color}55`, background: `${RAREZA_META[articuloPremio.rareza].color}0d` }}
              >
                <span className="text-2xl">{articuloPremio.icono}</span>
                <div>
                  <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: RAREZA_META[articuloPremio.rareza].color }}>
                    {review ? "Artículo en biblioteca" : "¡Artículo legendario desbloqueado!"} · {RAREZA_META[articuloPremio.rareza].label}
                  </div>
                  <div className="font-display-grave text-sm text-doc-aged">
                    {articuloPremio.etiqueta} — {articuloPremio.titulo}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { sfx.confirm?.(); onClose(); }} className="btn btn-cautelar text-[11px] px-4 py-2">
              Continuar ▸
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Volver ── */}
      {!resuelto && !review && (
        <div className="mt-5 pt-4 border-t border-doc-aged/10">
          <button onClick={() => { sfx.click?.(); onClose(); }} className="btn text-[10px] px-3 py-1.5">
            ◂ Retirarse
          </button>
        </div>
      )}
    </motion.div>
  );
}
