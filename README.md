# FORO [in]VISIBLE

> Una experiencia EVA de Proyecto01 · Creada por **Diego Ojeda**

RPG narrativo web sobre **Derecho Procesal Civil chileno**: jurisdicción,
competencia, juicio ordinario y sus etapas, recursos, juicio ejecutivo y
disposiciones comunes. Pensado para el **estudio del examen de grado**.

Juego creado por Diego Ojeda durante su preparación del examen. Este repositorio
es la base independiente de la experiencia **EVA / Proyecto01**.

- **En producción:** [evagameproce.vercel.app](https://evagameproce.vercel.app)
- **Repositorio:** [dojedacifuentes/eva.game.proce](https://github.com/dojedacifuentes/eva.game.proce)
- **Origen:** [dojedacifuentes/rpgproce](https://github.com/dojedacifuentes/rpgproce), commit `76f58da`. Se conserva su historial.

Estética: minimalismo cyberpunk-notarial, CRT, glitch jurídico, neón azul/violeta
sobre negro.

---

## Índice de documentos

| Documento | Para qué |
|---|---|
| [`docs/CHECKPOINT.md`](docs/CHECKPOINT.md) | Estado verificado hoy: qué se midió, con qué número, en qué commit |
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | Cómo seguir: mapa del código, convenciones, trampas conocidas, qué falta |
| [`docs/ENTREGA-MOVIL-FLUJO.md`](docs/ENTREGA-MOVIL-FLUJO.md) | **v4**: armazón fijo en el teléfono, mapa de flujo cenital, superficies sólidas, jefes con interrogatorio |
| [`docs/ENTREGA-UX-EVA.md`](docs/ENTREGA-UX-EVA.md) | Entrega del rediseño de una sola pantalla, creación de personaje, EVA y marca |
| [`docs/REVISION_JURIDICA_PENDIENTE.md`](docs/REVISION_JURIDICA_PENDIENTE.md) | **Pendiente de Diego**: contradicciones internas de contenido jurídico sin resolver |
| [`docs/NPC-TEXTOS-UNIFICADOS.md`](docs/NPC-TEXTOS-UNIFICADOS.md) | **Pendiente de Diego**: rasgos de personaje que cambiaron al unificar los NPC |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Despliegue en Vercel |
| [`docs/direccion-creativa/`](docs/direccion-creativa/) | Biblia visual, dirección de arte y de UX, diseño de mundos y jefes |
| [`scripts/verificacion/README.md`](scripts/verificacion/README.md) | El arnés de verificación en navegador real |

---

## Cómo correr localmente

```bash
npm ci
npm run dev   # http://localhost:3000
```

Node **24.x** y npm. En PowerShell, si la política de scripts bloquea `npm`, usa
`npm.cmd`.

### Comprobaciones

```bash
npm run lint       # eslint — sin errores NI advertencias
npm run typecheck  # tsc --noEmit
npm test           # vitest: 97 pruebas
npm run build      # compilación de producción
npm start          # servidor de producción
```

### Verificación en navegador real

Las pruebas unitarias no ven lo que ve el jugador. Para eso está
`scripts/verificacion/`: Chromium real sobre el build de producción, con un
perfil limpio y una partida de prueba — **nunca toca una partida personal**.

```bash
npm run build
npx next start -p 3100            # dejar corriendo en otra terminal

npm run verificar                 # avance en móvil, los 9 modales, teclado y repaso
npm run verificar:medidas         # scroll de documento y desborde horizontal
npm run verificar:contraste       # WCAG AA sobre el píxel realmente pintado
npm run verificar:a11y            # nombres accesibles y etiquetas
npm run verificar:flujos          # recorridos completos de juego
```

En Windows y macOS usan el Chrome o Edge instalados
(`scripts/verificacion/navegador.js`): no hace falta descargar navegadores.

Cada guion nació de un fallo que se había colado. Está explicado, uno por uno, en
[`scripts/verificacion/README.md`](scripts/verificacion/README.md).

---

## Stack

- **Next.js 15.5** (App Router) + **React 19.1**
- **TypeScript**, con comprobación de tipos en la compilación
- **TailwindCSS** + CSS propio (`app/globals.css`)
- **Tipografías vía `next/font`**: Inter (lectura), Cinzel (titulares), Cormorant (voz de personajes), JetBrains Mono (etiquetas y cifras)
- **Framer Motion**
- **Zustand + persist** (estado y guardado en `localStorage`, con guarda SSR)
- **Vitest** para la lógica delicada
- **Playwright** (sólo en desarrollo) para el arnés de verificación
- **Vercel-ready**: sin backend, sin claves, sin llamadas a modelos de IA

---

## Arquitectura de interfaz

### `GameShell` — el armazón de pantalla

Todas las rutas se dibujan dentro de `components/shell/GameShell.tsx`, que
controla cabecera, contenido y navegación. **En todos los tamaños** (v4) mide
exactamente la ventana: `grid-template-rows: auto minmax(0,1fr) auto` sobre
`100dvh`. El documento no se desplaza nunca; se desplaza la región de contenido.
La navegación inferior es una fila del grid, no una capa fija.

| Variante | Para qué | Comportamiento |
|---|---|---|
| `app` | Hub, portada, creación | El hijo reparte el alto; si no cabe en una ventana muy baja, se desplaza |
| `focus` | Actividades | Contenido en una región desplazable accesible; `scrollKey` la devuelve arriba al cambiar de fase |
| `reader` | Codex, textos largos | Igual que `focus` |

Dentro de una actividad, `.hud-fijo` queda pegado arriba (fase, vidas, pestañas)
y `.barra-accion` pegada abajo: **la acción que hace avanzar está siempre a la
vista**. Antes, en el teléfono, el botón «Comenzar» de la creación caía bajo la
barra inferior. **Nada se resolvió recortando con `overflow: hidden`.**

### `Modal` — un único sistema de diálogos

`components/shell/Modal.tsx`: superficie **opaca**, cabecera con retrato, cuerpo
con región desplazable propia y pie de acciones **siempre visible, fuera del
scroll**. Trae `role="dialog"`, foco atrapado, cierre con Escape y devolución del
foco al control que lo abrió.

Los overlays que conservan su arte propio (fichas del códex, cartas, bestiario,
biblioteca) reciben ese mismo comportamiento sin perder su diseño mediante el
hook `lib/useModalAccesible.ts`.

### Capa de legibilidad

En `app/globals.css`, sección `LEGIBILIDAD`: escala tipográfica con nombre
(`--t-micro` 13 px … `--t-display`), tokens de superficie **opacos del todo**
(`--sup-1`, `--sup-2`, `--sup-alta`), clases de énfasis (`.txt-fuerte` …
`.txt-tenue`) y un **suelo de píxeles**. La sección `v4` añade las piezas
comunes: `.fila`, `.opcion`, `.segmentado`, `.medidor`, `.chip`, `.btn-primario`.

El texto de lectura va en Inter; Cinzel y Cormorant pasan a sans cuando se usan
en tamaños pequeños, y los espaciados de versalita se contienen.

La comprobación de contraste **no se deduce del CSS**: se captura la pantalla, se
muestrea el píxel realmente pintado y se calcula el ratio WCAG contra él.

### Mapa de flujo y fondo

`components/MapaFlujo.tsx` dibuja la campaña como un **flujo de nodos** sobre un
plano visto desde arriba: cada misión y cada jefe es un nodo con puertos, los
cables muestran lo recorrido (verde), lo actual (animado) y lo pendiente, y cada
acto es un distrito de manzanas. El trazado se calcula con el ancho real: 1 acto
por fila en el teléfono, 2 en tableta, 3 en escritorio. Tocar un nodo abre su
detalle con «Jugar»; hay vista de lista alternativa.

`components/FondoCiudad.tsx` es el fondo de toda la aplicación: plano cenital
estático en SVG, renderizado en el servidor, sin JavaScript en el cliente.

### EVA

`lib/eva.ts` es un motor **determinista**: reglas legibles sobre el progreso
guardado. No hay llamadas a modelos, ni claves, ni backend, ni costo por uso.
Cada recomendación va acompañada de su `razon`, derivada del dato concreto que la
motivó. Si faltan datos, EVA no inventa diagnósticos.

### Marca

El nombre, los créditos, los colores y las rutas de assets de marca viven en un
único archivo: **`lib/brand.ts`**. Para cambiar cualquiera de esas cosas en toda
la interfaz se edita ahí y en ningún sitio más.

### Iconografía

`components/game/Icono.tsx`: 32 iconos de trazo con rejilla de 24, grosor 1,6 y
`currentColor`, en la navegación, la cabecera y las filas de Entrenar. Heredan el
color de su fila, así que cada zona lleva el suyo sin dibujar una versión por
color. Sustituyen a los emoji, que los dibujaba el sistema operativo —distinto en
cada teléfono—, traían su propio color y no eran de derecho procesal.

### Fluidez

- **`app/template.tsx`** da una entrada común a cada pantalla. Anima **sólo la
  opacidad**: un `transform` aquí sacaría de la pantalla todo lo que es
  `position: fixed` (ver [`docs/HANDOFF.md`](docs/HANDOFF.md) §4).
- **`app/loading.tsx`** dibuja la silueta del armazón mientras llega una ruta, en
  vez de dejar la pantalla anterior congelada.
- **`lib/useAvanceAutomatico.ts`** convierte la espera entre preguntas en un
  máximo adelantable: cualquier toque, Enter o flecha derecha sigue al momento, y
  una barra muestra cuánto falta. Antes eran 1,5 s fijos por pregunta.
- **`lib/useAtajosAlternativas.ts`** enlaza las teclas **1-9 y A-I** con las
  alternativas en pantalla: una tanda entera sin soltar el teclado. Se apagan
  mientras hay respuesta a la vista, y nunca roban teclas a un campo de texto ni
  a un diálogo abierto.

### Constancia

`lib/racha.ts` cuenta **días seguidos con actividad real** —no visitas—: el
contador sólo avanza desde `gainXp` y `completarMision`. Usa el día en hora
**local**, porque con UTC la racha saltaría a mitad de sesión para quien estudia
de noche. Mirar la racha no la reescribe. 15 pruebas cubren el cambio de mes, de
año, el 29 de febrero y el reloj movido hacia atrás.

### Repaso espaciado

`lib/repaso.ts` + la ruta `/repaso`. Lo que **fallas** en la cédula y en el
verdadero/falso entra en un mazo y vuelve a 1, 3, 7, 16 y 35 días; acertarlo lo
aleja, volver a fallarlo lo devuelve a mañana, y tras cinco aciertos seguidos
sale del mazo. Es lo único del juego que decide *cuándo* te toca ver cada cosa.

`lib/bancoRepaso.ts` unifica los tres bancos (`data/cedula.ts`,
`data/preguntas-vof.ts` y las alternativas de `data/examen-extendido.ts`) bajo
una sola forma, con identificadores derivados del **texto** de la pregunta y no
de su posición: reordenar un banco no mezcla historiales.

> Los intervalos son una progresión razonable elegida por criterio de diseño.
> **No** están calibrados con datos de este juego ni son un protocolo validado.

### Sonido y tacto

`lib/audio.ts` genera todo por **Web Audio API**, sin archivos.

- **Efectos con intención separada**: navegar (`tap`), volver (`back`), abrir y
  cerrar una ventana, elegir, confirmar, acertar, fallar. No todo suena igual.
- **Seis escenas de ambiente** —estudio, oral, ejecutivo, nulidad, recursos,
  cautelares—: la misma cama sonora afinada en otro registro según dónde esté el
  jugador. Cambia sola al navegar, con un cruce de disolución.
- **`lib/haptica.ts`** añade vibración corta en acierto, error e hito. Respeta
  `prefers-reduced-motion`. Safari de iOS no implementa `navigator.vibrate`, así
  que en iPhone no vibra nada: nunca es el único canal de información.

Todo arranca en silencio. El botón de la cabecera abre **`PanelAudio`**, con los
tres modos a la vista —silencio, efectos, ambiente— y un **control de volumen**
real, que se recuerda en el navegador. Antes era un botón que ciclaba entre tres
estados sin decir cuáles había, y el volumen estaba fijado en el código.

---

## Protección del guardado

`store/useGame.ts` es la única puerta destructiva del proyecto:

- `iniciarPartida()` es **la única** función que borra progreso.
- Abrir o cancelar la creación de personaje **no** toca la partida guardada.
- Reemplazar una partida en curso exige confirmación explícita en pantalla.
- `sanearEstado()` migra guardados antiguos sin destruirlos; `exportarPartida()` e
  `importarPartida()` permiten respaldo manual en JSON.

Hay 15 pruebas dedicadas sólo a esto (`store/__tests__/`).

---

## Sistemas de juego

### 13 mundos jugables

| # | Mundo | Núcleo normativo |
|---|---|---|
| I | Jurisdicción | Art. 76 CPR / 1, 5, 7, 8 COT |
| II | Competencia | 45-148 COT (absoluta y relativa) |
| III | Acción y pretensión | Doctrinario (Couture, Hoyos, Carnelutti) |
| IV | La demanda | Art. 254 CPC |
| V | Emplazamiento | 38-58 + 258-259 CPC |
| VI | Discusión | 254-318 CPC (demanda, contestación, réplica, dúplica, reconvención) |
| VII | Conciliación | 262-268 CPC |
| VIII | Prueba | 318-433 CPC (auto, medios, observaciones) |
| IX | Sentencia | 158, 162, 170, 432 CPC |
| X | Recursos | 181, 182, 187, 188, 196, 203, 319, 766, 767, 810 CPC + 545 COT |
| XI | Juicio ejecutivo | 434-478 CPC |
| XII | Cautelares | 273-302 CPC |
| XIII | Modo Examen | 20 preguntas tipo cédula con explicación |

### Minijuegos pedagógicos

- **Clasificador de competencia**: 6 casos cruzando materia, fuero, territorio, prórroga.
- **Constructor de demanda art. 254**: marcar requisitos; si faltan, riesgo de excepción dilatoria del art. 303 N°4.
- **Configurador de emplazamiento**: forma (40/44/48/50/54) + plazo (258/259).
- **Etapa de discusión interactiva**: demanda → dilatorias → resolución → réplica → dúplica → reconvención.
- **Auto de prueba + medios probatorios**: ofrecer pruebas oportunas; reposición especial del 319.
- **Clasificador de recursos** (NÚCLEO): dada una resolución, elegir el recurso procedente entre 11 alternativas, con el cuadro del CPC y COT 545.
- **Juicio ejecutivo**: elegir título ejecutivo (art. 434), navegar cuadernos principal/apremio/tercerías, oposición del 464.
- **Cautelares**: prejudiciales/precautorias/innominadas, las 4 del art. 290, con caución y bien afectado.
- **Modo Examen**: 20 preguntas con explicación normativa.

### Expansiones

Tres mundos paralelos con su propio guardado y sus propias mecánicas:
**Reinos del Derecho** (`/reinos`), **Civilis** (`/civilis`) y **Procesal**
(`/procesal`) — códex, cartas, bestiario, biblioteca, flashcards, mnemotecnia,
cascada contrarreloj, atlas y comparadores.

### Loop de ciclos procesales

Cada expediente terminado abre un nuevo ciclo. El personaje conserva atributos,
reputación, logros y la bitácora histórica.

### Codex con búsqueda

35+ artículos destacados, el cuadro de las 5 clases de resoluciones (art. 158), el
cuadro de los 11 recursos con plazo y tribunal competente, 6 medios probatorios,
6 excepciones dilatorias del art. 303, 7 títulos ejecutivos del art. 434 y
buscador por palabra o número de artículo.

---

## Estructura

```
eva.game.proce/
├─ app/                        # 50 rutas (App Router)
│  ├─ page.tsx                 # Portada
│  ├─ creacion/                # Asistente de personaje + partida rápida
│  ├─ juego/                   # Hub
│  ├─ mundo/[id]/              # Los 13 mundos
│  ├─ mision/[id]/  boss/[id]/ # Misiones y jefes
│  ├─ oral/  examen/  epilogo/ # Interrogación oral, cédula, cierre
│  ├─ codex/  inventario/      # Consulta y expediente
│  ├─ reinos/  civilis/  procesal/   # Expansiones
│  └─ globals.css              # Armazón, legibilidad, modales, cinemáticas
├─ components/
│  ├─ shell/                   # GameShell, Modal, cabecera, navegación, EVA
│  ├─ game/                    # Retratos procedurales
│  ├─ MapaFlujo.tsx            # Mapa de campaña: flujo de nodos cenital
│  ├─ FondoCiudad.tsx          # Fondo estático: plano de la ciudad + flujo
│  └─ …Panel.tsx               # Un panel por mecánica procesal
├─ lib/
│  ├─ reglas.ts                # Motor normativo procesal
│  ├─ eva.ts                   # Motor determinista de recomendación
│  ├─ brand.ts                 # Marca: única fuente de verdad
│  ├─ audio.ts                 # Web Audio: efectos y ambiente
│  └─ use*.ts                  # Hooks de hidratación, modal accesible, mezcla
├─ data/                       # Diálogos, casos, NPC, campaña, códex
├─ store/useGame.ts            # Zustand + persist + migración + respaldo
├─ scripts/verificacion/       # Arnés en navegador real (Playwright)
└─ docs/                       # Entregas, pendientes y dirección creativa
```

---

## Flujos que conviene revisar a mano

1. **Empezar de cero:** portada → «Comenzar» → nombre → «Partida rápida» (entra directo al mapa).
2. **Personalizar:** en creación, «Siguiente» por los cuatro pasos y volver atrás;
   los datos se conservan y los atributos se recalculan sin acumular bonificaciones.
3. **Protección del guardado:** con una partida en curso, abrir `/creacion` y
   cancelar; nada se borra. Reemplazar exige confirmación explícita.
4. **Una sola pantalla:** ninguna ruta desplaza el documento, ni a 1366×768 ni a
   390×844; a 1366×768 la campaña entera cabe en el mapa.
5. **Móvil:** `/juego` a 390×844; mapa centrado en «AQUÍ» y barra «Próximo paso»
   visible sobre la navegación; en una misión, la acción siempre abajo.
6. **Respaldo:** Perfil → «Exportar partida» / «Importar partida».

Para probar sin tocar tu partida real, usa una ventana privada del navegador o
exporta primero.

---

## Despliegue en Vercel

1. En [Vercel](https://vercel.com/new), importa `dojedacifuentes/eva.game.proce`.
2. Framework: **Next.js**. Root Directory: `./`. Rama de producción: `main`.
3. Node: **24.x**. El repositorio ejecuta `npm ci` y `npm run build`. Deja Output
   Directory en su valor predeterminado.
4. No se requieren variables de entorno, base de datos ni claves de IA.

Las partidas se guardan en el navegador mediante `localStorage`: una URL nueva no
comparte automáticamente las partidas del sitio original. Guía completa en
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Aviso pedagógico

El juego es una **simplificación didáctica**. Cita artículos del CPC, COT y CPR,
pero no reemplaza el estudio del Código, la jurisprudencia y la doctrina (Couture,
Hoyos, Cassarino, Maturana, Romero, Pereira, Tavolari).

El contenido jurídico **no ha sido contrastado contra fuente oficial** en este
repositorio: las contradicciones internas detectadas están listadas, sin
corregir, en [`docs/REVISION_JURIDICA_PENDIENTE.md`](docs/REVISION_JURIDICA_PENDIENTE.md)
a la espera de revisión con el Código a la vista.

> «El juez aplica la ley. El litigante la sufre. El estudiante de procesal hace
> las dos cosas a la vez.»
