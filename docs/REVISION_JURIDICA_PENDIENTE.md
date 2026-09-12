# Revisión jurídica pendiente — para Diego Ojeda

Fecha de este informe: **2026-09-12**

## Aviso previo: por qué no se corrigió nada

El encargo pedía contrastar contra fuente oficial (BCN / LeyChile) y **no corregir
de memoria**. En el entorno donde se hizo este trabajo, la política de salida a
internet **bloquea el acceso** a esos dominios:

```
https://www.bcn.cl            → bloqueado (connect_rejected, política de egreso)
https://www.leychile.cl       → bloqueado
https://www.diariooficial...  → bloqueado
```

Por tanto **no se modificó ni una palabra del contenido jurídico**. Lo que sigue
son contradicciones *internas* del propio repositorio: se pueden demostrar sin
salir del proyecto, porque el juego se contradice a sí mismo. Cuál de las dos
versiones es la correcta es lo que hay que resolver con el Código a la vista.

---

## 1. Ultra petita: el juego enseña dos causales distintas del art. 768

**Esto importa**: es una pregunta de examen y el jugador recibe respuestas
incompatibles según por dónde entre.

### Postura mayoritaria — ultra petita = **768 N°4**

| Archivo | Línea | Qué dice |
|---|---|---|
| `data/bosses.ts` | 29 | «la causal 5 es omisión del 170, **la 4 es ultra petita**, la 6 es cosa juzgada, la 1 es incompetencia» |
| `data/bosses.ts` | 258 | «**N°4**: ultra petita (otorgar más de lo pedido…)» |
| `data/combat/interrogations.ts` | 151 | «Eso es **768 N°4**, otorgar más de lo pedido» |
| `data/combat/interrogations.ts` | 242, 246 | «Ultra petita (**768 N°4**)» |
| `data/examen-extendido.ts` | 553 | «**Art. 768 N°4** CPC: haber sido dada ultra o extra petita» |
| `data/procesal/recursos.ts` | 79 | «**4ª** Ultra petita: otorgar más de lo pedido…» |

### Postura minoritaria — ultra petita = **768 N°2**

| Archivo | Línea | Qué dice |
|---|---|---|
| `data/casos-investigativos.ts` | 238 | título: «**Artículo 768 N°2 CPC** — Nulidad por Ultra Petita» |
| `data/casos-investigativos.ts` | 293, 302, 304, 308 | «Nulidad **causal N°2** del art. 768…» |
| `data/casos-investigativos.ts` | 329, 339 | «Sentencia ultra petita… **causal N°2 art. 768**» |

### Conflicto añadido

`data/examen-extendido.ts:107-108` asigna la **N°2** a otra cosa:

> «2. Cuando la causal es el haber sido pronunciada la sentencia por un juez con
> implicancia (**768 N°2**) o recusación (768 N°2).»

Es decir, dentro del mismo repositorio la N°2 es a la vez «ultra petita» y «juez
con implicancia». **Una de las dos está mal.**

**Qué hay que hacer:** abrir el art. 768 CPC vigente en BCN, fijar la numeración
correcta y alinear el archivo que esté equivocado. Todo apunta a que el caso
completo de `data/casos-investigativos.ts` (Caso 38B) es el que hay que revisar,
porque es el único que sostiene la N°2 y está contradicho por seis lugares.

> Nota: `data/bosses.ts:29` incluye «8: ultra petita» **dentro del texto de la
> opción incorrecta** de una pregunta trampa, y su propia explicación lo corrige
> a la N°4. Eso está bien construido, no es un error.

---

## 2. Art. 44 CPC presentado como si regulara el Diario Oficial

`data/casos-investigativos.ts:108` entrecomilla, como si fuera texto literal:

> «**Art. 44 CPC**: 'Si no se logra emplazar al demandado en su domicilio después
> de dos diligencias infructuosas, se procederá a su notificación por
> **publicación en el Diario Oficial**.'»

Pero `data/bosses-extra.ts:101` atribuye la notificación por avisos a otro
artículo:

> «**Art. 54 inc. 2° CPC**: tres veces en diario; cuando proceda inserción en
> Diario Oficial: día 1° o 15 (o día siguiente hábil).»

Dos artículos distintos para el mismo trámite, y el primero va **entre comillas
como cita textual**. Tu propio `LEGAL_REVIEW_NOTES.md` ya lo tenía anotado:

