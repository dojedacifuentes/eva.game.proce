"use client";
import { useEffect, useRef } from "react";
import ShellHeader, { type Volver } from "./ShellHeader";
import ShellNav from "./ShellNav";

export type VarianteShell = "app" | "focus" | "reader";

/**
 * GAME SHELL — armazón reutilizable de toda la aplicación.
 *
 * En TODOS los tamaños (v4) mide exactamente la ventana: cabecera arriba, una
 * región de contenido y la navegación abajo como fila propia. El documento no
 * se desplaza nunca. En el teléfono esto es lo que garantiza que la barra
 * inferior no tape nada y que el gesto de desplazar funcione sobre el contenido.
 *
 *  · "app"    Hub y pantallas de una sola vista. El hijo reparte el alto con
 *             grid/flex; si en una ventana muy baja no cabe, se desplaza.
 *  · "focus"  Actividades. El contenido va en una región desplazable accesible;
 *             las acciones que hacen avanzar usan `.barra-accion`, pegada al
 *             borde inferior de esa región.
 *  · "reader" Codex y lecturas largas. Igual que "focus".
 */
export default function GameShell({
  variant = "app",
  eyebrow,
  title,
  back,
  headerCompacto,
  headerExtra,
  nav = true,
  header = true,
  children,
  /** Etiqueta de la región desplazable en las variantes "focus" y "reader". */
  scrollLabel = "Contenido de la pantalla",
  /** Al cambiar, la región desplazable vuelve arriba (cambio de fase o módulo). */
  scrollKey,
}: {
  variant?: VarianteShell;
  eyebrow?: string;
  title?: string;
  back?: Volver;
  headerCompacto?: boolean;
  headerExtra?: React.ReactNode;
  nav?: boolean;
  /** La portada trae su propio titular a pantalla completa. */
  header?: boolean;
  children: React.ReactNode;
  scrollLabel?: string;
  scrollKey?: string | number;
}) {
  const region = useRef<HTMLDivElement>(null);

  // El bloqueo se aplica al documento mientras esta pantalla esté montada.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.add("shell-lock");
    return () => raiz.classList.remove("shell-lock");
  }, []);

  useEffect(() => {
    if (scrollKey === undefined) return;
    region.current?.scrollTo({ top: 0 });
  }, [scrollKey]);

  const conRegion = variant !== "app";

  return (
    <div className="shell" data-lock="true" data-variant={variant}>
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido
      </a>

      {header ? (
        <ShellHeader
          eyebrow={eyebrow}
          title={title}
          back={back}
          compacto={headerCompacto}
          extra={headerExtra}
        />
      ) : (
        <div />
      )}

      <main id="contenido-principal" className="shell-main">
        {conRegion ? (
          <div ref={region} className="shell-scroll flex-1" tabIndex={0} role="region" aria-label={scrollLabel}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {nav ? <ShellNav /> : <div />}
    </div>
  );
}
