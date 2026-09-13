# Handoff — cómo seguir con FORO [in]VISIBLE

Para quien tome este repositorio después: Diego, otro desarrollador o un agente.
Es el documento que hay que leer **antes** de tocar código.

Estado verificado y cifras del día: [`CHECKPOINT.md`](CHECKPOINT.md).
Panorama del proyecto: [`../README.md`](../README.md).

---

## 1 · Arranque

```bash
npm ci
npm run dev            # http://localhost:3000

npm run lint && npm run typecheck && npm test && npm run build
```

Para la verificación en navegador real:

```bash
npm run build
npx next start -p 3100     # dejar corriendo
npm run verificar          # avance en móvil + los 8 overlays
```

Node **24.x**. Sin variables de entorno, sin claves, sin backend.

---

## 2 · Dónde está cada cosa

| Quiero cambiar… | Se toca… |
|---|---|
| El nombre, los créditos o los colores de marca | `lib/brand.ts` **y nada más** |
| El armazón de pantalla (cabecera, alto, navegación) | `components/shell/GameShell.tsx` + sección `GAME SHELL` de `app/globals.css` |
| La acción fija abajo / el HUD fijo arriba de una actividad | Clases `.barra-accion` y `.hud-fijo` (sección `v4` de `app/globals.css`) |
| Filas de menú, opciones de respuesta, pestañas | `.fila`, `.opcion`, `.segmentado` (sección `v4`) |
| Cualquier diálogo o ventana modal | `components/shell/Modal.tsx`; si conserva arte propio, `lib/useModalAccesible.ts` |
| Tamaños de texto, contraste, opacidad de tarjetas | Sección `LEGIBILIDAD` de `app/globals.css` (tokens `--t-*`, `--sup-*`) |
| La transición al cambiar de pantalla | `app/template.tsx` + `.entrada-pantalla` (¡lee el aviso de §4!) |
| Lo que se ve mientras carga una ruta | `app/loading.tsx` + `.hueso` |
| Lo que recomienda EVA | `lib/eva.ts` (motor determinista, con pruebas) |
| Qué borra o conserva una partida | `store/useGame.ts` (ver §4) |
| Reglas procesales del juego | `lib/reglas.ts` |
| Personajes, diálogos de zona y misiones | `data/npcs-v2.ts` (fuente única) |
| Sonido | `lib/audio.ts` (todo generado, sin archivos) |
| Vibración en móvil | `lib/haptica.ts` |
| Volumen y modos de sonido | `components/shell/PanelAudio.tsx` + `setVolumen()` en `lib/audio.ts` |
| La espera entre preguntas de una actividad | `lib/useAvanceAutomatico.ts` + `components/shell/PistaAvance.tsx` |
| Las teclas que responden una alternativa | `lib/useAtajosAlternativas.ts` (con pruebas) |
| El aviso de subida de nivel | `components/shell/AvisoNivel.tsx` + `lib/progreso.ts` (con pruebas) |
| La racha de días de estudio | `lib/racha.ts` (con pruebas) + los campos del guardado que actualiza `avanzarRacha()` en `store/useGame.ts` |
| El mapa de campaña (nodos, cables, distritos, detalle) | `components/MapaFlujo.tsx` |
| El fondo de toda la aplicación | `components/FondoCiudad.tsx` (SVG estático, componente de servidor) |

La dirección creativa que se estaba siguiendo está escrita en el propio
repositorio: [`direccion-creativa/05_UX_DIRECTION.md`](direccion-creativa/05_UX_DIRECTION.md)
y [`direccion-creativa/VISUAL_BIBLE.md`](direccion-creativa/VISUAL_BIBLE.md). No
son adorno: el rediseño de combate e inventario que queda pendiente está
especificado ahí.

---

## 3 · Reglas de la casa

Invariantes del encargo. Romper cualquiera de ellas es una regresión, aunque el
build pase.

1. **Una sola pantalla en TODOS los tamaños (v4).** El armazón mide la ventana
   también en el teléfono: el documento no se desplaza nunca; se desplaza la
   región de contenido. `medir.js` lo comprueba en 5 tamaños.
