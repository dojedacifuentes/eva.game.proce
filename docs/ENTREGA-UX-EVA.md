# Entrega — rediseño UX, EVA y marca

Rama: `claude/tender-mayer-j60b5g` · Fecha: 2026-09-12

---

## 1. La prioridad explícita: una sola pantalla en escritorio

**Medido en navegador real (Chromium), no estimado.** Altura del documento frente
a la de la ventana, con una partida de prueba cargada:

| Ruta | 1366×768 | 1440×900 | 1024×768 | Desborde horizontal |
|---|---|---|---|---|
| `/` (portada) | 768 / 768 → **0 px de scroll** | 900 / 900 → **0** | 768 / 768 → **0** | 0 |
| `/juego` (hub) | **0** | **0** | **0** | 0 |
| `/creacion` | **0** | **0** | **0** | 0 |
| `/mundos` | **0** | **0** | **0** | 0 |
| `/inventario` | **0** | **0** | **0** | 0 |
| `/expansion` | **0** | **0** | **0** | 0 |
| `/oral` | **0** | **0** | **0** | 0 |
| `/reinos` `/civilis` `/procesal` | **0** | **0** | **0** | 0 |
| `/codex` | desplazable **a propósito** | — | — | 0 |

Para comparar: la auditoría previa medía el hub en **~1382 px de documento** a
1366×768, con el mapa empezando cerca del píxel 624.

`/codex` es la excepción deliberada que pedía el encargo: lectura larga con
desplazamiento cómodo en vez de una pantalla comprimida.

### Cómo se consiguió

- **`components/shell/GameShell.tsx`** — armazón reutilizable con tres variantes
  (`app`, `focus`, `reader`). Reparte el alto con grid y `min-height: 0`.
- El bloqueo del scroll **sólo se activa a partir de 1024×620**. En móvil, en
  ventanas bajas y con el texto ampliado se suelta solo. Verificado también a
  **1366×560** y a **683×384** (equivalente a 1366×768 con zoom al 200 %).
- **Nada se resolvió ocultando contenido.** Se comprobó, en los cuatro perfiles,
  que ningún elemento queda recortado sin scroll propio y que, con el documento
  desplazado hasta el fondo, ningún control queda bajo la barra inferior.

---

## 2. Qué se movió y qué se quitó del hub

| Elemento | Antes | Ahora | Por qué |
|---|---|---|---|
| PortalReinos / PortalCivilis / PortalProcesal | Encima del mapa, empujándolo fuera de la ventana | Pantalla **Mundos** (`/mundos`) y tarjeta en el hub | Rutas y mecánicas intactas; sólo cambia desde dónde se llega |
| Atributos detallados | Columna izquierda del hub | Perfil (`/inventario`) | Competían con la misión |
| Registro de actividad | Columna izquierda | Perfil | Ídem |
| Reliquias equipadas | Columna izquierda | Perfil | Ídem |
| Logros | Columna derecha | Perfil | Ídem |
| **Noticias Jurídicas** | Columna derecha | **Retirado del producto** | Cuatro titulares con forma de noticia real, **sin fuente ni fecha** |
| Eventos Activos | Columna derecha | Retirado | Atajos duplicados a `/oral`, `/inventario` y `/mundo`, ya en la navegación |

El hueco lo ocupa el panel de EVA.

---

## 3. HUD y cabeceras: una sola responsabilidad

`HUDPersistente` dibujaba **cuatro paneles `position: fixed`** en las esquinas
(identidad, XP, stats, reloj, audio). Ahora todo eso vive en la cabecera del
shell, que ocupa su propia fila del grid. El HUD conserva sólo la
realimentación efímera: el «+XP», el «+monedas» y el barrido CRT.

Eso permitió retirar el parche `pt-12 md:pt-0` de los tres layouts de expansión,
que existía justo para esquivar el HUD fijo en móvil.

`components/game/GameNav.tsx` se eliminó: lo sustituye
`components/shell/ShellNav.tsx`.

---

## 4. Móvil

- Navegación inferior de **cinco destinos**: Inicio · Entrenar · Oral · Mundos · Perfil.
- **Nota sobre el reparto:** el encargo sugería «Inicio, Entrenar, Oral, Progreso
  y Perfil». Aquí «Progreso» no tiene pantalla propia porque el progreso (nivel,
  XP, logros, reliquias, casos) ya vive dentro de Perfil → `/inventario`. Ese
  hueco lo ocupa «Mundos», que es donde el propio encargo pide llevar las tres
  expansiones. Ningún destino es una pantalla vacía.
- Objetivos táctiles de **44×44 CSS px** como mínimo (verificado).
- `env(safe-area-inset-bottom)` respetado, con `viewport-fit=cover` en el layout.
- **Cero desbordamiento horizontal** en las 11 rutas medidas × 5 tamaños.
- En el hub móvil la acción principal (EVA · tu próximo paso) va **primera**, y el
  mapa se sustituye por la lista de misiones, que es la alternativa clara para
  elegir a dónde ir. El interruptor Mapa/Lista sigue disponible.

