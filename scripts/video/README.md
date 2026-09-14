# Material para video

Capturas y clips del juego para el video de lanzamiento. Mismo principio que
[`scripts/verificacion/`](../verificacion/README.md): navegador real sobre el
**build de producción**, perfil limpio y la **partida de prueba** del arnés —
nunca toca una partida personal.

Nada de esto es una maqueta. Si el juego cambia, se vuelve a correr y las
capturas cambian con él.

## Cómo generarlo todo

```bash
npm ci && npm run build
npx next start -p 3100            # dejar corriendo en otra terminal

node scripts/video/capturar.js    # 36 capturas (vertical y ancho)
node scripts/video/clips.js       # 6 clips con interacción real
```

`capturar.js` acepta un formato suelto: `node scripts/video/capturar.js vertical`.

## Qué sale

| Carpeta | Qué hay |
|---|---|
| `capturas/vertical/` | 18 PNG de 1080 × 1920 (9:16) — reels, TikTok, HeyGen |
| `capturas/ancho/` | las mismas 18 pantallas en 1920 × 1080 (16:9) |
| `clips/` | 6 clips de 1080 × 1920, en `.mp4` (H.264) y `.webm` |
| `deck/` | el deck del video y las piezas que lo componen |

Las 18 pantallas: portada, hub, mundos, misión, examen con su acierto **y su
error**, repaso, códex, oral, creación de personaje, expediente, las tres
expansiones, plazos, cartas y verdadero/falso.

Los 6 clips: cédula respondida y explicada, desafío de misión, recorrido de
mundos, mapa de campaña, códex y minijuego de plazos.

## Sobre el `.mp4`

Los clips salen de Playwright en `.webm` (VP8) y se convierten a `.mp4` si hay
un **ffmpeg completo** en el sistema. El que trae Playwright no sirve: es una
compilación mínima que sólo hace VP8 y rechaza hasta la opción `-preset`.
`clips.js` lo detecta buscando `libx264` en `ffmpeg -encoders`, así que no se
equivoca de binario.

```bash
brew install ffmpeg          # macOS
winget install ffmpeg        # Windows
```

Sin él, quedan los `.webm`, que CapCut y DaVinci abren igual.

## El deck

`deck/EVAGAMEPROCE-video.pptx` — 17 diapositivas a 9:16, al tamaño real del
video. El guion y la dirección de arte están en prosa en
[`docs/VIDEO.md`](../../docs/VIDEO.md).

Para regenerarlo:

```bash
npm i pptxgenjs                          # no es dependencia del juego
python3 scripts/video/deck/piezas.py     # velo y guías de avatar (necesita Pillow)
node scripts/video/deck/generar-deck.js
```

`piezas.py` existe porque pptxgenjs no dibuja degradados: el velo que oscurece
la parte baja del fotograma —para que el texto blanco se lea sobre una interfaz
que ya trae el suyo— tiene que entrar como PNG con transparencia.

## Por qué cada guion hace lo que hace

**`capturar.js` congela las animaciones antes de disparar.** El juego respira:
los paneles entran con `spring`, los jefes flotan, los anillos giran. Sin
congelar, una de cada tres capturas salía a medio camino. Se inyecta
`animation:none` justo antes del `screenshot`, no antes de cargar, para que la
pantalla llegue a su estado final y ahí se quede.

**Algunas capturas responden una pregunta antes de disparar.** El estado inicial
de una actividad no vende nada: la pantalla que vende es la de después, con el
verde del acierto o el rojo del error. Por eso existen `05-mision-fb` y
`07-examen-fb`.

**Los clips cierran el contexto, no la página.** Playwright sólo termina de
escribir el vídeo cuando se cierra el `BrowserContext`. Cerrar la página deja un
archivo truncado.
