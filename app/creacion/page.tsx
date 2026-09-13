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
// v4: la partida rápida EMPIEZA el juego en un solo toque (nombre → «Partida
// rápida»). Antes llevaba a un paso de confirmación con el botón fuera de la
// pantalla del teléfono. Quien quiera elegir origen y rol sigue el asistente
// con «Siguiente».
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
type Sexo = "femenino" | "masculino";

export default function Creacion() {
  const router = useRouter();
  const hydrated = useHydrated();
  const personajeActual = useGame((s) => s.personaje);
  const nivelActual = useGame((s) => s.nivel);
  const iniciarPartida = useGame((s) => s.iniciarPartida);

  const [paso, setPaso] = useState<PasoId>("nombre");
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState<Sexo>(RAPIDA.sexo);
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

  /** Partida rápida: sólo el nombre. Empieza ya, salvo que haya que reemplazar. */
  function partidaRapida() {
    if (!nombreValido) return;
    sfx.confirm?.();
    setEsRapida(true);
    setOrigen(RAPIDA.origen);
    setRol(RAPIDA.rol);
    setSexo(RAPIDA.sexo);
    if (hayPartidaPrevia) { setConfirmando(true); return; }
    comenzarDeVerdad({ origen: RAPIDA.origen, rol: RAPIDA.rol, sexo: RAPIDA.sexo });
  }

  /** Punto único de creación desde el asistente. Si ya hay partida, pregunta. */
  function intentarComenzar() {
    if (!nombreValido) return;
    if (hayPartidaPrevia) { setConfirmando(true); return; }
    comenzarDeVerdad();
  }

  function comenzarDeVerdad(cfg?: { origen: Origen; rol: Rol; sexo: Sexo }) {
    const o = cfg?.origen ?? origen;
    const r = cfg?.rol ?? rol;
    const p: Personaje = {
      nombre: nombre.trim(),
      sexo: cfg?.sexo ?? sexo,
      origen: o,
      rol: r,
      nivelEconomico: nivelEconomicoDe(o),
      atributos: calcularAtributos(o, r),
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
      <div className="flex-1 min-h-0 flex flex-col max-w-2xl w-full mx-auto">
        {/* ── Aviso de partida en curso. Abrir esta pantalla no la ha tocado. ── */}
        {hayPartidaPrevia && (
          <div className="shrink-0 tarjeta flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 mt-1 mb-2" style={{ borderColor: "#4A3F27", background: "#17140D" }}>
            <span className="t-meta font-semibold" style={{ color: "#E3C27E" }}>
              Tienes una partida: {personajeActual.nombre} · Nv {nivelActual}
            </span>
            <span className="t-meta txt-suave">Nada se borra hasta que lo confirmes.</span>
            <Link href="/juego" onClick={() => sfx.click?.()} className="ml-auto t-meta font-semibold underline underline-offset-4" style={{ color: "#58F5B0" }}>
              Continuar la actual →
            </Link>
          </div>
        )}

        {/* ── Indicador de pasos ── */}
        <div className="shrink-0 mt-1 mb-3" aria-live="polite">
          <div className="flex items-baseline justify-between gap-2">
            <span className="rotulo">Paso {idxPaso + 1} de {PASOS.length}</span>
            <span className="text-[15px] font-semibold txt-fuerte">{PASOS[idxPaso].titulo}</span>
          </div>
          <ol className="flex gap-1.5 mt-2 list-none p-0 m-0" aria-hidden="true">
            {PASOS.map((p, i) => (
              <li key={p.id} className="flex-1 h-1.5 rounded-full" style={{ background: i <= idxPaso ? "#4BE7FF" : "#232C3D" }} />
            ))}
          </ol>
        </div>

        {/* ── Contenido del paso, con scroll propio ── */}
        <div className="shell-scroll flex-1 pr-1" tabIndex={0} role="region" aria-label={`Paso ${idxPaso + 1}: ${PASOS[idxPaso].titulo}`}>
          {paso === "nombre" && (
            <PasoNombre
              nombre={nombre}
              setNombre={setNombre}
              onEnter={avanzar}
              onRapida={partidaRapida}
              puedeSeguir={nombreValido}
              reemplaza={hayPartidaPrevia}
            />
          )}

          {paso === "origen" && (
            <PasoEleccion
              leyenda="Origen profesional"
              ayuda="De dónde vienes. Ajusta tus atributos de partida."
              opciones={ORIGEN.map((o) => ({ id: o.id, nombre: o.nombre, desc: o.desc, eva: o.eva }))}
              valor={origen}
              onElegir={(id) => { setOrigen(id as Origen); setEsRapida(false); sfx.click?.(); }}
            />
          )}

          {paso === "rol" && (
            <PasoEleccion
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
        <div className="shrink-0 flex items-center gap-2 pt-3 pb-1 mt-1 border-t border-[#1F2A3C]">
          {idxPaso > 0 ? (
            <button type="button" onClick={retroceder} className="btn-secundario">
              ← Atrás
            </button>
          ) : (
            <Link href="/" onClick={() => sfx.click?.()} className="btn-secundario">
              Cancelar
            </Link>
          )}

          <div className="flex-1" />

          {paso !== "confirmar" ? (
            <button
              type="button"
              onClick={avanzar}
              disabled={paso === "nombre" && !nombreValido}
              className={paso === "nombre" ? "btn-secundario disabled:opacity-40" : "btn-primario"}
            >
              {paso === "nombre" ? "Personalizar · Siguiente" : "Siguiente →"}
            </button>
          ) : (
            <button type="button" onClick={intentarComenzar} disabled={!nombreValido} className="btn-primario">
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
              <button type="button" onClick={() => { setConfirmando(false); sfx.click?.(); }} className="btn-secundario flex-1">
                Conservar la actual
              </button>
              <button type="button" onClick={() => comenzarDeVerdad()} className="btn btn-danger flex-1">
                Sí, reemplazar
              </button>
            </div>
          }
        >
          <p className="t-cuerpo txt-normal leading-relaxed m-0">
            Se perderá el progreso de <strong className="txt-fuerte">{personajeActual.nombre}</strong> (nivel{" "}
            {nivelActual}): misiones, logros, reliquias y monedas. Esta acción no se puede deshacer.
          </p>
          <Link href="/inventario" className="block text-center t-meta font-semibold txt-suave hover:text-zona-competencia mt-4 py-2 underline underline-offset-4">
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
    <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ borderColor: "#23404A", background: "#0E171C" }}>
      <span className="shrink-0"><EvaMark size={28} /></span>
      <p className="t-base txt-normal leading-snug m-0">
        <span className="sr-only">{EVA.nombre} explica: </span>
        {children}
      </p>
    </div>
  );
}

function PasoNombre({
  nombre, setNombre, onEnter, onRapida, puedeSeguir, reemplaza,
}: {
  nombre: string; setNombre: (v: string) => void; onEnter: () => void; onRapida: () => void; puedeSeguir: boolean; reemplaza: boolean;
}) {
  return (
    <div className="space-y-4 pb-2">
      <div>
        <label htmlFor="campo-nombre" className="rotulo block mb-2" style={{ color: "#7AD4E6" }}>
          Nombre del comparecente
        </label>
        <input
          id="campo-nombre"
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && puedeSeguir) onRapida(); }}
          placeholder="Apellido, Nombre"
          autoComplete="off"
          enterKeyHint="go"
          className="w-full rounded-xl bg-[#0E131D] border border-[#2E3A50] text-[#F4EEDD] px-4 py-3 text-[17px] focus:outline-none focus:border-[#4BE7FF]"
        />
        <p className="t-meta txt-suave mt-2 mb-0">Es lo único imprescindible. Aparecerá en tu expediente.</p>
      </div>

      <button
        type="button"
        onClick={onRapida}
        disabled={!puedeSeguir}
        className="w-full text-left rounded-xl p-4 border-2 disabled:cursor-not-allowed"
        style={puedeSeguir
          ? { borderColor: "#58F5B0", background: "#0F1D18" }
          : { borderColor: "#23302B", background: "#0E1412" }}
      >
        <span className="block text-[18px] font-bold" style={{ color: puedeSeguir ? "#58F5B0" : "#7E9A8E" }}>
          ▶ Partida rápida {reemplaza ? "" : "· jugar ya"}
        </span>
        <span className="block t-meta txt-normal mt-1">
          Litigante freelance · Abogado/a demandante · Atributos equilibrados
        </span>
        {!puedeSeguir && <span className="block t-meta txt-suave mt-1">Escribe tu nombre para activarla.</span>}
      </button>

      <DiceEva>
        La partida rápida usa una configuración recomendada: no la eliges tú, la pongo yo, y es válida y
        equilibrada. Si prefieres elegir origen y rol, usa «Personalizar».
      </DiceEva>
    </div>
  );
}

