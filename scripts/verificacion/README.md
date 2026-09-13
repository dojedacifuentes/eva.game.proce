# Arnés de verificación

Comprobaciones en navegador real (Chromium vía Playwright) sobre el build de
producción. Existen porque las pruebas unitarias no ven lo que el jugador ve:
cada uno de estos guiones nació de un fallo que se coló.

## Antes de ejecutar

```bash
npm run build
npx next start -p 3100          # dejar corriendo en otra terminal
```

Todos apuntan a `http://127.0.0.1:3100`.

Playwright usa el Chromium del sistema. Si no está en la ruta por defecto,
ajusta `executablePath` en cada guion.

## Qué comprueba cada uno

| Guion | Qué mide | Nació de |
|---|---|---|
| `medir.js` | Scroll de documento y desborde horizontal en 5 resoluciones | La regla de «una pantalla» del encargo original |
| `interno.js` | Que cada actividad **quepa entera**, sin desplazamiento interno | Actividades donde había que bajar para llegar al botón |
| `avanzar.js` | Que en móvil exista un control de avance **dentro de la ventana** y no bajo la barra | La entrada de jefe: sus botones caían 15 px por debajo del borde y nada se desplazaba |
| `jugar.js` | Lo mismo, pero **interactuando**: responde y vuelve a medir | El estado inicial pasaba; el estado tras responder, no |
| `overlays.js` | Abre cada modal con su gesto real y mide dentro: fondo opaco, tamaño, contraste, duplicados, `role="dialog"`, foco, Escape | El modal de NPC salía sin fondo y duplicado, y el arnés anterior **no hacía ni un clic** |
| `contraste2.js` | Contraste WCAG AA **sobre el píxel realmente pintado** (captura → canvas → muestreo) | Deducirlo del CSS daba falsos positivos en los dos sentidos |
| `a11y.js` | Controles sin nombre accesible y campos sin etiqueta | 296 de 297 botones no tenían nombre |
| `teclado.js` | Que las teclas respondan alternativas, que se apaguen con la respuesta a la vista, que no roben teclas a un campo de texto, y que la racha cuente días de estudio y no visitas | Ninguna de esas cosas se ve en una captura: hay que pulsar |
| `repaso.js` | El repaso espaciado de punta a punta: fallar una pregunta de verdad, que nazca la ficha, que `/repaso` la sirva el día que vence y que acertarla aleje el siguiente repaso a tres días exactos | Las pruebas unitarias cubren el motor y el banco por separado; la cadena completa, ninguna |
| `capturar.js`, `capmodal.js` | Capturas de pantalla | Revisión visual |

## Uso

```bash
node scripts/verificacion/medir.js /juego /creacion /mundos
node scripts/verificacion/interno.js /mision/m1_3 /examen
node scripts/verificacion/avanzar.js          # lista de rutas fija
node scripts/verificacion/overlays.js         # lista de overlays fija
node scripts/verificacion/contraste2.js /juego /codex
node scripts/verificacion/a11y.js / /juego /creacion
```

Las capturas se guardan en `scripts/verificacion/capturas/` (ignorado por git).

## Datos de prueba

`fixtures/save-prueba.json` y `fixtures/save-expansiones.json` se inyectan en
`localStorage` antes de cada medición. **Nunca se toca una partida real**: el
navegador automatizado usa un perfil limpio.

El de expansiones lleva contenido **desbloqueado** a propósito; sin él, las
fichas del códex y la biblioteca salen con candado y sus modales no llegan a
abrirse.

## Cobertura de overlays

Los nueve se abren con su gesto real y se miden por dentro:

`npc-zona` · `audio-panel` · `evento-zona` · `creacion-reemplazo` ·
`inventario-importar` · `reinos-biblioteca` · `civilis-codex` ·
`civilis-cartas` · `civilis-bestiario`

Dos tienen truco y conviene saberlo antes de tocarlos:

- **`evento-zona`** usa `/mundo/conciliacion` a propósito: es una de las pocas
  rutas sin escenas narrativas por delante (`escenasMundo` lo deja vacío) y su
  zona, `cosajuzgada`, es la que más eventos trae. En `/mundo/competencia` el
  explorador de zona no se monta hasta terminar la narrativa.
- **`inventario-importar`** adjunta un JSON al input oculto con `setInputFiles`,
  que es lo que hace el jugador con el selector de archivos.

## Limitaciones reales

- Sólo hay Chromium en este entorno: no se prueba Firefox ni WebKit.
- Los tamaños móviles son emulados, no dispositivos reales.
- El combate contra jefes no se recorre entero: se comprueba la entrada
  (`BossEntry`) pero no una partida completa de preguntas.
