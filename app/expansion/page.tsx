"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { sfx } from "@/lib/audio";
import { useGame } from "@/store/useGame";
import { isModuloUnlocked, getModuloGate } from "@/lib/unlock-gates";
import { CASOS_INVESTIGATIVOS } from "@/data/casos-investigativos";
import GameShell from "@/components/shell/GameShell";
import dynamic from "next/dynamic";

// ============================================================================
// Carga diferida de los módulos de entrenamiento: cada uno llega cuando se
// abre. `ssr: false` porque todos dependen de estado de cliente.
// ============================================================================
const Cargando = () => (
  <div className="py-16 text-center rotulo" aria-live="polite">
    Cargando módulo…
  </div>
);

const SeleccionBuild = dynamic(() => import("@/components/SeleccionBuild"), { ssr: false, loading: Cargando });
const ExpedienteVivo = dynamic(() => import("@/components/ExpedienteVivo"), { ssr: false, loading: Cargando });
const PreclusionTimer = dynamic(() => import("@/components/PreclusionTimer"), { ssr: false, loading: Cargando });
const InhibitoriaDeclinatoria = dynamic(() => import("@/components/InhibitoriaDeclinatoria"), { ssr: false, loading: Cargando });
const ArcadeClasificador = dynamic(() => import("@/components/ArcadeClasificador"), { ssr: false, loading: Cargando });
const AbandonoProcedimiento = dynamic(() => import("@/components/AbandonoProcedimiento"), { ssr: false, loading: Cargando });
const ComparecenciaPanel = dynamic(() => import("@/components/ComparecenciaPanel"), { ssr: false, loading: Cargando });
const SpeedrunVoF = dynamic(() => import("@/components/SpeedrunVoF"), { ssr: false, loading: Cargando });
const SalaSentencia = dynamic(() => import("@/components/SalaSentencia"), { ssr: false, loading: Cargando });
const JuicioEjecutivoCompleto = dynamic(() => import("@/components/JuicioEjecutivoCompleto"), { ssr: false, loading: Cargando });
const GrimorioSkills = dynamic(() => import("@/components/GrimorioSkills"), { ssr: false, loading: Cargando });
const ExamenGrado = dynamic(() => import("@/components/ExamenGrado"), { ssr: false, loading: Cargando });
const SistemaCartas = dynamic(() => import("@/components/SistemaCartas"), { ssr: false, loading: Cargando });
const TimelineOrdenamiento = dynamic(() => import("@/components/TimelineOrdenamiento"), { ssr: false, loading: Cargando });
const DueloMediosPrueba = dynamic(() => import("@/components/DueloMediosPrueba"), { ssr: false, loading: Cargando });
const AtaqueRepreguntas = dynamic(() => import("@/components/AtaqueRepreguntas"), { ssr: false, loading: Cargando });
const CasoInvestigativo = dynamic(() => import("@/components/CasoInvestigativo"), { ssr: false, loading: Cargando });
const SubmundosPanel = dynamic(() => import("@/components/SubmundosPanel"), { ssr: false, loading: Cargando });
const NPCInteractionPanel = dynamic(() => import("@/components/NPCInteractionPanel"), { ssr: false, loading: Cargando });
const WorldSelector = dynamic(() => import("@/components/WorldSelector"), { ssr: false, loading: Cargando });
const InventarioPanel = dynamic(() => import("@/components/InventarioPanel"), { ssr: false, loading: Cargando });

// ============================================================================
// ENTRENAR — v4
//
// Antes: cuatro secciones de tarjetas grandes una debajo de otra (21 módulos,
// descripciones a 12 px) y, dentro de cada módulo, otra fila de botones
// «Volver / Ciudad Judicial» duplicando la cabecera. En un teléfono eran más de
// cinco pantallazos de desplazamiento.
// Ahora: cuatro pestañas, cada una una lista corta de filas legibles; el botón
// de volver de la cabecera regresa al menú, y el gesto «atrás» del teléfono
// también (el módulo abierto vive en la URL: /expansion?m=arcade).
// ============================================================================

type Modulo =
  | "menu" | "build" | "expediente" | "preclusion" | "inhibitoria" | "arcade" | "abandono"
  | "comparecencia" | "vof" | "sentencia" | "ejecutivo_full" | "grimorio" | "examen" | "cartas"
  | "timeline" | "duelo" | "ataque" | "investigacion" | "submundos" | "npcs" | "mundos" | "inventario";

interface ModuloMeta {
  id: Exclude<Modulo, "menu">;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  zona: string;
  icono: string;
}

