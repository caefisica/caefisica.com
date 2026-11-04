# Content

[Español](../es/contenido.md)

Where each file in `content/` goes and how it is named.

## Structure

```text
content/
├── unmsm/
│   ├── pregrado/plan-2018/<CODE>/     course guides
│   ├── posgrado/                      master's and doctorate
│   └── facultad/                      faculty information
├── apuntes/<topic>/                   notes by topic
├── blog/<NNN-name>/index.md           blog posts
├── unmsm/docentes/_index.md           list of who teaches the syllabi
├── personas/_content.gotmpl           one page per person in the registries
├── personas/<slug>/index.md           written text about a person
├── fisicos/_index.md                  the map of Peruvian physicists
├── videos/_content.gotmpl             one page per playlist in playlists.yaml
├── tesis/_content.gotmpl              one page per thesis in data/theses.json
├── grabaciones/_index.md              list of data/recordings.json
├── equipo/_index.md                   the team, from data/team.yaml
├── contacto/, privacidad/
├── redes.md
└── _index.md                          home page
```

## Names

| Item            | Rule                                      | Example                                    |
| --------------- | ----------------------------------------- | ------------------------------------------ |
| Course folder   | Course code in capitals.                  | `CBE013`                                   |
| Syllabus folder | Academic term `YYYY-I` or `YYYY-II`.      | `2022-I`                                   |
| Person slug     | Full name in lowercase with hyphens.      | `carlos-vladimir-landauro-saenz`           |
| Blog post       | Three-digit number and a hyphenated name. | `003-faq`                                  |
| Resource YAML   | Any name; the shortcode cites it.         | `books-theoretical.yaml`, `playlists.yaml` |

Hugo lowercases addresses: `CBE013` is published at
`/unmsm/pregrado/plan-2018/cbe013/`.

## Description

`description` says in one sentence what the page holds, such as "The thermal and
caloric equations of state, and the isothermal, isobaric and isochoric
processes". Search engines show it, and a section index puts it under the page
title. A course does not show it there: its row carries the code and the
credits. Without such a sentence, leave the field empty.

On a top-level section's index, the header crumb already names the section, so
`headline` is the h1: a short statement of what the section shows, such as
"Quién contrata físicos en el Perú". Without it the title stays for screen
readers only and the page opens on its content.

`unmsm/pregrado/_index.md` is not published (`build.render: never`):
`/unmsm/pregrado/` redirects to `plan-2018/`, the only plan.

## People

Each person has one page, `/personas/<slug>/`, and the slug is their only key.
The slug is in one of two registries:

- [`data/physicists.json`](../../data/physicists.json): the physicists on the
  map. See [physicists](fisicos.md).
- [`data/people.toml`](../../data/people.toml): everyone else, such as those who
  write the guides. Each entry has `slug`, `name` and, optionally, `about`.

A slug cannot be in both. To write about a person, create
`content/personas/<slug>/index.md`; the template adds the registry data. The
photo goes in `static/images/personas/<slug>.webp` or `.jpg`, and its source in
[`data/photos.yaml`](../../data/photos.yaml).

The page puts the name and one line at the top that says who they are: `role` on
a written page; on a data page, their current post and their highest degree with
its institution, such as "Profesor principal, UNMSM · Doctorado en física, TU
Chemnitz". The facts follow in one row of label and value cells, between two
rules, and the sections come after them. Each section starts with
`<h2 id="…">Title <span class="count">N</span></h2>`. A list of eight rows or
more shows five and a button with the rest.

These fields name a person by slug:

| Where                                              | Field          |
| -------------------------------------------------- | -------------- |
| Syllabus                                           | `professor`    |
| Guide and blog post                                | `contributors` |
| List in `playlists.yaml`                           | `person`       |
| Speaker in `data/recordings.json`                  | `slug`         |
| Research group (`gi.md`)                           | `head.person`  |
| Member in [`data/team.yaml`](../../data/team.yaml) | `person`       |

A slug in neither registry stops the build. A playlist without `person` shows
the `lecturer` text without a link.

[`/equipo/`](../../layouts/equipo/list.html) draws the org chart from
`data/team.yaml`, then the other authors with their number of publications, and
how to collaborate. [`/unmsm/docentes/`](../../layouts/docentes/list.html) lists
each syllabus `professor` with their courses.
[`/personas/`](../../layouts/personas/list.html) lists everyone from A to Z.

## Create a file

`hugo new content` copies an archetype from [`archetypes/`](../../archetypes).
Hugo picks the archetype by the first folder of the target; for others, pass
`--kind`:

| Archetype     | How it is chosen                      |
| ------------- | ------------------------------------- |
| `blog.md`     | Automatic in `content/blog/`.         |
| `pregrado.md` | `--kind pregrado`, for course guides. |
| `offering.md` | `--kind offering`, for syllabi.       |
| `default.md`  | Any other folder.                     |

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO999/_index.md
```

The `blog`, `pregrado` and `default` archetypes create the page with
`draft: true`; `offering`, with `draft: false`. `bun run dev` shows drafts; the
site build (`bun run build`) does not publish them.

## Text format

Content is Markdown processed by goldmark. Unescaped HTML is on
(`unsafe = true`), and so are GitHub-style heading ids (`markup.toml`). To
insert tables, images, PDFs and notices, use the [shortcodes](shortcodes.md).
For formulas, add `math: true` to the front matter and write LaTeX for KaTeX.
