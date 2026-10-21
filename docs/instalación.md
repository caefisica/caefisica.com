# Instalación

Cómo ejecutar el sitio en tu equipo y cómo comprobar tus cambios.

## Herramientas

[`mise.toml`](../mise.toml) fija la versión de cada herramienta:

| Herramienta     | Uso                                                   |
| --------------- | ----------------------------------------------------- |
| `hugo-extended` | Genera el sitio. Se necesita la edición extendida.    |
| `bun`           | Instala dependencias y ejecuta `screenshots`.         |
| `node`          | Lo usan las herramientas de `node_modules`.           |
| `go`            | Compila `gotmplfmt`, que da formato a las plantillas. |
| `wrangler`      | Despliegue en Cloudflare.                             |

Necesitas además `git` y [mise](https://mise.jdx.dev/getting-started.html). Una
orden instala todas las herramientas:

```bash
mise install
```

## Ejecutar el sitio

```bash
git clone https://github.com/caefisica/caefisica.com.git caefisica
cd caefisica
mise install
mise run install
mise run dev
```

`mise run install` instala las dependencias de `bun.lock` sin modificarlo. `dev`
copia las fuentes de KaTeX a `static/fonts/`, ejecuta
`hugo server --bind=127.0.0.1 --port=1313 --disableFastRender` y sirve el sitio
en <http://localhost:1313>. Recarga el navegador cuando guardas un archivo.

Ejecuta Hugo siempre con `mise run`. Hugo compila el SCSS con el programa
`sass`, y `mise.toml` pone `node_modules/.bin` en el `PATH` de las tareas, donde
`sass-embedded` lo aporta. Si llamas a `hugo` directamente, necesitas Dart Sass
en el `PATH`.

El servidor no publica las páginas con `draft: true` y responde 404. Para ver
una página nueva en local, pon `draft: false` en su front matter. Cómo se forman
las direcciones: [convenciones](convenciones.md#nombres).

## Tareas

`mise tasks` lista todas las tareas de [`mise.toml`](../mise.toml).

| Orden                      | Qué hace                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `mise run install`         | Instala las dependencias de `bun.lock` sin modificarlo.                                  |
| `mise run dev`             | Copia las fuentes de KaTeX y sirve el sitio en el puerto 1313.                           |
| `mise run build`           | Copia las fuentes de KaTeX a `static/fonts/`, ejecuta `hugo --gc --minify` y `pagefind`. |
| `mise run lint`            | Comprueba scripts, estilos, plantillas, Markdown y formato, sin escribir.                |
| `mise run fix`             | Corrige los Markdown que `markdownlint-cli2` puede y da formato a plantillas y al resto. |
| `mise run typecheck`       | `tsc --noEmit`.                                                                          |
| `mise run check`           | `lint`, `typecheck` y `build`. Es lo que ejecuta CI.                                     |
| `mise run new`             | Alias de `hugo new`. Ver [convenciones](convenciones.md#crear-un-archivo).               |
| `mise run screenshots`     | Genera las capturas de `content/experimental` con Playwright.                            |
| `mise run install:browser` | Instala Chromium para `screenshots`.                                                     |

`lint` se divide en `lint:scripts` (`oxlint`), `lint:styles` (`stylelint`),
`lint:templates` (`gotmplfmt -l layouts data`), `lint:markdown`
(`markdownlint-cli2`) y `lint:format` (`oxfmt --check .`). `oxfmt` da formato a
los scripts, los Markdown, los YAML y los JSON; no toca `layouts/`,
`assets/scss/`, el código de terceros (`vendor/`) ni los archetypes
`offering.md`, `professor.md` y `tutorial.md`, porque `oxfmt` rompe la acción de
Hugo de su front matter (`date: {{ .Date }}`).

### Capturas

`mise run screenshots` necesita el navegador de Playwright, que instala
`mise run install:browser`. Recorre las carpetas de `content/experimental/` con
un `index.md` que tenga `link: "…"` e `images: ["…"]` en el front matter. Busca
en la carpeta un archivo `.png`, `.jpg` o `.jpeg` cuyo nombre contenga el primer
valor de `images`. Abre el `link` en una ventana de 1920×1080, espera a que la
red quede inactiva (30 s como máximo) y **sobrescribe** ese archivo con la
captura. Omite, con un mensaje de error, las carpetas sin archivo coincidente o
con otro formato. Pasa nombres de carpeta para limitar la ejecución:

```bash
mise run screenshots aps.org
```

Si el `link` responde con un estado HTTP de error, no guarda la captura,
conserva la imagen anterior y lo avisa (en GitHub Actions, como `::warning`).
Cuenta esos enlaces aparte en el resumen final. Termina con error si no
encuentra carpetas o si ninguna captura sale bien.

## Antes de enviar un cambio

```bash
mise run fix
mise run check
```

`check` solo comprueba, sin escribir. El flujo de CI ejecuta `mise run install`
y `mise run check`. Los flujos de GitHub están en
[despliegue](despliegue.md#flujos-de-github).
