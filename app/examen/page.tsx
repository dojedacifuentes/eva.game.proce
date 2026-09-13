"use client";
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { useAtajosAlternativas, letraDeOpcion } from "@/lib/useAtajosAlternativas";
import GameShell from "@/components/shell/GameShell";

type Q = { q: string; opciones: string[]; correcta: number; explicacion: string; art: string };

const PREGUNTAS: Q[] = [
  { q: "La facultad de conocer, juzgar y hacer ejecutar lo juzgado pertenece exclusivamente a los tribunales establecidos por la ley. Esta es la definición de:", opciones: ["Acción procesal", "Jurisdicción", "Competencia", "Pretensión"], correcta: 1, explicacion: "Art. 76 CPR y 1 COT definen así la jurisdicción.", art: "Art. 76 CPR / 1 COT" },
  { q: "La competencia ABSOLUTA NO admite prórroga porque:", opciones: ["Es renunciable", "Es de orden público", "Solo aplica a tribunales arbitrales", "Es supletoria"], correcta: 1, explicacion: "La competencia absoluta es de orden público (factores materia, fuero, cuantía) y es improrrogable.", art: "Arts. 181 y ss. COT" },
  { q: "Regla general de competencia relativa en materia civil:", opciones: ["Domicilio del actor", "Domicilio del demandado", "Lugar de cumplimiento", "A elección del demandante"], correcta: 1, explicacion: "Art. 134 COT: regla general es el domicilio del demandado, salvo reglas especiales.", art: "Art. 134 COT" },
  { q: "Los requisitos formales de la demanda están en:", opciones: ["Art. 254 CPC", "Art. 309 CPC", "Art. 170 CPC", "Art. 38 CPC"], correcta: 0, explicacion: "Art. 254 enumera los 5 requisitos formales.", art: "Art. 254 CPC" },
  { q: "Notificación que se practica si el demandado no es habido tras búsqueda en dos días distintos:", opciones: ["Por avisos", "Por estado diario", "Personal subsidiaria del art. 44", "Por cédula"], correcta: 2, explicacion: "Art. 44 CPC: notificación personal subsidiaria con entrega de cédula.", art: "Art. 44 CPC" },
  { q: "Plazo para contestar la demanda en juicio ordinario, demandado en el lugar del tribunal:", opciones: ["10 días", "15 días", "18 días", "30 días"], correcta: 1, explicacion: "Art. 258 inc. 1° CPC: 15 días.", art: "Art. 258 CPC" },
  { q: "La excepción dilatoria de INEPTITUD DEL LIBELO se funda en:", opciones: ["Falta de jurisdicción", "Defecto en el modo de proponer la demanda", "Cosa juzgada", "Prescripción"], correcta: 1, explicacion: "Art. 303 N°4 CPC: defecto formal en el modo de proponer la demanda.", art: "Art. 303 N°4 CPC" },
  { q: "Las excepciones perentorias del art. 310 (prescripción, cosa juzgada, transacción, pago) pueden oponerse:", opciones: ["Solo al contestar", "En cualquier estado hasta antes de la citación a oír sentencia (1ª) o vista (2ª)", "Solo en réplica", "Solo en juicio sumario"], correcta: 1, explicacion: "Art. 310 CPC: excepciones perentorias anómalas. Plazo amplio.", art: "Art. 310 CPC" },
  { q: "El término probatorio ORDINARIO en juicio ordinario civil es de:", opciones: ["10 días", "15 días", "20 días", "30 días"], correcta: 2, explicacion: "Art. 328 CPC: 20 días.", art: "Art. 328 CPC" },
  { q: "Resolución que recibe la causa a prueba se notifica por:", opciones: ["Personal", "Cédula", "Estado diario", "Avisos"], correcta: 1, explicacion: "Art. 48 CPC: por cédula. Reposición especial del 319 dentro de 3 días.", art: "Arts. 48 y 319 CPC" },
  { q: "Plazo del recurso de reposición ordinaria sin nuevos antecedentes:", opciones: ["3 días", "5 días", "10 días", "15 días"], correcta: 1, explicacion: "Art. 181 CPC: 5 días.", art: "Art. 181 CPC" },
  { q: "El recurso de apelación procede contra:", opciones: ["Solo decretos", "Sentencias definitivas e interlocutorias de 1ª instancia (regla general)", "Solo sentencias firmes", "Solo resoluciones de la Corte Suprema"], correcta: 1, explicacion: "Art. 187 CPC: regla general.", art: "Art. 187 CPC" },
  { q: "Plazo de apelación contra sentencia definitiva:", opciones: ["5 días", "10 días", "15 días", "30 días"], correcta: 1, explicacion: "Art. 189 CPC: 10 días para definitivas, 5 días para interlocutorias.", art: "Art. 189 CPC" },
  { q: "El recurso de hecho VERDADERO procede cuando:", opciones: ["El tribunal inferior concede una apelación improcedente", "El tribunal inferior deniega una apelación que debía concederse", "Hay vicios in procedendo", "Hay infracción de ley"], correcta: 1, explicacion: "Art. 203 CPC: denegación errada.", art: "Art. 203 CPC" },
  { q: "El recurso de casación en el FONDO procede contra sentencias:", opciones: ["Apelables de 1ª instancia", "Inapelables dictadas por Cortes de Apelaciones o árbitros de derecho de 2ª instancia", "Firmes", "Decretos"], correcta: 1, explicacion: "Art. 767 CPC: requiere ser INAPELABLE y dictada por CA o árbitro de derecho de 2ª.", art: "Art. 767 CPC" },
  { q: "El recurso de QUEJA del art. 545 COT procede contra:", opciones: ["Cualquier resolución", "Sentencias definitivas o interlocutorias que pongan fin al juicio y no admitan otro recurso (con excepción)", "Decretos y autos", "Sentencias firmes"], correcta: 1, explicacion: "Art. 545 COT: subsidiariedad. Excepción: sentencias definitivas de árbitros arbitradores.", art: "Art. 545 COT" },
  { q: "El recurso de REVISIÓN procede contra sentencias:", opciones: ["Apelables", "Firmes injustamente ganadas (cohecho, violencia, documentos falsos, etc.)", "De primera instancia", "Definitivas de la Corte Suprema"], correcta: 1, explicacion: "Art. 810 CPC: causales taxativas. Plazo: 1 año.", art: "Art. 810 CPC" },
  { q: "El juicio ejecutivo requiere obligación:", opciones: ["Discutida y prescrita", "Líquida, actualmente exigible y no prescrita", "Solo determinada", "Solo escrita"], correcta: 1, explicacion: "Requisitos esenciales del título ejecutivo. Arts. 434 ss.", art: "Arts. 434, 437 CPC" },
  { q: "Las excepciones a la ejecución en el juicio ejecutivo son:", opciones: ["Libres", "Taxativas (17 del art. 464)", "Solo dilatorias", "Solo perentorias"], correcta: 1, explicacion: "Art. 464 CPC: enumeración taxativa de 17 excepciones.", art: "Art. 464 CPC" },
  { q: "La medida precautoria del art. 290 N°4 CPC (prohibición de celebrar actos o contratos) sobre inmuebles requiere:", opciones: ["Solo decreto judicial", "Inscripción en el Conservador de Bienes Raíces para ser oponible a terceros", "Notificación personal", "Caución obligatoria"], correcta: 1, explicacion: "Art. 297 inc. 2° CPC: si recae sobre inmuebles, debe inscribirse.", art: "Art. 297 CPC" },
];

export default function ExamenPage() {
  const { desbloquearLogro, setFlag, pushLog } = useGame();
  const [i, setI] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const p = PREGUNTAS[i];

  function contestar(idx: number) {
    if (respuesta !== null) return;
    setRespuesta(idx);
    if (idx === p.correcta) {
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