2. **Nunca se resuelve recortando.** Prohibido ganar «que quepa» con
   `overflow: hidden`. Si un panel no cabe, recibe región desplazable propia,
   enfocable y etiquetada. El códex y la biblioteca se desplazan dentro de su
   región: son lectura larga.
3. **Superficies opacas del todo.** Nada de alfa en tarjetas ni tintes
   `${color}08` sobre el fondo. Para tintar, `color-mix(in srgb, color 14%, #111723)`.
4. **Suelo de píxeles.** Ningún texto por debajo de 13 px, ni siquiera en tamaños
   decimales. Texto de lectura en sans (Inter); la monoespaciada, sólo para
   etiquetas en mayúsculas, artículos y cifras.
5. **La acción que hace avanzar está siempre a la vista**: en `.barra-accion`,
   pegada abajo de la región desplazable, nunca al final del contenido.
   `avanzar.js` y `jugar.js` lo comprueban porque ya se rompió dos veces.
6. **`iniciarPartida()` es la única puerta destructiva.** Abrir o cancelar la
   creación de personaje no borra nada; reemplazar exige confirmación en pantalla.
7. **EVA es determinista.** Sin llamadas a modelos, sin claves, sin backend, sin
   costo por uso. Cada recomendación lleva su `razon` derivada de un dato
   concreto. Sin datos, EVA no diagnostica.
8. **Marca centralizada.** Si un nombre o un color de marca aparece escrito a mano
   fuera de `lib/brand.ts`, es un error.
9. **No se inventa.** Quedan explícitamente fuera: el significado de la sigla EVA,
   una biografía o apariencia humana de EVA, relaciones empresariales o
   titularidad jurídica no documentadas, credenciales profesionales de Diego,
   avales universitarios, cifras de usuarios y promesas de aprobación del examen.
10. **El contenido jurídico no se corrige de memoria.** Se contrasta contra fuente
    oficial (BCN / LeyChile) o no se toca. Ver §7.

---

## 4 · Trampas ya pagadas

Cada una de estas costó un fallo real. Están aquí para que no se repitan.

**React y Framer Motion**

- `{n && <div/>}` con `n = 0` **imprime el 0**. Pasó con los efectos de diálogo de
  los NPC: se veían cajitas con un `0` suelto y, peor, la recompensa no se
  aplicaba. Compara siempre explícitamente: `(x ?? 0) !== 0`.
- `<AnimatePresence>` envolviendo un hijo que no es `motion.*` o que no tiene
  `key` deja **copias fantasma montadas**. Con `reactStrictMode` se nota como
  contenido duplicado y desplazado. Si el padre ya monta condicionalmente, no
  hace falta `AnimatePresence`.
- **Ningún hook detrás de un `return`.** `MissionRunner` e `InterrogacionOral`
  tienen retornos tempranos (misión sin contenido, jefe inexistente) y el lint lo
  caza en cuanto un hook queda debajo. En ambos el atajo de teclado se declara
  arriba del todo; el cuerpo sólo corre al pulsar una tecla, cuando las funciones
  que nombra ya existen. `InterrogacionOral` lleva rotulada la convención:
  «TODOS LOS HOOKS PRIMERO».
- **Nunca llames a una función con efectos desde dentro de un actualizador de
  estado.** `setTiempo(s => { if (s <= 0) fallar(); … })` parecía inocente y no lo
  era: al agotarse el reloj, la respuesta seguía sin registrarse, el intervalo no
  se detenía y `fallar()` se repetía cada 100 ms, sumando fallos y saltando
  preguntas. Estaba en `SpeedrunVoF` y en `ArcadeClasificador`; ahora el
  actualizador sólo descuenta y un efecto aparte decide.

**CSS**

- `filter` o `transform` en un ancestro lo convierten en el bloque contenedor de
  todo `position: fixed` descendiente. Una animación de `filter` sobre `<body>`
  mandó la navegación al píxel 2018. Por eso el pulso de fondo vive en su propia
  capa `.ui-breathe` con `opacity`.
  **La misma regla gobierna `app/template.tsx`**: envuelve la pantalla entera, así
  que su animación de entrada es **sólo de opacidad**, sin `forwards`. Añadirle un
  `transform` —una entrada deslizante, por ejemplo— sacaría de la pantalla la
  barra de navegación, los modales y el aviso de nivel.
