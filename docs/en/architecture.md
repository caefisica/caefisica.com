# Architecture

[Español](../es/architecture.md)

The site is a Hugo project with no external theme: templates, styles and scripts
live here. `hugo` generates static HTML in `public/`, `pagefind` indexes it and
the Cloudflare Worker `web` serves that folder (see
[deployment](despliegue.md)). There is no server code.

```text
content/ + data/ + config/ ──▶ layouts/ ──▶ hugo ──▶ pagefind ──▶ public/ ──▶ Cloudflare
                               assets/ ──▶ esbuild + Tailwind CSS
```

## The path of a page

We follow the guide of the course `CBE013`
([`content/unmsm/pregrado/plan-2018/CBE013/_index.md`](../../content/unmsm/pregrado/plan-2018/CBE013/_index.md)),
published at `/unmsm/pregrado/plan-2018/cbe013/` (Hugo lowercases addresses).

**The content.** The guide is a branch bundle: `_index.md` carries the front
matter (`id`, `credits`, `prerequisites`, `semester`, `contributors`) and the
Markdown body; the `books-*.yaml` and `playlists.yaml` files and the term
folders (`2022-I/…`) are its resources and child pages. How `content/` is
organised: [content](contenido.md).

**The template.** [`content/unmsm/_index.md`](../../content/unmsm/_index.md)
sets `type: docs` and `showInformationBox: true` in `cascade` for the whole
section, and
[`content/unmsm/pregrado/plan-2018/_index.md`](../../content/unmsm/pregrado/plan-2018/_index.md)
sets `layout: "single"` for its descendants of type `section`. Hugo resolves
`type` + `layout` to
[`layouts/docs/single.html`](../../layouts/docs/single.html), which defines the
`main` block of [`layouts/baseof.html`](../../layouts/baseof.html). `baseof`
wraps every page: `head`, header, the content inside `data-pagefind-body` and
the footer scripts.

**The partials.** The partials in
[`layouts/_partials/`](../../layouts/_partials) are grouped by function: `site/`
(header, footer, `<head>`, scripts), `docs/` (guides and syllabi), `article/`
(pieces of any article), `data/` (lookups in the content), `media/` (images and
PDFs), `ui/` (icons, dates, avatars), and `home/` and `search/` for their pages.
`single.html` calls
[`docs/layout.html`](../../layouts/_partials/docs/layout.html) with the body of
[`docs/guide.html`](../../layouts/_partials/docs/guide.html):

- `docs/layout.html` builds the frame: the section menu, whose title links to
  the first section; breadcrumbs from below that section (one line; on narrow
  screens, only the link to the parent), title, body, footer, previous/next
  pagination, comments and, from `xl`, the table of contents
  (`article/toc.html`), which `toc: false` hides.
- [`docs/sidebar.html`](../../layouts/_partials/docs/sidebar.html) draws the
  menu with [`docs/tree.html`](../../layouts/_partials/docs/tree.html), which
  walks the section with
  [`docs/nav-node.html`](../../layouts/_partials/docs/nav-node.html). A section
  whose courses have `semester` is a curriculum: its courses group into one
  "Ciclo N" branch per term, with
  [`docs/semesters.html`](../../layouts/_partials/docs/semesters.html).
- [`article/byline.html`](../../layouts/_partials/article/byline.html) resolves
  each slug of `contributors` to `content/contributors/<slug>` with
  `data/contributors.html` and draws date, authors and reading time.
- [`docs/course-info.html`](../../layouts/_partials/docs/course-info.html) draws
  the course data (code, credits, prerequisites, lecturers and terms with
  `silabo*.pdf`) on pages with `showInformationBox` and `id`. Each `professor`
  slug resolves with `data/professor.html`: if the folder does not exist in
  `content/professors/`, the build fails.
- [`article/page-footer.html`](../../layouts/_partials/article/page-footer.html)
  puts the date of the last commit and the "Edita esta página" link.
- The syllabus `2022-I/index.md` uses `layout: "offering"`:
  [`layouts/docs/offering.html`](../../layouts/docs/offering.html) passes to
  `docs/layout.html` the body of `docs/offering.html`, which shows the lecturer
  with `docs/offering-info.html` and each `silabo*.pdf` of the bundle as a
  document (`media/document.html`, see the PDF viewer below).

