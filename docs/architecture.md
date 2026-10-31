# Arquitectura

El sitio es un proyecto Hugo sin tema externo: plantillas, estilos y scripts
viven aquí. `hugo` genera HTML estático en `public/`, `pagefind` lo indexa y el
Worker `web` de Cloudflare sirve esa carpeta (ver [despliegue](despliegue.md)).
No hay código de servidor.

```text
content/ + data/ + config/ ──▶ layouts/ ──▶ hugo ──▶ pagefind ──▶ public/ ──▶ Cloudflare
                               assets/ ──▶ esbuild + Tailwind CSS
```

## El camino de una página

Seguimos la guía del curso `CBE013`
([`content/unmsm/pregrado/plan-2018/CBE013/_index.md`](../content/unmsm/pregrado/plan-2018/CBE013/_index.md)),
publicada en `/unmsm/pregrado/plan-2018/cbe013/` (Hugo pone las direcciones en
minúsculas).

**El contenido.** La guía es un branch bundle: `_index.md` lleva el front matter
(`id`, `credits`, `prerequisites`, `semester`, `contributors`) y el cuerpo en
Markdown; los YAML `books-*.yaml` y `playlists.yaml` y las carpetas de semestre
(`2022-I/…`) son sus recursos y sus páginas hijas. Cómo se organiza `content/`:
[contenido](contenido.md).

**La plantilla.** [`content/unmsm/_index.md`](../content/unmsm/_index.md) fija
`type: docs` y `showInformationBox: true` en `cascade` para toda la sección, y
[`content/unmsm/pregrado/plan-2018/_index.md`](../content/unmsm/pregrado/plan-2018/_index.md)
fija `layout: "single"` para sus descendientes de tipo `section`. Hugo resuelve
`type` + `layout` a [`layouts/docs/single.html`](../layouts/docs/single.html),
que define el bloque `main` de [`layouts/baseof.html`](../layouts/baseof.html).
`baseof` envuelve toda página: `head`, cabecera, el contenido dentro de
`data-pagefind-body` y los scripts del pie.

**Los parciales.** Los parciales de [`layouts/_partials/`](../layouts/_partials)
se agrupan por función: `site/` (cabecera, pie, `<head>`, scripts), `docs/`
(guías y sílabos), `article/` (piezas de cualquier artículo), `data/` (búsquedas
en el contenido), `media/` (imágenes y PDF), `ui/` (iconos, fechas, avatares), y
`home/`, `search/` y `experimental/` para sus páginas. `single.html` llama a
[`docs/layout.html`](../layouts/_partials/docs/layout.html) con el cuerpo de
[`docs/guide.html`](../layouts/_partials/docs/guide.html):

- `docs/layout.html` arma el marco: menú de la sección, migas de pan (una línea;
  en pantallas angostas, solo el enlace al padre), título, cuerpo, pie,
  paginación anterior/siguiente, comentarios y, desde `xl`, el índice
  (`article/toc.html`), que `toc: false` oculta.
- [`docs/sidebar.html`](../layouts/_partials/docs/sidebar.html) dibuja el menú
  con [`docs/tree.html`](../layouts/_partials/docs/tree.html), que recorre la
  sección con [`docs/nav-node.html`](../layouts/_partials/docs/nav-node.html).
  Una sección cuyos cursos tienen `semester` es una malla: sus cursos se agrupan
  en una rama «Ciclo N» por semestre.
- [`article/byline.html`](../layouts/_partials/article/byline.html) resuelve
  cada slug de `contributors` a `content/contributors/<slug>` con
  `data/contributors.html` y dibuja fecha, autores y tiempo de lectura.
- [`docs/course-info.html`](../layouts/_partials/docs/course-info.html) dibuja
  los datos del curso (código, créditos, prerrequisitos, docentes y semestres
  con `silabo*.pdf`) en las páginas con `showInformationBox` e `id`. Cada slug
  de `professor` se resuelve con `data/professor.html`: si la carpeta no existe
  en `content/professors/`, la compilación falla.
