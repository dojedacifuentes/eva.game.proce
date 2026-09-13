"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { CAMPAÑA, getBoss } from "@/data/campaign";
import { FASE_META, getInterrogatorio, type FaseInterrogatorio } from "@/data/combat/interrogations";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";
import { colorActo } from "@/components/MapaFlujo";

// ============================================================================
// JEFE DE CAMPAÑA — interrogatorio en cinco fases.
//
// Antes cada jefe tenía UNA pregunta y `questions[idx % questions.length]` la
// repetía hasta vaciarle la vida: entre 3 y 7 veces la misma pregunta seguida.
// El repositorio ya tenía, sin usar, un interrogatorio de cinco fases por jefe
// (data/combat/interrogations.ts: pregunta inicial, repregunta, trampa, caso
// práctico y remate). Ahora el combate es ese interrogatorio:
//  · cada acierto quita un cuarto de la vida del jefe: se vence con 4 de 5;
//  · cada error cuesta salud mental y trauma; si ya no se puede ganar, el
//    combate termina y se ofrece reintentar;
//  · la norma rectora sólo se revela DESPUÉS de responder (regla anti-pistas).
// La pregunta única de antes se conserva como respaldo para un jefe sin
// interrogatorio.
// ============================================================================

type Pregunta = Pick<FaseInterrogatorio, "prompt" | "article" | "options" | "examAnswer"> & {
  fase?: FaseInterrogatorio["fase"];
  bossLine?: string;
};

const RESPALDO: Record<string, Pregunta> = {
  esfinge_competencia: {
    prompt: "El demandado contesta el fondo sin alegar incompetencia relativa. ¿Que efecto puede producirse?",
    article: "COT / competencia relativa",
    options: [
      { text: "Prorroga tacita de competencia relativa, si la materia lo permite.", correct: true, feedback: "Correcto. La competencia relativa puede sanearse por conducta procesal." },
      { text: "Nulidad absoluta inevitable.", correct: false, feedback: "Incorrecto. Confundes competencia relativa con absoluta." },
      { text: "Casacion inmediata sin sentencia.", correct: false, feedback: "Incorrecto. No hay sentencia susceptible de casacion." },
    ],
    examAnswer: "Distinguir competencia absoluta y relativa; la relativa debe reclamarse oportunamente o puede prorrogarse.",
  },
  receptor_fantasma: {
    prompt: "Primera notificacion de la demanda hecha por estado diario. El demandado nunca comparece. ¿Cual es el problema?",
    article: "Arts. 40 y 768 N°9 CPC",
    options: [
      { text: "Falta emplazamiento valido y hay indefension reclamable.", correct: true, feedback: "Correcto. La primera notificacion exige forma idonea." },
      { text: "No hay problema si se publico en el estado diario.", correct: false, feedback: "Incorrecto. El estado diario no sustituye el emplazamiento inicial." },
      { text: "Solo hay error de redaccion.", correct: false, feedback: "Incorrecto. Es un vicio de defensa, no tipografia." },
    ],
    examAnswer: "Emplazamiento = notificacion valida + plazo. Sin ello, se afecta bilateralidad y puede proceder nulidad.",
  },
  oraculo_prueba: {
    prompt: "La parte intenta rendir documentos antiguos despues del termino probatorio y los llama 'nuevos'. ¿Que evalua el tribunal?",
    article: "Arts. 318 y ss. CPC",
    options: [
      { text: "Si son realmente procedentes por regla especial o superviniencia; si no, preclusion.", correct: true, feedback: "Correcto. Lo olvidado no se vuelve superviniente por nostalgia." },
      { text: "Debe recibirlos siempre por verdad material.", correct: false, feedback: "Incorrecto. La oportunidad probatoria ordena el contradictorio." },
      { text: "Debe dictar sentencia sin oir a nadie.", correct: false, feedback: "Incorrecto. La decision debe fundarse y respetar contradiccion." },
    ],
    examAnswer: "Relaciona carga, oportunidad, cierre del termino probatorio y excepciones legales.",
  },
  juez_hierro: {
    prompt: "Sentencia definitiva omite resolver una excepcion opuesta. ¿Como se arma el ataque?",
    article: "Arts. 170 y 768 CPC",
    options: [
      { text: "Identificar omision, agravio, causal de forma y preparacion si corresponde.", correct: true, feedback: "Correcto. Un recurso serio une vicio, perjuicio y causal." },
      { text: "Pedir reposicion ordinaria de la sentencia definitiva.", correct: false, feedback: "Incorrecto. La reposicion ordinaria no es la via general contra sentencia definitiva." },
      { text: "Pedir que el juez explique informalmente.", correct: false, feedback: "Incorrecto. La impugnacion tiene formas y plazos." },
    ],
    examAnswer: "Usa R-A-P-E-T y explica casacion en la forma si hay causal y perjuicio.",
  },
  corte_glitch: {
    prompt: "¿Como respondes una pregunta de recursos sin perderte?",
    article: "Metodo R-A-P-E-T",
    options: [
      { text: "Resolucion, agravio, plazo, efecto y tribunal.", correct: true, feedback: "Correcto. Ese orden evita respuestas de trivia." },
      { text: "Nombre del recurso y una cita al azar.", correct: false, feedback: "Incorrecto. Falta procedencia, efecto y tribunal." },
      { text: "Solo plazo, porque eso preguntan siempre.", correct: false, feedback: "Incorrecto. El plazo sin resolucion y agravio es un numero suelto." },
    ],
    examAnswer: "Parte por la resolucion impugnable, luego agravio, recurso, plazo, efectos y tribunal competente.",
  },
  leviatan_ejecutivo: {
    prompt: "El ejecutado opone defensa no contemplada en art. 464 CPC. ¿Que regla domina?",
    article: "Art. 464 CPC",
    options: [
      { text: "Las excepciones son taxativas; debe encuadrar en una causal legal.", correct: true, feedback: "Correcto. El ejecutivo comprime la defensa en causales tasadas." },
      { text: "Puede oponer cualquier excepcion del ordinario.", correct: false, feedback: "Incorrecto. El ejecutivo tiene oposicion tasada." },
      { text: "La oposicion elimina automaticamente el embargo.", correct: false, feedback: "Incorrecto. El cuaderno de apremio no desaparece automaticamente." },
    ],
    examAnswer: "Explica titulo, requerimiento, embargo, plazo de oposicion, art. 464 y cuadernos.",
  },
  comision_grado: {
    prompt: "Caso integrado: contrato incumplido, titulo dudoso y sentencia adversa. ¿Como ordenas la respuesta oral?",
    article: "CPC / CC / COT",
    options: [
      { text: "Accion y procedimiento, hechos a probar, carga probatoria, resolucion, recurso y consecuencia.", correct: true, feedback: "Correcto. Es una respuesta aplicativa, no memoristica." },
      { text: "Definiciones sueltas hasta que el profesor se canse.", correct: false, feedback: "Incorrecto. El grado exige resolver el caso." },
      { text: "Inventar articulo si no recuerdas.", correct: false, feedback: "Incorrecto. Si dudas, razona y marca la duda; no inventes norma." },
    ],
    examAnswer: "Metodo: institucion, norma, requisito, aplicacion al hecho y consecuencia procesal.",
  },
};

