# AGENTS.md

Mapa del código: [architecture.md](architecture.md). Manual:
[docs/readme.md](docs/readme.md).

- Usa Bun (`bun.lock`). No uses npm.
- Ejecuta Hugo con los scripts de `package.json` (`bun run hugo:start`,
  `bun run build`), no con `hugo` directamente: los scripts ponen `sass` en el
  `PATH`.
- Termina cada cambio con `bun run check`. Si tocas `layouts/` o `data/`,
  ejecuta también `gotmplfmt -l layouts data`.
- Escribe contenido y documentación en español. Los comandos, las rutas y los
  nombres de campos se quedan como están.
- Da formato a los Markdown con
  `bunx prettier --print-width 80 --prose-wrap always --write <archivo>` y pasa
  `bun run lint:markdown`.
- Un cambio de versión de Hugo o de Bun se aplica a la vez en todos los archivos
  que la fijan (ver [despliegue](docs/despliegue.md#versiones-de-herramientas)).
- Las carpetas de curso se llaman con el código en mayúsculas y los sílabos con
  `AAAA-I` o `AAAA-II`.
- Los slugs de `contributors` y `professors` deben existir en `content/`.
- No edites `assets/js/vendor/`, `public/` ni `resources/`.
- No registres claves ni archivos `.env`.
