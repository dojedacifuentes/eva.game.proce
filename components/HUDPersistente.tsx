"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// HUD PERSISTENTE — sólo realimentación efímera.
//
// Los cuatro paneles `position:fixed` que este componente dibujaba en las
// esquinas (identidad, XP, stats, reloj, audio) se trasladaron a la cabecera del
// shell: allí ocupan sitio en el grid en vez de superponerse al contenido, que
// era la causa de que cabeceras y barras se taparan entre sí.
//
// Lo que queda aquí no ocupa espacio ni recibe clics: el "+XP" flotante, el
// "+monedas" y el barrido CRT periódico.
// ============================================================================

export default function HUDPersistente() {
  const xp = useGame((s) => s.xp);
  const monedas = useGame((s) => s.monedas);

  const [scanlinePulse, setScanlinePulse] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [coinGain, setCoinGain] = useState<number | null>(null);

  useEffect(() => {
    const p = setInterval(() => {
      setScanlinePulse(true);
      setTimeout(() => setScanlinePulse(false), 600);
    }, 7000);
    return () => clearInterval(p);
  }, []);

  // El valor anterior se guarda en una ref del propio efecto en vez de en estado:
  // así el efecto depende sólo de `xp` y no hay que omitir `prevXp` de las
  // dependencias (era una de las advertencias de react-hooks/exhaustive-deps).
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
            className="fixed bottom-28 left-8 z-50 pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="font-display-grave text-xl text-zona-cautelares"
              style={{ textShadow: "0 0 20px #58F5B0, 0 0 40px #58F5B060" }}
            >
              +{xpGain} XP
            </div>
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
            className="fixed bottom-14 left-8 z-50 pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="font-display-grave text-lg text-zona-prueba"
              style={{ textShadow: "0 0 20px #D7B46A, 0 0 40px #D7B46A60" }}
            >
              🪙 +{coinGain}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scanlinePulse && (
        <div className="fixed inset-x-0 top-0 z-30 pointer-events-none" aria-hidden="true">
          <div
            className="h-0.5 scanline-sweep"
            style={{
              background: "linear-gradient(90deg, transparent, var(--zona-competencia), transparent)",
              boxShadow: "0 0 12px var(--zona-competencia)",
            }}
          />
        </div>
      )}
    </>
  );
}

// Último valor visto, fuera del ciclo de render: no debe provocar re-render ni
// entrar en las dependencias de los efectos.
const anteriorXp: { valor: number | null } = { valor: null };
const anteriorMonedas: { valor: number | null } = { valor: null };
