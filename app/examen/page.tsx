"use client";
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/store/useGame";
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
    setRespuesta(idx);
    if (idx === p.correcta) setAciertos((a) => a + 1);
  }

  function avanzar() {
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

  if (terminado) {
    const nota = (aciertos / PREGUNTAS.length) * 7;
    return (
      <GameShell variant="focus" eyebrow="Evaluación" title="Examen de grado" back={{ href: "/juego", label: "Hub" }} scrollLabel="Preguntas del examen">
      <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
        <div className="terminal p-8 text-center">
          <div className="tag mb-3">CÉDULA FINAL</div>
          <h1 className="label-art text-3xl text-zona-notificaciones mb-4">Nota: {nota.toFixed(1)}</h1>
          <p className="text-doc-aged/70">Aciertos: {aciertos} / {PREGUNTAS.length}</p>
          <p className="text-doc-aged/60 text-sm mt-4">{nota >= 4.0 ? "Aprobado. La comisión hace una mueca de respeto procesal." : "Reprobado. Vuelve al Codex: arts. 158, 187, 766, 767."}</p>
          <Link href="/juego" className="btn mt-6 inline-block">◂ Volver al mapa</Link>
        </div>
      </div>
    </GameShell>
    );
  }

  return (
    <GameShell variant="focus" eyebrow="Evaluación" title="Examen de grado" back={{ href: "/juego", label: "Hub" }} scrollLabel="Preguntas del examen">
      <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <Link href="/juego" className="btn">◂ Mapa</Link>
        <div className="tag">PREGUNTA {i + 1} / {PREGUNTAS.length} · Aciertos: {aciertos}</div>
      </div>

      <div className="terminal p-6">
        <h2 className="label-art text-zona-competencia mb-4">{p.q}</h2>
        <div className="space-y-2">
          {p.opciones.map((op, idx) => {
            const correcto = idx === p.correcta;
            const elegido = idx === respuesta;
            return (
              <button key={idx} disabled={respuesta !== null} onClick={() => contestar(idx)}
                className={`block w-full text-left p-3 border text-sm ${
                  respuesta === null ? "border-ink-400 hover:border-neon-blue"
                  : correcto ? "border-neon-blue bg-neon-blue/10 text-zona-notificaciones"
                  : elegido ? "border-neon-red bg-neon-red/10 text-zona-nulidad" : "border-ink-400 opacity-50"
                }`}>
                {op}
              </button>
            );
          })}
        </div>
        {respuesta !== null && (
          <div className="mt-4 border-t border-ink-400 pt-4 text-sm">
            <p className="text-doc-aged/80">{p.explicacion}</p>
            <div className="tag tag-violet mt-2">{p.art}</div>
            <button className="btn mt-4" onClick={avanzar}>▸ Siguiente</button>
          </div>
        )}
      </div>
    </div>
    </GameShell>
  );
}
