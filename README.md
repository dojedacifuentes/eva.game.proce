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
npm test           # vitest: 44 pruebas
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

npm run verificar                 # avance en móvil + los 8 overlays
npm run verificar:medidas         # scroll de documento y desborde horizontal
npm run verificar:contraste       # WCAG AA sobre el píxel realmente pintado
npm run verificar:a11y            # nombres accesibles y etiquetas
npm run verificar:flujos          # recorridos completos de juego
```

Cada guion nació de un fallo que se había colado. Está explicado, uno por uno, en
[`scripts/verificacion/README.md`](scripts/verificacion/README.md).

---

## Stack

- **Next.js 15.5** (App Router) + **React 19.1**
- **TypeScript**, con comprobación de tipos en la compilación
- **TailwindCSS** + CSS propio (`app/globals.css`)
- **Framer Motion**
- **Zustand + persist** (estado y guardado en `localStorage`, con guarda SSR)
- **Vitest** para la lógica delicada
- **Playwright** (sólo en desarrollo) para el arnés de verificación
- **Vercel-ready**: sin backend, sin claves, sin llamadas a modelos de IA

---

## Arquitectura de interfaz

### `GameShell` — el armazón de pantalla

Todas las rutas se dibujan dentro de `components/shell/GameShell.tsx`, que
controla cabecera, contenido y navegación. Tres variantes:

| Variante | Para qué | Comportamiento |
|---|---|---|
| `app` | Hub y pantallas de una sola vista | En escritorio el documento **no** se desplaza; el hijo reparte el alto |
| `focus` | Actividades e interacciones breves | Igual, con el contenido en una región desplazable accesible |
| `reader` | Codex, biblioteca, textos largos | El documento se desplaza con normalidad |

El reparto es `grid-template-rows: auto minmax(0,1fr) auto` sobre `100dvh`, con
`min-height: 0` en el hijo. **Nada se resolvió recortando con `overflow: hidden`**:
cuando un panel no cabe, recibe su propia región desplazable, enfocable y
etiquetada.

El bloqueo del scroll de documento sólo se activa a partir de **1024×620**. En
móvil, en ventanas bajas y con el texto ampliado se suelta solo, para que ningún
control quede fuera de alcance.

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
(`--t-micro` … `--t-display`), tokens de superficie opaca (`--sup-1`, `--sup-2`,
`--sup-alta`), clases de énfasis (`.txt-fuerte` … `.txt-tenue`) y un **suelo de
píxeles** que impide que ningún texto baje del mínimo legible.

La comprobación de contraste **no se deduce del CSS**: se captura la pantalla, se
muestrea el píxel realmente pintado y se calcula el ratio WCAG contra él.

### EVA

`lib/eva.ts` es un motor **determinista**: reglas legibles sobre el progreso
guardado. No hay llamadas a modelos, ni claves, ni backend, ni costo por uso.
Cada recomendación va acompañada de su `razon`, derivada del dato concreto que la
motivó. Si faltan datos, EVA no inventa diagnósticos.

### Marca

El nombre, los créditos, los colores y las rutas de assets de marca viven en un
único archivo: **`lib/brand.ts`**. Para cambiar cualquiera de esas cosas en toda
la interfaz se edita ahí y en ningún sitio más.

### Fluidez

- **`app/template.tsx`** da una entrada común a cada pantalla. Anima **sólo la
  opacidad**: un `transform` aquí sacaría de la pantalla todo lo que es
  `position: fixed` (ver [`docs/HANDOFF.md`](docs/HANDOFF.md) §4).
- **`app/loading.tsx`** dibuja la silueta del armazón mientras llega una ruta, en
  vez de dejar la pantalla anterior congelada.
- **`lib/useAvanceAutomatico.ts`** convierte la espera entre preguntas en un
  máximo adelantable: cualquier toque, Enter o flecha derecha sigue al momento, y
  una barra muestra cuánto falta. Antes eran 1,5 s fijos por pregunta.

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

Todo arranca en silencio y se controla desde la cabecera (apagado → efectos →
ambiente de estudio).

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
│  ├─ MapCity.tsx              # Mapa urbano de arquitectura jurídica
│  ├─ GameWorldMap.tsx         # Mapa de nodos de campaña
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

1. **Empezar de cero:** portada → «Comenzar» → nombre → «Partida rápida» → «Comenzar».
2. **Personalizar:** en creación, «Siguiente» por los cuatro pasos y volver atrás;
   los datos se conservan y los atributos se recalculan sin acumular bonificaciones.
3. **Protección del guardado:** con una partida en curso, abrir `/creacion` y
   cancelar; nada se borra. Reemplazar exige confirmación explícita.
4. **Una sola pantalla:** `/juego` a 1366×768 no debe tener barra de desplazamiento.
5. **Móvil:** `/juego` a 390×844; sin desbordamiento horizontal, barra inferior
   visible, y el control de avance siempre dentro de la ventana.
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
