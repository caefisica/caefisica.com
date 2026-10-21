# Arquitectura

El sitio es un proyecto Hugo sin tema externo: las plantillas, los estilos y los
scripts viven en este repositorio. `hugo` genera HTML estático en `public/`,
`pagefind` lo indexa y el Worker `web` de Cloudflare sirve esa carpeta; ver
[despliegue](despliegue.md). No hay código de servidor.

```text
content/ + data/ + config/ ──▶ layouts/ ──▶ hugo ──▶ pagefind ──▶ public/ ──▶ Cloudflare
                               assets/ ──▶ esbuild + Dart Sass + PostCSS
```

## Mapa del código

| Ruta                            | Responsabilidad                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `content/`                      | Páginas en Markdown, YAML de recursos y PDF. Ver [convenciones](convenciones.md).                               |
| `layouts/`                      | Plantillas Go de Hugo, shortcodes y parciales.                                                                  |
| `assets/`                       | SCSS, TypeScript, fuentes e iconos que Hugo compila.                                                            |
| `static/`                       | Archivos que se copian tal cual: favicons, imágenes, fuentes.                                                   |
| `data/`                         | JSON y YAML leídos con `hugo.Data`.                                                                             |
| `config/`                       | Configuración de Hugo por entorno y de PostCSS.                                                                 |
| `archetypes/`                   | Moldes de `hugo new`.                                                                                           |
| `scripts/`                      | `screenshots.ts`, genera las capturas de `content/experimental`.                                                |
| `.github/`                      | Flujos de trabajo, plantillas de incidencias y `CONTRIBUTING.md`. Ver [flujos](despliegue.md#flujos-de-github). |
| `wrangler.toml`, `netlify.toml` | Despliegue. Ver [despliegue](despliegue.md).                                                                    |
| `.pages.yml`                    | Esquema de los campos de Pages CMS.                                                                             |

## Configuración

`config/_default/` tiene `config.toml` (salidas, taxonomías, permalinks),
`markup.toml`, `menus.toml`, `module.toml` y `params.toml`. `baseURL` es el
único lugar donde está el host del sitio.

- Taxonomías: `contributors`, `types` y `functionalities`. Los permalinks de
  `blog`, `types` y `functionalities` están en `[permalinks]`.
- `home` produce además `_redirects` y `_headers` (formatos de salida
  `REDIRECTS` y `HEADERS`), generados por `layouts/index.redirects` y
  `layouts/index.headers`. La política CSP sale de `data/fixes/headers.yml`.
- `layouts/sitemap.xml` genera `/sitemap.xml`. Una página con
  `sitemap_exclude: true` en el front matter no entra.
- `module.toml` monta `mermaid`, `katex` y `pdfjs-dist` de `node_modules` en
  `assets/js/vendor/` y las plantillas de `@thulite/images` en `layouts/`.
- `params.toml` activa las funciones del sitio: `options` (lazysizes, KaTeX,
  modo oscuro, resaltado).

## Plantillas

`layouts/baseof.html` envuelve todas las páginas: cabecera, contenido, pie y
scripts. Hugo elige la plantilla por tipo de contenido:

- Las secciones `blog`, `experimental`, `biblioteca`, `contacto` y `professors`
  usan la carpeta de `layouts/` con su nombre.
- `content/unmsm/_index.md` y `content/apuntes/_index.md` fijan `type: docs` con
  `cascade`, así que esas secciones y todas sus páginas usan `layouts/docs/`.
  `layouts/docs/offering.html` dibuja los sílabos por semestre
  (`layout: "offering"`).
- Algunas páginas fijan `type` en su front matter: `extend` y `links`.
- `layouts/types/` y `layouts/functionalities/` dibujan las taxonomías de
  `experimental`, publicadas en `/experimental/types/` y
  `/experimental/functionalities/`.

`layouts/partials/` se divide en `head/`, `header/`, `footer/`, `sidebar/`,
`main/` y `components/`. Los componentes de curso son:

- `components/information_box.html`: código, créditos y prerrequisitos de la
  guía, más una fila «Profesores» con los docentes de sus sílabos y una fila
  «Sílabos» con los semestres que tienen PDF. Cada fila aparece solo si tiene
  datos. Lo dibuja `layouts/docs/single.html` en las páginas con
  `showInformationBox` e `id`.
- `components/resolve-professor.html`: resuelve un slug de `professor` a
  `content/professors/<slug>`. Si la carpeta no existe, la compilación falla.
- `components/professor-name.html`: `honorific` y `title` de un docente. Lo usan
  la caja de información, `offering-details.html` y `layouts/professors/`.
- `components/offering-details.html`: cabecera de un sílabo. Muestra la fila
  «Docente» solo si el sílabo tiene `professor`.
- `components/resource-table.html`: tabla de libros o listas de reproducción
  desde un YAML del bundle. La llama el shortcode `resource-table`.
- `sidebar/plan-nav.html`: menú lateral de un plan, agrupado por `semester`.
- `components/resolve-contributors.html`: resuelve cada slug de `contributors` a
  `content/contributors/<slug>`. Reglas de los slugs:
  [convenciones](convenciones.md#nombres).

Los shortcodes están en `layouts/shortcodes/` y se describen en
[shortcodes](shortcodes.md).

## Estilos y scripts

- `layouts/partials/head/stylesheet.html` compila `assets/scss/app.scss` (y
  `assets/scss/home.scss` en la portada) con Dart Sass. En producción pasa por
  PostCSS (`config/postcss.config.js`: autoprefixer y PurgeCSS). La hoja de la
  portada va en línea en un `<style>`; las demás páginas enlazan `main.css`
  fingerprinteado. PurgeCSS lee `layouts/**/*.html` y `content/**/*.md`: una
  clase que solo aparece en otro lugar se elimina salvo que esté en su
  `safelist`. El CSS de KaTeX está aparte (`assets/scss/katex.scss`, salida
  `katex.css`) y solo se enlaza con `math: true`.
- `layouts/partials/head/script-header.html` pone el script de modo oscuro
  (`assets/js/color-mode.ts`) en línea, para aplicar el tema antes del primer
  pintado sin pedir un archivo que bloquee el render.
- `layouts/partials/footer/script-footer.html` compila los `.ts` de `assets/js/`
  con esbuild (`js.Build`). El paquete base (`main.js`) reúne los atajos de
  teclado, más lazysizes, clipboard e instant.page cuando `params.toml` los
  activa. Bootstrap (solo `collapse`, `dropdown` y `offcanvas`, en
  `assets/js/bootstrap.ts`) y highlight.js se cargan aparte, según
  `params.toml`; highlight.js solo en páginas con un bloque `<pre`. KaTeX se
  carga con `math: true` en el front matter y Mermaid con `mermaid: true`. El
  buscador (`assets/js/search.ts`, la interfaz de Pagefind) solo se carga en la
  portada y en `unmsm` y `apuntes`, las páginas que tienen su caja de búsqueda
  (`components/is-search-enabled.html`).
- `main.js`, `bootstrap.ts` y el buscador se piden cuando termina `load`
  (`partials/footer/load-after.html`), para que sus peticiones no compitan con
  el primer pintado. Corren después de `DOMContentLoaded`: un script que se sume
  a ellos no debe esperar ese evento. La API de YouTube se pide al primer clic
  en reproducir (`assets/js/player.ts`).
- `head/resource-hints.html` precarga las dos fuentes Jost (400 y 700) en todas
  las páginas menos la portada: sin la precarga, el cambio de fuente desplaza el
  texto (CLS). La portada no las precarga porque el LCP es su párrafo
  introductorio y una precarga retrasa ese pintado; ahí el cambio de fuente
  mueve el párrafo 0,003 de CLS.
- `assets/js/vendor/` se llena con los montajes de `module.toml`; no se edita.
