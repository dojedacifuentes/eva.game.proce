# Checkpoint — 12 de septiembre de 2026 (v4 · móvil y mapa de flujo)

Estado del repositorio en este punto, con **lo que se midió y con qué número**.
Lo que no se pudo medir está dicho como tal, no dado por aprobado.

- Rama de trabajo: `claude/movil-mapa-flujo` · Producción: `main`
- Producción: [evagameproce.vercel.app](https://evagameproce.vercel.app)
- Qué cambió y por qué: [`ENTREGA-MOVIL-FLUJO.md`](ENTREGA-MOVIL-FLUJO.md)
- Cómo seguir: [`HANDOFF.md`](HANDOFF.md)

---

## 1 · Qué entró

| Commit | Qué trae |
|---|---|
| `d9f44cb` | Armazón de una sola pantalla, asistente de creación, EVA determinista, marca centralizada. |
| `f0a0a71` | Escala tipográfica con suelo de píxeles, mapa de ciudad, ambiente sonoro. |
| `ec5378b` | Sistema único `Modal`, diálogo de NPC jugable, NPC unificados. |
| `07ecc86` | Desbloqueo del avance en la entrada de jefe. |
| `188e10c` | Documentación y arnés de verificación versionado. |
| `337e188` | **v4.** Armazón fijo en todos los tamaños, mapa de flujo cenital, fondo estático, superficies opacas, Inter, jefes con interrogatorio de 5 fases, Entrenar y Perfil con pestañas, arnés en Windows. 41 archivos, +3 463 / −4 123. |
| *(este)* | **v5 · Sensación de juego.** Fluidez entre pantallas, ambiente por escena, háptica y aviso de nivel. Ver §1·bis. |

## 1·bis · Primera tanda de mejoras de sensación (v5)

Seis cambios elegidos por una razón común: cinco de los seis **conectan sistemas
que ya estaban escritos en el repositorio y nunca se llamaban**.

| Qué | Antes | Ahora |
|---|---|---|
| **Subir de nivel** | Invisible en el juego base: `store/useGame.ts` recalculaba `nivel` dentro del `set()` y nadie reaccionaba. La barra de XP se llenaba y volvía a cero en silencio. La expansión Reinos sí avisaba; el núcleo no | `components/shell/AvisoNivel.tsx`, montado una vez en el layout: aviso, arpegio, vibración y destello. La decisión de cuándo celebrar vive en `lib/progreso.ts`, con 7 pruebas |
| **Cambio de pantalla** | Ninguna de las 50 rutas tenía `loading.tsx` ni `template.tsx`: corte seco, y las rutas dinámicas se quedaban con la pantalla anterior congelada | `app/template.tsx` (entrada común) y `app/loading.tsx` (silueta del armazón) |
| **Espera entre preguntas** | 1,5 s fijos e insalvables. En una tanda de veinte, medio minuto mirando | `lib/useAvanceAutomatico.ts`: máximo adelantable con cualquier toque, Enter o flecha, con barra de progreso. 900 ms al acertar, 1,6-1,7 s al fallar (hay explicación que leer) |
| **Ambiente sonoro** | `lib/audio.ts` traía cinco modos escritos; sólo sonaba uno | Seis escenas —estudio, oral, ejecutivo, nulidad, recursos, cautelares— que cambian solas al navegar, con cruce de disolución |
| **Paleta de efectos** | 337 de 517 llamadas eran `click` o `hover`: navegar, elegir, abrir un modal y confirmar sonaban igual | `tap`, `back`, `abrir`, `cerrar`, `error` y `subidaNivel`, repartidos por la cabecera, la navegación, el sistema de modales y las actividades principales |
| **Vibración** | Cero `navigator.vibrate` en todo el repositorio | `lib/haptica.ts` en acierto, error e hito. Respeta `prefers-reduced-motion` |

Además, un fallo real que apareció al tocar ese código: en `SpeedrunVoF` y
`ArcadeClasificador` el reloj llamaba a `fallar()` **desde dentro del
actualizador de estado**. Al agotarse el tiempo la respuesta seguía sin
registrarse, el intervalo no se detenía y se volvía a fallar cada 100 ms:
sumaba fallos y saltaba varias preguntas de golpe. Corregido.

El riesgo principal de esta tanda era `app/template.tsx`: envuelve la pantalla
entera, y un `transform` ahí habría roto todos los `position: fixed`. Por eso
anima **sólo opacidad**, y por eso se volvió a medir el armazón completo en vez
de dar por hecho que un `<div>` de más no cambia nada.

Esta tanda se integró **sobre** la v4, que llegó a `main` mientras estaba en
curso. Las cifras de §2 son las del resultado combinado, medidas después de
resolver la fusión; no las de ninguna de las dos ramas por separado.

---

## 2 · Medición de hoy

Build de producción servido en `127.0.0.1:3100`, **Chrome del sistema en
Windows** (vía `scripts/verificacion/navegador.js`), perfil limpio y partida de
prueba.

### Código

| Comprobación | Resultado |
|---|---|
| `npm run lint` | Sin errores ni advertencias |
| `npm run typecheck` | Limpio |
| `npm test` | **44 / 44** en 5 archivos |
| `npm run build` | **46 / 46** páginas estáticas |
| `npm audit` | **0 vulnerabilidades** |

### Navegador

| Medición | Resultado |
|---|---|
| **Avance en móvil** (`avanzar.js`: 20 pantallas × 390×844 y 360×800) | **0 bloqueos**. Ahora exige además 0 px de scroll de documento y barra de acción dentro de la ventana |
| **Scroll y desborde** (`medir.js`: 7 rutas × 1366×768, 1440×900, 1024×768, 390×844, 360×800) | **0 px de scroll de documento en los 5 tamaños** (antes el móvil sí se desplazaba) · 0 px de desborde horizontal |
| **Modales** (`overlays.js`, los 8 con su gesto real) | **0 hallazgos** |
| **Contraste** (`contraste2.js`, 10 rutas, píxel pintado) | **416 textos** · 0 bajo 12 px · 0 bajo WCAG AA |
| **Accesibilidad** (`a11y.js`, 11 rutas) | **0 hallazgos** |
| **Recorridos** (`flujos.js`) | **31 / 31** |
| **Jugar interactuando** (`jugar.js`, 9 actividades en móvil) | **0 bloqueos** |

Un hallazgo corregido durante la medición: con la base sólida de `.btn`, el
botón «Aceptar evento» (`btn-recurso`) quedaba en 4,4:1. Los botones de
identidad usan ahora la variante de texto legible.

Esta tabla se volvió a medir entera **después de fusionar la v4 con la v5**, con
el servidor reiniciado sobre el build nuevo. Importa decirlo porque en el primer
intento un `next-server` viejo seguía ocupando el puerto y servía el build
anterior: es la trampa que el propio handoff documenta, y habría dado por buenas
unas cifras que no correspondían al código medido.

---

## 3 · Qué queda abierto

- Módulos heredados de Entrenar (Juicio ejecutivo, Arcade, Timeline, etc.):
  heredan armazón, tipografía y superficies, pero no se rediseñaron por dentro.
- **Resto del plan de sensación de juego**, propuesto y no empezado: música
  adaptativa por capas (tensión que entra con poca vida o poco reloj), control de
  volumen real en vez de un ciclo de tres estados, textura de superficie,
  retratos procedurales al frente, parallax en el mapa, iconografía jurídica en
  SVG en lugar de emoji, atajos de teclado en las actividades, racha y tiempo de
  sesión, y repaso espaciado de los fallos. La espera saltable ya está puesta en
  `SpeedrunVoF` y `ArcadeClasificador`; falta llevarla al resto de actividades
  con tiempos fijos.
- Mapa de Reinos del Derecho en el teléfono sin revisar con perfil de jurista.
- Civilis a 390 px: dos o tres etiquetas aún se tocan en una esquina del mapa.
- Decisiones de Diego: [`REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md)
  y [`NPC-TEXTOS-UNIFICADOS.md`](NPC-TEXTOS-UNIFICADOS.md).

---

## 4 · Lo que NO se verificó

1. **Contenido jurídico contra fuente oficial.** No se modificó ni se validó.
2. **Dispositivos físicos, Safari iOS y Firefox.** Tamaños emulados en Chrome.
3. **Jugadores reales.** Nadie ajeno al proyecto ha jugado esta versión.
4. **Audio.** La v5 lo reescribió a fondo —seis escenas de ambiente y una paleta
   de efectos separada por intención— y **no se ha oído ni una sola nota**: este
   entorno no tiene salida de audio. Se comprobó que arranca, cambia de escena y
   se detiene sin errores; el juicio de oído está pendiente y es de Diego.
5. **Vibración.** Tampoco se ha sentido: no hay dispositivo. Y en iPhone no va a
   notarse nunca, porque Safari de iOS no implementa `navigator.vibrate`.
6. **Combate completo contra cada jefe.** Se verificó la entrada, la primera
   fase y el avance; no las cinco fases de los siete jefes.

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
node scripts/verificacion/jugar.js
```

En Windows o macOS no hace falta descargar navegadores: `navegador.js` usa
Chrome o Edge instalados. Para forzar uno: `PW_CHROMIUM=/ruta/al/ejecutable`.
