"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CAMPAÑA, getMision } from "@/data/campaign";
import { getMissionPlaybook, type MissionOption } from "@/data/mission-playbooks";
import { getWorldDefinition } from "@/data/worlds";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";

type Phase = "briefing" | "dossier" | "challenge" | "result";

export default function MissionRunner({ missionId }: { missionId: string }) {
  const router = useRouter();
  const missionEntry = getMision(missionId);
  const playbook = getMissionPlaybook(missionId);
  const game = useGame();
  const [phase, setPhase] = useState<Phase>("briefing");
  const [selected, setSelected] = useState<MissionOption | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [risk, setRisk] = useState(18);
  const [completedNow, setCompletedNow] = useState(false);

  const alreadyDone = game.misionesCompletadas.includes(missionId);

  const nextUrl = useMemo(() => {
    if (!missionEntry) return "/juego";
    const { acto } = missionEntry;
    const nextMission = acto.misiones.find((m) => !game.misionesCompletadas.includes(m.id) && m.id !== missionId);
    if (nextMission) return `/mision/${nextMission.id}`;
    return `/boss/${acto.bossId}`;
  }, [game.misionesCompletadas, missionEntry, missionId]);

  if (!missionEntry || !playbook) {
    return (
      <GameShell variant="focus" eyebrow="Campaña" title="Misión" back={{ href: "/juego", label: "Hub" }} scrollLabel="Contenido de la misión">
      <div className="min-h-screen px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <Link href="/juego" className="btn text-xs">Volver al mapa</Link>
        <div className="terminal p-6 mt-6">
          <h1 className="font-display-grave text-2xl text-doc-aged">Mision no encontrada</h1>
          <p className="text-doc-aged/60 text-sm mt-2 font-mono-terminal">
            La ruta existe, pero no hay playbook jugable para esta mision.
          </p>
        </div>
      </div>
    </GameShell>
    );
  }

  const { acto, mision } = missionEntry;
  const world = getWorldDefinition(playbook.worldId);
  const isCorrect = selected?.correct ?? false;

  const answer = (option: MissionOption) => {
    setSelected(option);
    setAttempts((n) => n + 1);
    if (option.correct) {
      sfx.confirm?.();
    } else {
      sfx.inadmisible?.();
      setRisk((r) => Math.min(100, r + 22));
      game.ajustarTrauma(2);
      game.ajustarReputacion(-1);
      game.pushLog(`Error en ${mision.titulo}: ${option.feedback}`, "mision");
    }
    setPhase("result");
  };

  const completeMission = () => {
    if (!alreadyDone && !completedNow) {
      game.completarMision(mision.id, mision.recompensa);
      game.desbloquearLogro({
        id: `mision_${mision.id}`,
        titulo: mision.titulo,
        descripcion: playbook.unlock.description,
        articulo: playbook.feedback.article,
        desbloqueado: true,
        fecha: Date.now(),
      });
      game.pushLog(`Mision completada: ${mision.titulo}`, "mision");
      if (mision.id === "m7_2") {
        game.finalizar("Aprobaste la simulacion final. La Ciudad Judicial no desaparece: ahora te respeta un poco.");
      }
      setCompletedNow(true);
    }
    router.push(nextUrl);
  };

  const retry = () => {
    setSelected(null);
    setPhase("challenge");
    sfx.click?.();
  };

  return (
    <GameShell variant="focus" eyebrow="Campaña" title="Misión" back={{ href: "/juego", label: "Hub" }} scrollLabel="Contenido de la misión">
      <div
      className="min-h-screen px-4 md:px-8 py-6 pb-24"
      style={{
        background: `
          radial-gradient(900px 500px at 8% 0%, ${world.palette.primary}1c, transparent 60%),
          radial-gradient(800px 460px at 92% 15%, ${world.palette.secondary}18, transparent 62%),
          linear-gradient(180deg, ${world.palette.surface}, var(--bg-deep) 72%)
        `,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div className="flex gap-2 flex-wrap">
            <Link href="/juego" className="btn text-xs">Volver al mapa</Link>
            <Link href={world.route} className="btn btn-recurso text-xs">Explorar mundo</Link>
          </div>
          <div className="font-mono-terminal text-[9px] uppercase tracking-[.25em] text-doc-aged/45">
            Acto {acto.numero} / {world.shortTitle} / {mision.tipo}
          </div>
        </header>

        <section className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          <div className="space-y-4">
            <div className="zona-card p-5 md:p-6" style={{ "--zona-color": world.palette.primary } as React.CSSProperties}>
              <div className="font-mono-terminal text-[9px] uppercase tracking-[.35em] mb-2" style={{ color: world.palette.primary }}>
                {playbook.subtitle}
              </div>
              <h1 className="font-display-grave text-3xl md:text-5xl text-doc-aged leading-tight">
                {playbook.title}
              </h1>
              <p className="font-serif-juridica text-doc-aged/70 text-sm md:text-base mt-3 max-w-2xl">
                {world.tagline}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {phase === "briefing" && (
                <MotionPanel key="briefing" color={world.palette.primary}>
                  <NpcBlock playbook={playbook} color={world.palette.primary} />
                  <div className="border-t border-doc-aged/10 pt-4">
                    <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/45 mb-2">
                      Objetivo pedagogico
                    </div>
                    <p className="text-doc-aged/75 text-sm leading-relaxed font-mono-terminal">
                      {world.mechanic}
                    </p>
                  </div>
                  <button className="btn btn-cyan w-full py-3" onClick={() => setPhase("dossier")}>
                    Abrir expediente
                  </button>
                </MotionPanel>
              )}

              {phase === "dossier" && (
                <MotionPanel key="dossier" color={world.palette.primary}>
                  <div>
                    <div className="font-mono-terminal text-[9px] uppercase tracking-widest mb-2" style={{ color: world.palette.primary }}>
                      Expediente {playbook.dossier.rol}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <DossierList title="Hechos" items={playbook.dossier.facts} />
                      <DossierList title="Pistas" items={playbook.dossier.clues} />
                    </div>
                  </div>
                  <button className="btn btn-recurso w-full py-3" onClick={() => setPhase("challenge")}>
                    Formular estrategia
                  </button>
                </MotionPanel>
              )}

              {phase === "challenge" && (
                <MotionPanel key="challenge" color={world.palette.primary}>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="font-mono-terminal text-[9px] uppercase tracking-widest" style={{ color: world.palette.primary }}>
                        Desafio / {playbook.challenge.kind}
                      </div>
                      <span className="tag" style={{ borderColor: world.palette.primary, color: world.palette.primary }}>
                        {playbook.feedback.article}
                      </span>
                    </div>
                    <h2 className="font-display-grave text-xl md:text-2xl text-doc-aged leading-snug">
                      {playbook.challenge.prompt}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {playbook.challenge.options.map((option, idx) => (
                      <button
                        key={option.id}
                        onClick={() => answer(option)}
                        onMouseEnter={() => sfx.hover?.()}
                        className="w-full text-left p-3 border border-doc-aged/15 hover:border-doc-aged/35 transition-colors"
                      >
                        <div className="flex gap-3">
                          <span className="font-mono-terminal text-[10px] opacity-50">{String.fromCharCode(65 + idx)}</span>
                          <span className="text-sm text-doc-aged/85 font-mono-terminal leading-relaxed">{option.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </MotionPanel>
              )}

              {phase === "result" && selected && (
                <MotionPanel key="result" color={isCorrect ? "var(--zona-cautelares)" : "var(--zona-nulidad)"}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 border flex items-center justify-center font-display-grave"
                      style={{
                        color: isCorrect ? "var(--zona-cautelares)" : "var(--zona-nulidad)",
                        borderColor: isCorrect ? "var(--zona-cautelares)" : "var(--zona-nulidad)",
                      }}
                    >
                      {isCorrect ? "OK" : "NO"}
                    </div>
                    <div>
                      <div
                        className="font-mono-terminal text-[9px] uppercase tracking-widest mb-1"
                        style={{ color: isCorrect ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}
                      >
                        {isCorrect ? "Decision correcta" : "Decision riesgosa"}
                      </div>
                      <p className="font-serif-juridica text-doc-aged/85 text-base leading-relaxed">
                        {selected.feedback}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <FeedbackBox label="Consecuencia procesal" text={selected.consequence} />
                    <FeedbackBox label="Institucion" text={playbook.feedback.institution} />
                    <FeedbackBox label="Articulo clave" text={playbook.feedback.article} />
                    <FeedbackBox label="Como decirlo en grado" text={playbook.feedback.exam} />
                  </div>

                  {isCorrect ? (
                    <div className="space-y-3">
                      <div className="p-3 border border-zona-cautelares/40 bg-zona-cautelares/5">
                        <div className="font-display-grave text-zona-cautelares text-sm">{playbook.unlock.title}</div>
                        <p className="text-doc-aged/65 text-xs mt-1 font-mono-terminal">{playbook.unlock.description}</p>
                        {!alreadyDone && (
                          <p className="text-zona-prueba text-xs mt-2 font-mono-terminal">
                            +{mision.recompensa.xp} XP / +{mision.recompensa.monedas} monedas
                          </p>
                        )}
                      </div>
                      <button className="btn btn-cautelar w-full py-3" onClick={completeMission}>
                        Cobrar recompensa y continuar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button className="btn btn-danger flex-1" onClick={retry}>
                        Reintentar razonadamente
                      </button>
                      <button className="btn flex-1" onClick={() => setPhase("dossier")}>
                        Revisar expediente
                      </button>
                    </div>
                  )}
                </MotionPanel>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4">
            <div className="terminal p-4">
              <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/45 mb-2">Progreso de mision</div>
              <ProgressStep label="Briefing" active={phase === "briefing"} done={phase !== "briefing"} />
              <ProgressStep label="Expediente" active={phase === "dossier"} done={["challenge", "result"].includes(phase)} />
              <ProgressStep label="Desafio" active={phase === "challenge"} done={phase === "result"} />
              <ProgressStep label="Feedback" active={phase === "result"} done={alreadyDone || completedNow} />
            </div>

            <div className="terminal p-4">
              <div className="flex justify-between text-[9px] font-mono-terminal uppercase tracking-widest mb-2">
                <span className="text-doc-aged/45">Riesgo procesal</span>
                <span className={risk > 65 ? "text-zona-nulidad" : "text-zona-prueba"}>{risk}%</span>
              </div>
              <div className="h-2 bg-bg-deep border border-doc-aged/10">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${risk}%`,
                    background: risk > 65 ? "var(--zona-nulidad)" : "var(--zona-prueba)",
                  }}
                />
              </div>
              <p className="text-[10px] text-doc-aged/45 mt-3 font-mono-terminal">
                Fallar no bloquea el aprendizaje: aumenta trauma, baja reputacion y exige reintento con feedback.
              </p>
            </div>

            <div className="terminal p-4">
              <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-2">
                Foco examen
              </div>
              <div className="space-y-1">
                {world.examFocus.map((x) => (
                  <div key={x} className="text-[10px] font-mono-terminal text-doc-aged/65 border border-doc-aged/10 px-2 py-1">
                    {x}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-doc-aged/35 mt-3 font-serif-juridica italic">{playbook.nextHint}</p>
            </div>

            {alreadyDone && (
              <div className="p-3 border border-zona-cautelares/40 bg-zona-cautelares/5 text-zona-cautelares text-xs font-mono-terminal">
                Mision ya completada. Puedes repetirla para estudiar sin duplicar recompensa.
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
    </GameShell>
  );
}
function MotionPanel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="terminal p-5 md:p-6 space-y-5"
      style={{ borderColor: `${color}66` }}
    >
      {children}
    </motion.div>
  );
}

function NpcBlock({ playbook, color }: { playbook: ReturnType<typeof getMissionPlaybook> extends infer T ? NonNullable<T> : never; color: string }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-16 h-16 shrink-0 border flex items-center justify-center font-display-grave text-lg"
        style={{
          borderColor: color,
          color,
          background: `${color}12`,
          boxShadow: `0 0 24px ${color}22`,
        }}
      >
        {playbook.npc.avatar}
      </div>
      <div>
        <div className="font-mono-terminal text-[9px] uppercase tracking-widest mb-1" style={{ color }}>
          {playbook.npc.role}
        </div>
        <h2 className="font-display-grave text-xl text-doc-aged">{playbook.npc.name}</h2>
        <p className="font-serif-juridica text-doc-aged/75 text-sm mt-2 leading-relaxed">"{playbook.npc.line}"</p>
      </div>
    </div>
  );
}

function DossierList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-doc-aged/10 p-3">
      <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/45 mb-2">{title}</div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 text-xs text-doc-aged/70 font-mono-terminal leading-relaxed">
            <span className="text-doc-aged/30">{idx + 1}.</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="border border-doc-aged/10 p-3">
      <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/35 mb-1">{label}</div>
      <p className="text-xs text-doc-aged/75 leading-relaxed font-mono-terminal">{text}</p>
    </div>
  );
}

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`w-2 h-2 rounded-full ${done ? "bg-zona-cautelares" : active ? "bg-zona-prueba" : "bg-doc-aged/20"}`} />
      <span className={`text-[10px] font-mono-terminal ${active ? "text-doc-aged" : done ? "text-zona-cautelares" : "text-doc-aged/35"}`}>
        {label}
      </span>
    </div>
  );
}
