# Video de lanzamiento — guion y dirección de arte

Un video vertical de **40 segundos** para Instagram, TikTok y YouTube Shorts.
La cara y la voz las pone un avatar de HeyGen; el resto es el juego, capturado
del build de producción.

- **Deck con el storyboard:** [`scripts/video/deck/EVAGAMEPROCE-video.pptx`](../scripts/video/deck/EVAGAMEPROCE-video.pptx) — 17 diapositivas a 9:16, una por escena, con la indicación de montaje en las notas del orador.
- **Materiales:** [`scripts/video/`](../scripts/video/README.md) — 36 capturas y 6 clips, regenerables.

---

## Decisión pendiente de Diego: la cara de EVA

Esto hay que resolverlo **antes** de publicar, no después.

[`lib/brand.ts`](../lib/brand.ts) dice, a propósito y por escrito, que EVA no
tiene rostro ni apariencia humana, y que el monograma de
`components/shell/EvaMark.tsx` es un **tratamiento provisional**. El avatar de
HeyGen le pone una cara, y el guion cierra con «Eva fuera»: eso la convierte en
personaje.

Hay dos caminos coherentes. El peor es no elegir.

1. **El avatar ES Eva.** Entonces deja de ser provisional: el archivo se deja en
   `public/`, se apunta `EVA.assetSrc` en `lib/brand.ts`, y el juego y el video
   muestran la misma imagen. `EvaMark` lo detecta solo y deja de dibujar el
   monograma; no hay que tocar ningún otro archivo.
2. **El avatar presenta el juego, pero no es Eva.** Entonces el guion no puede
   cerrar con «Eva fuera». Cambiar esa línea basta.

Si eliges 1 y no tocas el repositorio, la cara vive sólo en Instagram y el juego
sigue mostrando un monograma abstracto: dos marcas distintas para la misma cosa.

---

## El guion, escena por escena

Diez escenas. Cada bloque de **VOZ** se pega tal cual en HeyGen, en su propia
escena: es la única forma de controlar las pausas.

| # | Tiempo | En pantalla | Fuente |
|---|---|---|---|
| 1 | 0:00 – 0:03 | ¿Por quinta vez? | Avatar, plano cerrado |
| 2 | 0:03 – 0:05 | Qué adorable. | Avatar, plano medio |
| 3 | 0:05 – 0:09 | Leer no es aprender. | `06-examen.png` |
| 4 | 0:09 – 0:13 | Convierte el sufrimiento en juego. | `02-hub.png` |
| 5 | 0:13 – 0:16 | EVAGAMEPROCE | `01-portada.png` |
| 6 | 0:16 – 0:21 | Tu cerebro orgánico, a prueba. | `10-oral.png` · `clips/oral.mp4` |
| 7 | 0:21 – 0:26 | ¿Cuánto sabes realmente? | `04-mision.png` · `clips/mision.mp4` |
| 8 | 0:26 – 0:30 | O cuánto creías saber. | `07-examen-fb.png` · `clips/examen.mp4` |
| 9 | 0:30 – 0:36 | Juega gratis. | Avatar, plano medio |
| 10 | 0:36 – 0:40 | Link en la bio. Eva fuera. | Avatar, plano cerrado |

En cada escena la captura fija y el clip son **la misma pantalla**: el clip es
la versión en movimiento del plano, no otro plano. Si montas con la captura o
con el clip, el video es el mismo.

**VOZ, completa y en orden:**

```
1.  ¿Leyendo tus apuntes por quinta vez para el grado?
2.  Qué adorable.
3.  Pero leer no significa necesariamente que aprendiste.
4.  Así que convierte tu sufrimiento académico en un videojuego.
5.  EVAGAMEPROCE.
6.  Un juego diseñado para poner a prueba tu cerebro orgánico…
7.  Y descubrir cuánto sabes realmente.
8.  O cuánto creías saber.
9.  Juega gratis. Y sígueme para aprender a crear prototipos como este.
10. Link en la bio. Eva fuera.
```

Dos cambios respecto del guion original, ambos de respiración, no de contenido:

- «convierte tu sufrimiento académico en un videojuego: EVAGAMEPROCE» se parte
  en dos escenas. El nombre necesita silencio antes; dicho de corrido se pierde.
- «poner a prueba tu cerebro orgánico… o cuánto creías saber» se parte en tres.
  Los puntos suspensivos dentro de una escena HeyGen los lee como coma; entre
  escenas, la pausa es real.

### Escena opcional (no está en el guion original)

Entre la 8 y la 9, cuatro segundos de prueba de que esto no es una demo de tres
preguntas:

> **Trece mundos. Cédula, oral y códex. Todo el procesal civil, gratis.**
> Fondo: `03-mundos.png` · `clips/mundos.mp4`

Si el video se pasa de 45 segundos, es la primera que se cae.

---

## Dirección de arte

Una sola regla lo resume: **el video y el juego tienen que parecer la misma
cosa.** Si el espectador toca el link y aterriza en algo que no se parece a lo
que vio, el video no sirvió de nada.

