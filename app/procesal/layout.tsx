import "./procesal.css";
import GameShell from "@/components/shell/GameShell";

// ============================================================================
// ARCHIVOS DEL TIEMPO PROCESAL — layout de la expansión. Todo el árbol vive
// bajo .procesal-scope para que los estilos de archivo judicial no se filtren
// al resto del juego.
//
// El `pt-12 md:pt-0` ya no es necesario: ver la nota del layout de Civilis.
// ============================================================================

export default function ProcesalLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell variant="focus" eyebrow="Expansión" title="Archivos del Tiempo Procesal" back={{ href: "/mundos", label: "Mundos" }} scrollLabel="Contenido de la expansión procesal">
      <div className="procesal-scope proc-bg">{children}</div>
    </GameShell>
  );
}