const MODULOS_CAMPAÑA: ModuloMeta[] = [
  { id: "ejecutivo_full", titulo: "Campaña Ejecutiva", subtitulo: "10 etapas · árbol decisional", descripcion: "Juicio ejecutivo completo: del título al remate. Verificación art. 434, mandamiento, embargo, excepciones del 464, fallo y tercerías.", zona: "ejecutivo", icono: "💼" },
  { id: "examen", titulo: "Examen de Grado", subtitulo: "Cédula oral · alternativas", descripcion: "Cédulas con respuesta académica modelo y alternativas difíciles con distractores basados en errores reales.", zona: "nulidad", icono: "📋" },
  { id: "investigacion", titulo: "Casos Investigativos", subtitulo: "Deducción · pistas ocultas", descripcion: "Descubre pistas y deduce vicios procesales ocultos: emplazamiento fantasma, ultra petita, preclusión encubierta.", zona: "cosajuzgada", icono: "🔍" },
  { id: "npcs", titulo: "Mentoría Procesal", subtitulo: "10 mentores · 3 etapas", descripcion: "Aprende de la Dra. Noemí, el Juez Silva, el Receptor Castro y más. Cada mentor con arco, actividades y desafío final.", zona: "recursos", icono: "🧑‍⚖️" },
];

const MODULOS_COMBATE: ModuloMeta[] = [
  { id: "arcade", titulo: "Arcade Clasificador", subtitulo: "Combo · velocidad · ranking", descripcion: "Resoluciones, recursos, excepciones y competencia a velocidad creciente, con multiplicador de combo.", zona: "ejecutivo", icono: "🎮" },
  { id: "vof", titulo: "Verdadero o Falso", subtitulo: "Presión temporal · trampas", descripcion: "Más de 70 enunciados tramposos. La respuesta intuitiva suele ser la incorrecta.", zona: "oralidad", icono: "❓" },
  { id: "duelo", titulo: "Duelo de Medios", subtitulo: "Combate · 3 rondas", descripcion: "Documental, testimonial, confesión, presunción y pericial se enfrentan en tres rondas.", zona: "prueba", icono: "⚔️" },
  { id: "ataque", titulo: "Repreguntas", subtitulo: "8 preguntas · 30 s", descripcion: "Ocho preguntas de procedimiento con 30 segundos cada una. Velocidad y precisión.", zona: "oralidad", icono: "⚡" },
];

const MODULOS_HERRAMIENTAS: ModuloMeta[] = [
  { id: "inhibitoria", titulo: "Inhibitoria / Declinatoria", subtitulo: "Arts. 101-112 CPC", descripcion: "Cuestiones de competencia: identifica el medio y el tribunal correcto.", zona: "competencia", icono: "🏛" },
  { id: "timeline", titulo: "Timeline Procesal", subtitulo: "Ordena los actos", descripcion: "Reconstruye el orden correcto de los actos procesales.", zona: "ejecutivo", icono: "📅" },
  { id: "comparecencia", titulo: "Comparecencia", subtitulo: "Ley 18.120 · patrocinio", descripcion: "Los requisitos del primer escrito. La secretaría no perdona.", zona: "incidentes", icono: "✍️" },
  { id: "preclusion", titulo: "Preclusión Real", subtitulo: "Art. 64 CPC · fatal", descripcion: "Plazo en tiempo real: si vence, la preclusión es irreversible.", zona: "ejecutivo", icono: "⏳" },
  { id: "abandono", titulo: "Abandono", subtitulo: "Art. 152 CPC · 6 meses", descripcion: "Sólo las gestiones útiles interrumpen el plazo.", zona: "incidentes", icono: "🗂" },
  { id: "sentencia", titulo: "Sala de Sentencia", subtitulo: "Horror judicial", descripcion: "El estrado holográfico observa. Veredicto con efectos.", zona: "cosajuzgada", icono: "⚖️" },
  { id: "expediente", titulo: "Expediente Vivo", subtitulo: "Salud procesal", descripcion: "El expediente se degrada con cada vicio.", zona: "nulidad", icono: "📁" },
];

const MODULOS_SISTEMA: ModuloMeta[] = [
  { id: "inventario", titulo: "Reliquias Procesales", subtitulo: "Inventario · pasivos", descripcion: "Compra y equipa artefactos jurídicos con bonificaciones pasivas.", zona: "prueba", icono: "⚗️" },
  { id: "submundos", titulo: "Submundos Ocultos", subtitulo: "Secretos · desbloqueables", descripcion: "Historias de vicios procesales que nunca se escriben.", zona: "nulidad", icono: "🌑" },
  { id: "mundos", titulo: "Mundos Visuales", subtitulo: "5 identidades", descripcion: "Cambia la estética de los módulos.", zona: "competencia", icono: "🌍" },
  { id: "grimorio", titulo: "Grimorio de Skills", subtitulo: "11 habilidades", descripcion: "Desbloquea habilidades procesales especiales.", zona: "recursos", icono: "📖" },
  { id: "cartas", titulo: "Sistema de Cartas", subtitulo: "20 cartas jurídicas", descripcion: "Excepciones, recursos y medidas como cartas tácticas.", zona: "nulidad", icono: "🃏" },
  { id: "build", titulo: "Especialización", subtitulo: "6 clases", descripcion: "Litigante, casacional, formalista, estratega, práctico o doctrinario.", zona: "recursos", icono: "🎯" },
];