- Un `z-index` en un envoltorio **encierra** a sus descendientes en un contexto de
  apilado. `<div className="relative z-10">` en `app/layout.tsx` dejaba todos los
  modales por debajo de las capas CRT (scanlines `z-50`, ruido y viñeta `z-51`).
  El `z-10` ya no está; no volver a ponerlo.
- Un grid sin `grid-template-columns: minmax(0, 1fr)` se estira a `max-content`:
  el armazón medía 436 px dentro de una ventana de 390 px.
- `overflow-y: auto` + `overscroll-behavior: contain` en una región que **no
  desborda** se traga el gesto: el dedo no desplaza ni la región ni la página.
  Pasó en la creación en móvil. Con el armazón fijo sólo hay una región por
  pantalla; no anides otra que no la necesite.
- Nada de animación por fotograma a pantalla completa (lienzos, capas con
  `mix-blend-mode`, `backdrop-filter`). El fondo es SVG estático a propósito.
- `transition: all` anima alto y relleno: reflujo en cada cambio. Sólo color,
  borde, sombra, transformación y opacidad.
- `position: sticky` de `.barra-accion`/`.hud-fijo` necesita que su padre abarque
  todo el contenido (`flex flex-col min-h-full` en el envoltorio de la página).
- **Tailwind escanea estáticamente.** Una clase construida en tiempo de ejecución
  —`` `border-${color}/60` ``— no se genera nunca. Usa un mapa estático.

**Next.js y dependencias**

- `next/dynamic` exige un **objeto literal** en las opciones. Una constante
  compartida rompe la compilación.
- `overrides` sólo resuelve `$paquete` contra `dependencies`. Para `postcss`, que
  es `devDependency`, hay que fijar la versión literal.
- Un `next-server` zombi ocupando el puerto sirve un manifiesto viejo y produce
  «Loading chunk failed» y 400 en assets estáticos. `kill` al proceso y
  `rm -rf .next` antes de reconstruir.

**Zustand**

- Dentro de `onRehydrateStorage` **no** se puede llamar a `useGame.setState`: con
  `localStorage` la rehidratación ocurre de forma síncrona dentro de `create()`,
  cuando la variable todavía no existe. Hay una acción `_marcarHidratado` que
  cierra sobre `set` precisamente para eso, y `useHydrated` se apoya en
  `persist.hasHydrated()` + `onFinishHydration`.

---

## 5 · Cómo verificar de verdad

`scripts/verificacion/` ejecuta Chromium real sobre el build de producción, con
perfil limpio y partida de prueba — **nunca toca una partida personal**.

| Guion | Comprueba |
|---|---|
| `medir.js` | Scroll de documento y desborde horizontal en 5 resoluciones |
| `interno.js` | Que cada actividad quepa entera |
| `avanzar.js` | Que en móvil haya un control de avance dentro de la ventana |
| `jugar.js` | Lo mismo, pero **tras interactuar** |
| `overlays.js` | Abre los 8 modales con su gesto real y mide dentro |
| `contraste2.js` | WCAG AA sobre el píxel realmente pintado |
| `a11y.js` | Controles sin nombre accesible, campos sin etiqueta |
| `flujos.js` | Recorridos completos de juego |

**La lección que los originó:** la primera versión del arnés no hacía ni un solo
`click()`. Sólo cargaba rutas y medía el estado inicial, así que declaró «0
fallos» mientras el modal de NPC estaba roto a la vista. Cualquier medida que no
interactúe no está midiendo el juego.

Los guiones arrancan el navegador con `scripts/verificacion/navegador.js`: el
Chromium del contenedor si existe; si no, Chrome o Edge instalados (Windows,
macOS). `PW_CHROMIUM=/ruta` fuerza uno concreto.

**Lo que el arnés no cubre**, y hay que mirar a mano:

- Sólo Chromium (Chrome del sistema): ni Firefox ni WebKit.
- Los tamaños móviles son **emulados**, no dispositivos reales.
- El combate contra jefes se comprueba en la entrada (`BossEntry`), no en una
  partida completa de preguntas.
- El ambiente sonoro **no se ha escuchado**: se escribió y se comprobó que arranca
  y se detiene, pero el entorno no tiene salida de audio. Esto vale para las seis
  escenas y para toda la paleta de efectos. Escúchalo antes de darlo por bueno.
- **La vibración no se ha sentido**: no hay dispositivo. Y en iPhone no va a
  funcionar nunca, porque Safari de iOS no implementa `navigator.vibrate`.

---

## 6 · Qué queda pendiente

### Trabajo de interfaz ya especificado, no empezado

1. **Combate — avance parcial (v4).** `CampaignBossBattle` e `InterrogacionOral`
   ya tienen HUD fijo, opciones grandes y acción fija, y el jefe de campaña usa
   el interrogatorio de 5 fases. Falta la composición estilo Persona 5 de
   `05_UX_DIRECTION.md` §2 (acciones como comandos, interrupciones).
2. **Módulos heredados de Entrenar** (`JuicioEjecutivoCompleto`,
   `ArcadeClasificador`, `TimelineOrdenamiento`…): heredan armazón y
   tipografía, pero su interior sigue con la maquetación antigua. Migrarlos a
   `.opcion`, `.barra-accion` y `.hud-fijo`.
3. **Inventario de reliquias.** `components/InventarioPanel.tsx` según
   `05_UX_DIRECTION.md` §4 (rejilla). Hoy es una lista.

Todos deben pasar `avanzar.js`, `jugar.js` y `overlays.js` sin regresiones.

### Decisiones que sólo puede tomar Diego

4. [`REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md) —
   contradicciones **internas** del propio contenido, sin resolver. La más
   importante: el juego enseña la ultra petita como art. 768 N°4 en seis lugares y
   como 768 N°2 en `data/casos-investigativos.ts`. Es materia de examen y el
   jugador recibe respuestas incompatibles según por dónde entre.
5. [`NPC-TEXTOS-UNIFICADOS.md`](NPC-TEXTOS-UNIFICADOS.md) — al unificar los NPC en
   una sola fuente, cambió el rasgo de carácter de 5 de 6 personajes. Los
   diálogos, misiones y recompensas se conservaron literalmente, pero es texto que
   el jugador lee.

### Verificación que este entorno no pudo hacer

6. **Contrastar el banco jurídico contra BCN / LeyChile.** No se hizo y no se
   corrigió nada: ver §7.

---

## 7 · Por qué el contenido jurídico está sin verificar

El encargo pedía contrastar el orden de las causales del art. 768 CPC y la
formulación sobre prueba testimonial y sana crítica contra fuente oficial, y
**no corregirlas de memoria**.

En el entorno donde se hizo este trabajo, la política de salida a internet
**bloquea** `www.bcn.cl`, `leychile.cl` y el Diario Oficial. Por tanto **no se
modificó ni una palabra del contenido jurídico**, ni se validó ninguna parte del
banco de preguntas. Lo que hay documentado son contradicciones internas, que se
demuestran sin salir del repositorio.

Quien tenga acceso a las fuentes debe resolverlo con el Código a la vista. Hasta
entonces, ese contenido sigue siendo el original del juego, no una versión
revisada.

---

## 8 · Convenciones de trabajo

- Rama de desarrollo actual: `claude/movil-mapa-flujo`. Producción: `main`.
- Mensajes de commit en español, con ámbito: `fix(movil): …`, `feat(ux): …`.
- Antes de cualquier push: `lint`, `typecheck`, `test`, `build` **y** el arnés en
  las pantallas que se tocaron.
- `npm audit` debe seguir en **0 vulnerabilidades**.
- Los cambios de presentación no tocan mecánica ni stores. Si un cambio visual
  obliga a tocar `store/`, hay pruebas que lo cubren: ejecútalas.
