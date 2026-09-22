# Memoria del proyecto — EVA / Proyecto01

## Mapa del ecosistema

| Pieza | Repositorio | En producción |
|---|---|---|
| **Landing personal de EVA** | [dojedacifuentes/eva.proyecto01](https://github.com/dojedacifuentes/eva.proyecto01) | https://evaproyecto01.vercel.app/ |
| **FORO [in]VISIBLE** (este repo, el juego) | [dojedacifuentes/eva.game.proce](https://github.com/dojedacifuentes/eva.game.proce) | https://evagameproce.vercel.app |
| Origen histórico del juego | [dojedacifuentes/rpgproce](https://github.com/dojedacifuentes/rpgproce) (commit `76f58da`) | — |

La landing es la puerta de entrada de la marca **EVA / Proyecto01**; este repo es
una de las experiencias que presenta. Son repos y despliegues separados: un
cambio aquí no toca la landing, y viceversa. Autor: **Diego Ojeda**.

## Qué es este repo

RPG narrativo web sobre Derecho Procesal Civil chileno, para el estudio del
examen de grado. Next.js 15 App Router + TypeScript + Tailwind + framer-motion +
zustand. Node 24.x.

```bash
npm run lint       # sin errores NI advertencias
npm run typecheck
npm test           # vitest
npm run build
```

## Dónde mirar antes de escribir código

- `README.md` — índice de toda la documentación.
- `docs/HANDOFF.md` — mapa del código, convenciones, trampas conocidas.
- `docs/CHECKPOINT.md` — estado verificado y medido, con commit.
- `.claude/skills/reinos-del-derecho/SKILL.md` — convenciones de la expansión
  DLC "Reinos del Derecho". Consúltalo **antes** de tocar `app/reinos/**`,
  `data/reinos/**`, `components/reinos/**` o `store/useReinos.ts`.
- `scripts/verificacion/` — verificación en Chromium real sobre el build.

## Marca

`lib/brand.ts` es el **punto único de verdad** de nombres, créditos y assets de
marca. Ningún componente referencia archivos de marca por su cuenta. Ese archivo
documenta reglas de contenido deliberadas (no se afirma qué significa la sigla
EVA, EVA no tiene biografía ni rostro, no se declaran avales ni promesas): no las
relajes sin material verificable.
