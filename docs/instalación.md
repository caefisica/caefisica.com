# Instalación

Cómo ejecutar el sitio en tu equipo y cómo comprobar tus cambios.

## Herramientas

[`mise.toml`](../mise.toml) fija las versiones:

| Herramienta     | Versión | Uso                                                |
| --------------- | ------- | -------------------------------------------------- |
| `hugo-extended` | 0.166.0 | Genera el sitio. Se necesita la edición extendida. |
| `bun`           | 1.4.2   | Instala dependencias y ejecuta los scripts.        |
| `node`          | 24.21.0 | Lo usan las herramientas de `node_modules`.        |
| `go`            | 1.27.1  | Instala `gotmplfmt`.                               |
| `wrangler`      | 4.141.0 | Despliegue en Cloudflare.                          |

Necesitas además `git`. Con [mise](https://mise.jdx.dev/getting-started.html)
instalado, una orden instala todo:

```bash
mise install
```

Sin mise, instala a mano las versiones de la tabla.

## Ejecutar el sitio

```bash
git clone https://github.com/caefisica/caefisica.com.git
cd caefisica.com
bun install
bun run hugo:start
```

`hugo:start` ejecuta `hugo server --disableFastRender` y sirve el sitio en
<http://localhost:1313>. Recarga el navegador cuando guardas un archivo.

Ejecuta Hugo siempre con `bun run`. Hugo compila el SCSS con el programa `sass`,
y `bun run` pone `node_modules/.bin` en el `PATH`, donde `sass-embedded` lo
aporta. Si llamas a `hugo` directamente, necesitas Dart Sass en el `PATH`.

Hugo pone las direcciones en minúsculas: el archivo
`content/unmsm/pregrado/plan-2018/CBE013/_index.md` se publica en
`/unmsm/pregrado/plan-2018/cbe013/`.

El servidor no publica las páginas con `draft: true` y responde 404. Para ver
una guía nueva en local, pon `draft: false` en su front matter.

## Scripts

| Orden                      | Qué hace                                                                     |
| -------------------------- | ---------------------------------------------------------------------------- |
| `bun run hugo:start`       | Servidor de desarrollo en el puerto 1313.                                    |
| `bun run build`            | Copia las fuentes de KaTeX a `static/fonts/` y ejecuta `hugo --gc --minify`. |
| `bun run lint`             | `oxlint`, `stylelint` y `markdownlint-cli2`.                                 |
| `bun run format`           | Da formato con `oxfmt` a `assets/js`, `config`, `functions` y `scripts`.     |
| `bun run format:check`     | Lo mismo, sin escribir.                                                      |
| `bun run format:templates` | Da formato a `layouts` y `data` con `gotmplfmt`.                             |
| `bun run typecheck`        | `tsc --noEmit`.                                                              |
| `bun run check`            | `lint`, `format:check`, `typecheck` y `build`, en ese orden.                 |
| `bun run hugo:create`      | Alias de `hugo new`. Ver [convenciones](convenciones.md#crear-un-archivo).   |
| `bun run screenshots`      | Genera las capturas de `content/experimental` con Playwright.                |

`bun run lint:markdown` ejecuta `markdownlint-cli2` con `fix: true`, así que
corrige los Markdown que puede. La primera ejecución de `bun run build` tarda
cerca de 30 segundos porque procesa las imágenes. `bun run screenshots` necesita
el navegador de Playwright: `bunx playwright install chromium`.

## Antes de enviar un cambio

```bash
bun run check
```

El flujo [`ci_nodejs.yml`](../.github/workflows/ci_nodejs.yml) ejecuta esa orden
en cada pull request y además `gotmplfmt -l layouts data`. Si cambias
plantillas, ejecuta `bun run format:templates` antes. `gotmplfmt` se instala con
`go install github.com/gohugoio/gotmplfmt@latest`.

El flujo [`check_broken_links.yml`](../.github/workflows/check_broken_links.yml)
revisa los enlaces de `content/` con la configuración de
[`.404-links.yml`](../.404-links.yml).