- [`article/page-footer.html`](../layouts/_partials/article/page-footer.html)
  pone la fecha del último commit y el enlace «Edita esta página».
- El sílabo `2022-I/index.md` usa `layout: "offering"`:
  [`layouts/docs/offering.html`](../layouts/docs/offering.html) pasa a
  `docs/layout.html` el cuerpo de `docs/offering.html`, que muestra el docente
  con `docs/offering-info.html` y cada `silabo*.pdf` del bundle como documento
  (`media/document.html`, ver el visor de PDF más abajo).

**Los shortcodes.** El cuerpo usa `infobox-alert` y `resource-table`
([`layouts/_shortcodes/`](../layouts/_shortcodes), ver
[shortcodes](shortcodes.md)). `resource-table` llama a
`docs/resource-table.html`, que hace `Get` del YAML dentro del bundle y lo
vuelca con `transform.Unmarshal` en una tabla de libros o de listas de
reproducción.

**Los estilos y los scripts.**

- [`site/head/styles.html`](../layouts/_partials/site/head/styles.html) compila
  una hoja con `css.TailwindCSS` (Tailwind v4). Las reglas viven en dos
  archivos: [`assets/css/site.css`](../assets/css/site.css) (tokens, base y
  componentes que usa toda página) y
  [`assets/css/docs.css`](../assets/css/docs.css) (tablas, código, Markdown,
  menús de la documentación y paginación). Dos entradas los importan:
  - [`assets/css/app.css`](../assets/css/app.css), para toda página salvo la
    portada, importa los dos. Hugo genera `hugo_stats.json`
    (`build.buildStats.enable`) y `app.css` lo lee con `@source`: solo se emiten
    las utilidades que usan las plantillas.
  - [`assets/css/home.css`](../assets/css/home.css), para la portada, importa
    solo `site.css` y toma las utilidades de las plantillas que la portada
    pinta, así la hoja que bloquea su primer pintado es pequeña. Una regla que
    la portada no usa va en `docs.css`.

  Las dos se enlazan fingerprinteadas. Una hoja en línea agranda el documento
  más allá de la primera ventana TCP (unos 14 KB comprimidos), y esa ventana de
  más costó más que pedir la hoja aparte.

  KaTeX tiene su propia hoja, enlazada solo con `math: true`.

- [`site/head/scripts.html`](../layouts/_partials/site/head/scripts.html) pone
  `assets/js/color-mode.ts` en línea para aplicar el tema antes del primer
  pintado.
- [`site/scripts.html`](../layouts/_partials/site/scripts.html) compila los
  `.ts` de `assets/js/` con `js.Build` (esbuild) a través de `site/script.html`.
  El paquete base reúne la navegación (`assets/js/navigation.ts`), instant.page
  según `params.toml`, y clipboard solo si el contenido tiene un `<pre>`;
  highlight.js, KaTeX y Mermaid se cargan solo donde se usan, y el reproductor
  del video (`player.ts`) solo en la portada. El buscador
  (`assets/js/search.ts`, sobre la API de Pagefind) se carga en todas las
  páginas, con sus atajos Ctrl/⌘ K y `/`; su diálogo está en
  [`search/dialog.html`](../layouts/_partials/search/dialog.html). El paquete
  base y el buscador se piden después de `load` y del primer pintado
  (`site/load-after.html`).
- [`media/document.html`](../layouts/_partials/media/document.html) dibuja un
  PDF como documento: título, tamaño, «Descargar» y, con `open`, el visor
  abierto; sin `open`, «Ver» lo despliega. Marca la página con
  `.Store.Set "pdf"`, y `site/scripts.html` carga entonces
  [`assets/js/pdf-viewer.ts`](../assets/js/pdf-viewer.ts), que importa pdf.js
  solo cuando un visor se abre y dibuja una página a la vez en un `<canvas>`. Si
  el PDF no carga, el visor muestra el error y deja el enlace «Abrir en otra
  pestaña».
