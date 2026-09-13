# Entrega — móvil, mapa de flujo y superficies sólidas

Rama: `claude/movil-mapa-flujo` · Fecha: 2026-09-12

El encargo, en palabras del autor: mejorar la jugabilidad **sobre todo en el
celular**; hay que navegar mucho hacia abajo; los tamaños de letra se leen mal;
más fluidez; reorganizar; un **mapa de fondo visto desde arriba con aspecto de
diagrama de flujo, como n8n**; y **quitar las tarjetas translúcidas**.

---

## 1. Lo que se encontró antes de tocar nada

Medido en producción (`evagameproce.vercel.app`) con un teléfono emulado de
375×812:

| Hallazgo | Consecuencia |
|---|---|
| El armazón sólo fijaba el alto de la ventana desde **1024×620**. En el teléfono el documento se desplazaba y la barra inferior era `position: fixed`. | Todo lo que no cabía quedaba "más abajo", detrás de la barra. |
| En la creación, el botón **«Comenzar» caía en el píxel 949**, con la barra empezando en el 746 y la ventana acabando en el 812. | Para empezar a jugar había que descubrir que se podía desplazar. |
| La región de contenido tenía `overscroll-behavior: contain` **sin desbordar**: arrastrar el dedo sobre ella no desplazaba la página (`scrollY` seguía en 0). | El gesto natural no funcionaba; sólo desplazaba tocando la cabecera o la barra. |
| Fondo: un `<canvas>` a pantalla completa redibujando lluvia, 20 artículos girando y un barrido **en cada fotograma**, más dos capas CRT fijas con `mix-blend-mode`. | Coste de CPU/GPU permanente en el teléfono y menos contraste bajo el texto. |
| Paneles con alfa `.975`/`.992` y tarjetas tintadas con `${color}08`. | La "tarjeta translúcida": el fondo animado asomaba a través. |
| Cuerpo de texto en JetBrains Mono y Cormorant cursiva a 13-14 px; etiquetas con espaciado de `.3em`–`.5em`. | Lo más difícil de leer en pantalla pequeña. |
| Los jefes de campaña tenían **una sola pregunta** y la repetían hasta vaciar la vida (3-7 veces). | Combate trivial y repetitivo. Existía un interrogatorio de 5 fases por jefe **sin usar**. |

---

## 2. Qué cambió

### Armazón de aplicación en todos los tamaños

`components/shell/GameShell.tsx` + sección `GAME SHELL` de `app/globals.css`.

- `.shell` mide `100dvh` siempre. Cabecera, **una** región de contenido y la
  navegación como fila del grid. El documento no se desplaza nunca.
- `.barra-accion`: la acción que hace avanzar, pegada al borde inferior de la
  región desplazable. Misión, jefe, oral, examen.
- `.hud-fijo`: fase, vidas o pestañas, pegadas arriba.
- Cabecera de 56 px: volver (ruta o acción de la propia pantalla), título en
  sans legible, ficha Nv/monedas que abre el perfil, sonido.

### Mapa de flujo cenital

`components/MapaFlujo.tsx` sustituye a `GameWorldMap` + `MapCity`.

- Cada misión y cada jefe es un **nodo** con puerto de entrada y salida. Los
  **cables** son verdes cuando el nodo ya se ejecutó; sólo el que entra al nodo
  actual está animado; el resto, gris.
- Cada acto es un **distrito** de manzanas visto desde arriba.
- El trazado se calcula con el ancho real: **1 acto por fila** en el teléfono,
  **2** en tableta, **3** en escritorio. A 1366×768 cabe la campaña entera.
- Los nodos son botones HTML (foco, nombre accesible, 48-64 px); el SVG sólo
  dibuja distritos y cables. Al abrir, la vista se centra en «AQUÍ».
- Tocar un nodo abre una **hoja sólida** con descripción, dificultad,
  recompensa y «Jugar». Hay vista de **lista** alternativa.

### Fondo

`components/FondoCiudad.tsx`: plano cenital (manzanas, parques, río, avenidas,
Palacio de Tribunales, Plaza de la Justicia) con un flujo de nodos encima. SVG
**estático, renderizado en el servidor**: se pinta en el primer fotograma y no
ejecuta nada en el teléfono. Sólo en equipos con ratón se anima un cable.

### Legibilidad y superficies

- **Inter** (vía `next/font`) para lectura e interfaz. La monoespaciada queda
  para etiquetas en mayúsculas, artículos y cifras.
