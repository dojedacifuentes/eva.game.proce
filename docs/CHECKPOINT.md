# Checkpoint — 13 de septiembre de 2026 (v5.2 · sensación de juego y repaso)

Estado del repositorio en este punto, con **lo que se midió y con qué número**.
Lo que no se pudo medir está dicho como tal, no dado por aprobado.

- Rama de trabajo: `claude/tender-mayer-j60b5g` · Producción: `main`
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
| `35f5ea2` `495a0d2` `0bedf5b` | **v5 · Sensación de juego.** Fluidez entre pantallas, ambiente por escena, háptica y aviso de nivel. Ver §1·bis. |
| `d2772f3` | **v5.1.** Racha de estudio, atajos de teclado y control de volumen real. Ver §1·ter. |
| *(este)* | **v5.2 · Repaso espaciado.** Ver §1·quater. |

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

## 1·ter · Segunda tanda: el juego responde

| Qué | Antes | Ahora |
|---|---|---|
| **Constancia** | Nada medía si el jugador vuelve, que es lo único que decide un examen de grado | `lib/racha.ts`: días seguidos con **actividad real**, no visitas. Sólo avanza desde `gainXp` y `completarMision`. Día en hora local, no UTC. 15 pruebas: cambio de mes, de año, 29 de febrero y reloj movido hacia atrás |
| **Responder con el teclado** | Había que llevar la mano al ratón en cada pregunta | `lib/useAtajosAlternativas.ts`: teclas **1-9 y A-I**, en misiones, cédula e interrogatorio. Se apagan mientras hay respuesta en pantalla y nunca roban teclas a un campo de texto ni a un diálogo |
| **Volumen** | No existía: encendido o apagado, con la ganancia fijada en el código | `setVolumen()` con rampa corta —para que no chasquee al mover el control mientras suena el ambiente— y memoria por navegador |
| **Elegir qué suena** | Un botón que ciclaba entre tres estados sin decir cuáles eran | `PanelAudio`: los tres modos a la vista, con su explicación, más el volumen |

La racha añade cuatro campos al guardado. No hace falta migración: `sanearEstado`
rellena las claves ausentes, así que una partida anterior empieza la racha en
cero sin perder nada de lo suyo.

**Medido después de esta tanda**, sobre el build de producción: lint y typecheck
limpios, **67/67** pruebas, build **46/46**, **9/9** modales sin hallazgos —el
panel de sonido entra al arnés—, **0** pantallas sin poder avanzar en móvil, **0
px** de scroll de documento y de desborde en los cinco tamaños, **336 textos**
sin ninguno bajo 12 px ni bajo AA, y **0** hallazgos de accesibilidad.

Las teclas y la racha no se ven en una captura, así que tienen guion propio,
`teclado.js`: **9/9**. Su primera versión pasaba **en vacío** —comprobaba la
racha contra la cédula, que no otorga XP hasta la última pregunta, de modo que
nunca llegaba a escribirse—; ahora juega una misión entera y comprueba que la
racha se abre en 1 con la fecha local de hoy, y que limitarse a navegar no la
toca.

## 1·quater · Tercera tanda: repaso espaciado

Lo que **fallas** entra en un mazo y vuelve cuando toca. De todo lo propuesto es
lo que más debería notarse en el examen, porque no añade contenido: cambia
*cuándo* ves el que ya hay.

| Pieza | Qué hace |
|---|---|
| `lib/repaso.ts` | Intervalos de 1, 3, 7, 16 y 35 días. Fallar devuelve la ficha al principio; cinco aciertos seguidos la sacan del mazo. 24 pruebas |
| `lib/bancoRepaso.ts` | Unifica los tres bancos —cédula, verdadero/falso y alternativas de grado, 105 preguntas— bajo una sola forma. Los identificadores se derivan del **texto**, no de la posición: reordenar un banco no mezcla historiales. 6 pruebas, una de ellas comprueba que en las alternativas de grado la letra marcada como correcta existe de verdad entre las opciones |
| `app/repaso/page.tsx` | Sirve tandas de hasta 12, con las teclas, la espera saltable y la háptica de las tandas anteriores |
| `data/cedula.ts` | Las preguntas de `/examen` salen de dentro de la página a `data/`, para que el repaso pueda volver a servirlas. El contenido no se tocó |

La fila de repaso encabeza la pestaña Campaña de Entrenar y dice cuántas vencen
hoy.

**Sobre los intervalos**: son una progresión razonable elegida por criterio de
diseño. **No** están calibrados con datos de este juego, ni son un protocolo
validado, ni hay medición de que mejoren el resultado de nadie en el examen.

**Medido después de esta tanda**: lint y typecheck limpios, **97/97** pruebas,
build **47/47**, **9/9** modales, **0** pantallas sin poder avanzar en móvil,
**0 px** de scroll de documento y de desborde en 9 rutas × 5 tamaños, **455
textos** sin ninguno bajo 12 px ni bajo AA, **0** hallazgos de accesibilidad y
**31/31** recorridos.

El repaso tiene su propio guion de punta a punta, `repaso.js`: **18/18**. Falla
una pregunta de verdad en la cédula, comprueba que nace la ficha, adelanta el
reloj del mazo, ve que `/repaso` la sirve, y —leyendo del propio juego cuál era
la correcta— la acierta a propósito para comprobar que el siguiente repaso se va
a exactamente tres días. Esa última comprobación se añadió porque la anterior
admitía las dos ramas y, por sí sola, no demostraba nada.

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
  adaptativa por capas (tensión que entra con poca vida o poco reloj), textura de
  superficie, retratos procedurales al frente, parallax en el mapa e iconografía
  jurídica en SVG en lugar de emoji.
- El repaso espaciado se alimenta hoy de la cédula y del verdadero/falso. Las
  alternativas de grado ya son repasables desde `bancoRepaso`, pero el módulo
  que las juega todavía no anota sus fallos.
- La espera saltable y los atajos de teclado están en las actividades
  principales; faltan los módulos heredados de Entrenar.
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
