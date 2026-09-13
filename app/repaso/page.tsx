"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { diaLocal } from "@/lib/racha";
import { pendientes, resumen } from "@/lib/repaso";
import { preguntasDe, NOMBRE_FUENTE } from "@/lib/bancoRepaso";
import { useAtajosAlternativas, letraDeOpcion } from "@/lib/useAtajosAlternativas";
import { useAvanceAutomatico } from "@/lib/useAvanceAutomatico";
import PistaAvance from "@/components/shell/PistaAvance";
import GameShell from "@/components/shell/GameShell";

// ============================================================================
// REPASO — lo que fallaste, cuando toca volver a verlo.
//
// No añade contenido: vuelve a servir preguntas de los bancos que ya existen.
// Lo que aporta es *cuándo*. Ver lib/repaso.ts.
// ============================================================================

/** Tanda máxima. Una sesión que cabe en un rato se hace; una de cuarenta, no. */
const MAXIMO_POR_TANDA = 12;

export default function RepasoPage() {
  const hydrated = useHydrated();
  const mazo = useGame((s) => s.repaso);
  const registrarRepaso = useGame((s) => s.registrarRepaso);

  const hoy = diaLocal();
  const cuentas = useMemo(() => resumen(mazo, hoy), [mazo, hoy]);

  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const avance = useAvanceAutomatico();

  // La tanda se congela al abrirla. Si se recalculara con cada respuesta,
  // contestar una pregunta la sacaría de la lista de pendientes y el resto se
  // desplazaría bajo los pies del jugador.
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    if (!hydrated || ids !== null) return;
    setIds(pendientes(mazo, hoy).slice(0, MAXIMO_POR_TANDA).map((f) => f.id));
  }, [hydrated, ids, mazo, hoy]);

  const preguntas = useMemo(() => preguntasDe(ids ?? []), [ids]);

  /** Vuelve a empezar con las que aún queden para hoy. */
  function otraTanda() {
    avance.cancelar();
    setI(0);
    setElegida(null);
    setAciertos(0);
    setTerminado(false);
    setIds(null); // el efecto de arriba vuelve a componer la tanda
  }

  const p = preguntas[i];

  function responder(idx: number) {
    if (elegida !== null || !p) return;
    setElegida(idx);
    const ok = idx === p.correcta;
    registrarRepaso(p.id, ok);
    if (ok) {
      setAciertos((a) => a + 1);
      sfx.confirm?.();
      haptica.acierto();
    } else {
      sfx.error?.();
      haptica.error();
    }
    // Al fallar se espera más: hay explicación que leer. Cualquier toque o
    // Enter adelanta igualmente.
    avance.programar(siguiente, ok ? 1100 : 2000);
  }

  function siguiente() {
    setElegida(null);
    if (i + 1 >= preguntas.length) setTerminado(true);
    else setI((n) => n + 1);
  }

  useAtajosAlternativas(p?.opciones.length ?? 0, responder, elegida === null && !terminado);

  const volver = { href: "/expansion", label: "Entrenar" };

  // ── Sin nada que repasar ────────────────────────────────────────────────
  if (hydrated && ids !== null && preguntas.length === 0) {
    return (
      <GameShell variant="focus" eyebrow="Repaso" title="Repaso espaciado" back={volver} scrollLabel="Repaso">
        <div className="max-w-2xl mx-auto tarjeta p-5 mt-3">
          <h2 className="text-xl font-bold txt-fuerte m-0">
            {cuentas.enMazo > 0 ? "Hoy no toca nada" : "Tu mazo está vacío"}
          </h2>
          <p className="t-cuerpo txt-normal mt-2">
            {cuentas.enMazo > 0 ? (
              <>
                Tienes <strong>{cuentas.enMazo}</strong> pregunta{cuentas.enMazo === 1 ? "" : "s"} en
                el mazo, pero ninguna vence hoy. Volver antes de tiempo no ayuda: el repaso funciona
                porque llega cuando estás a punto de olvidar.
              </>
            ) : (
              <>
                Aquí vuelven las preguntas que <strong>fallas</strong> en la cédula y en el
                verdadero/falso, a 1, 3, 7, 16 y 35 días. Aún no has fallado ninguna, o no has
                jugado a esas actividades.
              </>
            )}
          </p>
          {cuentas.aprendidas > 0 && (
            <p className="t-meta txt-suave mt-2 mb-0">
              Ya has dejado atrás {cuentas.aprendidas} pregunta{cuentas.aprendidas === 1 ? "" : "s"}.
            </p>
          )}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Link href="/examen" className="btn-primario">Ir a la cédula</Link>
            <Link href="/expansion" className="btn">Volver a Entrenar</Link>
          </div>
        </div>
      </GameShell>
    );
  }

  // ── Resultado de la tanda ───────────────────────────────────────────────
  if (terminado) {
    const restantes = Math.max(0, cuentas.pendientes - preguntas.length);
    return (
      <GameShell variant="focus" eyebrow="Repaso" title="Tanda terminada" back={volver} scrollLabel="Resultado del repaso">
        <div className="max-w-2xl mx-auto tarjeta p-5 mt-3">
          <h2 className="text-xl font-bold txt-fuerte m-0">
            {aciertos} de {preguntas.length}
          </h2>
          <p className="t-cuerpo txt-normal mt-2">
            Las que acertaste vuelven más adelante; las que fallaste, mañana.
          </p>
          {restantes > 0 && (
            <p className="t-meta txt-suave mt-2 mb-0">
              Todavía te quedan {restantes} para hoy.
            </p>
          )}
          <div className="flex gap-2 mt-4 flex-wrap">
            {restantes > 0 && (
              <button type="button" className="btn-primario" onClick={otraTanda}>
                Otra tanda
              </button>
            )}
            <Link href="/expansion" className="btn">Volver a Entrenar</Link>
          </div>
        </div>
      </GameShell>
    );
  }

  // ── Hasta que el guardado esté leído no se afirma nada ───────────────────
  if (!hydrated || !p) {
    return (
      <GameShell variant="focus" eyebrow="Repaso" title="Repaso espaciado" back={volver} scrollLabel="Repaso">
        <div className="max-w-2xl mx-auto tarjeta p-5 mt-3" aria-busy="true">
          <p className="t-cuerpo txt-suave m-0">Abriendo el mazo…</p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell variant="focus" eyebrow="Repaso" title="Repaso espaciado" back={volver} scrollLabel="Pregunta de repaso">
      <div className="max-w-2xl mx-auto w-full flex flex-col">
        <div className="pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold txt-fuerte">Pregunta {i + 1} de {preguntas.length}</span>
            <span className="chip font-datos">{NOMBRE_FUENTE[p.fuente]}</span>
          </div>
          <div className="medidor mt-1.5" style={{ height: 6 }} aria-hidden="true">
            <span style={{ width: `${(i / preguntas.length) * 100}%`, background: "#4BE7FF" }} />
          </div>
        </div>

        <div className="flex-1 pt-3 space-y-4">
          <h2 className="text-[19px] md:text-[21px] font-semibold txt-fuerte leading-snug m-0">
            {p.enunciado}
          </h2>

          <div className="space-y-2.5" role="group" aria-label="Opciones">
            {p.opciones.map((op, idx) => {
              const estado = elegida === null ? undefined
                : idx === p.correcta ? "ok"
                : idx === elegida ? "mal"
                : "apagada";
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={elegida !== null}
                  onClick={() => responder(idx)}
                  className="opcion"
                  data-estado={estado}
                  aria-keyshortcuts={elegida === null ? `${idx + 1} ${letraDeOpcion(idx)}` : undefined}
                >
                  <span className="opcion-letra" aria-hidden="true">
                    {estado === "ok" ? "✓" : estado === "mal" ? "✗" : letraDeOpcion(idx)}
                  </span>
                  <span>{op}</span>
                </button>
              );
            })}
          </div>

          {elegida !== null && (
            <section className="tarjeta p-4" aria-live="polite">
              <div
                className="text-[16px] font-bold"
                style={{ color: elegida === p.correcta ? "#58F5B0" : "#F08585" }}
              >
                {elegida === p.correcta ? "Correcto" : "Incorrecto"}
              </div>
              <p className="t-cuerpo txt-normal leading-snug mt-1 mb-2">{p.explicacion}</p>
              {p.norma && <span className="chip font-datos">{p.norma}</span>}
              {avance.pendiente && <PistaAvance duracion={avance.duracion} />}
            </section>
          )}
        </div>
      </div>
    </GameShell>
  );
}
