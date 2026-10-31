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

**Los parciales.** `single.html` compone la página con parciales de
[`layouts/partials/`](../layouts/partials):

- `sidebar/aside.html` → `sidebar/docs-menu.html`: para las URL `/plan-*` usa
  [`sidebar/plan-nav.html`](../layouts/partials/sidebar/plan-nav.html), que
  agrupa los cursos por su campo `semester`; el resto de las secciones `docs`
  usa `sidebar/render-auto-nav.html`, que arma el árbol del menú desde las
  secciones de Hugo.
- `main/blog-meta.html` resuelve cada slug de `contributors` a
  `content/contributors/<slug>` con `components/resolve-contributors.html` y
  dibuja fecha y tiempo de lectura.
- `components/information_box.html` dibuja la caja de información (código,
  créditos, prerrequisitos, docentes de los sílabos y semestres con
  `silabo*.pdf`) en las páginas con `showInformationBox` e `id`. Cada slug de
  `professor` se resuelve con `components/resolve-professor.html`: si la carpeta
  no existe en `content/professors/`, la compilación falla.
- `main/edit-page.html` pone el enlace «Edita esta página» al pie.
- El sílabo `2022-I/index.md` usa `layout: "offering"`:
  [`layouts/docs/offering.html`](../layouts/docs/offering.html) muestra el
  docente con `components/offering-details.html` y cada `silabo*.pdf` del bundle
  en el visor `components/pdfjs-viewer.html`.

**Los shortcodes.** El cuerpo usa `infobox-alert` y `resource-table`
([`layouts/shortcodes/`](../layouts/shortcodes), ver
[shortcodes](shortcodes.md)). `resource-table` llama a
`components/resource-table.html`, que hace `Get` del YAML dentro del bundle y lo
vuelca con `transform.Unmarshal` en una tabla de libros o de listas de
reproducción.

**Los estilos y los scripts.**

- [`partials/head/stylesheet.html`](../layouts/partials/head/stylesheet.html)
  compila una hoja con `css.TailwindCSS` (Tailwind v4). Las reglas viven en dos
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

- [`partials/head/script-header.html`](../layouts/partials/head/script-header.html)
  pone `assets/js/color-mode.ts` en línea para aplicar el tema antes del primer
  pintado.
- [`partials/footer/script-footer.html`](../layouts/partials/footer/script-footer.html)
  compila los `.ts` de `assets/js/` con `js.Build` (esbuild). El paquete base
  reúne la navegación (`assets/js/navigation.ts`), los atajos de teclado,
  lazysizes e instant.page según `params.toml`, y clipboard solo si el contenido
  tiene un `<pre>`; highlight.js, KaTeX, Mermaid y el buscador
  (`assets/js/search.ts`, la interfaz de Pagefind) se cargan solo donde se usan.
  `main.js` y el buscador se piden después de `load` y del primer pintado
  (`partials/footer/load-after.html`). Las cabeceras `Link` de precarga salen de
  `head/resource-hints.html`.
- `module.toml` monta `mermaid`, `katex` y `pdfjs-dist` desde `node_modules` en
  `assets/js/vendor/`, y las plantillas de `@thulite/images` en `layouts/`
  (`_shortcodes`, `_markup` y `_partials`). Un `_shortcodes` montado gana a
  `layouts/shortcodes/` del sitio; `layouts/_shortcodes/` del sitio gana al
  montado. `assets/js/vendor/` no se edita.

**La compilación.** `bun run build` ejecuta `hugo --gc --minify` y
`pagefind --site public`. Hugo escribe las páginas, `_headers`, `_redirects` y
`sitemap.xml` en `public/`; Pagefind indexa `data-pagefind-body` y escribe
`public/pagefind/`.

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
- `params.toml` activa las funciones del sitio en `options` (lazysizes, KaTeX,
  modo oscuro, resaltado).

Otras carpetas de `layouts/`: las secciones `blog`, `experimental`,
`biblioteca`, `contacto` y `professors` usan la carpeta con su nombre; algunas
páginas fijan `type` en su front matter (`extend`, `links`); `layouts/types/` y
`layouts/functionalities/` dibujan las taxonomías de `experimental`.