**The shortcodes.** The body uses `infobox-alert` and `resource-table`
([`layouts/_shortcodes/`](../../layouts/_shortcodes), see
[shortcodes](shortcodes.md)). `resource-table` calls `docs/resource-table.html`,
which does `Get` on the YAML inside the bundle and unmarshals it with
`transform.Unmarshal` into a list of rows, one per book or playlist, with a
button per link.

**The styles and the scripts.**

- [`site/head/styles.html`](../../layouts/_partials/site/head/styles.html)
  compiles a stylesheet with `css.TailwindCSS` (Tailwind v4). The rules live in
  two files: [`assets/css/site.css`](../../assets/css/site.css) (tokens, base
  and components every page uses) and
  [`assets/css/docs.css`](../../assets/css/docs.css) (tables, code, Markdown,
  documentation menus and pagination). Two entry points import them:
  - [`assets/css/app.css`](../../assets/css/app.css), for every page except the
    home page, imports both. Hugo generates `hugo_stats.json`
    (`build.buildStats.enable`) and `app.css` reads it with `@source`: only the
    utilities the templates use are emitted.
  - [`assets/css/home.css`](../../assets/css/home.css), for the home page,
    imports only `site.css` and takes the utilities of the templates the home
    page paints, so the stylesheet that blocks its first paint is small. A rule
    the home page does not use goes in `docs.css`.

  Both are linked fingerprinted. KaTeX has its own stylesheet, linked only with
  `math: true`.

- [`site/head/scripts.html`](../../layouts/_partials/site/head/scripts.html)
  inlines `assets/js/color-mode.ts` to apply the theme before first paint.
- [`site/scripts.html`](../../layouts/_partials/site/scripts.html) compiles the
  `.ts` files of `assets/js/` with `js.Build` (esbuild) through
  `site/script.html`. The base bundle gathers the navigation
  (`assets/js/navigation.ts`), instant.page according to `params.toml`, and
  clipboard only if the content has a `<pre>`; highlight.js, KaTeX and Mermaid
  load only where they are used, and the video player (`player.ts`) only on the
  pages of `/videos/` and on YouTube or Facebook talks, and the mp4 one
  (`video.ts`) only on Educast ones. The search (`assets/js/search.ts`, over the
  Pagefind API) loads on every page, with its Ctrl/⌘ K and `/` shortcuts; its
  dialog is in
  [`search/dialog.html`](../../layouts/_partials/search/dialog.html). The base
  bundle and the search are requested after `load` and the first paint
  (`site/load-after.html`).
- [`media/document.html`](../../layouts/_partials/media/document.html) draws a
  PDF as a document: title, size, "Descargar" and, with `open`, the viewer open;
  without `open`, "Ver" unfolds it. It marks the page with `.Store.Set "pdf"`,
  and `site/scripts.html` then loads
  [`assets/js/pdf-viewer.ts`](../../assets/js/pdf-viewer.ts), which imports
  pdf.js only when a viewer opens and draws one page at a time on a `<canvas>`.
  If the PDF does not load, the viewer shows the error and leaves the "Abrir en
  otra pestaña" link.
- `module.toml` mounts `mermaid`, `katex` and `pdfjs-dist` from `node_modules`
  in `assets/js/vendor/`, and the Jost and KaTeX fonts (`.woff2` only) in
  `static/fonts/`. `assets/js/vendor/` is not edited. The Jost `@font-face`
  rules are in `site.css`, and `site/head/fonts.html` preloads the upright Jost.

**The build.** `bun run build` runs `hugo --gc --minify` and
`pagefind --site public`. Hugo writes the pages, `_headers`, `_redirects` and
`sitemap.xml` to `public/`; Pagefind indexes `data-pagefind-body` and writes
`public/pagefind/`. The menu, the breadcrumbs, the footer and the pagination
carry `data-pagefind-ignore="all"`, so results show only the page's text.

