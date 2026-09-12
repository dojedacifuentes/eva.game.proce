"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { useHydrated } from "@/lib/useHydrated";
import type { Atributos, Origen, Personaje, Rol } from "@/types/game";
import { sfx } from "@/lib/audio";
import GameShell from "@/components/shell/GameShell";
import EvaMark from "@/components/shell/EvaMark";
import Modal from "@/components/shell/Modal";
import { EVA } from "@/lib/brand";
import {
  ORIGENES as ORIGEN,
  ROLES as ROL,
  PARTIDA_RAPIDA as RAPIDA,
  calcularAtributos,
  nivelEconomicoDe,
} from "@/lib/personaje";

// ============================================================================
// CREACIÓN DE PERSONAJE — asistente compacto + partida rápida.
//
// Reemplaza el formulario de una sola columna larga (nombre, sexo, 5 orígenes,
// 5 roles, 6 atributos y el botón al final, sobre el píxel 1184 en escritorio).
//
// Reglas de seguridad de la partida, explícitas:
//  · Abrir esta pantalla NO borra nada.
//  · Cancelar o volver atrás NO borra nada.
//  · Sólo `iniciarPartida` destruye la anterior, y sólo tras confirmarlo en un
//    diálogo dentro del producto.
// ============================================================================

type PasoId = "nombre" | "origen" | "rol" | "confirmar";
const PASOS: { id: PasoId; titulo: string }[] = [
  { id: "nombre", titulo: "Nombre" },
  { id: "origen", titulo: "Origen" },
  { id: "rol", titulo: "Rol" },
  { id: "confirmar", titulo: "Confirmar" },
];

const CLAVE_BORRADOR = "foro-invisible:borrador-creacion";

