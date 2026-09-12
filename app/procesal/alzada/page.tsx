"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useProcesal } from "@/store/useProcesal";
import { RELATOR, MEMORIA_ALZADA, HIPOTESIS_ALZADA, type HipotesisAlzada } from "@/data/procesal/alzada";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function AlzadaPage() {
  const [tab, setTab] = useState<"hipotesis" | "repaso">("hipotesis");
  const [fraseIdx, setFraseIdx] = useState(0);
  const premio = useProcesal((s) => s.premio);

  // quiz
  const [qs, setQs] = useState<HipotesisAlzada[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [prestigio, setPrestigio] = useState(50);
  const [seed, setSeed] = useState(0);
  const [claimed, setClaimed] = useState(false);

  // repaso
  const [cardIdx, setCardIdx] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setFraseIdx((i) => (i + 1) % RELATOR.frases.length), 5200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setQs(shuffle(HIPOTESIS_ALZADA).map((q) => ({ ...q, opciones: shuffle(q.opciones) })));
    setIdx(0); setElegida(null); setAciertos(0); setPrestigio(50); setClaimed(false);
  }, [seed]);

  const fin = qs.length > 0 && idx >= qs.length;
  useEffect(() => {
    if (fin && !claimed) { setClaimed(true); premio(aciertos * 5, aciertos); sfx.unlock?.(); }
  }, [fin, claimed, aciertos, premio]);

  const q = !fin && qs.length > 0 ? qs[idx] : null;
  const revelado = elegida !== null;
  const acerto = q ? elegida === q.correcta : false;

  const responder = (id: string) => {
    if (revelado || !q) return;
    setElegida(id);
    if (id === q.correcta) { setAciertos((n) => n + 1); setPrestigio((p) => Math.min(100, p + 12)); sfx.confirm?.(); }
    else { setPrestigio((p) => Math.max(0, p - 14)); sfx.warning?.(); }
  };
  const siguiente = () => { setElegida(null); setIdx((i) => i + 1); sfx.click?.(); };

  const card = MEMORIA_ALZADA[cardIdx];
  const veredictoAlz = prestigio >= 80 ? "La Sala te escucha con respeto." : prestigio >= 50 ? "Sobrevives en estrados." : prestigio > 0 ? "El relator carraspea, incómodo." : "Te bajaron del estrado.";

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16" data-proc="recursos">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/procesal" className="proc-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Ciudadela</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Segunda instancia</span>
      </header>

      {/* hero narrador */}
      <div className="proc-panel p-4 mb-3">
        <div className="flex items-start gap-3">
          <motion.div className="text-4xl shrink-0 proc-float" style={{ filter: "drop-shadow(0 0 12px var(--proc-primary))" }}>{RELATOR.icono}</motion.div>
          <div className="min-w-0">
            <div className="proc-tag">El Tribunal de Alzada</div>
            <h1 className="proc-heading text-2xl md:text-3xl leading-none">Apelación y casación, sin piedad</h1>
            <p className="font-serif-juridica italic text-[12.5px] opacity-70 mt-1.5">“{RELATOR.frases[fraseIdx]}”</p>
            <div className="font-mono-terminal text-[9px] opacity-50 mt-0.5">— {RELATOR.nombre}</div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setTab("hipotesis"); sfx.click?.(); }} className="proc-btn flex-1 py-2 text-sm" style={{ opacity: tab === "hipotesis" ? 1 : 0.5 }}>⚔️ Hipótesis</button>
        <button onClick={() => { setTab("repaso"); sfx.click?.(); }} className="proc-btn flex-1 py-2 text-sm" style={{ opacity: tab === "repaso" ? 1 : 0.5 }}>🧠 Repaso</button>
      </div>

      {tab === "hipotesis" ? (
        qs.length === 0 ? (
          <div className="proc-heading text-center proc-float py-10">Instalando la Sala…</div>
        ) : fin ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="proc-panel p-6 text-center">
            <div className="text-3xl mb-1">{aciertos === qs.length ? "🏛️" : aciertos >= qs.length * 0.6 ? "✅" : "📚"}</div>
            <div className="proc-heading text-xl mb-1">Vista terminada</div>
            <p className="font-serif-juridica opacity-85 text-sm">{veredictoAlz}</p>
            <p className="font-serif-juridica opacity-75 text-sm mt-1">Aciertos: <span className="proc-accent">{aciertos}/{qs.length}</span> · Prestigio: <span className="proc-accent">{prestigio}</span></p>
            <div className="font-mono-terminal text-[11px] proc-accent mt-1 mb-4">+{aciertos * 5} XP · 🔖 {aciertos}</div>
            <button onClick={() => setSeed((s) => s + 1)} className="proc-btn px-5 py-2.5 text-sm">↻ Nueva vista</button>
          </motion.div>
        ) : q ? (
          <div>
            {/* prestigio */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono-terminal text-[10px] opacity-60 shrink-0">Prestigio</span>
              <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: prestigio >= 50 ? "linear-gradient(90deg,#2c7350,#5fb37a)" : "linear-gradient(90deg,#8a2f28,#c65b6e)" }} animate={{ width: `${prestigio}%` }} />
              </div>
              <span className="font-mono-terminal text-[10px] proc-accent shrink-0">{idx + 1}/{qs.length}</span>
            </div>

            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="proc-panel p-4 md:p-5">
              <div className="proc-card p-3 mb-3">
                <div className="proc-tag mb-1">Hipótesis · {q.titulo}</div>
                <p className="font-serif-juridica text-[15px] leading-relaxed">{q.situacion}</p>
              </div>
              <p className="font-serif-juridica text-[15px] font-semibold mb-3" style={{ color: "var(--proc-primary)" }}>{q.pregunta}</p>
              <div className="space-y-2">
                {q.opciones.map((op) => {
                  let state: string | undefined;
                  if (revelado) state = op.id === q.correcta ? "ok" : op.id === elegida ? "bad" : "dim";
                  return (
                    <button key={op.id} onClick={() => responder(op.id)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={state} className="proc-opt w-full px-3 py-2.5 font-serif-juridica text-[14px] flex items-center gap-2">
                      {revelado && op.id === q.correcta && <span className="shrink-0">✓</span>}
                      {revelado && op.id === elegida && op.id !== q.correcta && <span className="shrink-0">✗</span>}
                      <span>{op.texto}</span>
                    </button>
                  );
                })}
              </div>
              {revelado && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                  <div className="proc-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
                    <div className="proc-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>{acerto ? "✦ Bien razonado" : "✗ Revisa"} · {q.articulo}</div>
                    <p className="font-serif-juridica text-[13.5px] opacity-90 leading-relaxed">{q.razonamiento}</p>
                  </div>
                  <button onClick={siguiente} className="proc-btn w-full py-2.5 text-sm mt-2">{idx + 1 < qs.length ? "Siguiente hipótesis ▸" : "Ver veredicto ▸"}</button>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : null
      ) : (
        // REPASO (flip cards)
        <div>
          <div className="flex items-center gap-3 max-w-md mb-3">
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--proc-secondary), var(--proc-primary))" }} animate={{ width: `${((cardIdx + 1) / MEMORIA_ALZADA.length) * 100}%` }} />
            </div>
            <span className="font-mono-terminal text-[11px] proc-accent">{cardIdx + 1}/{MEMORIA_ALZADA.length}</span>
          </div>

          <button onClick={() => { setFlip((f) => !f); sfx.click?.(); }} className="w-full text-left">
            <motion.div key={card.id + String(flip)} initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="proc-panel p-6 min-h-[180px] flex flex-col items-center justify-center text-center">
              {!flip ? (
                <>
                  <div className="proc-tag mb-2">Concepto · toca para revelar</div>
                  <div className="proc-heading text-xl md:text-2xl">{card.frente}</div>
                </>
              ) : (
                <>
                  <div className="proc-tag mb-2" style={{ color: "var(--proc-accent)" }}>Regla · {card.articulo}</div>
                  <p className="font-serif-juridica text-[15px] leading-relaxed opacity-90">{card.dorso}</p>
                </>
              )}
            </motion.div>
          </button>

          <div className="flex gap-2 mt-3">
            <button onClick={() => { setCardIdx((i) => (i - 1 + MEMORIA_ALZADA.length) % MEMORIA_ALZADA.length); setFlip(false); sfx.click?.(); }} className="proc-btn flex-1 py-2.5 text-sm">◂ Anterior</button>
            <button onClick={() => { setCardIdx((i) => (i + 1) % MEMORIA_ALZADA.length); setFlip(false); sfx.click?.(); }} className="proc-btn flex-1 py-2.5 text-sm">Siguiente ▸</button>
          </div>
          <p className="font-mono-terminal text-[10px] opacity-45 text-center mt-3">Repasa las {MEMORIA_ALZADA.length} reglas y luego pon a prueba tu criterio en Hipótesis.</p>
        </div>
      )}
    </div>
  );
}
