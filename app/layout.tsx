import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GlobalCanvas from "@/components/GlobalCanvas";
import FondoCiudad from "@/components/FondoCiudad";
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

// Texto de lectura e interfaz. Antes todo el cuerpo iba en JetBrains Mono y en
// Cormorant cursiva a 13-14 px: en un teléfono era lo más difícil de leer del
// juego. Inter tiene altura de x grande y se lee bien a tamaños pequeños; la
// monoespaciada queda para etiquetas, artículos y cifras.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--fuente-sans",
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
      className={`${inter.variable} ${cinzel.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* Fondo: plano de la Ciudad Judicial visto desde arriba con un flujo de
            nodos encima. Es SVG estático renderizado en el servidor: se pinta en
            el primer fotograma y no consume ni un ciclo de CPU al jugar. Sustituye
            al lienzo animado (lluvia, artículos girando, barrido) y a las capas
            CRT de mezcla a pantalla completa, que eran lo más caro en móvil. */}
        <FondoCiudad />
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