export default function Creacion() {
  const router = useRouter();
  const hydrated = useHydrated();
  const personajeActual = useGame((s) => s.personaje);
  const nivelActual = useGame((s) => s.nivel);
  const iniciarPartida = useGame((s) => s.iniciarPartida);

  const [paso, setPaso] = useState<PasoId>("nombre");
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState<"femenino" | "masculino">(RAPIDA.sexo);
  const [origen, setOrigen] = useState<Origen>(RAPIDA.origen);
  const [rol, setRol] = useState<Rol>(RAPIDA.rol);
  const [esRapida, setEsRapida] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const borradorLeido = useRef(false);

  const hayPartidaPrevia = hydrated && !!personajeActual.nombre;

  // ── Borrador: se conserva al volver entre pasos y se limpia al terminar ────
  useEffect(() => {
    if (borradorLeido.current) return;
    borradorLeido.current = true;
    try {
      const crudo = localStorage.getItem(CLAVE_BORRADOR);
      if (!crudo) return;
      const b = JSON.parse(crudo);
      if (typeof b.nombre === "string") setNombre(b.nombre);
      if (b.sexo === "femenino" || b.sexo === "masculino") setSexo(b.sexo);
      if (ORIGEN.some((o) => o.id === b.origen)) setOrigen(b.origen);
      if (ROL.some((r) => r.id === b.rol)) setRol(b.rol);
      if (PASOS.some((p) => p.id === b.paso)) setPaso(b.paso);
    } catch { /* borrador ilegible: se ignora */ }
  }, []);

  useEffect(() => {
    if (!borradorLeido.current) return;
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ nombre, sexo, origen, rol, paso }));
    } catch { /* sin persistencia: el asistente sigue funcionando */ }
  }, [nombre, sexo, origen, rol, paso]);

  const atributos = useMemo(() => calcularAtributos(origen, rol), [origen, rol]);
  const nombreValido = nombre.trim().length > 0;
  const idxPaso = PASOS.findIndex((p) => p.id === paso);

  function avanzar() {
    sfx.click?.();
    if (paso === "nombre" && nombreValido) setPaso("origen");
    else if (paso === "origen") setPaso("rol");
    else if (paso === "rol") setPaso("confirmar");
  }
  function retroceder() {
    sfx.click?.();
    if (idxPaso > 0) setPaso(PASOS[idxPaso - 1].id);
  }

  /** Partida rápida: sólo el nombre; el resto queda en la recomendada. */
  function irARapida() {
    if (!nombreValido) return;
    sfx.confirm?.();
    setEsRapida(true);
    setOrigen(RAPIDA.origen);
    setRol(RAPIDA.rol);
    setSexo(RAPIDA.sexo);
    setPaso("confirmar");
  }

  /** Punto único de creación. Si ya hay partida, primero pregunta. */
  function intentarComenzar() {
    if (!nombreValido) return;
    if (hayPartidaPrevia) { setConfirmando(true); return; }
    comenzarDeVerdad();
  }

  function comenzarDeVerdad() {
    const p: Personaje = {
      nombre: nombre.trim(),
      sexo,
      origen,
      rol,
      nivelEconomico: nivelEconomicoDe(origen),
      atributos: calcularAtributos(origen, rol),
      reputacion: 0,
      trauma: 0,
      expedientesGanados: 0,
      expedientesPerdidos: 0,
      cicloProcesal: 1,
    };
    iniciarPartida(p);
    try { localStorage.removeItem(CLAVE_BORRADOR); } catch { /* nada que limpiar */ }
    sfx.confirm?.();
    router.push("/juego");
  }

  return (
    <GameShell
      variant="app"
      eyebrow="Registro de litigantes"
      title="Crear personaje"
      back={{ href: "/", label: "Portada" }}
      headerCompacto
    >
      <div className="flex-1 min-h-0 flex flex-col max-w-3xl w-full mx-auto">
        {/* ── Aviso de partida en curso. Abrir esta pantalla no la ha tocado. ── */}
        {hayPartidaPrevia && (
          <div
            className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 mb-2 border text-[11px]"
            style={{ borderColor: "rgba(215,180,106,0.35)", background: "rgba(215,180,106,0.07)" }}
          >
            <span className="font-mono-terminal text-zona-prueba">
              Tienes una partida: {personajeActual.nombre} · Nv.{nivelActual}
            </span>
            <span className="font-mono-terminal text-doc-aged/45">
              Nada se borra hasta que lo confirmes.
            </span>
            <Link
              href="/juego"
              onClick={() => sfx.click?.()}
              className="ml-auto font-mono-terminal uppercase tracking-widest text-zona-cautelares hover:underline"
            >
              Continuar la actual →
            </Link>
          </div>
        )}

        {/* ── Indicador de pasos ── */}
        <ol className="shrink-0 flex items-center gap-1 mb-3 list-none p-0 m-0">
          {PASOS.map((p, i) => {
            const hecho = i < idxPaso;
            const activo = i === idxPaso;
            return (
              <li key={p.id} className="flex-1">
                <div
                  className="h-0.5 rounded-full mb-1"
                  style={{ background: hecho || activo ? "var(--zona-competencia)" : "rgba(232,223,197,0.12)" }}
                />
                <span
                  className="font-mono-terminal text-[8px] uppercase tracking-widest"
                  style={{ color: activo ? "var(--zona-competencia)" : "rgba(232,223,197,0.35)" }}
                >
                  {i + 1}. {p.titulo}
                </span>
              </li>
            );
          })}
        </ol>

        {/* ── Contenido del paso, con scroll propio ── */}
        <div className="shell-scroll flex-1 pr-1" tabIndex={0} role="region" aria-label={`Paso ${idxPaso + 1}: ${PASOS[idxPaso].titulo}`}>
          {paso === "nombre" && (
            <PasoNombre
              nombre={nombre}
              setNombre={setNombre}
              onEnter={avanzar}
              onRapida={irARapida}
              puedeSeguir={nombreValido}
            />
          )}

          {paso === "origen" && (
            <PasoElección
              leyenda="Origen profesional"
              ayuda="De dónde vienes. Ajusta tus atributos de partida."
              opciones={ORIGEN.map((o) => ({ id: o.id, nombre: o.nombre, desc: o.desc, eva: o.eva }))}
              valor={origen}
              onElegir={(id) => { setOrigen(id as Origen); setEsRapida(false); sfx.click?.(); }}
            />
          )}

          {paso === "rol" && (
            <PasoElección
              leyenda="Rol procesal"
              ayuda="Desde qué asiento litigas. Cambia el enfoque de las misiones."
              opciones={ROL.map((r) => ({ id: r.id, nombre: r.nombre, desc: "", eva: r.eva }))}
              valor={rol}
              onElegir={(id) => { setRol(id as Rol); setEsRapida(false); sfx.click?.(); }}
            />
          )}

          {paso === "confirmar" && (
            <PasoConfirmar
              nombre={nombre.trim()}
              origen={origen}
              rol={rol}
              sexo={sexo}
              setSexo={(s) => { setSexo(s); setEsRapida(false); }}
              atributos={atributos}
              esRapida={esRapida}
              onPersonalizar={() => { setEsRapida(false); setPaso("origen"); sfx.click?.(); }}
            />
          )}
        </div>

        {/* ── Controles de avance: siempre visibles, nunca dentro del scroll ── */}
        <div className="shrink-0 flex items-center gap-2 pt-3 mt-1 border-t border-zona-competencia/10">
          {idxPaso > 0 ? (
            <button type="button" onClick={retroceder} className="btn text-[11px] px-4 py-2.5">
              ← Atrás
            </button>
          ) : (
            <Link href="/" onClick={() => sfx.click?.()} className="btn text-[11px] px-4 py-2.5">
              Cancelar
            </Link>
          )}

          <div className="flex-1" />

          {paso !== "confirmar" ? (
            <button
              type="button"
              onClick={avanzar}
              disabled={paso === "nombre" && !nombreValido}
              className="btn btn-recurso text-[11px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={intentarComenzar}
              disabled={!nombreValido}
              className="btn btn-recurso text-[11px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {hayPartidaPrevia ? "Reemplazar y comenzar" : "Comenzar"}
            </button>
          )}
        </div>
      </div>

      {/* Confirmación de reemplazo. Sólo después de un "sí" se toca lo guardado. */}
      {confirmando && (
        <Modal
          titulo="Vas a reemplazar tu partida"
          acento="var(--zona-nulidad-txt)"
          ancho="md"
          etiquetaCuerpo="Confirmación de reemplazo de partida"
          onCerrar={() => setConfirmando(false)}
          pie={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                type="button"
                onClick={() => { setConfirmando(false); sfx.click?.(); }}
                className="btn flex-1"
              >
                Conservar la actual
              </button>
              <button type="button" onClick={comenzarDeVerdad} className="btn btn-danger flex-1">
                Sí, reemplazar
              </button>
            </div>
          }
        >
          <p className="t-cuerpo txt-normal leading-relaxed m-0">
            Se perderá el progreso de <strong className="txt-fuerte">{personajeActual.nombre}</strong> (nivel{" "}
            {nivelActual}): misiones, logros, reliquias y monedas. Esta acción no se puede deshacer.
          </p>
          <Link
            href="/inventario"
            className="block text-center t-meta font-mono-terminal uppercase tracking-widest txt-suave hover:text-zona-competencia mt-4 py-2"
          >
            Antes quiero exportar mi partida
          </Link>
        </Modal>
      )}
    </GameShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════

function DiceEva({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-2.5 border" style={{ borderColor: "rgba(122,212,230,0.25)", background: "rgba(122,212,230,0.05)" }}>
      <EvaMark size={18} />
      <p className="font-serif-juridica not-italic text-doc-aged/75 text-xs leading-snug">
        <span className="sr-only">{EVA.nombre} explica: </span>
        {children}
      </p>
    </div>
  );
}

function PasoNombre({
  nombre, setNombre, onEnter, onRapida, puedeSeguir,
}: {
  nombre: string; setNombre: (v: string) => void; onEnter: () => void; onRapida: () => void; puedeSeguir: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="campo-nombre" className="block font-mono-terminal text-[10px] uppercase tracking-widest text-zona-competencia mb-2">
          Nombre del comparecente
        </label>
        <input
          id="campo-nombre"
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && puedeSeguir) onEnter(); }}
          placeholder="Apellido, Nombre"
          autoComplete="off"
          className="w-full bg-ink-700 border border-neon-blue/30 text-doc-aged p-3 text-base focus:outline-none focus:border-neon-blue"
        />
        <p id="ayuda-nombre" className="font-mono-terminal text-[9px] text-doc-aged/35 mt-1.5">
          Es lo único imprescindible. Aparecerá en tu expediente.
        </p>
      </div>

      <DiceEva>
        Con el nombre basta para empezar. Si quieres jugar ya, usa la partida rápida: te pongo una
        configuración válida y equilibrada, y puedes personalizarla cuando quieras.
      </DiceEva>

      <button
        type="button"
        onClick={onRapida}
        disabled={!puedeSeguir}
        className="w-full p-3.5 border text-left transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-125"
        style={{ borderColor: "var(--zona-cautelares)", background: "rgba(88,245,176,0.08)" }}
      >
        <div className="font-display-grave text-sm" style={{ color: "var(--zona-cautelares)" }}>
          ▶ PARTIDA RÁPIDA
        </div>
        <div className="font-mono-terminal text-[9px] text-doc-aged/50 mt-0.5">
          Litigante freelance · Abogada demandante · Atributos equilibrados
        </div>
      </button>
    </div>
  );
}

