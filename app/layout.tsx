import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GlobalCanvas from "@/components/GlobalCanvas";
import WorldThemeProvider from "@/components/WorldThemeProvider";
import { JUEGO, PROYECTO, AUTOR } from "@/lib/brand";

// ============================================================================
// Fuentes vía next/font: se descargan en la compilación y se sirven desde el
// propio dominio.
//
// Antes eran un <link> a fonts.googleapis.com en el <head>. Una hoja de estilo
// externa BLOQUEA el primer render: si Google tarda o el usuario está tras una
// red que lo filtra, la pantalla se queda en negro hasta que responda. Además
// enviaba una petición con la IP del usuario a un tercero en cada visita.
// `display: "swap"` completa el arreglo: el texto se ve con la tipografía de
// respaldo mientras llega la definitiva.
// ============================================================================

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--fuente-display",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--fuente-serif",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--fuente-mono",
});

export const metadata: Metadata = {
  title: `${JUEGO.nombre} — ${JUEGO.subtitulo}`,
  description: `${JUEGO.descripcion} ${PROYECTO.presenta}. ${AUTOR.credito}.`,
  applicationName: JUEGO.nombre,
  authors: [{ name: AUTOR.nombre }],
};

// `viewport-fit=cover` es lo que permite que env(safe-area-inset-*) tenga
// valores reales en teléfonos con gesto inferior o muesca.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06070B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body className="crt">
        {/* Pulso de fondo. Capa aparte para no aplicar `filter` al <body>, que
            rompería el `position: fixed` de la navegación y los diálogos. */}
        <div className="ui-breathe" aria-hidden="true" />
        {/* Aplica data-world al body para activar los 5 temas visuales */}
        <WorldThemeProvider />
        {/* GlobalCanvas incluye el HUD de realimentación y la intro */}
        <GlobalCanvas />
        {/* `relative` sin z-index: con `z-10` este contenedor creaba un contexto
            de apilado que ENCERRABA a los modales por debajo de las capas CRT
            (scanlines z-50 y ruido+viñeta z-51), que son hermanas suyas. El
            resultado era que todo modal quedaba bajo una viñeta negra al 60 %. */}
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
