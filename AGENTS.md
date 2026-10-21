# AGENTS.md

Set-up, checks y envío: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). Mapa
del código: [docs/architecture.md](docs/architecture.md). Manual:
[docs/readme.md](docs/readme.md).

- Termina cada cambio con `bun run fix` y `bun run check`.
- Usa Bun (`bun.lock`). No uses npm.
- Ejecuta Hugo con los scripts de [`package.json`](package.json) (`bun run dev`,
  `bun run build`), no con `hugo` directamente: `bun run` pone
  `node_modules/.bin` en el `PATH`.
- Escribe contenido y documentación en español. Los comandos, las rutas y los
  nombres de campos se quedan como están.
- Un cambio de versión de Hugo, Bun o Node se hace solo en `mise.toml`.
- Nombres de carpetas y slugs de `contributors` y `professors`:
  [nombres](docs/contenido.md#nombres).
- No edites `assets/js/vendor/`, `public/` ni `resources/`.
- No registres claves ni archivos `.env`.
