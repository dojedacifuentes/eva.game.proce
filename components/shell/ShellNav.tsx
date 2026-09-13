"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";

/**
 * Navegación principal — CINCO destinos como máximo, todos con pantalla real
 * detrás (ninguno es un hueco por rellenar).
 *
 * Nota sobre el reparto: el encargo sugería «Inicio, Entrenar, Oral, Progreso y
 * Perfil». Aquí "Progreso" no tiene pantalla propia porque el progreso (nivel,
 * XP, logros, reliquias, casos) ya vive dentro de Perfil → /inventario. Ese
 * hueco lo ocupa "Mundos", que es donde el propio encargo pide llevar las tres
 * expansiones que antes colgaban encima del mapa.
 */
export const DESTINOS = [
  { href: "/juego", icon: "🗺", label: "Inicio", desc: "Hub de campaña" },
  { href: "/expansion", icon: "🎯", label: "Entrenar", desc: "Módulos de práctica" },
  { href: "/oral", icon: "⚔", label: "Oral", desc: "Interrogatorios y jefes" },
  { href: "/mundos", icon: "🌐", label: "Mundos", desc: "Mundos y expansiones" },
  { href: "/inventario", icon: "🎒", label: "Perfil", desc: "Expediente y progreso" },
] as const;

function esActivo(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/juego") return pathname === "/juego";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ShellNav() {
  const pathname = usePathname();

  return (
    <nav className="shell-nav" aria-label="Navegación principal">
      <ul className="max-w-3xl mx-auto px-1 flex items-stretch justify-around list-none m-0 p-0">
        {DESTINOS.map((d) => {
          const activo = esActivo(pathname, d.href);
          return (
            <li key={d.href} className="flex-1 flex">
              <Link
                href={d.href}
                // `tap`, no `click`: navegar acompaña, no celebra. El golpe
                // fuerte se reserva para las acciones con consecuencia.
                onClick={() => { sfx.tap?.(); haptica.toque(); }}
                onMouseEnter={() => sfx.hover?.()}
                aria-current={activo ? "page" : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-md active:scale-95 transition-all"
                style={{ color: activo ? "var(--zona-competencia)" : "rgba(232,223,197,0.78)", background: activo ? "rgba(75,231,255,0.09)" : "transparent" }}
              >
                <span
                  aria-hidden="true"
                  className="text-[22px] leading-none"
                  style={activo ? { filter: "drop-shadow(0 0 7px var(--zona-competencia))" } : undefined}
                >
                  {d.icon}
                </span>
                <span className="t-micro font-mono-terminal uppercase tracking-wider leading-none">
                  {d.label}
                </span>
                {/* El nombre accesible no se queda en el emoji. */}
                <span className="sr-only">{d.desc}</span>
                <span
                  aria-hidden="true"
                  className="h-0.5 rounded-full transition-all"
                  style={{
                    width: activo ? 24 : 0,
                    background: "var(--zona-competencia)",
                    boxShadow: activo ? "0 0 6px var(--zona-competencia)" : "none",
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
