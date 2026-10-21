# AGENTS.md

Mapa del código: [docs/architecture.md](docs/architecture.md). Manual:
[docs/readme.md](docs/readme.md).

- Usa Bun (`bun.lock`). No uses npm.
- Ejecuta todo con las tareas de [`mise.toml`](mise.toml) (`mise run dev`,
  `mise run build`), no con `hugo` directamente: las tareas ponen los binarios
  de `node_modules/.bin` (`tailwindcss`, entre otros) en el `PATH`.
- Termina cada cambio con `mise run fix` y `mise run check`.
- Escribe contenido y documentación en español. Los comandos, las rutas y los
  nombres de campos se quedan como están.
- Un cambio de versión de Hugo, Bun o Node se hace solo en `mise.toml`.
- Nombres de carpetas y slugs de `contributors` y `professors`:
  [convenciones](docs/convenciones.md#nombres).
- No edites `assets/js/vendor/`, `public/` ni `resources/`.
- No registres claves ni archivos `.env`.
