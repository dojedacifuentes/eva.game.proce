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
| Cualquier diálogo o ventana modal | `components/shell/Modal.tsx`; si conserva arte propio, `lib/useModalAccesible.ts` |
| Tamaños de texto, contraste, opacidad de tarjetas | Sección `LEGIBILIDAD` de `app/globals.css` (tokens `--t-*`, `--sup-*`) |
| Lo que recomienda EVA | `lib/eva.ts` (motor determinista, con pruebas) |
| Qué borra o conserva una partida | `store/useGame.ts` (ver §4) |
| Reglas procesales del juego | `lib/reglas.ts` |
| Personajes, diálogos de zona y misiones | `data/npcs-v2.ts` (fuente única) |
| Sonido | `lib/audio.ts` (todo generado, sin archivos) |
| El mapa de la ciudad / el mapa de campaña | `components/MapCity.tsx` / `components/GameWorldMap.tsx` |

La dirección creativa que se estaba siguiendo está escrita en el propio
repositorio: [`direccion-creativa/05_UX_DIRECTION.md`](direccion-creativa/05_UX_DIRECTION.md)
y [`direccion-creativa/VISUAL_BIBLE.md`](direccion-creativa/VISUAL_BIBLE.md). No
son adorno: el rediseño de combate e inventario que queda pendiente está
especificado ahí.

---

## 3 · Reglas de la casa

Invariantes del encargo. Romper cualquiera de ellas es una regresión, aunque el
build pase.

1. **Una sola pantalla en escritorio.** El hub y las actividades caben enteros en
   la ventana, sin scroll de documento.
2. **Nunca se resuelve recortando.** Prohibido ganar «que quepa» con
   `overflow: hidden`. Si un panel no cabe, recibe región desplazable propia,
   enfocable y etiquetada. El códex y la biblioteca **sí** se desplazan: son
   lectura larga, y así debe ser.
3. **Superficies opacas.** Nada de tarjetas translúcidas sobre el fondo animado.
4. **Suelo de píxeles.** Ningún texto por debajo del mínimo legible, ni siquiera
   en tamaños decimales (`text-[10.5px]` y compañía ya mordieron una vez).
5. **En móvil siempre hay una forma de avanzar dentro de la ventana**, nunca bajo
   la barra inferior. Hay un guion dedicado sólo a comprobarlo (`avanzar.js`),
   porque esto ya se rompió una vez y dejó el juego intransitable en teléfono.
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

**CSS**

- `filter` o `transform` en un ancestro lo convierten en el bloque contenedor de
  todo `position: fixed` descendiente. Una animación de `filter` sobre `<body>`
  mandó la navegación al píxel 2018. Por eso el pulso de fondo vive en su propia
  capa `.ui-breathe` con `opacity`.
- Un `z-index` en un envoltorio **encierra** a sus descendientes en un contexto de
  apilado. `<div className="relative z-10">` en `app/layout.tsx` dejaba todos los
  modales por debajo de las capas CRT (scanlines `z-50`, ruido y viñeta `z-51`).
  El `z-10` ya no está; no volver a ponerlo.
- Un grid sin `grid-template-columns: minmax(0, 1fr)` se estira a `max-content`:
  el armazón medía 436 px dentro de una ventana de 390 px.
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

**Lo que el arnés no cubre**, y hay que mirar a mano:

- Sólo hay Chromium en el entorno de desarrollo usado: ni Firefox ni WebKit.
- Los tamaños móviles son **emulados**, no dispositivos reales.
- El combate contra jefes se comprueba en la entrada (`BossEntry`), no en una
  partida completa de preguntas.
- El ambiente sonoro **no se ha escuchado**: se escribió y se comprobó que arranca
  y se detiene, pero el entorno no tiene salida de audio. Escúchalo antes de darlo
  por bueno.

---

## 6 · Qué queda pendiente

### Trabajo de interfaz ya especificado, no empezado

1. **Combate.** `components/CampaignBossBattle.tsx` y
   `components/InterrogacionOral.tsx` siguen con la presentación antigua. La
   dirección de UX del repositorio (`05_UX_DIRECTION.md` §2) pide HUD fijo y
   composición estilo Persona 5. Es el sistema que más se juega y el que menos se
   ha tocado. La entrada cinemática (`components/BossEntry.tsx`) sí está
   rehecha y sirve de referencia de cómo debe quedar.
2. **Inventario.** `components/InventarioPanel.tsx` según `05_UX_DIRECTION.md` §4
   (rejilla estilo Diablo/Cyberpunk). Hoy es una lista.

Ambos deben pasar `avanzar.js`, `interno.js` y `overlays.js` sin regresiones.

### Decisiones que sólo puede tomar Diego

3. [`REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md) —
   contradicciones **internas** del propio contenido, sin resolver. La más
   importante: el juego enseña la ultra petita como art. 768 N°4 en seis lugares y
   como 768 N°2 en `data/casos-investigativos.ts`. Es materia de examen y el
   jugador recibe respuestas incompatibles según por dónde entre.
4. [`NPC-TEXTOS-UNIFICADOS.md`](NPC-TEXTOS-UNIFICADOS.md) — al unificar los NPC en
   una sola fuente, cambió el rasgo de carácter de 5 de 6 personajes. Los
   diálogos, misiones y recompensas se conservaron literalmente, pero es texto que
   el jugador lee.

### Verificación que este entorno no pudo hacer

5. **Contrastar el banco jurídico contra BCN / LeyChile.** No se hizo y no se
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

- Rama de desarrollo actual: `claude/tender-mayer-j60b5g`. Producción: `main`.
- Mensajes de commit en español, con ámbito: `fix(movil): …`, `feat(ux): …`.
- Antes de cualquier push: `lint`, `typecheck`, `test`, `build` **y** el arnés en
  las pantallas que se tocaron.
- `npm audit` debe seguir en **0 vulnerabilidades**.
- Los cambios de presentación no tocan mecánica ni stores. Si un cambio visual
  obliga a tocar `store/`, hay pruebas que lo cubren: ejecútalas.