### Paleta — la del juego, sin inventar ninguna

Los valores salen de `app/globals.css`. No hay un color de marca para el video
distinto del que ya tiene el producto.

| Color | Hex | Para qué |
|---|---|---|
| Fondo | `#06070B` | todo el video, avatar incluido |
| Cian | `#4BE7FF` | acento, luz principal |
| Violeta | `#8A5CFF` | contraluz |
| Papel | `#E8DFC5` | texto de lectura |
| Verde | `#58F5B0` | acierto |
| Rojo | `#D94A4A` | error |

### Tipografía

Las tres del juego, gratis en Google Fonts. Instalarlas **antes** de montar.

- **Cinzel** — títulos en pantalla. Gravedad institucional.
- **JetBrains Mono** — rótulos, URL, cifras, subtítulos.
- **Inter** — cualquier párrafo largo.

El deck `.pptx` usa sustitutas de Office (Cambria, Courier New, Calibri) para
que abra en cualquier PowerPoint. Son del deck, no del video.

### Cinco reglas

1. **Nada blanco, ni un fotograma.** El fondo del avatar es el negro del juego,
   no el de HeyGen. Los fondos de oficina futurista que trae por defecto —con su
   robot humanoide de relleno— son exactamente lo que este juego no es: aquí la
   estética es cyberpunk **notarial**, y la iconografía ya existe y es jurídica.
2. **El neón ilumina, no decora.** Cian de frente, violeta de contraluz. Dos
   fuentes, no cinco.
3. **Grano al 8 % y líneas de barrido finas sobre todo**, avatar incluido. Es el
   paso que funde las dos fuentes de imagen —un render de IA y una captura de
   navegador— en una sola. Sin esto se nota el pegado; con esto, no.
4. **Un corte por frase.** El avatar nunca está solo más de cuatro segundos.
5. **Cero emoji, cero flechas animadas.** El juego cambió sus emoji por 32
   iconos de trazo propios (`components/game/Icono.tsx`) justo para no
   depender de los que dibuja cada teléfono. El video no los reintroduce.

### Encuadre 9:16

1080 × 1920. La interfaz de la app tapa unos **250 px arriba** (nombre de
cuenta) y **420 px abajo** (descripción, sonido, botones). Todo lo que importa
vive en la franja del medio.

- **Avatar solo:** de pecho para arriba, ojos a un tercio de la altura. Nunca
  centrado: deja aire para el texto de abajo.
- **Juego a pantalla completa:** las capturas ya son 1080 × 1920, entran sin
  recortar ni escalar. No meterlas en un marco de teléfono: resta pantalla.
- **Avatar sobre el juego:** círculo de 300 px abajo a la izquierda, borde cian
  de 3 px. Nunca abajo a la derecha, que ahí van los botones de la app.
- **Subtítulos:** entre el 62 % y el 78 % de la altura. Mono, mayúsculas, fondo
  negro al 55 %, dos líneas como máximo.

---

## Montaje

HeyGen pone la cara y la voz. El ritmo —que es lo que decide si el video
funciona— se hace después, en el editor.

1. **Formato vertical primero.** Deja el proyecto en 9:16 antes de escribir
   nada: cambiarlo después reencuadra el avatar y hay que rehacer las diez
   escenas.
2. **Una escena por línea de voz.** Diez escenas, no una con todo el texto.
3. **Fondo negro, no el de HeyGen.** Sube un PNG liso `#06070B` como fondo de
   las escenas de avatar.
4. **Voz seca y algo lenta**, velocidad ~0,95. El guion es irónico y la ironía
   necesita aire. Escucha «Qué adorable» aislado antes de dar la voz por buena.
5. **Exporta el avatar a 1080 × 1920 y móntalo aparte**, en CapCut o DaVinci.
   Ahí van encima las capturas y los clips de `scripts/video/`.
6. **Grano, líneas de barrido y color** sobre todo el montaje.
7. **Subtítulos quemados.** La mayoría lo ve sin sonido, y los de la plataforma
   salen con su propia tipografía y rompen el conjunto.
8. **Sonido.** El juego genera su audio por Web Audio API (`lib/audio.ts`) y no
   tiene archivos que sacar: hay que grabarlo de pantalla, o usar una base
   instrumental oscura y subir el golpe sólo en el revelado del título.

---

## Qué se puede y qué no se puede decir

El video es material de marca y `lib/brand.ts` fija reglas de contenido a
propósito. El guion las respeta; cualquier reescritura también tiene que
hacerlo. **No** se afirma qué significa la sigla EVA, no se declaran avales
universitarios ni credenciales profesionales, no se dan cifras de usuarios y
**no se promete aprobar el examen**. «Poner a prueba cuánto sabes» es una
descripción de la mecánica; «te hace aprobar el grado» sería otra cosa.

El repaso espaciado usa intervalos elegidos por criterio de diseño: no están
calibrados con datos de este juego ni son un protocolo validado. No los
presentes como método probado.
