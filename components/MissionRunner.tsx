"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { getMision } from "@/data/campaign";
import { getMissionPlaybook, type MissionOption } from "@/data/mission-playbooks";
import { getWorldDefinition } from "@/data/worlds";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { useAtajosAlternativas, letraDeOpcion } from "@/lib/useAtajosAlternativas";
import GameShell from "@/components/shell/GameShell";
import { colorActo } from "@/components/MapaFlujo";

// ============================================================================
// MISIÓN — tres fases en una columna legible: Caso → Desafío → Resultado.
//
// Antes eran cuatro fases (briefing y expediente por separado), un titular de
// hasta 48 px, una columna lateral de progreso/riesgo/foco que en el teléfono
// caía debajo de todo, y el botón de avance al final del contenido. Ahora:
//  · briefing y expediente son una sola lectura (un toque menos por misión);
//  · la fase y el riesgo viajan pegados arriba;
//  · la acción que hace avanzar va pegada abajo, siempre visible;
//  · las opciones se barajan al entrar al desafío, para que la respuesta no
//    dependa de la posición.
// ============================================================================

type Fase = "caso" | "desafio" | "resultado";
const FASES: { id: Fase; nombre: string }[] = [
  { id: "caso", nombre: "Caso" },
  { id: "desafio", nombre: "Desafío" },
  { id: "resultado", nombre: "Resultado" },
];

