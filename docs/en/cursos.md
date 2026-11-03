# Add a course

[Español](../es/cursos.md)

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO601/_index.md
```

A course guide is a folder in `content/unmsm/pregrado/plan-2018/` named with the
course code. It holds the guide, the resource YAML files and one folder per term
with the syllabus:

```text
content/unmsm/pregrado/plan-2018/CFO601/
├── _index.md                           course guide
├── books-theoretical-practical.yaml    books
├── books-documents.yaml                books
└── 2022-II/
    ├── index.md                        syllabus of the term
    └── silabo.pdf
```

## The guide

Front matter fields the templates use:

| Field           | Use                                                                 |
| --------------- | ------------------------------------------------------------------- |
| `title`         | Course name.                                                        |
| `lead`          | Opening text under the title.                                       |
| `description`   | Summary for search engines and social networks.                     |
| `id`            | Course code. Without `id` the information box does not appear.      |
| `credits`       | Credits, in the information box.                                    |
| `prerequisites` | List of texts; joined with " y " in the information box.            |
| `semester`      | Term number. The side menu groups courses by this value.            |
| `contributors`  | Slugs in `content/contributors/`. See [naming](contenido.md#names). |
| `working`       | With `true`, shows the notice "Estamos trabajando en este curso".   |
| `math`          | With `true`, loads KaTeX for formulas.                              |
| `mermaid`       | With `true`, loads Mermaid for the `mermaid` shortcode.             |
| `weight`        | Page order; Hugo sorts from lowest to highest.                      |
| `draft`         | With `true`, the page is not published. `bun run dev` shows it.     |

The information box (code, credits, prerequisites, lecturers and syllabi)
appears on the pages of `content/unmsm/` that have an `id`:
`content/unmsm/_index.md` turns on `showInformationBox` for its descendants. The
"Profesores" row gathers the `professor` of the guide's syllabi, without
repeats. The "Sílabos" row links, newest term first, each syllabus that has a
`silabo*.pdf`. A row without data is not drawn.

The body is Markdown. Books and playlists are inserted with the `resource-table`
shortcode:

```markdown
## Libros recomendados

{{< resource-table resource="books-theoretical.yaml" type="book" >}}

## Listas de reproducción

{{< resource-table resource="playlists.yaml" type="playlist" >}}
```

`resource` is the name of a YAML file in the course folder.

## Books

`type="book"`. Each item of the list is a book:

```yaml
- author: Mesherski
  title: Problemas de mecánica teórica
  editorial: Mir Moscú
  year: "1974"
  edition: 1ra ed.
  url: https://drive.google.com/file/d/…/view
```

If a book has several editions, replace `url`, `edition` and `year` with a
`links` list; each link carries `url`, `edition` and `year`:

```yaml
- author: Autor
  title: Título
  editorial: Editorial
  links:
    - url: https://example.com/2da
      edition: 2da ed.
      year: "2010"
    - url: https://example.com/3ra
      edition: 3ra ed.
      year: "2015"
```

## Playlists

`type="playlist"`:

```yaml
- title: "Physics I: Classical Mechanics (1999)"
  channel: CosmoLearning
  lecturer: Walter Lewin
  videos: "35"
  url: https://www.youtube.com/playlist?list=…
  description: >-
    Las clases de 8.01 que Walter Lewin dictó en el MIT en 1999…
```

Each entry also appears in `/videos/`, grouped by course. A YouTube playlist (a
`url` with `list=`) or a shared Google Drive folder (a `url` with
`/drive/folders/`) has its own page there: a player, its lessons with their
duration and `description`, which is written in Markdown and says what the list
covers, at what level and in what language. If `lecturer` matches the name of a
profile in `/fisicos/`, the page links the profile and the profile lists the
lesson. The subfolders of a Drive folder are sections of the list, in the order
of the numbers their names start with. If the top-level folders carry no number,
`sections` lists them in lesson order:

```yaml
- title: Mecánica
  url: https://drive.google.com/drive/folders/…
  sections:
    - Vectores
    - Cinemática
```

A folder that `sections` does not name goes after, by name. A list that several
courses cite has a single page, with the title and description of the first
course. Any other link (a channel, a page of links) is listed and opens where it
is.

The lessons come from `data/playlists/<id>.json`, which `bun run playlists`
writes with [yt-dlp](https://github.com/yt-dlp/yt-dlp); the `<id>` is the
playlist's or the folder's. `bun run playlists <id>…` updates only those lists.
On Drive it queries only the files the JSON does not have yet: a file's duration
does not change, and Drive cuts a burst of queries with a 429 error. On that
error the script does not write the list. The script skips private or deleted
videos, and on Drive the files that are not video. It also skips those that
`skip` names by id: videos the author uploaded to the list that do not belong to
the course, because the whole list is downloaded each time. A list without JSON
is listed as an external link. A list that YouTube or Drive no longer serves is
deleted from `playlists.yaml`. `videos` is shown only for links without a page;
for the others the JSON counts.

## Syllabi

A syllabus is a term folder inside the course ([naming](contenido.md#names)),
with an `index.md` and, optionally, a PDF whose name starts with `silabo`:

```bash
hugo new content --kind offering unmsm/pregrado/plan-2018/CFO601/2024-I/index.md
```

```yaml
---
title: "Electromagnetismo I — 2024-I"
professor: "fulgencio-villegas-silva"
semester: "2024-I"
date: 2022-08-01T00:00:00
draft: false
layout: "offering"
---
```

`professor` is a lecturer slug (see [naming](contenido.md#names)). Without
`professor` the syllabus shows no "Docente" row. The syllabus page shows the
term, the lecturer and each `silabo*.pdf` file in a viewer. Without a PDF it
shows "No hay sílabo disponible para este semestre".

## Lecturers

A lecturer is `content/professors/<slug>/index.md`:

```bash
hugo new content --kind professor professors/fulgencio-villegas-silva/index.md
```

```yaml
---
title: "Fulgencio Villegas Silva"
honorific: "Dr."
institution: "unmsm"
draft: false
date: 2024-01-01T00:00:00
---
```

`honorific` and `title` form the lecturer's name in the guide's information box,
in the syllabus header and on the pages of `content/professors/`. `institution`
is a key of `data/universities.yaml` (see
[universities](contenido.md#universities)). The lecturer's page lists the
courses of the syllabi that name them in `professor`, with one link per term.
