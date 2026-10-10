# Instalación

Cómo ejecutar el sitio en tu equipo y cómo comprobar tus cambios.

## Herramientas

[`mise.toml`](../mise.toml) fija la versión de cada herramienta:

| Herramienta     | Uso                                                |
| --------------- | -------------------------------------------------- |
| `hugo-extended` | Genera el sitio. Se necesita la edición extendida. |
| `bun`           | Instala dependencias y ejecuta los scripts.        |
| `node`          | Lo usan las herramientas de `node_modules`.        |
| `go`            | Instala `gotmplfmt`.                               |
| `wrangler`      | Despliegue en Cloudflare.                          |

Necesitas además `git`. Con [mise](https://mise.jdx.dev/getting-started.html)
instalado, una orden instala todo:

```bash
mise install
```

Sin mise, instala a mano las versiones de `mise.toml`.

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

El servidor no publica las páginas con `draft: true` y responde 404. Para ver
una página nueva en local, pon `draft: false` en su front matter. Cómo se forman
las direcciones: [convenciones](convenciones.md#nombres).

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

`bun run lint:markdown` ejecuta `markdownlint-cli2 "**/*.md" "!node_modules/**"`
sin opciones. `.markdownlint-cli2.jsonc` fija `fix: true`, así que corrige los
Markdown que puede.

### Capturas

`bun run screenshots` necesita el navegador de Playwright:
`bunx playwright install chromium`. Recorre las carpetas de
`content/experimental/` con un `index.md` que tenga `link: "…"` e
`images: ["…"]` en el front matter. Busca en la carpeta un archivo `.png`,
`.jpg` o `.jpeg` cuyo nombre contenga el primer valor de `images`. Abre el
`link` en una ventana de 1920×1080, espera a que la red quede inactiva (30 s
como máximo) y **sobrescribe** ese archivo con la captura. Omite, con un mensaje
de error, las carpetas sin archivo coincidente o con otro formato. Pasa nombres
de carpeta para limitar la ejecución:

```bash
bun run screenshots aps.org
```

Si el `link` responde con un estado HTTP de error, no guarda la captura,
conserva la imagen anterior y lo avisa (en GitHub Actions, como `::warning`).
Cuenta esos enlaces aparte en el resumen final. Termina con error si no
encuentra carpetas o si ninguna captura sale bien.

## Antes de enviar un cambio

```bash
bun run check
```

Si cambias plantillas de `layouts/` o `data/`, formatéalas:

```bash
bun run format:templates
```

El flujo de CI solo comprueba, sin escribir: falla si
`gotmplfmt -l layouts data` lista algún archivo. `gotmplfmt` se instala con
`go install github.com/gohugoio/gotmplfmt@latest`. Los flujos de GitHub que
repiten estas comprobaciones están en
[despliegue](despliegue.md#flujos-de-github).
