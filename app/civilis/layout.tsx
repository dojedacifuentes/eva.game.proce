import "./civilis.css";
import GameShell from "@/components/shell/GameShell";

// ============================================================================
// CIVILIS — layout de la expansión. Todo el árbol vive bajo .civilis-scope
// para que los estilos JRPG no se filtren al resto del juego.
//
// El `pt-12 md:pt-0` que había aquí compensaba el HUD fijo del juego base, que
// tapaba las cabeceras en móvil. Ya no hace falta: el HUD dejó de dibujar
// paneles fijos y la cabecera del shell ocupa su propia fila del grid.
// ============================================================================

export default function CivilisLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell variant="focus" eyebrow="Expansión" title="Civilis" back={{ href: "/mundos", label: "Mundos" }} scrollLabel="Contenido de Civilis">
      <div className="civilis-scope civ-bg">{children}</div>
    </GameShell>
  );
}
