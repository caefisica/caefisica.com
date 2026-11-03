# AGENTS.md

Set-up, checks y envío: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). Mapa
del código: [docs/es/architecture.md](docs/es/architecture.md). Manual:
[docs/es/readme.md](docs/es/readme.md).

- Termina cada cambio con `bun run fix` y `bun run check`.
- Usa Bun (`bun.lock`). No uses npm.
- Compila y sirve el sitio con los scripts de [`package.json`](package.json)
  (`bun run dev`, `bun run build`), no con `hugo` directamente: `bun run` pone
  `node_modules/.bin` en el `PATH`. `hugo new content` crea archivos y no
  compila, así que se corre directo.
- Escribe el contenido y el `readme.md` en español. La documentación va en dos
  idiomas, con los mismos nombres de archivo: `docs/es/` y `docs/en/`. Un cambio
  en un documento cambia los dos. Los comandos, las rutas y los nombres de
  campos se quedan como están. Los comentarios del código van en inglés.
- Un cambio de versión de Hugo, Bun o Node se hace solo en `mise.toml`.
- Nombres de carpetas y slugs de `contributors` y `professors`:
  [nombres](docs/es/contenido.md#nombres).
- No edites `assets/js/vendor/`, `public/` ni `resources/`.
- No registres claves ni archivos `.env`.
