"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import { SKILLS, skillsDesbloqueadas, type Skill } from "@/lib/skills";
import { sfx } from "@/lib/audio";
import { useModalAccesible } from "@/lib/useModalAccesible";

// ============================================================================
// GRIMORIO DE SKILLS — vista de habilidades coleccionables
// Estética: libro arcano de poderes procesales.
// ============================================================================

export default function GrimorioSkills() {
  const logros = useGame((s) => s.logros);
  const pushLog = useGame((s) => s.pushLog);
  const desbloqueadas = skillsDesbloqueadas(logros);
  const [activa, setActiva] = useState<Skill | null>(null);
  // Foco atrapado, Escape y devolución del foco, conservando el arte
  // propio de este overlay (ver lib/useModalAccesible.ts).
  const cajaModal = useModalAccesible<HTMLDivElement>(() => setActiva(null));
  const [usadas, setUsadas] = useState<string[]>([]);

  function usar(s: Skill) {
    sfx.casacion();
    setUsadas((arr) => [...arr, s.id]);
    pushLog(`Habilidad invocada: ${s.nombre} — ${s.efectoCorto}`, "SKILL");
  }

  return (
    <div className="space-y-4">
      <div className="terminal p-5">
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-recursos mb-2">GRIMORIO</div>
        <h2 className="font-display-grave text-3xl text-doc-aged mb-2">Habilidades Procesales</h2>
        <p className="font-serif-juridica italic text-doc-aged/60 text-sm">
          «Todo abogado domina, en privado, técnicas que jamás reconocerá en público. Acá están las tuyas.»
        </p>
        <div className="mt-3 text-[10px] font-mono-terminal text-doc-aged/40">
          DESBLOQUEADAS: <span className="text-zona-cautelares">{desbloqueadas.length}</span> / {SKILLS.length}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SKILLS.map((s) => {
          const disponible = desbloqueadas.some((d) => d.id === s.id);
          const usada = usadas.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => { if (disponible) { setActiva(s); sfx.hover(); } else { sfx.warning(); } }}
              onMouseEnter={() => disponible && sfx.hover()}
              className={`zona-card p-4 text-left ${!disponible ? "opacity-40" : ""}`}
              style={{ "--zona-color": `var(--zona-${s.zona})` } as React.CSSProperties}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">{disponible ? s.emoji : "🔒"}</span>
                {usada && <span className="text-[9px] font-mono-terminal text-doc-aged/40 uppercase">USADA</span>}
              </div>
              <h3 className="font-display-grave text-base text-doc-aged tracking-wider mb-1">{s.nombre}</h3>
              <div className="text-[10px] uppercase tracking-widest font-mono-terminal mb-2" style={{ color: `var(--zona-${s.zona})` }}>
                {s.efectoCorto}
              </div>
              {!disponible && (
                <div className="text-[10px] text-doc-aged/40 italic mt-2 font-serif-juridica">
                  ✦ {s.desbloqueoCondicion}
                </div>
              )}
              {disponible && (
                <div className="text-[10px] text-zona-cautelares mt-2 font-mono-terminal">
                  ✓ disponible · cd {s.cooldownTurnos}t
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MODAL DETALLE */}
      <AnimatePresence>
        {activa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiva(null)}
            className="modal-scrim"
          >
            <motion.div
              ref={cajaModal} role="dialog" aria-modal="true" aria-label="Detalle de habilidad"
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="zona-card p-8 max-w-lg w-full"
              style={{ "--zona-color": `var(--zona-${activa.zona})` } as React.CSSProperties}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-6xl">{activa.emoji}</span>
                <button onClick={() => setActiva(null)} className="text-doc-aged/40 hover:text-doc-aged">✕</button>
              </div>
              <h3 className="font-display-grave text-2xl text-doc-aged mb-2">{activa.nombre}</h3>
              <div className="text-[10px] uppercase tracking-widest font-mono-terminal mb-4" style={{ color: `var(--zona-${activa.zona})` }}>
                {activa.zona} · cooldown {activa.cooldownTurnos} turnos
              </div>
              <p className="font-serif-juridica italic text-doc-aged/85 mb-4">{activa.descripcion}</p>
              <div className="p-3 border border-zona-recursos/40 bg-zona-recursos/5 text-xs text-doc-aged mb-4">
                <span className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mr-2">EFECTO</span>
                {activa.efectoCorto}
              </div>
              <button
                onClick={() => { usar(activa); setActiva(null); }}
                onMouseEnter={() => sfx.hover()}
                disabled={usadas.includes(activa.id)}
                className="btn btn-recurso w-full text-base py-3"
              >
                {usadas.includes(activa.id) ? "★ YA INVOCADA EN ESTA SESIÓN" : "▶ INVOCAR HABILIDAD"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