function barajar(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const DANO_JUGADOR = 25;

export default function CampaignBossBattle({ bossId }: { bossId: string }) {
  const router = useRouter();
  const game = useGame();
  const boss = getBoss(bossId);
  const act = CAMPAÑA.find((a) => a.bossId === bossId);

  const preguntas: Pregunta[] = useMemo(() => {
    const inter = getInterrogatorio(bossId);
    if (inter && inter.length > 0) return inter;
    return [RESPALDO[bossId] ?? RESPALDO.comision_grado];
  }, [bossId]);

  const vidaMax = boss?.vidaMax ?? 120;
  // Se vence con todas las fases menos una: se puede fallar una vez.
  const golpesNecesarios = Math.max(1, preguntas.length - 1);
  const golpe = Math.ceil(vidaMax / golpesNecesarios);

  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(vidaMax);
  const [playerHp, setPlayerHp] = useState(100);
  const [aciertos, setAciertos] = useState(0);
  const [orden, setOrden] = useState<number[] | null>(null);
  const [elegida, setElegida] = useState<number | null>(null);
  const [final, setFinal] = useState<"victoria" | "derrota" | null>(null);
  const [intento, setIntento] = useState(0);

  const alreadyWon = game.logros.some((l) => l.id === `campaign_boss_${bossId}`);
  const q = preguntas[idx];

  // El orden de las opciones se decide en el cliente, al llegar a cada fase.
  useEffect(() => {
    setOrden(barajar(q.options.length));
    setElegida(null);
  }, [q, intento]);

  const nextUrl = useMemo(() => {
    if (!act) return "/juego";
    const nextAct = CAMPAÑA.find((a) => a.numero === act.numero + 1);
    if (!nextAct) return "/epilogo";
    return `/mision/${nextAct.misiones[0].id}`;
  }, [act]);

  if (!boss) {
    return (
      <GameShell variant="focus" eyebrow="Campaña" title="Jefe de facción" back={{ href: "/juego", label: "Mapa" }} scrollLabel="Combate contra el jefe">
        <div className="max-w-2xl mx-auto tarjeta p-5 mt-3">
          <p className="t-cuerpo txt-normal">Jefe no encontrado.</p>
          <Link href="/juego" className="btn-primario mt-4">Volver al mapa</Link>
        </div>
      </GameShell>
    );
  }

  const col = colorActo(act?.zona ?? "examen");
  const acento = { "--acento": col.c } as CSSProperties;
  const respondida = elegida !== null;
  const opcionElegida = respondida && orden ? q.options[orden[elegida]] : null;

  const responder = (pos: number) => {
    if (respondida || !orden || final) return;
    const option = q.options[orden[pos]];
    setElegida(pos);
    if (option.correct) {
      const nuevoHp = Math.max(0, hp - golpe);
      setHp(nuevoHp);
      setAciertos((a) => a + 1);
      sfx.confirm?.();
      if (nuevoHp <= 0 && !alreadyWon) {
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
    } else {
      setPlayerHp((v) => Math.max(0, v - DANO_JUGADOR));
      game.ajustarTrauma(3);
      sfx.inadmisible?.();
    }
  };

  // ¿Se puede ganar todavía con las fases que quedan?
  const quedan = preguntas.length - (idx + 1);
  const ganado = hp <= 0;
  const imposible = !ganado && (aciertos + quedan) * golpe < vidaMax;
  const agotado = playerHp <= 0;

  const avanzar = () => {
    sfx.click?.();
    if (ganado) { setFinal("victoria"); return; }
    if (imposible || agotado || quedan <= 0) { setFinal("derrota"); return; }
    setIdx((n) => n + 1);
  };

  const reintentar = () => {
    sfx.click?.();
    setIdx(0);
    setHp(vidaMax);
    setPlayerHp(100);
    setAciertos(0);
    setFinal(null);
    setIntento((n) => n + 1);
  };

  const meta = q.fase ? FASE_META[q.fase] : null;
  const ctaAvance = ganado ? "¡Jefe vencido! Ver resultado →"
    : imposible || agotado || quedan <= 0 ? "Ver resultado"
    : "Siguiente fase →";

  return (
    <GameShell
      variant="focus"
      eyebrow={act ? `Acto ${act.numero} · Jefe` : "Instancia final"}
      title={boss.nombre}
      back={{ href: "/juego", label: "Mapa" }}
      scrollLabel="Combate contra el jefe"
      scrollKey={`${idx}-${final}-${intento}`}
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col min-h-full">
        {/* ── HUD: vida del jefe, salud mental y fases ── */}
        <div className="hud-fijo space-y-2" style={acento}>
          <div className="flex items-center gap-3">
            <span className="fila-icono" style={acento} aria-hidden="true">{boss.icono}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between t-meta">
                <span className="font-semibold txt-fuerte truncate">Vida del jefe</span>
                <span className="font-datos" style={{ color: col.txt }}>{hp}/{vidaMax}</span>
              </div>
              <div className="medidor mt-1" role="progressbar" aria-label="Vida del jefe" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={vidaMax}>
                <span style={{ width: `${(hp / vidaMax) * 100}%`, background: `linear-gradient(90deg, #F08585, ${col.c})` }} />
              </div>
            </div>
            <div className="w-24 shrink-0">
              <div className="flex justify-between t-micro">
                <span className="txt-suave">Mente</span>
                <span className="font-datos" style={{ color: "#58F5B0" }}>{playerHp}</span>
              </div>
              <div className="medidor mt-1" role="progressbar" aria-label="Tu salud mental" aria-valuenow={playerHp} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${playerHp}%`, background: "#58F5B0" }} />
              </div>
            </div>
          </div>
          {preguntas.length > 1 && !final && (
            <div className="flex items-center gap-1.5" aria-label={`Fase ${idx + 1} de ${preguntas.length}`}>
              {preguntas.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ background: i < idx ? "#58F5B0" : i === idx ? col.c : "#232C3D" }}
                />
              ))}
              <span className="t-micro font-datos txt-suave ml-2 shrink-0">{idx + 1}/{preguntas.length}</span>
            </div>
          )}
        </div>

        <div className="flex-1 pt-3 space-y-4">
          {!final && (
            <>
              {q.bossLine && (
                <section className="tarjeta p-4" style={{ borderColor: `${col.c}55` }}>
                  <p className="cita m-0">«{q.bossLine}»</p>
                </section>
              )}

              <div>
                <div className="rotulo" style={{ color: col.txt }}>
                  {meta ? `${meta.icon} ${meta.label}` : "Ataque jurídico"}
                </div>
                <h2 className="text-[19px] md:text-[21px] font-semibold txt-fuerte leading-snug mt-1.5 mb-0">{q.prompt}</h2>
              </div>

              {orden && (
                <div className="space-y-2.5" role="group" aria-label="Opciones">
                  {orden.map((oi, pos) => {
                    const option = q.options[oi];
                    const estado = !respondida ? undefined
                      : option.correct ? "ok"
                      : elegida === pos ? "mal"
                      : "apagada";
                    return (
                      <button
                        key={`${intento}-${idx}-${oi}`}
                        type="button"
                        disabled={respondida}
                        onClick={() => responder(pos)}
                        className="opcion"
                        data-estado={estado}
                      >
                        <span className="opcion-letra" aria-hidden="true">
                          {estado === "ok" ? "✓" : estado === "mal" ? "✗" : String.fromCharCode(65 + pos)}
                        </span>
                        <span>{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {opcionElegida && (
                <div className="space-y-3" aria-live="polite">
                  <section
                    className="tarjeta p-4"
                    style={{ borderColor: opcionElegida.correct ? "#58F5B0" : "#F08585" }}
                  >
                    <div className="text-[16px] font-bold" style={{ color: opcionElegida.correct ? "#58F5B0" : "#F08585" }}>
                      {opcionElegida.correct ? `Acierto · −${golpe} al jefe` : `Error · −${DANO_JUGADOR} de salud mental`}
                    </div>
                    <p className="t-cuerpo txt-normal leading-snug mt-1 mb-0">{opcionElegida.feedback}</p>
                  </section>
                  <section className="tarjeta p-4">
                    <div className="rotulo">Respuesta de grado</div>
                    <p className="t-base txt-normal leading-snug mt-1.5 mb-2">{q.examAnswer}</p>
                    <span className="chip font-datos">{q.article}</span>
                  </section>
                </div>
              )}
            </>
          )}

          {final === "victoria" && (
            <section className="tarjeta p-5 text-center" style={{ borderColor: "#58F5B0" }}>
              <div className="text-5xl" aria-hidden="true">{boss.icono}</div>
              <div className="rotulo mt-3" style={{ color: "#58F5B0" }}>Jefe vencido · {aciertos}/{preguntas.length} aciertos</div>
              <h2 className="font-display-grave text-2xl md:text-3xl txt-fuerte mt-2 mb-0">{boss.recompensa.skill}</h2>
              <p className="t-cuerpo txt-normal mt-2 mb-0">
                {alreadyWon ? "Recompensa ya cobrada anteriormente." : `+${boss.recompensa.xp} XP · 🪙 ${boss.recompensa.monedas}`}
              </p>
            </section>
          )}

          {final === "derrota" && (
            <section className="tarjeta p-5" style={{ borderColor: "#F08585" }}>
              <div className="rotulo" style={{ color: "#F08585" }}>El jefe resiste · {aciertos}/{preguntas.length} aciertos</div>
              <h2 className="text-2xl font-bold txt-fuerte mt-2 mb-0">Necesitas {golpesNecesarios} aciertos para vencerlo.</h2>
              <p className="t-cuerpo txt-normal mt-2 mb-0">
                Repasa las respuestas de grado de las fases que fallaste y vuelve a intentarlo. Las misiones del acto
                preparan exactamente estas preguntas.
              </p>
            </section>
          )}
        </div>

        <div className="barra-accion">
          {!final && respondida && (
            <button type="button" className="btn-primario" style={ganado ? { "--acento": "#58F5B0" } as CSSProperties : acento} onClick={avanzar}>
              {ctaAvance}
            </button>
          )}
          {!final && !respondida && (
            <p className="t-meta txt-suave m-0 self-center">Elige una respuesta. La norma se revela después.</p>
          )}
          {final === "victoria" && (
            <>
              <Link href="/juego" onClick={() => sfx.click?.()} className="btn-secundario">Mapa</Link>
              <button type="button" className="btn-primario" style={{ "--acento": "#58F5B0" } as CSSProperties} onClick={() => { sfx.confirm?.(); router.push(nextUrl); }}>
                Continuar campaña →
              </button>
            </>
          )}
          {final === "derrota" && (
            <>
              <Link href="/juego" onClick={() => sfx.click?.()} className="btn-secundario">Repasar en el mapa</Link>
              <button type="button" className="btn-primario" style={acento} onClick={reintentar}>
                Reintentar
              </button>
            </>
          )}
        </div>
      </div>
    </GameShell>
  );
}
