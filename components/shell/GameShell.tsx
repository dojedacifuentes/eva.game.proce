"use client";
import { useEffect } from "react";
import ShellHeader from "./ShellHeader";
import ShellNav from "./ShellNav";

export type VarianteShell = "app" | "focus" | "reader";

/**
 * GAME SHELL — armazón reutilizable de toda la aplicación.
 *
 * Tres variantes, según lo que la pantalla necesite:
 *
 *  · "app"    Hub y pantallas de una sola vista. En escritorio el documento NO
 *             se desplaza; el hijo reparte el alto con grid/flex y gestiona sus
 *             propias zonas desplazables.
 *  · "focus"  Actividades e interacciones breves. Igual de contenida, pero el
 *             contenido va dentro de una región con scroll interno accesible,
 *             así nada queda fuera de alcance aunque crezca.
 *  · "reader" Codex, biblioteca y explicaciones jurídicas largas. El documento
 *             se desplaza con normalidad: la lectura cómoda manda sobre la
 *             regla de una pantalla.
 *
 * El bloqueo del scroll del documento no oculta nada: sólo se activa en ventanas
 * de 1024×620 para arriba (ver app/globals.css) y en móvil, ventanas bajas o con
 * el texto ampliado se suelta solo.
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
  /** Etiqueta de la región desplazable en la variante "focus". */
  scrollLabel = "Contenido de la pantalla",
}: {
  variant?: VarianteShell;
  eyebrow?: string;
  title?: string;
  back?: { href: string; label: string };
  headerCompacto?: boolean;
  headerExtra?: React.ReactNode;
  nav?: boolean;
  /** La portada trae su propio titular a pantalla completa. */
  header?: boolean;
  children: React.ReactNode;
  scrollLabel?: string;
}) {
  const bloquea = variant === "app" || variant === "focus";

  // El bloqueo se aplica al documento mientras esta pantalla esté montada, y se
  // retira al salir. Las consultas de medios de globals.css deciden si de verdad
  // llega a surtir efecto en el tamaño actual.
  useEffect(() => {
    if (!bloquea) return;
    const raiz = document.documentElement;
    raiz.classList.add("shell-lock");
    return () => raiz.classList.remove("shell-lock");
  }, [bloquea]);

  return (
    <div className="shell" data-lock={bloquea ? "true" : "false"} data-variant={variant}>
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

      {variant === "focus" ? (
        <main id="contenido-principal" className="shell-main">
          <div className="shell-scroll flex-1" tabIndex={0} role="region" aria-label={scrollLabel}>
            {children}
          </div>
        </main>
      ) : (
        <main id="contenido-principal" className="shell-main">
          {children}
        </main>
      )}

      {nav ? (
        <>
          <div className="shell-navspace" aria-hidden="true" />
          <ShellNav />
        </>
      ) : (
        <div />
      )}
    </div>
  );
}
