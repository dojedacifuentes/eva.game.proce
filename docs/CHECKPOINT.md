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
| `npm test` | **37 / 37** |
| `npm run build` | **46 / 46** páginas estáticas |

### Navegador

| Medición | Resultado |
|---|---|
| **Avance en móvil** (`avanzar.js`: 20 pantallas × 390×844 y 360×800) | **0 bloqueos**. Ahora exige además 0 px de scroll de documento y barra de acción dentro de la ventana |
| **Scroll y desborde** (`medir.js`: 7 rutas × 1366×768, 1440×900, 1024×768, 390×844, 360×800) | **0 px de scroll de documento en los 5 tamaños** (antes el móvil sí se desplazaba) · 0 px de desborde horizontal |
| **Modales** (`overlays.js`, los 8 con su gesto real) | **0 hallazgos** |
| **Contraste** (`contraste2.js`, 10 rutas, píxel pintado) | **415 textos** · 0 bajo 12 px · 0 bajo WCAG AA |
| **Accesibilidad** (`a11y.js`, 11 rutas) | **0 hallazgos** |
| **Recorridos** (`flujos.js`) | **31 / 31** |
| **Jugar interactuando** (`jugar.js`, 9 actividades en móvil) | **0 bloqueos** |

Un hallazgo corregido durante la medición: con la base sólida de `.btn`, el
botón «Aceptar evento» (`btn-recurso`) quedaba en 4,4:1. Los botones de
identidad usan ahora la variante de texto legible.

---

## 3 · Qué queda abierto

- Módulos heredados de Entrenar (Juicio ejecutivo, Arcade, Timeline, etc.):
  heredan armazón, tipografía y superficies, pero no se rediseñaron por dentro.
- Mapa de Reinos del Derecho en el teléfono sin revisar con perfil de jurista.
- Civilis a 390 px: dos o tres etiquetas aún se tocan en una esquina del mapa.
- Decisiones de Diego: [`REVISION_JURIDICA_PENDIENTE.md`](REVISION_JURIDICA_PENDIENTE.md)
  y [`NPC-TEXTOS-UNIFICADOS.md`](NPC-TEXTOS-UNIFICADOS.md).

---

## 4 · Lo que NO se verificó

1. **Contenido jurídico contra fuente oficial.** No se modificó ni se validó.
2. **Dispositivos físicos, Safari iOS y Firefox.** Tamaños emulados en Chrome.
3. **Jugadores reales.** Nadie ajeno al proyecto ha jugado esta versión.
4. **Audio.** No se tocó; sigue sin escucharse en este entorno.
5. **Combate completo contra cada jefe.** Se verificó la entrada, la primera
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