function PasoElección({
  leyenda, ayuda, opciones, valor, onElegir,
}: {
  leyenda: string;
  ayuda: string;
  opciones: { id: string; nombre: string; desc: string; eva: string }[];
  valor: string;
  onElegir: (id: string) => void;
}) {
  const elegida = opciones.find((o) => o.id === valor);
  return (
    <fieldset className="border-0 p-0 m-0 space-y-3">
      <legend className="font-mono-terminal text-[10px] uppercase tracking-widest text-zona-competencia mb-1">
        {leyenda}
      </legend>
      <p className="font-mono-terminal text-[9px] text-doc-aged/40 -mt-2">{ayuda}</p>

      <div className="grid sm:grid-cols-2 gap-2">
        {opciones.map((o) => {
          const activa = o.id === valor;
          return (
            <label
              key={o.id}
              className="flex gap-2 items-start p-3 border cursor-pointer transition-all"
              style={{
                borderColor: activa ? "var(--zona-competencia)" : "rgba(232,223,197,0.14)",
                background: activa ? "rgba(75,231,255,0.08)" : "transparent",
              }}
            >
              <input
                type="radio"
                name={leyenda}
                value={o.id}
                checked={activa}
                onChange={() => onElegir(o.id)}
                className="mt-1 accent-[var(--zona-competencia)]"
              />
              <span className="min-w-0">
                <span className="block text-zona-notificaciones text-sm leading-tight">{o.nombre}</span>
                {o.desc && (
                  <span className="block text-doc-aged/55 text-xs leading-snug mt-0.5">{o.desc}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {elegida && <DiceEva>{elegida.eva}</DiceEva>}
    </fieldset>
  );
}

function PasoConfirmar({
  nombre, origen, rol, sexo, setSexo, atributos, esRapida, onPersonalizar,
}: {
  nombre: string;
  origen: Origen;
  rol: Rol;
  sexo: "femenino" | "masculino";
  setSexo: (s: "femenino" | "masculino") => void;
  atributos: Atributos;
  esRapida: boolean;
  onPersonalizar: () => void;
}) {
  const o = ORIGEN.find((x) => x.id === origen)!;
  const r = ROL.find((x) => x.id === rol)!;

  return (
    <div className="space-y-3">
      {esRapida && (
        <div className="p-2.5 border" style={{ borderColor: "rgba(88,245,176,0.3)", background: "rgba(88,245,176,0.06)" }}>
          <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-zona-cautelares mb-1">
            Configuración recomendada
          </div>
          <p className="font-serif-juridica not-italic text-doc-aged/70 text-xs leading-snug">
            Estás usando la configuración recomendada: no la elegiste tú, la puse yo para que puedas
            empezar de inmediato. Es una combinación válida y equilibrada.
          </p>
          <button
            type="button"
            onClick={onPersonalizar}
            className="font-mono-terminal text-[10px] uppercase tracking-widest text-zona-competencia hover:underline mt-1.5"
          >
            Personalizar en su lugar →
          </button>
        </div>
      )}

      <dl className="grid sm:grid-cols-3 gap-2 m-0">
        <Resumen etiqueta="Nombre" valor={nombre || "—"} />
        <Resumen etiqueta="Origen" valor={o.nombre} />
        <Resumen etiqueta="Rol" valor={r.nombre} />
      </dl>

      {/* Se conserva la opción de sexo que ya existía, agrupada aquí. */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/45 mb-1.5">
          Sexo del personaje
        </legend>
        <div className="flex gap-2">
          {(["femenino", "masculino"] as const).map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 px-3 py-2 border cursor-pointer text-xs uppercase tracking-widest"
              style={{
                borderColor: sexo === s ? "var(--zona-competencia)" : "rgba(232,223,197,0.14)",
                background: sexo === s ? "rgba(75,231,255,0.08)" : "transparent",
                color: sexo === s ? "var(--zona-notificaciones)" : "rgba(232,223,197,0.6)",
              }}
            >
              <input
                type="radio"
                name="sexo"
                value={s}
                checked={sexo === s}
                onChange={() => setSexo(s)}
                className="accent-[var(--zona-competencia)]"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Atributos compactos: una fila por atributo, sin tarjetas gigantes. */}
      <div>
        <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/45 mb-1.5">
          Atributos resultantes
        </div>
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
          {(Object.entries(atributos) as [keyof Atributos, number][]).map(([k, v]) => {
            const delta = v - 5;
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="font-mono-terminal text-[10px] text-doc-aged/60 w-[9.5rem] shrink-0 capitalize">
                  {k.replace(/_/g, " ")}
                </span>
                <span className="flex-1 h-1 bg-ink-700 rounded-full overflow-hidden">
                  <span className="block h-full barfill" style={{ width: `${v * 10}%` }} />
                </span>
                <span className="font-mono-terminal text-[10px] text-zona-notificaciones w-11 text-right shrink-0">
                  {v}/10
                  {delta !== 0 && (
                    <span style={{ color: delta > 0 ? "var(--zona-cautelares)" : "var(--zona-nulidad)" }}>
                      {" "}{delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <DiceEva>
        Tus atributos salen de 5 en cada uno, más lo que aportan origen y rol. Se recalculan desde
        cero cada vez que cambias algo, así que puedes volver atrás sin acumular bonificaciones.
        Origen y rol quedan fijos al comenzar: cambiarlos después rompería ese cálculo.
      </DiceEva>
    </div>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="p-2 border border-doc-aged/12">
      <dt className="font-mono-terminal text-[8px] uppercase tracking-widest text-doc-aged/40">{etiqueta}</dt>
      <dd className="font-display-grave text-doc-aged text-xs leading-tight mt-0.5 m-0">{valor}</dd>
    </div>
  );
}
