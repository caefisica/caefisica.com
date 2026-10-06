# Arquitectura

El sitio es un proyecto Hugo sin tema externo: las plantillas, los estilos y los
scripts viven en este repositorio. `hugo` genera HTML estático en `public/` y
las plataformas de despliegue sirven esa carpeta. La única pieza de servidor es
una función de Netlify para el boletín.

```text
content/ + data/ + config/ ──▶ layouts/ ──▶ hugo ──▶ public/ ──▶ Cloudflare / Netlify
                               assets/ ──▶ esbuild + Dart Sass + PostCSS
                                                       functions/ ──▶ Netlify Functions
```

## Mapa del código

| Ruta                                        | Responsabilidad                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `content/`                                  | Páginas en Markdown, YAML de recursos y PDF. Ver [convenciones](docs/convenciones.md). |
| `layouts/`                                  | Plantillas Go de Hugo, shortcodes y parciales.                                         |
| `assets/`                                   | SCSS, TypeScript e iconos que Hugo compila.                                            |
| `static/`                                   | Archivos que se copian tal cual: favicons, imágenes, fuentes.                          |
| `data/`                                     | JSON y YAML leídos con `hugo.Data`.                                                    |
| `config/`                                   | Configuración de Hugo por entorno.                                                     |
| `archetypes/`                               | Plantillas de `hugo new`.                                                              |
| `functions/`                                | Función de Netlify `submission-created`.                                               |
| `scripts/`                                  | `screenshots.ts`, genera las capturas de `content/experimental`.                       |
| `.github/`                                  | Flujos de trabajo, plantillas de incidencias y `CONTRIBUTING.md`.                      |
| `netlify.toml`, `wrangler.toml`, `build.sh` | Despliegue. Ver [despliegue](docs/despliegue.md).                                      |
| `.pages.yml`                                | Esquema de los campos de Pages CMS.                                                    |

## Configuración

`config/_default/` tiene `config.toml` (salidas, taxonomías, permalinks),
`markup.toml`, `menus.toml`, `module.toml` y `params.toml`. `config/production/`
y `config/next/` solo fijan `canonifyURLs = false`.

- Taxonomías: `contributors`, `types`, `functionalities` y `topics`. Los
  permalinks de `blog`, `types` y `functionalities` están en `[permalinks]`.
- `home` produce además `_redirects` y `_headers` (formatos de salida
  `REDIRECTS` y `HEADERS`), generados por `layouts/index.redirects` y
  `layouts/index.headers`. La política CSP sale de `data/fixes/headers.yml`.
- `module.toml` monta paquetes de `node_modules` en `assets/js/vendor/`
  (`mermaid`, `katex`, `pdfjs-dist`) y las plantillas de `@thulite/images` en
  `layouts/`.
- `params.toml` activa las funciones del sitio: `options` (lazysizes, KaTeX,
  modo oscuro, resaltado), `search.provider = "algolia"` y `professors`.

## Plantillas

`layouts/baseof.html` envuelve todas las páginas: cabecera, contenido, pie y
scripts. Hugo elige la plantilla por tipo de contenido:

- Cada sección de `content/` con una carpeta del mismo nombre en `layouts/`
  (`blog`, `experimental`, `biblioteca`, `contacto`, `contributors`,
  `professors`) usa esa carpeta.
- `content/unmsm/_index.md` y `content/apuntes/_index.md` fijan `type: docs` con
  `cascade`, así que todas sus páginas usan `layouts/docs/`.
  `layouts/docs/offering.html` dibuja los sílabos por semestre
  (`layout: "offering"`).
- Algunas páginas fijan `type` en su front matter: `extend`, `links`,
  `confirmation` y `newsletter`.
- `layouts/types/` y `layouts/functionalities/` dibujan las taxonomías de
  `experimental`, publicadas en `/experimental/types/` y
  `/experimental/functionalities/`.

`layouts/partials/` se divide en `head/`, `header/`, `footer/`, `sidebar/`,
`main/` y `components/`. Los componentes de curso son:

- `components/information_box.html`: código, créditos, prerrequisitos y
  docentes.
- `components/course-offerings.html` y `components/offering-details.html`: tabla
  de sílabos y cabecera de un sílabo. Buscan al docente en
  `content/professors/<slug>`.
- `components/resource-table.html`: tabla de libros o listas de reproducción
  desde un YAML del bundle. La llama el shortcode `resource-table`.
- `components/topic-switcher.html`: lista las páginas que comparten el primer
  valor de `topics`.
- `sidebar/plan-nav.html`: menú lateral de un plan, agrupado por `semester`.
- `components/resolve-contributors.html`: resuelve cada slug de `contributors` a
  `content/contributors/<slug>`; un slug que no existe detiene la compilación.

Los shortcodes están en `layouts/shortcodes/` y se describen en
[shortcodes](docs/shortcodes.md).

## Estilos y scripts

- `layouts/partials/head/stylesheet.html` compila `assets/scss/app.scss` (y
  `assets/scss/home.scss` en la portada) con Dart Sass. En producción pasa por
  PostCSS (`config/postcss.config.js`: autoprefixer y PurgeCSS) y se
  fingerprinta. PurgeCSS lee `layouts/**/*.html` y `content/**/*.md`: una clase
  que solo aparece en otro lugar se elimina salvo que esté en su `safelist`.
- `layouts/partials/footer/script-footer.html` compila los `.ts` de `assets/js/`
  con esbuild (`js.Build`). El paquete base (`main.js`) reúne newsletter, atajos
  de teclado, Netlify Identity, lazysizes, clipboard e instant.page. KaTeX se
  carga con `math: true` en el front matter, Mermaid con `mermaid: true`, el
  buscador solo en la portada y en `unmsm`, `apuntes` y `blog`.
- `assets/js/vendor/` se llena con los montajes de `module.toml`; no se edita.

## Boletín

El formulario de `layouts/partials/sidebar/newsletter.html` es un formulario de
Netlify (`data-netlify="true"`). `assets/js/newsletter.ts` lo envía por `fetch`
a `/`. Netlify dispara `functions/submission-created.js`, que agrega el correo a
una lista de SendGrid y avisa al administrador.

## Verificación

`bun run check` ejecuta, en orden, `lint`, `format:check`, `typecheck` y
`build`. El flujo `.github/workflows/ci_nodejs.yml` lo corre en cada pull
request, junto con `gotmplfmt -l layouts data`. Ver
[instalación](docs/instalación.md).