---

## 5. Empezar y crear personaje

- **Portada:** una sola acción principal, decidida por el estado real de la
  partida («Comenzar» o «Continuar partida»). Antes había cinco botones del mismo
  peso más cuatro accesos al pie.
- **Asistente de cuatro pasos:** Nombre → Origen → Rol → Confirmar. Controles de
  avance siempre visibles, fuera de la zona desplazable.
- **Partida rápida:** sólo el nombre. El paso de confirmación explica, con esas
  palabras, que *«estás usando la configuración recomendada: no la elegiste tú, la
  puse yo»*, y ofrece personalizar.
- **Se conservan todas las opciones** de personalización, incluida la de sexo,
  agrupada en el paso de confirmación.
- **Borrador** en `localStorage`, que se limpia al terminar. Volver atrás conserva
  los datos.
- Los atributos se calculan **siempre desde la base limpia**, así que ir y volver
  entre pasos no acumula bonificaciones (hay una prueba automática para esto).
- EVA explica cada origen y cada rol en lenguaje llano.

> **Sobre los 30 segundos:** en el recorrido automatizado, de la portada a la
> partida creada pasan **~0,9 s de navegación**, sin contar lo que tarde una
> persona en escribir su nombre y leer. **Esto no es una métrica validada con
> usuarios** y no debe presentarse como tal.

### Protección de la partida

Antes, «Firmar y comenzar» llamaba a `reset()` y luego a `setPersonaje()`, **sin
avisar**. Ahora:

- Abrir `/creacion` **no** borra nada. Se muestra un aviso con la partida en curso
  y un enlace para continuarla.
- Cancelar **no** borra nada.
- Reemplazar abre un diálogo modal con gestión de foco que nombra lo que se
  perderá. **Sólo tras el «sí» se toca el estado guardado.**
- Hay un único camino destructivo en el store: `iniciarPartida`.

Verificado en navegador: con el diálogo abierto, `localStorage` sigue intacto.

---

## 6. EVA

- **`lib/eva.ts`** — motor determinista. Reglas legibles, contenido existente,
  **sin llamadas a modelos, claves, costos ni backend**.
- En el hub: «Tu próximo paso», con la actividad recomendada, un botón que la abre
  y **siempre** la razón concreta («Es la última pendiente del Acto 1: al
  terminarla se abre el jefe»).
- En creación: explica el paso y cada opción.
- Si no hay datos de debilidades, **no inventa diagnósticos**: ofrece continuar
  campaña o elegir materia (`SIN_DATOS` y `ALTERNATIVAS` en `lib/eva.ts`).
- El panel lleva impreso: *«Recomendación calculada con tu progreso guardado. Sin
  análisis externo.»*

**Un fallo encontrado y corregido por las pruebas:** la primera versión del motor
nunca habría recomendado un jefe, porque daba un acto por cerrado en cuanto sus
misiones estaban hechas. Ahora lee los logros (`campaign_boss_<id>`, que es lo que
el juego ya graba al vencer) y sólo pasa de acto cuando el jefe está vencido.

---

## 7. Marca y asset provisional de EVA

- **`lib/brand.ts`** centraliza nombre, créditos, colores y rutas de assets.
- Nombre confirmado en el repositorio: **FORO [in]VISIBLE** (metadatos de
  `app/layout.tsx` y composición de la portada). Se respeta tal cual.
- Textos: «Una experiencia EVA de Proyecto01» y «Creada por Diego Ojeda».
- **No se inventó** el significado de la sigla EVA, ni biografía, personalidad,
  rostro o apariencia humana, ni relaciones empresariales, ni credenciales de
  Diego, ni avales, cifras de usuarios o promesas de aprobación.

### 🔻 Asset provisional de EVA — dónde reemplazarlo

**Archivo:** `components/shell/EvaMark.tsx`
**Qué es:** un monograma tipográfico abstracto dibujado en SVG — un rombo de
líneas con las letras «EVA». Deliberadamente **no** es un rostro ni una figura
humana. En `public/` no había ningún material de EVA ni de Proyecto01.

**Para sustituirlo por el oficial:**

1. Deja el archivo en `public/` (por ejemplo `public/eva-oficial.svg`).
2. En **`lib/brand.ts`**, cambia una línea:
   ```ts
   export const EVA = {
     // …
     assetSrc: "/eva-oficial.svg",   // antes: null
     assetEsProvisional: false,
   }
   ```

No hay que tocar nada más: `EvaMark` lo detecta y deja de dibujar el provisional.

---

## 8. Calidad técnica

