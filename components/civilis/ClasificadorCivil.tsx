"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import type { CasoCivil } from "@/types/civilis";
import { getEntradaCodex } from "@/data/civilis/codex";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

// ============================================================================
// CLASIFICADOR CIVIL — minijuego nuclear: caso concreto → opciones de
// clasificación → feedback con cita formal. Acertar desbloquea el Codex.
// ============================================================================

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const hashId = (id: string) => id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

export default function ClasificadorCivil({
  caso,
  onResuelto,
  onClose,
}: {
  caso: CasoCivil;
  onResuelto?: () => void;
  onClose: () => void;
}) {
  const resolverCaso = useCivilis((s) => s.resolverCaso);
  const yaResuelto = useCivilis((s) => s.casosResueltos.includes(caso.id));
  const yaEnCodex = useCivilis((s) => (caso.codexId ? s.codexDesbloqueado.includes(caso.codexId) : true));

  const [elegida, setElegida] = useState<string | null>(null);
  const categorias = useMezclaEstable(caso.id, () => seededShuffle(caso.categorias, hashId(caso.id)));
  const revelado = elegida !== null;
  const acerto = elegida === caso.correcta;
  const entradaNueva = caso.codexId && acerto && !yaEnCodex ? getEntradaCodex(caso.codexId) : undefined;

  const elegir = (id: string) => {
    if (revelado) return;
    setElegida(id);
    if (id === caso.correcta) {
      sfx.confirm?.();
      if (!yaResuelto) resolverCaso(caso.id, caso.recompensa, caso.codexId);
      if (caso.codexId && !yaEnCodex) setTimeout(() => sfx.unlock?.(), 320);
      onResuelto?.();
    } else {
      sfx.warning?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="civ-panel p-4 md:p-5"
      data-civ={caso.region}
    >
      {/* enemigo */}
      <div className="flex items-center gap-3 mb-3">
        <motion.span
          className="text-3xl shrink-0 civ-float inline-block"
          style={{ filter: "drop-shadow(0 0 8px var(--civ-primary))" }}
        >
          {caso.iconoEnemigo}
        </motion.span>
        <div className="min-w-0">
          <div className="civ-tag">Enemigo · dif. {caso.dificultad}</div>
          <div className="civ-heading text-lg leading-tight">{caso.enemigo}</div>
        </div>
        <button onClick={onClose} className="ml-auto text-[var(--civ-ink)]/40 hover:text-[var(--civ-ink)]/80 font-mono-terminal text-sm shrink-0">✕</button>
      </div>

      {/* enunciado */}
      <div className="civ-card p-3 mb-3">
        <p className="font-serif-juridica text-[15px] leading-relaxed" style={{ color: "var(--civ-ink)" }}>{caso.enunciado}</p>
        {caso.contexto && <p className="font-mono-terminal text-[10px] mt-1.5 opacity-50">{caso.contexto}</p>}
      </div>

      <div className="civ-tag mb-2">{caso.pregunta}</div>

      {/* categorías */}
      <div className="space-y-2">
        {categorias.map((cat) => {
          let state: string | undefined;
          if (revelado) {
            if (cat.id === caso.correcta) state = "ok";
            else if (cat.id === elegida) state = "bad";
            else state = "dim";
          }
          return (
            <button
              key={cat.id}
              onClick={() => elegir(cat.id)}
              onMouseEnter={() => !revelado && sfx.hover?.()}
              disabled={revelado}
              data-state={state}
              className="civ-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2"
            >
              {revelado && cat.id === caso.correcta && <span className="shrink-0">✓</span>}
              {revelado && cat.id === elegida && cat.id !== caso.correcta && <span className="shrink-0">✗</span>}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* feedback */}
      {revelado && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
          <div className="civ-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
            <div className="civ-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>
              {acerto ? "✦ Correcto" : "✗ Incorrecto"} · {caso.articulo}
            </div>
            <p className="font-serif-juridica text-[13.5px] leading-relaxed opacity-90">{caso.explicacion}</p>
          </div>

          {entradaNueva && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="civ-card p-3 flex items-center gap-3" style={{ borderColor: "var(--civ-primary)" }}>
              <span className="text-2xl shrink-0" style={{ filter: "drop-shadow(0 0 8px var(--civ-primary))" }}>{entradaNueva.icono}</span>
              <div className="min-w-0">
                <div className="civ-tag">✦ Codex desbloqueado</div>
                <div className="civ-heading text-sm leading-tight">{entradaNueva.institucion}</div>
              </div>
            </motion.div>
          )}

          {acerto && (
            <div className="font-mono-terminal text-[11px] civ-accent">
              +{caso.recompensa.xp} XP · 🪙 {caso.recompensa.oro}{yaResuelto ? " (ya resuelto antes)" : ""}
            </div>
          )}

          <button onClick={onClose} className="civ-btn w-full py-2.5 text-sm mt-1">
            {acerto ? "Continuar ▸" : "Volver e intentar otro"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