**The server.** [`wrangler.toml`](../../wrangler.toml) defines the Worker `web`:
`assets.directory = "./public"` serves it and missing routes return `404.html`
(`not_found_handling = "404-page"`). The host comes from `baseURL` in
[`config/_default/config.toml`](../../config/_default/config.toml). Details:
[deployment](despliegue.md).

## Code map

| Path            | Responsibility                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/`      | Markdown pages, resource YAML and PDFs. See [content](contenido.md).                                                     |
| `layouts/`      | Hugo Go templates, shortcodes and partials.                                                                              |
| `assets/`       | CSS, TypeScript, fonts and icons that Hugo compiles.                                                                     |
| `static/`       | Files copied as they are: favicons, images, fonts.                                                                       |
| `data/`         | JSON and YAML read with `hugo.Data`: CSP headers, months, home page and members.                                         |
| `config/`       | Hugo configuration per environment.                                                                                      |
| `archetypes/`   | Templates for `hugo new`.                                                                                                |
| `scripts/`      | `openalex.ts` and `playlists.ts` write `data/researchers/` and `data/playlists/`; `landmask.ts`, `assets/maps/land.bin`. |
| `.github/`      | Workflows, issue templates and `CONTRIBUTING.md`.                                                                        |
| `wrangler.toml` | Deployment. See [deployment](despliegue.md).                                                                             |
| `.pages.yml`    | Schema of the Pages CMS fields.                                                                                          |

## Configuration

`config/_default/` has `config.toml` (outputs, taxonomies, permalinks),
`markup.toml`, `menus.toml`, `module.toml` and `params.toml`.

- Taxonomy: `contributors`. The `blog` permalink is in `[permalinks]`.
- `home` also produces `_redirects` and `_headers` (output formats `REDIRECTS`
  and `HEADERS`), generated by `layouts/index.redirects` and
  `layouts/index.headers`. The CSP comes from `data/fixes/headers.yml`.
- `layouts/sitemap.xml` generates `/sitemap.xml`. A page with
  `sitemap_exclude: true` in its front matter is left out.
- `params.toml` turns on the site's features in `options` (KaTeX, dark mode,
  highlighting).
- Markdown images (`_markup/render-image.html`) and those of the `img` shortcode
  go through [`media/picture.html`](../../layouts/_partials/media/picture.html),
  which builds the `srcset` with the widths in `params.toml` and uses the
  browser's lazy loading (`loading="lazy"`).

Other folders in `layouts/`: the `blog`, `fisicos` and `professors` sections use
the folder with their name (a lecturer's page gathers their courses with
`data/professor-courses.html` and the name of their university with
`data/university.html`; a physicist's page numbers its sources with
`data/cite-marks.html`); the links page sets `type: links` and uses
`layouts/links/page.html`. `videos` has no content files: its adapter
`content/videos/_content.gotmpl` creates one page per playlist in the courses'
`playlists.yaml` (see [courses](cursos.md#playlists)), and `assets/js/player.ts`
plays each lesson on the same page. `grabaciones` has none either: its adapter
creates one page per series and one per talk from `data/recordings.json` (see
[talks](grabaciones.md)). `organizaciones` creates one page per place in
`data/physicists.json` (see [organisations](organizaciones.md)), and `grupos`,
one per group in `data/groups.json` (see [research groups](grupos.md)).
`revista` is a single page that lists `data/journal.json` (see
[journal](revista.md)).

## Glossary

| Term                | Meaning                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| bundle              | A folder with an `index.md` and its resources (YAML, PDFs, images). A branch bundle uses `_index.md`. |
| guide               | The `_index.md` of a course: its data, its text and its resources.                                    |
| syllabus (offering) | One term of a course: a `2022-I/` folder with `layout: "offering"` and its `silabo*.pdf`.             |
| partial             | A reusable template in `layouts/_partials/`, called with `partial`.                                   |
| shortcode           | A tag in the Markdown body, defined in `layouts/_shortcodes/`.                                        |
| content adapter     | `_content.gotmpl`: creates pages from a file in `data/` instead of one `.md` per page.                |
| `cascade`           | Front matter that a section passes to all its descendants.                                            |
| slug                | The folder name of a person (`contributors`, `professors`, `fisicos`), lowercase and without accents. |