| Punto | Antes | Ahora |
|---|---|---|
| **Migración de partidas** | `migrate: () => ({...INIT})` — **borraba la partida en cada cambio de versión** | Migración que conserva lo guardado y sólo rellena lo que falta. 8 pruebas |
| **Hidratación** | `/juego` mostraba «sin personaje» antes de leer el guardado | Estado de carga estable; verificado en 14 fotogramas seguidos sin un solo destello |
| **Advertencias de hooks** | 18 | **0**, sin silenciar ninguna regla |
| **Fuentes** | `<link>` a fonts.googleapis.com, que **bloquea el primer render** | `next/font`, servidas desde el propio dominio |
| **Peso de `/expansion`** | 97,9 kB de JS de página | **14,5 kB** (21 módulos con carga diferida) |
| **Pruebas** | ninguna | **37**, en CI |
| **Nombres accesibles** | 1 `aria-label` para 297 botones | 0 controles sin nombre en 13 rutas |
| **Foco visible** | sin reglas `:focus-visible` | regla global |
| **`safe-area-inset`** | sin usar | aplicado en la barra inferior |
| **Vulnerabilidades** | — | `npm audit`: **0** (Next ya estaba en 15.5.25; el aviso de la auditoría estaba desactualizado) |

### Dos fallos latentes encontrados por el camino

1. **`body { animation: uiBreathe }` aplicaba `filter` al `<body>`.** Un filtro
   convierte al elemento en **bloque contenedor de todos sus descendientes
   `position: fixed`**. La barra inferior y los diálogos modales se anclaban al
   documento en vez de a la ventana: en una página larga aparecían a 2.000 px del
   borde. Corregido moviendo el pulso a una capa fija propia, sin hijos.
2. **Temporizadores con cierre caducado.** `ArcadeClasificador` y `SpeedrunVoF`
   llamaban a `fallar()` desde un `setInterval` sin declararla; el intervalo se
   quedaba con valores de combo e índice de un render anterior. Corregido con
   `lib/useCallbackRef.ts`.

### Respaldo de partida (añadido)

Perfil → «Exportar / Importar partida». Las partidas viven en `localStorage`, que
es **por dominio**: quien jugara en el sitio original no tenía forma de llevarse
su avance a esta copia. Ahora sí. Importar también pide confirmación.

---

## 9. Contenido jurídico

**No se modificó ni una palabra del contenido jurídico.** El encargo pedía
contrastar contra BCN/LeyChile y no corregir de memoria; en este entorno la
política de salida a internet **bloquea esos dominios**.

Lo que sí se hizo:

- Se documentaron, con archivo y línea, las **contradicciones internas** del
  repositorio, que son demostrables sin salir del proyecto. La principal: el juego
  enseña ultra petita como **768 N°4** en seis lugares y como **768 N°2** en
  `data/casos-investigativos.ts`.
- Se retiró del hub el panel de noticias sin fuente.
- Se añadió soporte **opcional** de procedencia (`types/procedencia.ts` +
  `components/shell/FichaProcedencia.tsx`), que sólo se muestra si está rellena.
  **No se marcó nada como verificado**, porque no se pudo verificar nada.

Detalle completo: [`docs/REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md).

**No se revisó el resto del banco de preguntas.** Nada de este trabajo permite
afirmar que el banco esté validado.

---

## 10. Resultados de verificación

```
npm run lint       0 errores, 0 advertencias   (antes: 18 advertencias)
npm run typecheck  sin errores
npm test           37 pruebas, 4 archivos, todas correctas
npm run build      Compiled successfully · 46/46 páginas
npm audit          0 vulnerabilidades
```

**Navegador (Chromium, servidor de producción):**

```
Mediciones      11 rutas × 5 tamaños → 0 desborde horizontal
                0 scroll de documento en escritorio (salvo /codex, a propósito)
Alcanzabilidad  4 perfiles (normal, ventana baja, zoom 200 %, móvil) → sin
                recortes ni controles inalcanzables
Accesibilidad   13 rutas → 0 controles sin nombre, 0 campos sin etiqueta
Flujos          28 comprobaciones → 28 correctas
```

### Lo que NO se pudo verificar

- **Contenido jurídico contra fuente oficial.** `www.bcn.cl`, `leychile.cl` y
  `diariooficial.interior.gob.cl` están bloqueados por la política de egreso del
  entorno. **No está aprobado, está pendiente.**
- **Compatibilidad con datos anteriores reales.** Las pruebas de migración usan un
  save construido a mano con la forma de la versión 2. No hubo acceso a una
  partida real de `rpgproce.vercel.app`. Conviene probar exportando una partida
  real antes de desplegar.
- **Navegadores distintos de Chromium.** No hay Firefox ni WebKit en el entorno.
- **Dispositivos físicos.** Los tamaños móviles son emulados.
- **El objetivo de «30 segundos» con usuarios reales.** Sólo se midió el tiempo de
  navegación de la automatización.

---

## 11. Capturas

Se generaron capturas reales a 1366×768 y 390×844 de portada, hub, creación y
mundos durante la verificación. No se versionan en el repositorio para no
engordarlo; se pueden regenerar levantando `npm run build && npm start` y
apuntando cualquier navegador a las rutas.
