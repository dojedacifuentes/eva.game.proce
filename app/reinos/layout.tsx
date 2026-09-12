import type { Metadata } from "next";
import "./reinos.css";
import GameShell from "@/components/shell/GameShell";

// ============================================================================
// REINOS DEL DERECHO — Layout del DLC
// Aporta SOLO el wrapper temático y el CSS aislado. Hereda <html>/<body>,
// fuentes, .crt y el armazón del layout raíz: misma carcasa, sin duplicar nada.
// ============================================================================

export const metadata: Metadata = {
  title: "Reinos del Derecho — Expansión · FORO [in]VISIBLE",
  description:
    "Expansión DLC: un overworld jurídico de 7 regiones. Civil, administrativo y competencia convertidos en desafíos. Examen de grado como mundo desbloqueable.",
};

export default function ReinosLayout({ children }: { children: React.ReactNode }) {
  // El `pt-12 md:pt-0` que compensaba el HUD fijo del juego base ya no hace
  // falta: el HUD no dibuja paneles fijos y la cabecera vive en el grid.
  return (
    <GameShell variant="focus" eyebrow="Expansión" title="Reinos del Derecho" back={{ href: "/mundos", label: "Mundos" }} scrollLabel="Contenido de Reinos del Derecho">
      <div className="reinos-scope reino-parchment">{children}</div>
    </GameShell>
  );
}
