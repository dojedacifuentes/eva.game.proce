"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPAÑA, getBoss } from "@/data/campaign";
import { getWorldDefinition } from "@/data/worlds";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";

type BossQuestion = {
  prompt: string;
  article: string;
  options: { text: string; correct: boolean; feedback: string }[];
  examAnswer: string;
};

const BOSS_QUESTIONS: Record<string, BossQuestion[]> = {
  esfinge_competencia: [
    {
      prompt: "El demandado contesta el fondo sin alegar incompetencia relativa. ¿Que efecto puede producirse?",
      article: "COT / competencia relativa",
      options: [
        { text: "Prorroga tacita de competencia relativa, si la materia lo permite.", correct: true, feedback: "Correcto. La competencia relativa puede sanearse por conducta procesal." },
        { text: "Nulidad absoluta inevitable.", correct: false, feedback: "Incorrecto. Confundes competencia relativa con absoluta." },
        { text: "Casacion inmediata sin sentencia.", correct: false, feedback: "Incorrecto. No hay sentencia susceptible de casacion." },
      ],
      examAnswer: "Distinguir competencia absoluta y relativa; la relativa debe reclamarse oportunamente o puede prorrogarse.",
    },
  ],
  receptor_fantasma: [
    {
      prompt: "Primera notificacion de la demanda hecha por estado diario. El demandado nunca comparece. ¿Cual es el problema?",
      article: "Arts. 40 y 768 N°9 CPC",
      options: [
        { text: "Falta emplazamiento valido y hay indefension reclamable.", correct: true, feedback: "Correcto. La primera notificacion exige forma idonea." },
        { text: "No hay problema si se publico en el estado diario.", correct: false, feedback: "Incorrecto. El estado diario no sustituye el emplazamiento inicial." },
        { text: "Solo hay error de redaccion.", correct: false, feedback: "Incorrecto. Es un vicio de defensa, no tipografia." },
      ],
      examAnswer: "Emplazamiento = notificacion valida + plazo. Sin ello, se afecta bilateralidad y puede proceder nulidad.",
    },
  ],
  oraculo_prueba: [
    {
      prompt: "La parte intenta rendir documentos antiguos despues del termino probatorio y los llama 'nuevos'. ¿Que evalua el tribunal?",
      article: "Arts. 318 y ss. CPC",
      options: [
        { text: "Si son realmente procedentes por regla especial o superviniencia; si no, preclusion.", correct: true, feedback: "Correcto. Lo olvidado no se vuelve superviniente por nostalgia." },
        { text: "Debe recibirlos siempre por verdad material.", correct: false, feedback: "Incorrecto. La oportunidad probatoria ordena el contradictorio." },
        { text: "Debe dictar sentencia sin oir a nadie.", correct: false, feedback: "Incorrecto. La decision debe fundarse y respetar contradiccion." },
      ],
      examAnswer: "Relaciona carga, oportunidad, cierre del termino probatorio y excepciones legales.",
    },
  ],
  juez_hierro: [
    {
      prompt: "Sentencia definitiva omite resolver una excepcion opuesta. ¿Como se arma el ataque?",
      article: "Arts. 170 y 768 CPC",
      options: [
        { text: "Identificar omision, agravio, causal de forma y preparacion si corresponde.", correct: true, feedback: "Correcto. Un recurso serio une vicio, perjuicio y causal." },
        { text: "Pedir reposicion ordinaria de la sentencia definitiva.", correct: false, feedback: "Incorrecto. La reposicion ordinaria no es la via general contra sentencia definitiva." },
        { text: "Pedir que el juez explique informalmente.", correct: false, feedback: "Incorrecto. La impugnacion tiene formas y plazos." },
      ],
      examAnswer: "Usa R-A-P-E-T y explica casacion en la forma si hay causal y perjuicio.",
    },
  ],
  corte_glitch: [
    {
      prompt: "¿Como respondes una pregunta de recursos sin perderte?",
      article: "Metodo R-A-P-E-T",
      options: [
        { text: "Resolucion, agravio, plazo, efecto y tribunal.", correct: true, feedback: "Correcto. Ese orden evita respuestas de trivia." },
        { text: "Nombre del recurso y una cita al azar.", correct: false, feedback: "Incorrecto. Falta procedencia, efecto y tribunal." },
        { text: "Solo plazo, porque eso preguntan siempre.", correct: false, feedback: "Incorrecto. El plazo sin resolucion y agravio es un numero suelto." },
      ],
      examAnswer: "Parte por la resolucion impugnable, luego agravio, recurso, plazo, efectos y tribunal competente.",
    },
  ],
  leviatan_ejecutivo: [
    {
      prompt: "El ejecutado opone defensa no contemplada en art. 464 CPC. ¿Que regla domina?",
      article: "Art. 464 CPC",
      options: [
        { text: "Las excepciones son taxativas; debe encuadrar en una causal legal.", correct: true, feedback: "Correcto. El ejecutivo comprime la defensa en causales tasadas." },
        { text: "Puede oponer cualquier excepcion del ordinario.", correct: false, feedback: "Incorrecto. El ejecutivo tiene oposicion tasada." },
        { text: "La oposicion elimina automaticamente el embargo.", correct: false, feedback: "Incorrecto. El cuaderno de apremio no desaparece automaticamente." },
      ],
      examAnswer: "Explica titulo, requerimiento, embargo, plazo de oposicion, art. 464 y cuadernos.",
    },
  ],
  comision_grado: [
    {
      prompt: "Caso integrado: contrato incumplido, titulo dudoso y sentencia adversa. ¿Como ordenas la respuesta oral?",
      article: "CPC / CC / COT",
      options: [
        { text: "Accion y procedimiento, hechos a probar, carga probatoria, resolucion, recurso y consecuencia.", correct: true, feedback: "Correcto. Es una respuesta aplicativa, no memoristica." },
        { text: "Definiciones sueltas hasta que el profesor se canse.", correct: false, feedback: "Incorrecto. El grado exige resolver el caso." },
        { text: "Inventar articulo si no recuerdas.", correct: false, feedback: "Incorrecto. Si dudas, razona y marca la duda; no inventes norma." },
      ],
      examAnswer: "Metodo: institucion, norma, requisito, aplicacion al hecho y consecuencia procesal.",
    },
  ],
};

