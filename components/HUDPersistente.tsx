"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// HUD PERSISTENTE — sólo realimentación efímera.
//
// Lo que queda aquí no ocupa espacio ni recibe clics: el "+XP" flotante y el
// "+monedas". El barrido CRT periódico (un re-render global cada 7 s) se retiró
// junto con el resto de la atmósfera CRT.
// ============================================================================

export default function HUDPersistente() {
  const xp = useGame((s) => s.xp);
  const monedas = useGame((s) => s.monedas);

  const [xpGain, setXpGain] = useState<number | null>(null);
  const [coinGain, setCoinGain] = useState<number | null>(null);

  // El valor anterior se guarda fuera del estado: así el efecto depende sólo de
  // `xp` y no hay que omitir dependencias.
  useEffect(() => {
    let vivo = true;
    const anterior = anteriorXp.valor;
    anteriorXp.valor = xp;
    if (anterior === null || xp <= anterior) return;
    setXpGain(xp - anterior);
    const t = setTimeout(() => vivo && setXpGain(null), 2000);
    return () => { vivo = false; clearTimeout(t); };
  }, [xp]);

  useEffect(() => {
    let vivo = true;
    const anterior = anteriorMonedas.valor;
    anteriorMonedas.valor = monedas;
    if (anterior === null || monedas <= anterior) return;
    setCoinGain(monedas - anterior);
    const t = setTimeout(() => vivo && setCoinGain(null), 1800);
    return () => { vivo = false; clearTimeout(t); };
  }, [monedas]);

  return (
    <>
      <AnimatePresence>
        {xpGain !== null && (
          <motion.div
            key="xp-gain"
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 1.5 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[130] pointer-events-none"
            aria-hidden="true"
          >
            <div className="flotante-xp">+{xpGain} XP</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {coinGain !== null && (
          <motion.div
            key="coin-gain"
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 1.5 }}
            className="fixed top-36 left-1/2 -translate-x-1/2 z-[130] pointer-events-none"
            aria-hidden="true"
          >
            <div className="flotante-monedas">🪙 +{coinGain}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Último valor visto, fuera del ciclo de render: no debe provocar re-render ni
// entrar en las dependencias de los efectos.
const anteriorXp: { valor: number | null } = { valor: null };
const anteriorMonedas: { valor: number | null } = { valor: null };
