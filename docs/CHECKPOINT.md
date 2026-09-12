# Checkpoint — 12 de septiembre de 2026

Estado del repositorio en este punto, con **lo que se midió y con qué número**.
Lo que no se pudo medir está dicho como tal, no dado por aprobado.

- Rama de trabajo: `claude/tender-mayer-j60b5g` · Producción: `main`
- Producción: [evagameproce.vercel.app](https://evagameproce.vercel.app)
- Cómo seguir: [`HANDOFF.md`](HANDOFF.md)

---

## 1 · Qué entró

Desde `3f98d9e` (la copia recién desplegada en Vercel) hasta hoy:
**117 archivos, +8 414 / −3 338**.

| Commit | Qué trae |
|---|---|
| `d9f44cb` | **Armazón de una sola pantalla.** `GameShell` con tres variantes sobre `100dvh`; todas las rutas quedan dentro de él, directamente o por el layout de su expansión. Asistente de creación + partida rápida, protección del guardado, EVA determinista, marca centralizada en `lib/brand.ts`. 65 archivos. |
| `f0a0a71` | **Legibilidad y mundo.** Escala tipográfica con suelo de píxeles, mapa de ciudad con arquitectura jurídica, cada actividad cabe entera, ambiente sonoro generado. 48 archivos. |
| `ec5378b` | **Modales.** Sistema único `Modal` opaco y accesible, diálogo de NPC rehecho como escena jugable, NPC unificados en una sola fuente. 25 archivos. |
| `07ecc86` | **Móvil.** Desbloquea el avance en la entrada de jefe, sube la escala tipográfica, opaca los paneles restantes. 4 archivos. |
| *(este)* | Documentación (README, checkpoint, handoff), arnés de verificación versionado en `scripts/verificacion/`, ajuste de densidad que cierra el último desborde y actualización de dependencias a 0 vulnerabilidades. |

---

## 2 · Medición de hoy

Ejecutado sobre el **build de producción** servido en `127.0.0.1:3100`, con
Chromium real, perfil limpio y partida de prueba.

### Comprobaciones de código

| Comprobación | Resultado |
|---|---|
| `npm run lint` | Sin errores **ni advertencias** |
| `npm run typecheck` | Limpio |
| `npm test` | **37 / 37** en 4 archivos |
| `npm run build` | Correcto · **46 / 46** páginas estáticas · 50 rutas |
| `npm audit` | **0 vulnerabilidades** |

### Comprobaciones en navegador

| Medición | Resultado |
|---|---|
| **Avance en móvil** (18 pantallas × 390×844 y 360×800) | **0 pantallas donde no se pueda avanzar** |
| **Modales** (los 8, abiertos con su gesto real) | **0 hallazgos**: fondo opaco, texto sobre el mínimo, contraste AA, sin duplicados, sin recorte, `role="dialog"`, Escape cierra |
| **Una sola pantalla** (7 rutas × 1366×768, 1440×900, 1024×768) | **0 px de scroll de documento** en las tres resoluciones. Única excepción: `/codex`, deliberada (variante `reader`, lectura larga) |
| **Desborde horizontal** (esas 7 rutas × 5 resoluciones, móvil incluido) | **0 px** en todas |
| **Contraste y tamaño de texto** (10 rutas, medido sobre el píxel pintado) | **394 textos** · **0 bajo el mínimo de 12 px** · **0 bajo WCAG AA** |
| **Accesibilidad** (11 rutas: nombres accesibles y etiquetas) | **0 hallazgos** |
| **Recorridos de juego** (6 flujos completos, interactuando) | **28 comprobaciones correctas · 0 fallidas** |

Los seis recorridos son: crear partida rápida, personalizar y volver entre pasos,
protección de la partida existente, persistencia sin destello de «sin personaje»,
misión + códex + las tres expansiones, y móvil a 390×844 (sin desborde,
navegación de 5 destinos como máximo, barra inferior visible, acción principal
arriba).

**Un número que conviene leer bien:** el recorrido automatizado llega de la
portada a partida guardada en **0,9 s**. Eso es tiempo de máquina, no de persona.
El objetivo de «crear personaje en unos 30 s» sigue siendo una **meta de diseño
sin validar con usuarios**.

### Encaje interno, con matiz

`interno.js` mide si la región desplazable de cada pantalla necesita
desplazamiento. A 1366×768 y 1440×900:

| Pantalla | Resultado |
|---|---|
| `/juego`, `/mision/m1_3`, `/examen`, `/creacion`, `/civilis/vof`, `/procesal/plazos` | **Caben enteras**: ninguna actividad obliga a desplazarse para llegar a su acción |
| `/oral`, `/inventario`, `/expansion` | Usan su **región desplazable interna** (347, 514 y 800 px a 1366×768) |

Las tres últimas son **listas**, no actividades: la parrilla de jefes, el
expediente y el catálogo de expansiones. El encargo permitía explícitamente el
desplazamiento interno accesible para paneles largos; lo que prohibía era el
scroll de documento y resolver el encaje recortando. Ninguna de las tres recorta
contenido ni deja su acción fuera de alcance — y las tres pasan la prueba de
avance en móvil.

---

## 3 · Qué queda abierto

### Interfaz, ya especificada en el repositorio

- **Combate** (`CampaignBossBattle`, `InterrogacionOral`) según
  `direccion-creativa/05_UX_DIRECTION.md` §2. No empezado.
- **Inventario** (`InventarioPanel`) según §4 del mismo documento. No empezado.

### Decisiones de Diego

- [`REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md):
  contradicciones internas de contenido sin resolver. La principal, la ultra
  petita enseñada como art. 768 N°4 en seis lugares y como 768 N°2 en
  `data/casos-investigativos.ts`.
- [`NPC-TEXTOS-UNIFICADOS.md`](NPC-TEXTOS-UNIFICADOS.md): el rasgo de carácter de
  5 de 6 personajes cambió al unificar los NPC.

---

## 4 · Lo que NO se verificó

Dicho explícitamente, porque el encargo lo pedía así.

1. **El contenido jurídico no se contrastó contra fuente oficial.** La política de
   salida a internet del entorno bloquea `bcn.cl`, `leychile.cl` y el Diario
   Oficial. **No se modificó ni una palabra** del banco de preguntas ni del códex,
   y **no se validó ninguna parte** de ellos. Lo único documentado son
   contradicciones internas, demostrables sin salir del repositorio.
2. **Sólo se probó en Chromium.** Ni Firefox ni WebKit: no están en el entorno.
3. **Los tamaños móviles son emulados**, no dispositivos reales. No se probó
   táctil real, ni Safari iOS, ni la barra de direcciones que aparece y
   desaparece.
4. **El ambiente sonoro no se ha escuchado.** Se comprobó que arranca y se detiene
   sin errores; el entorno no tiene salida de audio. Falta juicio de oído.
5. **El combate contra jefes no se recorrió entero**: se mide la entrada
   (`BossEntry`), no una partida completa de preguntas.
6. **No hay prueba con usuarios.** El objetivo de «crear personaje en ~30 s» es
   una meta de diseño, no una métrica validada: nadie ajeno al proyecto lo ha
   cronometrado.

---

## 5 · Cómo reproducir estas cifras

```bash
npm ci
npm run lint && npm run typecheck && npm test && npm run build

npx next start -p 3100        # dejar corriendo en otra terminal
npm run verificar             # avance en móvil + los 8 modales
npm run verificar:medidas     # scroll de documento y desborde horizontal
npm run verificar:contraste   # WCAG AA sobre píxel pintado
npm run verificar:a11y        # nombres accesibles
npm run verificar:flujos      # recorridos de juego
```

Detalle de cada guion: [`../scripts/verificacion/README.md`](../scripts/verificacion/README.md).
