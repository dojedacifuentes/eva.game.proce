"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";

/**
 * Navegación principal — cinco destinos, todos con pantalla real detrás.
 *
 * "Mapa" sustituye a "Inicio": el hub ES el mapa de la campaña, y el nombre
 * dice lo que el jugador encuentra al tocarlo.
 */
export const DESTINOS = [
  { href: "/juego", icon: "🗺", label: "Mapa", desc: "Mapa de la campaña" },
  { href: "/expansion", icon: "🎯", label: "Entrenar", desc: "Módulos de práctica" },
  { href: "/oral", icon: "⚔", label: "Oral", desc: "Interrogatorios y jefes" },
  { href: "/mundos", icon: "🌐", label: "Mundos", desc: "Mundos y expansiones" },
  { href: "/inventario", icon: "🎒", label: "Perfil", desc: "Expediente y progreso" },
] as const;

function esActivo(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/juego") return pathname === "/juego" || pathname.startsWith("/mision") || pathname.startsWith("/boss");
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ShellNav() {
  const pathname = usePathname();

  return (
    <nav className="shell-nav" aria-label="Navegación principal">
      <ul className="nav-lista m-0">
        {DESTINOS.map((d) => {
          const activo = esActivo(pathname, d.href);
          return (
            <li key={d.href} className="flex-1 flex">
              <Link
                href={d.href}
                // `tap`, no `click`: navegar acompaña, no celebra. El golpe
                // fuerte se reserva para las acciones con consecuencia.
                onClick={() => { sfx.tap?.(); haptica.toque(); }}
                aria-current={activo ? "page" : undefined}
                className="nav-enlace"
              >
                <span aria-hidden="true" className="icono">{d.icon}</span>
                <span>{d.label}</span>
                {/* El nombre accesible no se queda en el emoji. */}
                <span className="sr-only">: {d.desc}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