- Cinzel y Cormorant pasan a sans en tamaños pequeños; los espaciados de
  `.3em`–`.5em` bajan a `.1em`.
- Escala: cuerpo 16-17 px, mínimo 13 px.
- `--sup-1`, `--sup-2`, `--sup-alta` **opacos del todo**. Botones de identidad
  con la variante de texto legible.

### Jugabilidad

| Pantalla | Antes | Ahora |
|---|---|---|
| Creación | Nombre → Partida rápida → confirmar (botón fuera de pantalla) | Nombre → **Partida rápida: se juega ya**. Con partida guardada, confirma el reemplazo |
| Hub | EVA, jefe, expansiones, misión y progreso apilados; el mapa se cambiaba por una lista | Mapa de flujo a pantalla + barra «Próximo paso» con **▶ Jugar** |
| Misión | 4 fases, titular de 48 px, columna lateral bajo todo | **Caso → Desafío → Resultado**, opciones barajadas, acción fija |
| Jefe de campaña | 1 pregunta repetida | **Interrogatorio de 5 fases** existente: pregunta, repregunta, trampa, caso, remate. Se vence con 4 de 5; la norma se revela tras responder |
| Oral | Retrato de 130 px, área normativa visible antes de responder | HUD compacto, opciones grandes, norma después, «Siguiente» fijo |
| Entrenar | 4 secciones de tarjetas (21 módulos) + botones de volver duplicados | **4 pestañas** de filas; el módulo va en la URL (`?m=`) y el «atrás» del teléfono vuelve al menú |
| Perfil | 8 paneles apilados | Ficha fija + pestañas Resumen · Logros · Bitácora · Respaldo |
| Civilis / Procesal | Mapa 16:10 con etiquetas montadas en el teléfono | Mapa 3:4 en pantallas estrechas, etiquetas en sans sólida |

**No se modificó ni una palabra del contenido jurídico.** El combate de jefe usa
preguntas que ya estaban en `data/combat/interrogations.ts`; las de respaldo
son las originales de cada jefe.

---

## 3. Verificación

Build de producción servido en `127.0.0.1:3100`, Chrome del sistema (Windows),
perfil limpio y partida de prueba.

| Comprobación | Resultado |
|---|---|
| `npm run lint` · `npm run typecheck` | Limpios |
| `npm test` | 37 / 37 |
| `npm run build` | 46 / 46 páginas |
| `avanzar.js` (20 pantallas × 390×844 y 360×800) | **0 bloqueos**, con 0 px de scroll de documento y barra de acción visible |
| `medir.js` (7 rutas × 5 tamaños) | **0 px de scroll de documento en los 5 tamaños, móvil incluido** · 0 desborde horizontal |
| `overlays.js` (8 modales con su gesto real) | 0 hallazgos |
| `contraste2.js` (10 rutas) | 415 textos sobre píxel real · 0 bajo 12 px · 0 bajo AA |
| `a11y.js` (11 rutas) | 0 hallazgos |
| `flujos.js` | **31 / 31**, incluidos: partida rápida en un toque, 27 nodos en el mapa, nodo que abre su detalle, acción a la vista en móvil |
| `jugar.js` (9 actividades, interactuando) | 0 bloqueos |

### Lo que NO se verificó

- **Teléfonos físicos.** Tamaños emulados en Chrome; ni Safari iOS ni Firefox.
- **Jugadores reales.** Nadie ajeno al proyecto ha jugado esta versión.
- **Audio**: no se tocó y sigue sin escucharse en este entorno.
- Los **módulos heredados** de Entrenar (Juicio ejecutivo, Arcade, Timeline…)
  conservan su maquetación propia; heredan tipografía, superficies y armazón,
  pero no se rediseñaron uno a uno.

---

## 4. Pendiente

1. Rediseñar por dentro los módulos heredados de Entrenar con `.opcion`,
   `.barra-accion` y `.hud-fijo`.
2. Mapa de Reinos del Derecho en el teléfono: revisar con un perfil de jurista
   creado (la partida de prueba abre el asistente de avatar).
3. Civilis: aún se tocan dos o tres etiquetas en la esquina inferior izquierda
   del mapa a 390 px; las posiciones vienen de `data/civilis/regiones.ts`.
4. Las decisiones de contenido de `REVISION_JURIDICA_PENDIENTE.md` y
   `NPC-TEXTOS-UNIFICADOS.md` siguen abiertas.