function barajar(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export default function MissionRunner({ missionId }: { missionId: string }) {
  const router = useRouter();
  const missionEntry = getMision(missionId);
  const playbook = getMissionPlaybook(missionId);
  const game = useGame();
  const [fase, setFase] = useState<Fase>("caso");
  const [selected, setSelected] = useState<MissionOption | null>(null);
  const [orden, setOrden] = useState<number[] | null>(null);
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

  // Teclas 1-N y A-N sobre las opciones **barajadas**: el índice de la tecla es
  // la posición en pantalla, no la del banco de datos. Va antes del retorno
  // condicional porque un hook no puede quedar detrás de un `return`; el cuerpo
  // sólo se ejecuta al pulsar una tecla, cuando `answer` ya está definida.
  useAtajosAlternativas(
    orden?.length ?? 0,
    (pos) => {
      const ops = playbook?.challenge.options;
      if (orden && ops) answer(ops[orden[pos]]);
    },
    fase === "desafio" && !!orden,
  );

  if (!missionEntry || !playbook) {
    return (
      <GameShell variant="focus" eyebrow="Campaña" title="Misión" back={{ href: "/juego", label: "Mapa" }} scrollLabel="Contenido de la misión">
        <div className="max-w-2xl mx-auto tarjeta p-5 mt-3">
          <h2 className="text-xl font-bold txt-fuerte">Misión no encontrada</h2>
          <p className="t-cuerpo txt-normal mt-2">La ruta existe, pero no hay contenido jugable para esta misión.</p>
          <Link href="/juego" className="btn-primario mt-4">Volver al mapa</Link>
        </div>
      </GameShell>
    );
  }

  const { acto, mision } = missionEntry;
  const world = getWorldDefinition(playbook.worldId);
  const col = colorActo(acto.zona);
  const numero = acto.misiones.findIndex((m) => m.id === mision.id) + 1;
  const isCorrect = selected?.correct ?? false;
  const idxFase = FASES.findIndex((f) => f.id === fase);
  const opciones = playbook.challenge.options;

  const irADesafio = () => {
    sfx.click?.();
    setSelected(null);
    setOrden(barajar(opciones.length));
    setFase("desafio");
  };

  const answer = (option: MissionOption) => {
    setSelected(option);
    if (option.correct) {
      sfx.confirm?.();
      haptica.acierto();
    } else {
      sfx.inadmisible?.();
      haptica.error();
      setRisk((r) => Math.min(100, r + 22));
      game.ajustarTrauma(2);
      game.ajustarReputacion(-1);
      game.pushLog(`Error en ${mision.titulo}: ${option.feedback}`, "mision");
    }
    setFase("resultado");
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

  const acento = { "--acento": col.c } as CSSProperties;

  return (
    <GameShell
      variant="focus"
      eyebrow={`Acto ${acto.numero} · Misión ${numero}/${acto.misiones.length}`}
      title={mision.titulo}
      back={{ href: "/juego", label: "Mapa" }}
      scrollLabel="Contenido de la misión"
      scrollKey={fase}
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col min-h-full">
        {/* ── Fase y riesgo, siempre arriba ── */}
        <div className="hud-fijo flex items-center gap-3" style={acento}>
          <ol className="pasos" aria-label="Fases de la misión">
            {FASES.map((f, i) => (
              <li key={f.id} data-estado={i < idxFase ? "hecho" : i === idxFase ? "actual" : "pendiente"} aria-current={i === idxFase ? "step" : undefined}>
                <span className="pasos-num" aria-hidden="true">{i < idxFase ? "✓" : i + 1}</span>
                <span>{f.nombre}</span>
              </li>
            ))}
          </ol>
          <div className="shrink-0 w-24" title="Riesgo procesal: sube con cada error">
            <div className="flex justify-between t-micro font-datos">
              <span className="txt-suave">Riesgo</span>
              <span style={{ color: risk > 65 ? "#F08585" : "#E3C27E" }}>{risk}%</span>
            </div>
            <div className="medidor mt-1" style={{ height: 6 }} aria-hidden="true">
              <span style={{ width: `${risk}%`, background: risk > 65 ? "#F08585" : "#D7B46A" }} />
            </div>
          </div>
        </div>

        <div className="flex-1 pt-3 space-y-4">
          {fase === "caso" && (
            <>
              <div className="rotulo" style={{ color: col.txt }}>{playbook.subtitle}</div>

              {/* Quién te habla */}
              <section className="tarjeta p-4" aria-label="Encargo">
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 shrink-0 rounded-xl grid place-items-center font-datos font-bold text-[15px]"
                    style={{ background: "#151B27", border: `2px solid ${col.c}`, color: col.txt }}
                    aria-hidden="true"
                  >
                    {playbook.npc.avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold txt-fuerte leading-tight">{playbook.npc.name}</div>
                    <div className="t-meta txt-suave">{playbook.npc.role}</div>
                  </div>
                </div>
                <p className="cita mt-3 mb-0">«{playbook.npc.line}»</p>
              </section>

              {/* Expediente */}
              <section className="tarjeta p-4" aria-labelledby="t-expediente">
                <h2 id="t-expediente" className="rotulo m-0" style={{ color: col.txt }}>
                  Expediente {playbook.dossier.rol}
                </h2>
                <ol className="mt-3 space-y-2.5 list-none p-0">
                  {playbook.dossier.facts.map((f, i) => (
                    <li key={i} className="flex gap-3 t-cuerpo txt-normal leading-snug">
                      <span className="font-datos t-meta txt-suave shrink-0 w-5 text-right">{i + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ol>
                <div className="rotulo mt-4">Pistas</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {playbook.dossier.clues.map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                </div>
              </section>

              <p className="t-meta txt-suave m-0">
                <span className="font-semibold txt-normal">Objetivo: </span>{world.mechanic}
              </p>
              <Link href={world.route} onClick={() => sfx.click?.()} className="inline-block t-meta underline underline-offset-4" style={{ color: col.txt }}>
                Explorar el mundo de esta materia →
              </Link>
            </>
          )}

          {fase === "desafio" && orden && (
            <>
              <div className="rotulo" style={{ color: col.txt }}>Desafío</div>
              <h2 className="text-[19px] md:text-[21px] font-semibold txt-fuerte leading-snug m-0">
                {playbook.challenge.prompt}
              </h2>
              <div className="space-y-2.5" role="group" aria-label="Opciones">
                {orden.map((oi, pos) => {
                  const option = opciones[oi];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => answer(option)}
                      className="opcion"
                      aria-keyshortcuts={`${pos + 1} ${letraDeOpcion(pos)}`}
                    >
                      <span className="opcion-letra" aria-hidden="true">{letraDeOpcion(pos)}</span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {fase === "resultado" && selected && (
            <>
              <section
                className="tarjeta p-4"
                style={{ borderColor: isCorrect ? "#58F5B0" : "#F08585", background: isCorrect ? "#0F1B18" : "#1C1215" }}
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-11 h-11 shrink-0 rounded-full grid place-items-center text-xl font-bold"
                    style={{ background: isCorrect ? "#58F5B0" : "#F08585", color: "#050A09" }}
                    aria-hidden="true"
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[17px] font-bold" style={{ color: isCorrect ? "#58F5B0" : "#F08585" }}>
                      {isCorrect ? "Decisión correcta" : "Decisión riesgosa"}
                    </div>
                    <p className="t-cuerpo txt-normal leading-snug mt-1 mb-0">{selected.feedback}</p>
                  </div>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-3">
                <Caja rotulo="Consecuencia procesal" texto={selected.consequence} />
                <Caja rotulo="Cómo decirlo en grado" texto={playbook.feedback.exam} />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="chip">{playbook.feedback.institution}</span>
                <span className="chip font-datos">{playbook.feedback.article}</span>
              </div>

              {isCorrect && (
                <section className="tarjeta p-4" style={{ borderColor: "#2C5A48" }}>
                  <div className="rotulo" style={{ color: "#58F5B0" }}>Desbloqueas</div>
                  <div className="text-[17px] font-semibold txt-fuerte mt-1">{playbook.unlock.title}</div>
                  <p className="t-meta txt-suave mt-1 mb-0">{playbook.unlock.description}</p>
                  {!alreadyDone && !completedNow && (
                    <p className="chip chip-premio mt-3 mb-0">+{mision.recompensa.xp} XP · 🪙 {mision.recompensa.monedas}</p>
                  )}
                </section>
              )}

              <div>
                <div className="rotulo">Para repasar</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {world.examFocus.map((x) => <span key={x} className="chip font-datos">{x}</span>)}
                </div>
                <p className="t-meta txt-suave mt-3 mb-0">{playbook.nextHint}</p>
              </div>

              {!isCorrect && (
                <p className="t-meta txt-suave m-0">
                  Fallar no bloquea el aprendizaje: sube el riesgo, baja un punto de reputación y puedes reintentar.
                </p>
              )}
            </>
          )}

          {alreadyDone && (
            <p className="t-meta m-0" style={{ color: "#58F5B0" }}>
              ✓ Misión ya completada. Puedes repetirla para estudiar sin duplicar la recompensa.
            </p>
          )}
        </div>

        {/* ── La acción que hace avanzar, siempre a la vista ── */}
        <div className="barra-accion">
          {fase === "caso" && (
            <button type="button" className="btn-primario" style={acento} onClick={irADesafio}>
              Resolver el caso →
            </button>
          )}
          {fase === "desafio" && (
            <button type="button" className="btn-secundario" onClick={() => { sfx.click?.(); setFase("caso"); }}>
              ← Volver al expediente
            </button>
          )}
          {fase === "resultado" && (isCorrect ? (
            <button type="button" className="btn-primario" style={{ "--acento": "#58F5B0" } as CSSProperties} onClick={completeMission}>
              {alreadyDone || completedNow ? "Continuar →" : "Cobrar recompensa y continuar →"}
            </button>
          ) : (
            <>
              <button type="button" className="btn-secundario" onClick={() => { sfx.click?.(); setFase("caso"); }}>
                Revisar expediente
              </button>
              <button type="button" className="btn-primario" style={acento} onClick={irADesafio}>
                Reintentar
              </button>
            </>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function Caja({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <div className="tarjeta p-3.5">
      <div className="rotulo">{rotulo}</div>
      <p className="t-base txt-normal leading-snug mt-1.5 mb-0">{texto}</p>
    </div>
  );
}