const TODOS = [...MODULOS_CAMPAÑA, ...MODULOS_COMBATE, ...MODULOS_HERRAMIENTAS, ...MODULOS_SISTEMA];
const VALIDOS = new Set<string>(TODOS.map((x) => x.id));

const PESTAÑAS = [
  { id: "campaña", nombre: "Campaña", modulos: MODULOS_CAMPAÑA },
  { id: "arena", nombre: "Arena", modulos: MODULOS_COMBATE },
  { id: "herramientas", nombre: "Herramientas", modulos: MODULOS_HERRAMIENTAS },
  { id: "sistema", nombre: "Sistema", modulos: MODULOS_SISTEMA },
] as const;
type PestañaId = (typeof PESTAÑAS)[number]["id"];

/** Colores de identidad usados como acento de fila (versión legible). */
const COLOR_ZONA: Record<string, string> = {
  ejecutivo: "#FF8A3D", nulidad: "#F08585", cosajuzgada: "#E8E4DA", recursos: "#A98CFF",
  oralidad: "#FF85DC", prueba: "#D7B46A", competencia: "#4BE7FF", incidentes: "#F0A878",
};

const CLAVE_PESTAÑA = "foro-invisible:entrenar-pestana";

export default function ExpansionHub() {
  const [m, setM] = useState<Modulo>("menu");
  const [pestaña, setPestaña] = useState<PestañaId>("campaña");
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const { nivel, logros } = useGame();
  const logrosIds = logros.map((l) => l.id);

  // El módulo abierto vive en la URL: el «atrás» del teléfono vuelve al menú.
  useEffect(() => {
    const leer = () => {
      const p = new URLSearchParams(window.location.search).get("m");
      setM(p && VALIDOS.has(p) ? (p as Modulo) : "menu");
      setCasoSeleccionado(null);
    };
    leer();
    try {
      const t = localStorage.getItem(CLAVE_PESTAÑA);
      if (PESTAÑAS.some((x) => x.id === t)) setPestaña(t as PestañaId);
    } catch { /* sin almacenamiento */ }
    window.addEventListener("popstate", leer);
    return () => window.removeEventListener("popstate", leer);
  }, []);

  const abrir = (id: Exclude<Modulo, "menu">) => {
    if (!isModuloUnlocked(id, nivel, logrosIds)) return;
    sfx.confirm?.();
    setM(id);
    setCasoSeleccionado(null);
    try { window.history.pushState({ ...window.history.state, m: id }, "", `?m=${id}`); } catch { /* sin historial */ }
  };

  const volverAlMenu = useCallback(() => {
    if (window.history.state?.m) {
      window.history.back();
    } else {
      setM("menu");
      setCasoSeleccionado(null);
      try { window.history.replaceState(window.history.state, "", window.location.pathname); } catch { /* sin historial */ }
    }
  }, []);

  const elegirPestaña = (id: PestañaId) => {
    sfx.click?.();
    setPestaña(id);
    try { localStorage.setItem(CLAVE_PESTAÑA, id); } catch { /* sin almacenamiento */ }
  };

  const meta = m !== "menu" ? TODOS.find((x) => x.id === m) : undefined;

  // ─── Módulo abierto ───────────────────────────────────────────────────────
  if (m !== "menu") {
    const enCaso = m === "investigacion" && casoSeleccionado;
    const casoActual = enCaso ? CASOS_INVESTIGATIVOS.find((c) => c.id === casoSeleccionado) : undefined;
    return (
      <GameShell
        variant="focus"
        eyebrow="Entrenar"
        title={casoActual?.titulo ?? meta?.titulo ?? "Módulo"}
        back={enCaso
          ? { onClick: () => setCasoSeleccionado(null), label: "Casos" }
          : { onClick: volverAlMenu, label: "Módulos" }}
        scrollLabel="Módulo de entrenamiento"
        scrollKey={`${m}-${casoSeleccionado ?? ""}`}
      >
        <div className="max-w-6xl w-full mx-auto pt-2 pb-4">
          {m === "investigacion" && !casoActual && (
            <div className="space-y-3">
              <p className="t-cuerpo txt-normal m-0">
                Descubre pistas, conecta evidencia y deduce el vicio procesal antes de que la prescripción actúe.
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {CASOS_INVESTIGATIVOS.map((caso) => (
                  <button
                    key={caso.id}
                    type="button"
                    onClick={() => { sfx.confirm?.(); setCasoSeleccionado(caso.id); }}
                    className="fila"
                    style={{ "--acento": COLOR_ZONA[caso.zona] ?? "#4BE7FF" } as CSSProperties}
                  >
                    <span className="fila-icono" aria-hidden="true">🔍</span>
                    <span className="fila-texto">
                      <span className="fila-titulo">{caso.titulo}</span>
                      <span className="fila-sub">{caso.descripcion}</span>
                      <span className="fila-meta">{"★".repeat(caso.dificultad)} · {caso.pistas.length} pistas</span>
                    </span>
                    <span className="fila-chevron" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {casoActual && (
            <CasoInvestigativo caso={casoActual} onVolver={() => setCasoSeleccionado(null)} onResuelto={() => { /* recompensas dentro del caso */ }} />
          )}
          {m === "ejecutivo_full" && <JuicioEjecutivoCompleto />}
          {m === "examen" && <ExamenGrado />}
          {m === "grimorio" && <GrimorioSkills />}
          {m === "cartas" && <SistemaCartas />}
          {m === "timeline" && <TimelineOrdenamiento />}
          {m === "duelo" && <DueloMediosPrueba />}
          {m === "ataque" && <AtaqueRepreguntas />}
          {m === "arcade" && <ArcadeClasificador />}
          {m === "inventario" && <InventarioPanel />}
          {m === "submundos" && <SubmundosPanel />}
          {m === "npcs" && <NPCInteractionPanel />}
          {m === "mundos" && <WorldSelector onClose={volverAlMenu} />}
          {m === "vof" && <SpeedrunVoF />}
          {m === "sentencia" && <SalaSentencia />}
          {m === "expediente" && <ExpedienteVivo />}
          {m === "preclusion" && <PreclusionTimer />}
          {m === "inhibitoria" && <InhibitoriaDeclinatoria />}
          {m === "abandono" && <AbandonoProcedimiento />}
          {m === "comparecencia" && <ComparecenciaPanel />}
          {m === "build" && <SeleccionBuild onElegir={volverAlMenu} />}
        </div>
      </GameShell>
    );
  }

  // ─── Menú ─────────────────────────────────────────────────────────────────
  const activa = PESTAÑAS.find((p) => p.id === pestaña) ?? PESTAÑAS[0];

  return (
    <GameShell
      variant="focus"
      eyebrow={`Entrenar · ${TODOS.length} módulos`}
      title="Módulos de práctica"
      back={{ href: "/juego", label: "Mapa" }}
      scrollLabel="Módulos de entrenamiento"
      scrollKey={pestaña}
    >
      <div className="max-w-5xl w-full mx-auto pb-4">
        <div className="hud-fijo">
          <div className="segmentado" role="tablist" aria-label="Categorías de módulos">
            {PESTAÑAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={p.id === pestaña}
                aria-controls="panel-modulos"
                onClick={() => elegirPestaña(p.id)}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        <div id="panel-modulos" role="tabpanel" aria-labelledby={`tab-${activa.id}`} className="pt-3 grid md:grid-cols-2 gap-2">
          {activa.id === "arena" && (
            <Link
              href="/oral"
              onClick={() => sfx.click?.()}
              className="fila md:col-span-2"
              style={{ "--acento": "#FF85DC" } as CSSProperties}
            >
              <span className="fila-icono" aria-hidden="true">🎙️</span>
              <span className="fila-texto">
                <span className="fila-titulo">Modo Oral — Boss Rush</span>
                <span className="fila-sub">La comisión examinadora: pregunta, repregunta, trampa y derivación.</span>
                <span className="fila-meta">Interrogatorios con vida y reputación</span>
              </span>
              <span className="fila-chevron" aria-hidden="true">›</span>
            </Link>
          )}
          {activa.modulos.map((mod) => {
            const gate = isModuloUnlocked(mod.id, nivel, logrosIds) ? null : getModuloGate(mod.id);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => abrir(mod.id)}
                disabled={!!gate}
                className="fila disabled:cursor-not-allowed"
                style={{ "--acento": COLOR_ZONA[mod.zona] ?? "#4BE7FF" } as CSSProperties}
              >
                <span className="fila-icono" aria-hidden="true">{gate ? "🔒" : mod.icono}</span>
                <span className="fila-texto">
                  <span className="fila-titulo">{mod.titulo}</span>
                  <span className="fila-sub">{gate ? gate.hint ?? gate.label : mod.descripcion}</span>
                  <span className="fila-meta">{gate ? gate.label : mod.subtitulo}</span>
                </span>
                <span className="fila-chevron" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