function PasoEleccion({
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
    <fieldset className="border-0 p-0 m-0 space-y-3 pb-2">
      <legend className="rotulo mb-1" style={{ color: "#7AD4E6" }}>{leyenda}</legend>
      <p className="t-meta txt-suave m-0">{ayuda}</p>

      <div className="grid sm:grid-cols-2 gap-2">
        {opciones.map((o) => {
          const activa = o.id === valor;
          return (
            <label
              key={o.id}
              className="flex gap-3 items-start p-3.5 rounded-xl border-2 cursor-pointer"
              style={{ borderColor: activa ? "#4BE7FF" : "#1F2A3C", background: activa ? "#0F1B24" : "#111620" }}
            >
              <input
                type="radio"
                name={leyenda}
                value={o.id}
                checked={activa}
                onChange={() => onElegir(o.id)}
                className="mt-1 w-5 h-5 shrink-0 accent-[#4BE7FF]"
              />
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold txt-fuerte leading-tight">{o.nombre}</span>
                {o.desc && <span className="block t-meta txt-suave leading-snug mt-1">{o.desc}</span>}
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
  sexo: Sexo;
  setSexo: (s: Sexo) => void;
  atributos: Atributos;
  esRapida: boolean;
  onPersonalizar: () => void;
}) {
  const o = ORIGEN.find((x) => x.id === origen)!;
  const r = ROL.find((x) => x.id === rol)!;

  return (
    <div className="space-y-4 pb-2">
      {esRapida && (
        <div className="p-3 rounded-xl border" style={{ borderColor: "#2C5A48", background: "#0F1B18" }}>
          <div className="rotulo" style={{ color: "#58F5B0" }}>Configuración recomendada</div>
          <p className="t-base txt-normal leading-snug mt-1 mb-0">
            Estás usando la configuración recomendada: no la elegiste tú, la puse yo para que puedas empezar de inmediato.
          </p>
          <button type="button" onClick={onPersonalizar} className="t-meta font-semibold underline underline-offset-4 mt-2" style={{ color: "#4BE7FF" }}>
            Personalizar en su lugar →
          </button>
        </div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 m-0">
        <Resumen etiqueta="Nombre" valor={nombre || "—"} />
        <Resumen etiqueta="Origen" valor={o.nombre} />
        <Resumen etiqueta="Rol" valor={r.nombre} />
      </dl>

      {/* Se conserva la opción de sexo que ya existía, agrupada aquí. */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="rotulo mb-2">Sexo del personaje</legend>
        <div className="flex gap-2">
          {(["femenino", "masculino"] as const).map((s) => (
            <label
              key={s}
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-3 rounded-xl border-2 cursor-pointer text-[15px] font-semibold capitalize"
              style={{
                borderColor: sexo === s ? "#4BE7FF" : "#1F2A3C",
                background: sexo === s ? "#0F1B24" : "#111620",
                color: sexo === s ? "#F4EEDD" : "#AEB8C8",
              }}
            >
              <input type="radio" name="sexo" value={s} checked={sexo === s} onChange={() => setSexo(s)} className="w-5 h-5 accent-[#4BE7FF]" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="rotulo mb-2">Atributos resultantes</div>
        <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2">
          {(Object.entries(atributos) as [keyof Atributos, number][]).map(([k, v]) => {
            const delta = v - 5;
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="t-meta txt-normal w-[9.5rem] shrink-0 capitalize">{k.replace(/_/g, " ")}</span>
                <span className="medidor flex-1" style={{ height: 6 }} aria-hidden="true">
                  <span className="barfill" style={{ width: `${v * 10}%` }} />
                </span>
                <span className="font-datos t-meta w-14 text-right shrink-0" style={{ color: "#7AD4E6" }}>
                  {v}/10
                  {delta !== 0 && (
                    <span style={{ color: delta > 0 ? "#58F5B0" : "#F08585" }}>
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
        Tus atributos salen de 5 en cada uno, más lo que aportan origen y rol. Se recalculan desde cero cada vez
        que cambias algo, así que puedes volver atrás sin acumular bonificaciones.
      </DiceEva>
    </div>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="tarjeta px-3 py-2">
      <dt className="rotulo">{etiqueta}</dt>
      <dd className="text-[16px] font-semibold txt-fuerte leading-tight mt-0.5 m-0">{valor}</dd>
    </div>
  );
}
