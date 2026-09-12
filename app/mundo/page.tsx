"use client";
import Link from "next/link";
import { getAllNpcs } from "@/data/npcs";
import { EVENTOS_MUNDO } from "@/data/eventos-mundo";
import ZonaCard from "@/components/ZonaCard";
import GameShell from "@/components/shell/GameShell";

// ============================================================================
// MUNDO HUB — v3 visual system
// ============================================================================

const ZONAS_METADATA: Record<string, { nombre: string; descripcion: string; href: string; emoji: string }> = {
  competencia: {
    nombre: "Cámara de Competencia",
    descripcion: "Jurisdicción y conflictos de competencia. Inhibitorias, declinatorias y cuestiones de tribunal competente.",
    href: "/mundo/competencia",
    emoji: "⚖️",
  },
  cautelares: {
    nombre: "Sala de Medidas Cautelares",
    descripcion: "Embargos, medidas conservativas y protección del patrimonio en peligro. Verosimilitud, periculum in mora, contracautela.",
    href: "/mundo/cautelares",
    emoji: "🔒",
  },
  notificaciones: {
    nombre: "Oficina de Notificaciones",
    descripcion: "Actos de comunicación procesal. Notificación personal, subsidiaria, publicación. El receptor es el guardián del debido proceso.",
    href: "/mundo/emplazamiento",
    emoji: "📬",
  },
  recursos: {
    nombre: "Corte de Recursos",
    descripcion: "Apelación, casación en la forma, casación en el fondo. Los recursos otorgan vida a sentencias que de otro modo serían definitivas.",
    href: "/mundo/recursos",
    emoji: "⚔️",
  },
  prueba: {
    nombre: "Tribunal de Prueba",
    descripcion: "Medios de prueba: documental, testimonial, confesión, presunción, pericial. La prueba es el alma del proceso.",
    href: "/mundo/prueba",
    emoji: "📜",
  },
  cosajuzgada: {
    nombre: "Cámara de Cosa Juzgada",
    descripcion: "Bilateralidad, preclusión, cosa juzgada. Los pilares que dan estabilidad jurídica al sistema. Donde terminan las pretensiones.",
    href: "/mundo/sentencia",
    emoji: "📚",
  },
  cosa_juzgada: {
    nombre: "Cámara de Cosa Juzgada",
    descripcion: "Preclusión, cosa juzgada formal y material, identidad de partes, objeto y causa. Una biblioteca que cierra puertas para que los pleitos terminen.",
    href: "/mundo/sentencia",
    emoji: "📚",
  },
  demanda: {
    nombre: "Sección de Demandas",
    descripcion: "Acción, pretensión, requisitos formales. El acto procesal que pone en movimiento toda la máquina judicial.",
    href: "/mundo/demanda",
    emoji: "📋",
  },
  ejecutivo: {
    nombre: "Juzgado Ejecutivo",
    descripcion: "Juicio ejecutivo. Título ejecutivo, gestión preparatoria, mandamiento, embargo, excepciones tasadas, apremio.",
    href: "/mundo/juicio_ejecutivo",
    emoji: "💼",
  },
  sumario: {
    nombre: "Autopista Sumaria",
    descripcion: "Procedencia, comparendo, prueba breve, sustitución de procedimiento y diferencias con el ordinario.",
    href: "/mision/m5_3",
    emoji: "🏁",
  },
  nulidad: {
    nombre: "Sala de Nulidad",
    descripcion: "Causales de nulidad procesal. Vicios que contaminan todo el expediente y lo condenan al desasimiento.",
    href: "/mundo/examen",
    emoji: "⚠️",
  },
};

export default function MundoHub() {
  const npcs = getAllNpcs();

  const zonasSet = new Set<string>();
  npcs.forEach((npc) => zonasSet.add(npc.zona));
  EVENTOS_MUNDO.forEach((evento) => zonasSet.add(evento.zona));
  zonasSet.add("sumario");
  const zonas = Array.from(zonasSet).sort();

  const STATS = [
    { val: npcs.length, label: "NPCs", color: "var(--zona-competencia)" },
    { val: EVENTOS_MUNDO.length, label: "Eventos", color: "var(--zona-prueba)" },
    { val: zonas.length, label: "Zonas", color: "var(--zona-recursos)" },
    { val: npcs.filter((n) => n.mision).length, label: "Misiones", color: "var(--zona-cautelares)" },
    { val: "∞", label: "Posibilidades", color: "var(--zona-nulidad)" },
  ];

  return (
    <GameShell variant="focus" eyebrow="Mundos" title="Zonas procesales" back={{ href: "/mundos", label: "Mundos" }} scrollLabel="Zonas del juego base">
      <div className="min-h-screen px-4 md:px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <Link href="/juego" className="btn mb-4 inline-block">◂ Volver al mapa principal</Link>
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-competencia mb-2">
          MUNDO JUDICIAL VIVO
        </div>
        <h1 className="font-display-grave text-4xl md:text-5xl text-doc-aged mb-3">
          Explorador de Zonas
        </h1>
        <p className="text-doc-aged/60 text-sm font-mono-terminal max-w-2xl">
          {npcs.length} personajes jurídicos habitan la Ciudad Judicial.{" "}
          {EVENTOS_MUNDO.length} sucesos dinámicos pueden ocurrir.
          Visita las zonas para encuentros, diálogos y misiones.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="terminal p-3 text-center">
            <div className="text-lg font-display-grave" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[9px] text-doc-aged/50 font-mono-terminal">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Zones grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonas.map((zonaId) => {
          const meta = ZONAS_METADATA[zonaId];
          if (!meta) return null;
          return (
            <ZonaCard
              key={zonaId}
              zonaId={zonaId}
              zonaNombre={meta.nombre}
              descripcion={meta.descripcion}
              href={meta.href}
              emoji={meta.emoji}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="terminal mt-10 p-4">
        <div className="font-mono-terminal text-[9px] text-doc-aged/40 space-y-1.5">
          <div>👥 = Personajes disponibles en la zona</div>
          <div>📌 = Eventos que pueden ocurrir aleatoriamente</div>
          <div>💬 = Diálogos con personajes afectan tu reputación, trauma y nivel económico</div>
          <div>⚡ = Los eventos pueden cambiar el clima jurídico y crear oportunidades o peligros</div>
        </div>
      </div>
    </div>
    </GameShell>
  );
}