- `module.toml` monta `mermaid`, `katex` y `pdfjs-dist` desde `node_modules` en
  `assets/js/vendor/`, y las fuentes de Jost y KaTeX (solo `.woff2`) en
  `static/fonts/`. `assets/js/vendor/` no se edita. Las `@font-face` de Jost
  están en `site.css`, y `site/head/fonts.html` precarga la Jost recta.

**La compilación.** `bun run build` ejecuta `hugo --gc --minify` y
`pagefind --site public`. Hugo escribe las páginas, `_headers`, `_redirects` y
`sitemap.xml` en `public/`; Pagefind indexa `data-pagefind-body` y escribe
`public/pagefind/`. El menú, las migas de pan, el pie y la paginación llevan
`data-pagefind-ignore="all"`, así los resultados muestran solo el texto de la
página.

**El servidor.** [`wrangler.toml`](../wrangler.toml) define el Worker `web`:
`assets.directory = "./public"` lo sirve y las rutas inexistentes devuelven
`404.html` (`not_found_handling = "404-page"`). El host sale de `baseURL` en
[`config/_default/config.toml`](../config/_default/config.toml). Detalles:
[despliegue](despliegue.md).

## Mapa del código

| Ruta                            | Responsabilidad                                                               |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `content/`                      | Páginas en Markdown, YAML de recursos y PDF. Ver [contenido](contenido.md).   |
| `layouts/`                      | Plantillas Go de Hugo, shortcodes y parciales.                                |
| `assets/`                       | CSS, TypeScript, fuentes e iconos que Hugo compila.                           |
| `static/`                       | Archivos que se copian tal cual: favicons, imágenes, fuentes.                 |
| `data/`                         | JSON y YAML leídos con `hugo.Data`: cabeceras CSP, meses, portada y miembros. |
| `config/`                       | Configuración de Hugo por entorno.                                            |
| `archetypes/`                   | Moldes de `hugo new`.                                                         |
| `scripts/`                      | `screenshots.ts`, genera las capturas de `content/experimental`.              |
| `.github/`                      | Flujos de trabajo, plantillas de incidencias y `CONTRIBUTING.md`.             |
| `wrangler.toml`, `netlify.toml` | Despliegue. Ver [despliegue](despliegue.md).                                  |
| `.pages.yml`                    | Esquema de los campos de Pages CMS.                                           |

## Configuración

`config/_default/` tiene `config.toml` (salidas, taxonomías, permalinks),
`markup.toml`, `menus.toml`, `module.toml` y `params.toml`.

- Taxonomías: `contributors`, `types` y `functionalities`. Los permalinks de
  `blog`, `types` y `functionalities` están en `[permalinks]`.
- `home` produce además `_redirects` y `_headers` (formatos de salida
  `REDIRECTS` y `HEADERS`), generados por `layouts/index.redirects` y
  `layouts/index.headers`. La política CSP sale de `data/fixes/headers.yml`.
- `layouts/sitemap.xml` genera `/sitemap.xml`. Una página con
  `sitemap_exclude: true` en el front matter no entra.
- `params.toml` activa las funciones del sitio en `options` (KaTeX, modo oscuro,
  resaltado).
- Las imágenes de Markdown (`_markup/render-image.html`) y del shortcode `img`
  pasan por [`media/picture.html`](../layouts/_partials/media/picture.html), que
  arma el `srcset` con los anchos de `params.toml` y usa la carga diferida del
  navegador (`loading="lazy"`).

Otras carpetas de `layouts/`: las secciones `blog`, `experimental` y
`professors` usan la carpeta con su nombre; `experimental/taxonomy.html` y
`experimental/term.html` dibujan sus taxonomías `types` y `functionalities`; la
página de enlaces fija `type: links` y usa `layouts/links/page.html`.