export default function CampaignBossBattle({ bossId }: { bossId: string }) {
  const router = useRouter();
  const game = useGame();
  const boss = getBoss(bossId);
  const act = CAMPAÑA.find((a) => a.bossId === bossId);
  const world = getWorldDefinition(act?.zona === "juicio_ejecutivo" ? "ejecutivo" : act?.zona ?? "recursos");
  const questions = BOSS_QUESTIONS[bossId] ?? BOSS_QUESTIONS.comision_grado;
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(boss?.vidaMax ?? 120);
  const [playerHp, setPlayerHp] = useState(100);
  const [selected, setSelected] = useState<number | null>(null);
  const [log, setLog] = useState<string>("El boss estudia tu expediente con mala fe academica.");
  const [finished, setFinished] = useState(false);

  const alreadyWon = game.logros.some((l) => l.id === `campaign_boss_${bossId}`);
  const q = questions[idx % questions.length];

  const nextUrl = useMemo(() => {
    if (!act) return "/juego";
    const nextAct = CAMPAÑA.find((a) => a.numero === act.numero + 1);
    if (!nextAct) return "/epilogo";
    return `/mision/${nextAct.misiones[0].id}`;
  }, [act]);

  if (!boss) {
    return (
      <GameShell variant="focus" eyebrow="Campaña" title="Jefe de facción" back={{ href: "/juego", label: "Hub" }} scrollLabel="Combate contra el jefe">
      <div className="min-h-screen px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <Link href="/juego" className="btn text-xs">Volver al mapa</Link>
        <div className="terminal p-6 mt-6">Boss no encontrado.</div>
      </div>
    </GameShell>
    );
  }

  const choose = (optionIndex: number) => {
    if (selected !== null || finished) return;
    const option = q.options[optionIndex];
    setSelected(optionIndex);
    if (option.correct) {
      const damage = 45;
      const nextHp = Math.max(0, hp - damage);
      setHp(nextHp);
      setLog(`${option.feedback} Daño juridico: ${damage}.`);
      sfx.confirm?.();
      if (nextHp <= 0) {
        setFinished(true);
        if (!alreadyWon) {
          game.gainXp(boss.recompensa.xp);
          game.gainMonedas(boss.recompensa.monedas);
          game.desbloquearLogro({
            id: `campaign_boss_${bossId}`,
            titulo: `Boss vencido: ${boss.nombre}`,
            descripcion: boss.recompensa.skill,
            articulo: boss.articulo,
            desbloqueado: true,
            fecha: Date.now(),
          });
          game.pushLog(`Boss vencido: ${boss.nombre}`, "boss");
          if (bossId === "comision_grado") {
            game.finalizar("La comision firma el acta. Nadie sonrie, pero nadie objeta.");
          }
        }
      }
    } else {
      const damage = 24;
      setPlayerHp((v) => Math.max(0, v - damage));
      setLog(`${option.feedback} Pierdes ${damage} salud mental.`);
      game.ajustarTrauma(3);
      sfx.inadmisible?.();
    }
  };

  const nextQuestion = () => {
    if (playerHp <= 0) {
      router.push("/juego");
      return;
    }
    setSelected(null);
    setIdx((n) => n + 1);
  };

  return (
    <GameShell variant="focus" eyebrow="Campaña" title="Jefe de facción" back={{ href: "/juego", label: "Hub" }} scrollLabel="Combate contra el jefe">
      <div
      className="min-h-screen px-4 md:px-8 py-6 pb-24"
      style={{
        background: `radial-gradient(900px 520px at 50% 0%, ${boss.color}22, transparent 60%), var(--bg-deep)`,
      }}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/juego" className="btn text-xs">Retirarse al mapa</Link>
          <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em] text-doc-aged/45">
            Boss de campaña / {act ? `Acto ${act.numero}` : "Instancia final"}
          </div>
        </header>

        <section className="zona-card p-5 md:p-7" style={{ "--zona-color": boss.color } as React.CSSProperties}>
          <div className="grid md:grid-cols-[180px_1fr] gap-5 items-center">
            <div
              className="aspect-square border flex items-center justify-center font-display-grave text-5xl"
              style={{ borderColor: boss.color, color: boss.color, background: `${boss.color}10` }}
            >
              {boss.icono}
            </div>
            <div>
              <div className="font-mono-terminal text-[9px] uppercase tracking-[.35em] mb-2" style={{ color: boss.color }}>
                {boss.articulo}
              </div>
              <h1 className="font-display-grave text-3xl md:text-5xl text-doc-aged leading-tight">{boss.nombre}</h1>
              <p className="font-serif-juridica text-doc-aged/70 text-sm md:text-base mt-3">{boss.descripcion}</p>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-3">
          <HealthBar label="Boss" value={hp} max={boss.vidaMax} color={boss.color} />
          <HealthBar label="Salud mental" value={playerHp} max={100} color="var(--zona-cautelares)" />
        </div>

        {!finished ? (
          <section className="terminal p-5 md:p-6 space-y-5" style={{ borderColor: `${boss.color}66` }}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-mono-terminal text-[9px] uppercase tracking-widest mb-2" style={{ color: boss.color }}>
                  Ataque juridico / {q.article}
                </div>
                <h2 className="font-display-grave text-xl md:text-2xl text-doc-aged leading-snug">{q.prompt}</h2>
              </div>
              <span className="tag" style={{ borderColor: boss.color, color: boss.color }}>
                {idx + 1}
              </span>
            </div>

            <div className="space-y-2">
              {q.options.map((option, i) => {
                const reveal = selected !== null;
                const picked = selected === i;
                return (
                  <button
                    key={option.text}
                    disabled={reveal}
                    onClick={() => choose(i)}
                    className={`w-full text-left p-3 border font-mono-terminal text-sm transition-colors ${
                      reveal && option.correct ? "border-zona-cautelares text-zona-cautelares bg-zona-cautelares/5" :
                      reveal && picked ? "border-zona-nulidad text-zona-nulidad bg-zona-nulidad/5" :
                      "border-doc-aged/15 hover:border-doc-aged/35 text-doc-aged/80"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border border-doc-aged/10 bg-bg-deep/50">
              <div className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/35 mb-1">Feedback</div>
              <p className="text-doc-aged/75 text-sm font-serif-juridica">{log}</p>
              {selected !== null && (
                <p className="text-zona-prueba text-xs font-mono-terminal mt-2">Respuesta de grado: {q.examAnswer}</p>
              )}
            </div>

            {selected !== null && (
              <button className="btn btn-recurso w-full py-3" onClick={nextQuestion}>
                {playerHp <= 0 ? "Retirarse" : "Siguiente repregunta"}
              </button>
            )}
          </section>
        ) : (
          <section className="terminal p-6 space-y-5 border-zona-cautelares/60">
            <div>
              <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em] text-zona-cautelares mb-2">
                Boss vencido
              </div>
              <h2 className="font-display-grave text-3xl text-doc-aged">{boss.recompensa.skill}</h2>
              <p className="text-doc-aged/65 text-sm font-mono-terminal mt-2">
                {alreadyWon ? "Recompensa ya cobrada anteriormente." : `+${boss.recompensa.xp} XP / +${boss.recompensa.monedas} monedas`}
              </p>
            </div>
            <button className="btn btn-cautelar w-full py-3" onClick={() => router.push(nextUrl)}>
              Continuar campaña
            </button>
          </section>
        )}

        <div className="terminal p-4">
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-recursos mb-2">
            Mundo relacionado: {world.title}
          </div>
          <p className="text-xs text-doc-aged/60 font-mono-terminal">{world.mechanic}</p>
        </div>
      </div>
    </div>
    </GameShell>
  );
}
function HealthBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="terminal p-3">
      <div className="flex justify-between text-[9px] font-mono-terminal uppercase tracking-widest mb-2">
        <span className="text-doc-aged/45">{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-2 bg-bg-deep border border-doc-aged/10">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
