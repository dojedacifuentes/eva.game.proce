"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useGame } from "@/store/useGame";
import { isModuloUnlocked, getModuloGate, type UnlockGate } from "@/lib/unlock-gates";
import { CASOS_INVESTIGATIVOS } from "@/data/casos-investigativos";
import GameShell from "@/components/shell/GameShell";
import dynamic from "next/dynamic";

// ============================================================================
// Carga diferida de los módulos de entrenamiento.
//
// Antes los 21 módulos se importaban de forma estática: entrar a /expansion
// descargaba el código de TODOS aunque el jugador abriera uno solo, y era con
// diferencia la ruta más pesada del proyecto. Ahora cada módulo llega cuando se
// abre. `ssr: false` porque todos dependen de estado de cliente (audio,
// temporizadores, localStorage).
// ============================================================================
const Cargando = () => (
  <div className="py-16 text-center font-mono-terminal text-[11px] uppercase tracking-[.3em] text-doc-aged/35" aria-live="polite">
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
// HUB EXPANSIÓN — v6.0
// Reorganizado en 4 categorías con jerarquía visual clara.
// CAMPAÑA (primario) → COMBATE → HERRAMIENTAS → SISTEMA
// ============================================================================

type Modulo =
  | "menu"
  | "build"
  | "expediente"
  | "preclusion"
  | "inhibitoria"
  | "arcade"
  | "abandono"
  | "comparecencia"
  | "vof"
  | "sentencia"
  | "ejecutivo_full"
  | "grimorio"
  | "examen"
  | "cartas"
  | "timeline"
  | "duelo"
  | "ataque"
  | "investigacion"
  | "submundos"
  | "npcs"
  | "mundos"
  | "inventario";

interface ModuloMeta {
  id: Modulo;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  zona: string;
  icono: string;
}

// ─── CAMPAÑA PRINCIPAL (large hero cards) ──────────────────────────────────

const MODULOS_CAMPAÑA: ModuloMeta[] = [
  {
    id: "ejecutivo_full",
    titulo: "Campaña Ejecutiva",
    subtitulo: "10 ETAPAS · ÁRBOL DECISIONAL",
    descripcion: "Juicio ejecutivo completo: del título al remate. Verificación art. 434, mandamiento, embargo, excepciones del 464, fallo y tercerías. Mecánica de vida y reputación.",
    zona: "ejecutivo",
    icono: "💼",
  },
  {
    id: "examen",
    titulo: "Examen de Grado",
    subtitulo: "CÉDULA ORAL · ALTERNATIVAS",
    descripcion: "15+ cédulas con respuesta académica modelo. 12+ alternativas difíciles con distractores basados en errores reales. Análisis normativo completo.",
    zona: "nulidad",
    icono: "📋",
  },
  {
    id: "investigacion",
    titulo: "Casos Investigativos",
    subtitulo: "DEDUCCIÓN · PISTAS OCULTAS",
    descripcion: "Resuelve casos descubriendo pistas y deduciendo vicios procesales ocultos. Emplazamiento Fantasma · Ultra Petita · Preclusión Encubierta.",
    zona: "cosajuzgada",
    icono: "🔍",
  },
  {
    id: "npcs",
    titulo: "Mentoría Procesal",
    subtitulo: "10 MENTORES · 3 ETAPAS",
    descripcion: "Aprende de Dra. Noemí, Juez Silva, Receptor Castro y 7 mentores más. Cada uno con arco narrativo, actividades y desafío final.",
    zona: "recursos",
    icono: "🧑‍⚖️",
  },
];

// ─── COMBATE / ARCADE (medium cards) ───────────────────────────────────────

const MODULOS_COMBATE: ModuloMeta[] = [
  {
    id: "arcade",
    titulo: "Arcade Clasificador",
    subtitulo: "COMBO · VELOCIDAD · RANKING",
    descripcion: "Resoluciones · recursos · excepciones · competencia. Velocidad creciente. Combo multiplicador. Ranking S-A-B-C-D.",
    zona: "ejecutivo",
    icono: "🎮",
  },
  {
    id: "vof",
    titulo: "Verdadero o Falso",
    subtitulo: "PRESIÓN TEMPORAL · TRAMPAS",
    descripcion: "70+ enunciados tramposos. La respuesta intuitiva suele ser incorrecta. Glitch visual al fallar.",
    zona: "oralidad",
    icono: "❓",
  },
  {
    id: "duelo",
    titulo: "Duelo de Medios",
    subtitulo: "COMBATE · 3 RONDAS",
    descripcion: "5 medios de prueba se enfrentan. Documental, testimonial, confesión, presunción, pericial. 3 rondas de combate.",
    zona: "prueba",
    icono: "⚔️",
  },
  {
    id: "ataque",
    titulo: "Repreguntas",
    subtitulo: "8 PREGUNTAS · 30 SEG",
    descripcion: "Ocho preguntas de procedimiento con 30 segundos cada una. Presión máxima. Velocidad + precisión doctrinaria.",
    zona: "oralidad",
    icono: "⚡",
  },
];

// ─── HERRAMIENTAS PROCESALES (compact cards) ────────────────────────────────

const MODULOS_HERRAMIENTAS: ModuloMeta[] = [
  {
    id: "inhibitoria",
    titulo: "Inhibitoria / Declinatoria",
    subtitulo: "ART. 101-112 CPC",
    descripcion: "Cuestiones de competencia. Identifica el medio y el tribunal correcto.",
    zona: "competencia",
    icono: "🏛",
  },
  {
    id: "timeline",
    titulo: "Timeline Procesal",
    subtitulo: "DRAG & DROP · ORDEN LEGAL",
    descripcion: "Reconstruye el orden correcto de actos procesales. Art. 768 N°9.",
    zona: "ejecutivo",
    icono: "📅",
  },
  {
    id: "comparecencia",
    titulo: "Comparecencia",
    subtitulo: "LEY 18.120 · PATROCINIO",
    descripcion: "Los 7 requisitos del primer escrito. La secretaria no perdona.",
    zona: "incidentes",
    icono: "✍️",
  },
  {
    id: "preclusion",
    titulo: "Preclusión Real",
    subtitulo: "ART. 64 CPC · FATAL",
    descripcion: "Timer en tiempo real. Si vencés el plazo, la preclusión es irreversible.",
    zona: "ejecutivo",
    icono: "⏳",
  },
  {
    id: "abandono",
    titulo: "Abandono",
    subtitulo: "ART. 152 CPC · 6 MESES",
    descripcion: "Solo gestiones útiles interrumpen el plazo. Las administrativas no.",
    zona: "incidentes",
    icono: "🗂",
  },
  {
    id: "sentencia",
    titulo: "Sala de Sentencia",
    subtitulo: "HORROR JUDICIAL",
    descripcion: "El estrado holográfico observa. Veredicto aleatorio con efectos.",
    zona: "cosajuzgada",
    icono: "⚖️",
  },
  {
    id: "expediente",
    titulo: "Expediente Vivo",
    subtitulo: "SALUD PROCESAL",
    descripcion: "El expediente se degrada con cada vicio. Art. 768 N°9.",
    zona: "nulidad",
    icono: "📁",
  },
];

// ─── SISTEMA / META-GAME (pill buttons) ─────────────────────────────────────

const MODULOS_SISTEMA: ModuloMeta[] = [
  {
    id: "inventario",
    titulo: "Reliquias Procesales",
    subtitulo: "INVENTARIO · PASIVOS",
    descripcion: "Compra y equipa artefactos jurídicos que otorgan bonificaciones pasivas.",
    zona: "prueba",
    icono: "⚗️",
  },
  {
    id: "submundos",
    titulo: "Submundos Ocultos",
    subtitulo: "SECRETOS · DESBLOQUEABLES",
    descripcion: "Historias de vicios procesales que nunca se escriben.",
    zona: "nulidad",
    icono: "🌑",
  },
  {
    id: "mundos",
    titulo: "Mundos Visuales",
    subtitulo: "5 IDENTIDADES",
    descripcion: "Transforma la estética completa del juego.",
    zona: "competencia",
    icono: "🌍",
  },
  {
    id: "grimorio",
    titulo: "Grimorio de Skills",
    subtitulo: "11 HABILIDADES",
    descripcion: "Desbloquea habilidades procesales especiales.",
    zona: "recursos",
    icono: "📖",
  },
  {
    id: "cartas",
    titulo: "Sistema de Cartas",
    subtitulo: "20 CARTAS JURÍDICAS",
    descripcion: "Excepciones, recursos y medidas como cartas tácticas.",
    zona: "nulidad",
    icono: "🃏",
  },
  {
    id: "build",
    titulo: "Especialización",
    subtitulo: "6 CLASES RPG",
    descripcion: "Litigante · Casacional · Formalista · Estratega · Práctico · Doctrinario.",
    zona: "recursos",
    icono: "🎯",
  },
];

// ─── COMPONENTES UI ──────────────────────────────────────────────────────────

function SectionLabel({ children, tag }: { children: React.ReactNode; tag?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-doc-aged/40">
        {children}
      </div>
      {tag && (
        <div className="h-px flex-1 bg-doc-aged/10" />
      )}
    </div>
  );
}

interface CampañaCardProps {
  mod: ModuloMeta;
  completada?: boolean;
  gate?: UnlockGate | null;
  onClick: () => void;
}

function CampañaCard({ mod, completada, gate, onClick }: CampañaCardProps) {
  const locked = !!gate;
  return (
    <button
      onClick={locked ? undefined : onClick}
      onMouseEnter={() => !locked && sfx.hover()}
      disabled={locked}
      className={`zona-card p-6 text-left relative group transition-all duration-200 ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ "--zona-color": `var(--zona-${mod.zona})` } as React.CSSProperties}
    >
      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-bg-deep/70 backdrop-blur-[1px]">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-mono-terminal text-[9px] text-doc-aged/70 uppercase tracking-widest text-center px-4">
            {gate.label}
          </div>
          {gate.hint && (
            <div className="font-mono-terminal text-[7px] text-doc-aged/40 mt-1 text-center px-4 italic">
              {gate.hint}
            </div>
          )}
        </div>
      )}
      {completada && !locked && (
        <div className="absolute top-3 right-3 text-[8px] font-mono-terminal text-zona-cautelares border border-zona-cautelares/40 px-2 py-0.5">
          ✓ VISITADO
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <span className={`text-4xl ${locked ? "grayscale" : ""}`}>{mod.icono}</span>
        <div>
          <div
            className="text-[9px] font-mono-terminal uppercase tracking-widest mb-1 opacity-70"
            style={{ color: `var(--zona-${mod.zona})` }}
          >
            {mod.subtitulo}
          </div>
          <h3 className="font-display-grave text-xl text-doc-aged leading-tight">
            {mod.titulo}
          </h3>
        </div>
      </div>
      <p className="text-doc-aged/55 text-xs leading-relaxed font-mono-terminal">
        {mod.descripcion}
      </p>
      {!locked && (
        <div
          className="mt-4 text-[9px] font-mono-terminal uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: `var(--zona-${mod.zona})` }}
        >
          ENTRAR →
        </div>
      )}
    </button>
  );
}

interface CombateCardProps {
  mod: ModuloMeta;
  gate?: UnlockGate | null;
  onClick: () => void;
}

function CombateCard({ mod, gate, onClick }: CombateCardProps) {
  const locked = !!gate;
  return (
    <button
      onClick={locked ? undefined : onClick}
      onMouseEnter={() => !locked && sfx.hover()}
      disabled={locked}
      className={`p-4 text-left border transition-all duration-150 relative ${locked ? "opacity-40 cursor-not-allowed" : "hover:brightness-110"}`}
      style={{
        borderColor: locked ? "rgba(75,75,100,.2)" : `var(--zona-${mod.zona})30`,
        background: locked ? "rgba(6,7,11,.6)" : `var(--zona-${mod.zona})08`,
      }}
      title={locked ? gate.label : undefined}
    >
      {locked && (
        <div className="absolute top-2 right-2 text-sm">🔒</div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-2xl ${locked ? "grayscale" : ""}`}>{mod.icono}</span>
        <div>
          <div className="font-display-grave text-sm text-doc-aged">{mod.titulo}</div>
          <div
            className="text-[8px] font-mono-terminal uppercase tracking-widest"
            style={{ color: locked ? "rgba(100,100,120,.6)" : `var(--zona-${mod.zona})` }}
          >
            {locked ? gate.label : mod.subtitulo}
          </div>
        </div>
      </div>
      <p className="text-doc-aged/45 text-[10px] font-mono-terminal leading-relaxed">
        {locked ? (gate.hint ?? "Bloqueado") : mod.descripcion}
      </p>
    </button>
  );
}

interface HerramientaCardProps {
  mod: ModuloMeta;
  onClick: () => void;
}

function HerramientaCard({ mod, onClick }: HerramientaCardProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => sfx.hover()}
      className="flex items-center gap-3 p-3 border border-doc-aged/10 text-left hover:border-doc-aged/25 transition-colors group"
    >
      <span className="text-xl shrink-0">{mod.icono}</span>
      <div className="min-w-0">
        <div className="font-display-grave text-xs text-doc-aged truncate">{mod.titulo}</div>
        <div
          className="text-[8px] font-mono-terminal truncate"
          style={{ color: `var(--zona-${mod.zona})` }}
        >
          {mod.subtitulo}
        </div>
      </div>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function ExpansionHub() {
  const [m, setM] = useState<Modulo>("menu");
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const { nivel, logros } = useGame();
  const logrosIds = logros.map((l) => l.id);

  // Deep-link desde mapa: /expansion?m=arcade abre directo ese módulo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("m") as Modulo | null;
    if (param && param !== "menu") {
      setM(param);
      const url = new URL(window.location.href);
      url.searchParams.delete("m");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // ─── Módulo Investigación con selector de casos ───────────────────────────
  if (m === "investigacion") {
    if (!casoSeleccionado) {
      return (
        <GameShell variant="focus" eyebrow="Entrenar" title="Módulos de práctica" back={{ href: "/juego", label: "Hub" }} scrollLabel="Módulos de entrenamiento">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">
          <div className="flex justify-between mb-6 flex-wrap gap-2">
            <button className="btn text-xs" onClick={() => { sfx.click(); setM("menu"); }}>◂ Volver</button>
            <Link href="/juego" className="btn text-xs">◂ Ciudad Judicial</Link>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-[9px] font-mono-terminal text-doc-aged/40 uppercase tracking-widest mb-2">
                INVESTIGACIÓN PROCESAL
              </div>
              <h2 className="font-display-grave text-3xl text-doc-aged mb-2">
                Selecciona un Caso
              </h2>
              <p className="text-doc-aged/60 font-serif-juridica text-sm">
                Descubre pistas. Conecta evidencia. Deduce el vicio procesal antes de que la prescripción actúe.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {CASOS_INVESTIGATIVOS.map((caso) => (
                <button
                  key={caso.id}
                  onClick={() => { sfx.confirm(); setCasoSeleccionado(caso.id); }}
                  onMouseEnter={() => sfx.hover()}
                  className="zona-card p-6 text-left"
                  style={{ "--zona-color": `var(--zona-${caso.zona})` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display-grave text-lg text-doc-aged leading-tight">{caso.titulo}</h3>
                    <div className="font-mono-terminal text-[9px] shrink-0 ml-3" style={{ color: `var(--zona-${caso.zona})` }}>
                      {"⭐".repeat(caso.dificultad)}
                    </div>
                  </div>
                  <p className="font-serif-juridica text-doc-aged/60 text-sm leading-relaxed">
                    {caso.descripcion}
                  </p>
                  <div
                    className="mt-3 text-[8px] font-mono-terminal uppercase tracking-widest"
                    style={{ color: `var(--zona-${caso.zona})` }}
                  >
                    {caso.pistas.length} PISTAS · ART. {caso.solucion.articuloClave}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
    </GameShell>
      );
    }

    const casoActual = CASOS_INVESTIGATIVOS.find((c) => c.id === casoSeleccionado);
    if (!casoActual) return null;

    return (
      <GameShell variant="focus" eyebrow="Entrenar" title="Módulos de práctica" back={{ href: "/juego", label: "Hub" }} scrollLabel="Módulos de entrenamiento">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="flex justify-between mb-6 flex-wrap gap-2">
          <button className="btn text-xs" onClick={() => { sfx.click(); setCasoSeleccionado(null); }}>◂ Casos</button>
          <Link href="/juego" className="btn text-xs">◂ Ciudad Judicial</Link>
        </div>
        <CasoInvestigativo
          caso={casoActual}
          onVolver={() => setCasoSeleccionado(null)}
          onResuelto={() => {
            // Recompensas ya aplicadas dentro de CasoInvestigativo.handleVerificar
          }}
        />
      </div>
    </GameShell>
    );
  }

  // ─── Módulo específico activo ─────────────────────────────────────────────
  if (m !== "menu") {
    return (
      <GameShell variant="focus" eyebrow="Entrenar" title="Módulos de práctica" back={{ href: "/juego", label: "Hub" }} scrollLabel="Módulos de entrenamiento">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="flex justify-between mb-6 flex-wrap gap-2">
          <button className="btn text-xs" onClick={() => { sfx.click(); setM("menu"); }}>◂ Volver</button>
          <Link href="/juego" className="btn text-xs">◂ Ciudad Judicial</Link>
        </div>
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
        {m === "mundos" && <WorldSelector onClose={() => setM("menu")} />}
        {m === "vof" && <SpeedrunVoF />}
        {m === "sentencia" && <SalaSentencia />}
        {m === "expediente" && <ExpedienteVivo />}
        {m === "preclusion" && <PreclusionTimer />}
        {m === "inhibitoria" && <InhibitoriaDeclinatoria />}
        {m === "abandono" && <AbandonoProcedimiento />}
        {m === "comparecencia" && <ComparecenciaPanel />}
        {m === "build" && <SeleccionBuild onElegir={() => setM("menu")} />}
      </div>
    </GameShell>
    );
  }

  // ─── MENÚ PRINCIPAL ───────────────────────────────────────────────────────
  const openMod = (id: Modulo) => {
    if (!isModuloUnlocked(id, nivel, logrosIds)) return; // gated
    sfx.confirm();
    setM(id);
  };

  return (
    <GameShell variant="focus" eyebrow="Entrenar" title="Módulos de práctica" back={{ href: "/juego", label: "Hub" }} scrollLabel="Módulos de entrenamiento">
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <Link href="/juego" className="btn text-xs">◂ Ciudad Judicial</Link>
        <div className="flex items-center gap-4 text-[9px] font-mono-terminal text-doc-aged/40">
          <span>HUB EXPANSIÓN</span>
          <span className="text-zona-competencia">{MODULOS_CAMPAÑA.length + MODULOS_COMBATE.length + MODULOS_HERRAMIENTAS.length + MODULOS_SISTEMA.length} MÓDULOS</span>
        </div>
      </header>

      {/* ─── CAMPAÑA PRINCIPAL ─── */}
      <section className="mb-10">
        <SectionLabel tag="divider">CAMPAÑA PRINCIPAL</SectionLabel>
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {MODULOS_CAMPAÑA.map((mod) => (
            <CampañaCard
              key={mod.id}
              mod={mod}
              gate={isModuloUnlocked(mod.id, nivel, logrosIds) ? null : getModuloGate(mod.id)}
              onClick={() => openMod(mod.id)}
            />
          ))}
        </motion.div>
      </section>

      {/* ─── BOSS RUSH ─── */}
      <section className="mb-10">
        <SectionLabel tag="divider">BOSS RUSH</SectionLabel>
        <Link
          href="/oral"
          onMouseEnter={() => sfx.hover()}
          className="block border transition-all duration-200 hover:brightness-110 p-5"
          style={{
            borderColor: "var(--zona-oralidad)40",
            background: "var(--zona-oralidad)06",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚔️</span>
            <div className="flex-1">
              <div className="font-display-grave text-xl text-doc-aged mb-1">Modo Oral — Boss Rush</div>
              <div className="text-[9px] font-mono-terminal text-zona-oralidad uppercase tracking-widest mb-2">
                9 INSTANCIAS · COMISIÓN EXAMINADORA · CADENAS DE DERIVACIÓN
              </div>
              <p className="text-doc-aged/50 text-xs font-mono-terminal leading-relaxed">
                Anfiteatro judicial. Ataques: directo · puente · trampa · repregunta. Cada boss es un arquetipo de examinador. Vida y reputación en juego.
              </p>
            </div>
            <div className="shrink-0 text-[9px] font-mono-terminal text-zona-oralidad border border-zona-oralidad/40 px-3 py-2 hover:border-zona-oralidad transition-colors">
              ENTRAR →
            </div>
          </div>
        </Link>
      </section>

      {/* ─── ARENA DE COMBATE ─── */}
      <section className="mb-10">
        <SectionLabel tag="divider">ARENA DE COMBATE</SectionLabel>
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {MODULOS_COMBATE.map((mod) => (
            <CombateCard
              key={mod.id}
              mod={mod}
              gate={isModuloUnlocked(mod.id, nivel, logrosIds) ? null : getModuloGate(mod.id)}
              onClick={() => openMod(mod.id)}
            />
          ))}
        </motion.div>
      </section>

      {/* ─── HERRAMIENTAS PROCESALES ─── */}
      <section className="mb-10">
        <SectionLabel tag="divider">HERRAMIENTAS PROCESALES</SectionLabel>
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {MODULOS_HERRAMIENTAS.map((mod) => (
            <HerramientaCard
              key={mod.id}
              mod={mod}
              onClick={() => openMod(mod.id)}
            />
          ))}
        </motion.div>
      </section>

      {/* ─── SISTEMA ─── */}
      <section className="mb-6 pb-16">
        <SectionLabel tag="divider">SISTEMA</SectionLabel>
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {MODULOS_SISTEMA.map((mod) => (
            <button
              key={mod.id}
              onClick={() => openMod(mod.id)}
              onMouseEnter={() => sfx.hover()}
              className="flex items-center gap-2 px-4 py-2 border border-doc-aged/15 hover:border-doc-aged/35 text-left transition-colors group"
            >
              <span className="text-base">{mod.icono}</span>
              <div>
                <div className="font-display-grave text-xs text-doc-aged">{mod.titulo}</div>
                <div
                  className="text-[7px] font-mono-terminal uppercase tracking-wider"
                  style={{ color: `var(--zona-${mod.zona})` }}
                >
                  {mod.subtitulo}
                </div>
              </div>
            </button>
          ))}
        </motion.div>
      </section>

    </div>
    </GameShell>
  );
}
