"use client";
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { useAtajosAlternativas, letraDeOpcion } from "@/lib/useAtajosAlternativas";
import GameShell from "@/components/shell/GameShell";
import { PREGUNTAS_CEDULA as PREGUNTAS } from "@/data/cedula";
import { idCedula } from "@/lib/bancoRepaso";


export default function ExamenPage() {
  const { desbloquearLogro, setFlag, pushLog, registrarRepaso } = useGame();
  const [i, setI] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const p = PREGUNTAS[i];

  function contestar(idx: number) {
    if (respuesta !== null) return;
    setRespuesta(idx);
    const ok = idx === p.correcta;
    // Lo que se falla entra al mazo de repaso y vuelve a 1, 3, 7… días.
    registrarRepaso(idCedula(p.q), ok);
    if (ok) {
      setAciertos((a) => a + 1);
      sfx.confirm?.();
      haptica.acierto();
    } else {
      sfx.inadmisible?.();
      haptica.error();
    }
  }

  // Teclas 1-4 y A-D. Se apagan en cuanto hay respuesta en pantalla, para que
  // una pulsación de más no conteste la pregunta siguiente sin leerla.
  useAtajosAlternativas(p?.opciones.length ?? 0, contestar, respuesta === null && !terminado);

  function avanzar() {
    sfx.click?.();
    setRespuesta(null);
    if (i + 1 >= PREGUNTAS.length) {
      setTerminado(true);
      const nota = (aciertos / PREGUNTAS.length) * 7;
      if (aciertos >= PREGUNTAS.length * 0.7) {
        setFlag("examen_aprobado");
        desbloquearLogro({ id: "examen", titulo: "Cédula procesal aprobada", descripcion: "Aprobaste el modo examen con nota >= 4.9.", articulo: "—", desbloqueado: true });
      }
      pushLog(`Cédula procesal completada. Nota: ${nota.toFixed(1)}`, "EXAMEN");
    } else {
      setI(i + 1);
    }
  }

  function reiniciar() {
    sfx.click?.();
    setI(0);
    setAciertos(0);
    setRespuesta(null);
    setTerminado(false);
  }

  if (terminado) {
    const nota = (aciertos / PREGUNTAS.length) * 7;
    const aprobado = nota >= 4.0;
    return (
      <GameShell variant="focus" eyebrow="Evaluación" title="Examen de grado" back={{ href: "/juego", label: "Mapa" }} scrollLabel="Resultado del examen" scrollKey="fin">
        <div className="max-w-xl w-full mx-auto flex flex-col min-h-full">
          <div className="flex-1 pt-4">
            <section className="tarjeta p-6 text-center" style={{ borderColor: aprobado ? "#58F5B0" : "#F08585" }}>
              <div className="rotulo">Cédula final</div>
              <div className="font-datos text-6xl font-bold mt-3" style={{ color: aprobado ? "#58F5B0" : "#F08585" }}>{nota.toFixed(1)}</div>
              <p className="t-cuerpo txt-normal mt-2 mb-0">Aciertos: {aciertos} de {PREGUNTAS.length}</p>
              <p className="t-base txt-suave mt-3 mb-0">
                {aprobado ? "Aprobado. La comisión hace una mueca de respeto procesal." : "Reprobado. Vuelve al Codex: arts. 158, 187, 766, 767."}
              </p>
            </section>
          </div>
          <div className="barra-accion">
            <button type="button" className="btn-secundario" onClick={reiniciar}>Repetir examen</button>
            <Link href="/juego" className="btn-primario">Volver al mapa</Link>
          </div>
        </div>
      </GameShell>
    );
  }

  const ultima = i + 1 >= PREGUNTAS.length;

  return (
    <GameShell variant="focus" eyebrow="Evaluación" title="Examen de grado" back={{ href: "/juego", label: "Mapa" }} scrollLabel="Preguntas del examen" scrollKey={i}>
      <div className="max-w-3xl w-full mx-auto flex flex-col min-h-full">
        <div className="hud-fijo">
          <div className="flex items-center justify-between t-meta">
            <span className="font-semibold txt-fuerte">Pregunta {i + 1} de {PREGUNTAS.length}</span>
            <span className="font-datos" style={{ color: "#58F5B0" }}>✓ {aciertos}</span>
          </div>
          <div className="medidor mt-1.5" style={{ height: 6 }} aria-hidden="true">
            <span style={{ width: `${((i + (respuesta !== null ? 1 : 0)) / PREGUNTAS.length) * 100}%`, background: "#4BE7FF" }} />
          </div>
        </div>

        <div className="flex-1 pt-3 space-y-4">
          <h2 className="text-[19px] md:text-[21px] font-semibold txt-fuerte leading-snug m-0">{p.q}</h2>
          <div className="space-y-2.5" role="group" aria-label="Opciones">
            {p.opciones.map((op, idx) => {
              const estado = respuesta === null ? undefined
                : idx === p.correcta ? "ok"
                : idx === respuesta ? "mal"
                : "apagada";
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={respuesta !== null}
                  onClick={() => contestar(idx)}
                  className="opcion"
                  data-estado={estado}
                  // La letra ya se ve en el botón; esto le dice a quien usa
                  // lector de pantalla que además es un atajo.
                  aria-keyshortcuts={respuesta === null ? `${idx + 1} ${letraDeOpcion(idx)}` : undefined}
                >
                  <span className="opcion-letra" aria-hidden="true">{estado === "ok" ? "✓" : estado === "mal" ? "✗" : letraDeOpcion(idx)}</span>
                  <span>{op}</span>
                </button>
              );
            })}
          </div>
          {respuesta !== null && (
            <section className="tarjeta p-4" aria-live="polite">
              <div className="text-[16px] font-bold" style={{ color: respuesta === p.correcta ? "#58F5B0" : "#F08585" }}>
                {respuesta === p.correcta ? "Correcto" : "Incorrecto"}
              </div>
              <p className="t-cuerpo txt-normal leading-snug mt-1 mb-2">{p.explicacion}</p>
              <span className="chip font-datos">{p.art}</span>
            </section>
          )}
        </div>

        <div className="barra-accion">
          {respuesta !== null ? (
            <button type="button" className="btn-primario" onClick={avanzar}>
              {ultima ? "Ver nota" : "Siguiente →"}
            </button>
          ) : (
            <p className="t-meta txt-suave m-0 self-center">Elige una respuesta.</p>
          )}
        </div>
      </div>
    </GameShell>
  );
}
