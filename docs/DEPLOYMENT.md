# Desplegar EVA Game Proce en Vercel

## Importar el repositorio

Abre [New Project](https://vercel.com/new) en tu cuenta de Vercel e importa **dojedacifuentes/eva.game.proce**. Si no aparece, concede a la integración de GitHub de Vercel acceso a este repositorio.

| Ajuste | Valor |
| --- | --- |
| Project Name | `eva-game-proce` (o un nombre disponible) |
| Framework Preset | Next.js |
| Root Directory | `./` |
| Production Branch | `main` |
| Node.js Version | `24.x` |
| Install Command | `npm ci` (definido en vercel.json) |
| Build Command | `npm run build` (definido en vercel.json) |
| Output Directory | Predeterminado de Next.js; no usar `out` |
| Environment Variables | Ninguna requerida |

Pulsa **Deploy**. Vercel asignará la URL; el repositorio no presupone que un dominio concreto esté disponible. La integración Git permite generar despliegues posteriores a partir de cambios en el repositorio.

No necesitas configurar VERCEL_TOKEN ni un workflow de despliegue: utiliza la integración nativa con GitHub. El workflow incluido solo instala, analiza y compila el código en Linux.

## Verificar el despliegue

1. Abrir `/` y `/creacion`.
2. Crear un personaje de prueba y entrar a `/juego`.
3. Recargar y comprobar que la partida continúa.
4. Abrir una misión y una expansión desde el juego.
5. Abrir `/codex` y regresar al hub.

El estado reside en `localStorage`, separado por origen y navegador. Cambiar desde `rpgproce.vercel.app` a la nueva URL no mueve partidas automáticamente. No se ha modificado la clave ni la versión de guardado en esta importación.

## Desarrollo local

```sh
git clone https://github.com/dojedacifuentes/eva.game.proce.git
cd eva.game.proce
npm ci
npm run dev
```

Usa Node 24.x (`.nvmrc`). Para probar una compilación de producción:

```sh
npm run lint
npm run build
npm run typecheck
npm start
```

En Windows PowerShell puede utilizarse `npm.cmd` si `npm.ps1` está bloqueado por la política de ejecución.

## Procedencia y cambios de preparación

Se conserva el historial de `dojedacifuentes/rpgproce`, partiendo del commit `76f58dad250664e9f171353a87b4f668cc0df56f`.

La preparación actualiza Next.js 14.2.5 a 15.5.25, React a 19.1.9, Framer Motion a una versión 11 compatible con React 19, Zustand a 4.5.7 y los tipos correspondientes. Las seis rutas dinámicas usan los parámetros asíncronos requeridos por Next.js 15. El lockfile fija las dependencias y Vercel instala mediante `npm ci`.

El override de PostCSS reutiliza la versión directa 8.5.28 para evitar la copia antigua incluida por Next.js 15. La compilación debe comprobarse al cambiar este override o actualizar Next.js. Se mantienen visibles las advertencias heredadas de hooks y fuentes; no se deshabilitan los controles de compilación.

Referencias oficiales: [migración a Next.js 15](https://nextjs.org/docs/app/guides/upgrading/version-15), [actualización de seguridad de agosto de 2026](https://nextjs.org/blog/august-2026-security-release), [Node.js en Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Las mejoras de UX y el diseño de EVA se implementarán sobre este repositorio después de la importación. No se ha realizado una validación completa del banco jurídico.
