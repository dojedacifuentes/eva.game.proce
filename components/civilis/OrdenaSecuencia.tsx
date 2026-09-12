"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import type { Secuencia } from "@/data/civilis/secuencias";
import { getRegionCivil } from "@/data/civilis/regiones";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function OrdenaSecuencia({ secuencia, onSalir }: { secuencia: Secuencia; onSalir: () => void }) {
  // mezclado estable (el componente se monta tras selección en cliente → sin SSR)
  const barajados = useMezclaEstable(secuencia.id, () => shuffle(secuencia.items.map((t, i) => ({ t, idx: i }))));
  const [colocados, setColocados] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [errores, setErrores] = useState(0);

  const region = getRegionCivil(secuencia.region);
  const completo = colocados === secuencia.items.length;

  const click = (idx: number) => {
    if (idx === colocados) { setColocados((c) => c + 1); sfx.confirm?.(); }
    else { setErrores((e) => e + 1); setWrong(idx); sfx.warning?.(); setTimeout(() => setWrong(null), 420); }
  };

  return (
    <div className="max-w-2xl mx-auto" data-civ={secuencia.region}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{region?.icono}</span>
        <span className="civ-tag">{secuencia.articulo} · errores {errores}</span>
      </div>
      <h2 className="civ-heading text-xl md:text-2xl mb-3">{secuencia.titulo}</h2>

      {/* orden construido */}
      <div className="space-y-2 mb-3">
        {secuencia.items.slice(0, colocados).map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="civ-opt px-3 py-2.5 font-serif-juridica text-[13px] flex items-center gap-2" data-state="ok">
            <span className="font-mono-terminal text-[11px] opacity-70">{i + 1}.</span>{t}
          </motion.div>
        ))}
      </div>

      {completo ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="civ-panel p-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="civ-heading text-lg">¡Secuencia correcta!</div>
          <p className="font-serif-juridica opacity-75 text-sm mt-1">{errores === 0 ? "Sin errores. Impecable." : `Con ${errores} error(es).`}</p>
          <button onClick={onSalir} className="civ-btn px-5 py-2.5 text-sm mt-4">◂ Otra secuencia</button>
        </motion.div>
      ) : (
        <>
          <div className="civ-tag mb-2">Toca el paso que va en la posición {colocados + 1}</div>
          <div className="space-y-2">
            {barajados.filter((b) => b.idx >= colocados).map((b) => (
              <button key={b.idx} onClick={() => click(b.idx)} className="civ-opt w-full px-3 py-2.5 font-serif-juridica text-[13px] text-left"
                data-state={wrong === b.idx ? "bad" : undefined}>
                {b.t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