> «Revisar referencias antiguas a art. 44 CPC que hablan de publicación en Diario
> Oficial. En el juego nuevo se trata como notificación personal subsidiaria.»

**Qué hay que hacer:** contrastar arts. 44 y 54 CPC, y decidir si el caso
investigativo se reescribe o se recoloca. Si la cita entrecomillada no es literal,
quitar las comillas aunque el fondo sea correcto.

**Sí se corrigió una cosa relacionada, y sin tocar contenido jurídico:** la
portada mostraba como frase de ambiente «art. 64 CPC / art. 44 CPC — *Dos
intentos. Luego el Diario Oficial*». Se retiró esa frase de la rotación
(`app/page.tsx`) por apoyarse en la misma asociación discutida. No se sustituyó
por ninguna afirmación nueva.

---

## 3. Prueba testimonial y valoración (punto señalado en la auditoría)

Lo que hay hoy en el repositorio:

- `data/procesal/prueba.ts:160` clasifica **«Prueba testimonial (reglas del 384)»**
  en la categoría **`tasada`**.
- `data/dialogos-profundo.ts:159` habla de «apreciación de la prueba testimonial»
  sin adscribirla a un sistema de valoración.
- No se encontró en el banco ninguna formulación general del tipo «la prueba
  testimonial se valora conforme a la sana crítica». La búsqueda de «sana crítica»
  sólo devuelve texto de ambiente en `data/mission-playbooks.ts:427,445`.

Esto **no es una contradicción interna demostrable**: es exactamente el tipo de
cuestión que el propio encargo manda dejar identificada, porque depende de cómo
se lea el art. 384 CPC y de la postura doctrinal del curso.

**Qué hay que hacer:** decidir con criterio docente si el 384 se presenta como
prueba legal o tasada, y dejarlo registrado con `procedencia` (ver abajo).

---

## 4. Contenido sin fuente retirado del producto

El hub mostraba un panel **«Noticias Jurídicas»** con cuatro titulares en formato
de noticia real, **sin fuente ni fecha**:

- «Corte Suprema acoge recurso de protección por vulneración al debido proceso.»
- «Nuevo criterio sobre validez de notificaciones electrónicas.»
- «Proyecto de reforma al CPC avanza en comisión mixta.»
- «Pleno fija doctrina sobre cómputo de plazos en feriado judicial.»

Un estudiante podía leerlos como información actual del sistema judicial chileno.
**Se retiraron por completo** (`app/juego/page.tsx`). No se sustituyeron por otros
titulares: el hueco lo ocupa ahora el panel de EVA, que sólo dice cosas derivadas
del progreso real de la partida.

---

## 5. Cómo marcar contenido a medida que lo revises

Se añadió soporte —opcional— para registrar fuente y fecha:

- Tipo: `types/procedencia.ts`
- Componente: `components/shell/FichaProcedencia.tsx`
- Ya enchufado en: `components/ExamenGrado.tsx` (tras la explicación)

```ts
{
  id: "alt_12",
  enunciado: "…",
  // …
  procedencia: {
    norma: "Art. 768 N°4 CPC",
    url: "https://www.bcn.cl/leychile/navegar?idNorma=22740",
    revisadoEl: "2026-09-20",
    revisadoPor: "Diego Ojeda",
    estado: "verificado",
  },
}
```

Estados posibles: `verificado`, `doctrinal`, `pendiente`.

**La ficha no se dibuja si el campo no existe.** Es deliberado: así lo que no has
revisado no aparenta estar revisado. No se marcó nada como verificado en este
trabajo, porque no se pudo contrastar nada.

---

## Alcance de esta revisión — sin exagerar

Se revisó, **por búsqueda dentro del repositorio**:

- todas las apariciones de «ultra petita» (20 coincidencias en 10 archivos);
- todas las referencias con la forma `768 N°x` (unas 30);
- todas las menciones a «Diario Oficial» (8);
- todas las menciones a «sana crítica» y a «testimonial».

**No se revisó el resto del banco de preguntas**, que son varios miles de líneas
repartidas en `data/`, `data/civilis/`, `data/procesal/`, `data/reinos/` y
`data/combat/`. **Nada de este trabajo permite afirmar que el banco esté
validado.**
