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
├── fisicos/<slug>/index.md            written profiles of Peruvian physicists
├── videos/_content.gotmpl             one page per playlist in playlists.yaml
├── tesis/_content.gotmpl              one page per thesis in data/theses.json
├── grabaciones/_index.md              list of data/recordings.json
├── professors/<slug>/index.md         lecturers
├── contributors/<slug>/_index.md      contributors; the index is /equipo/
├── contacto/, privacidad/
├── redes.md
└── _index.md                          home page
```

## Names

| Item               | Rule                                      | Example                                    |
| ------------------ | ----------------------------------------- | ------------------------------------------ |
| Course folder      | Course code in capitals.                  | `CBE013`                                   |
| Syllabus folder    | Academic term `YYYY-I` or `YYYY-II`.      | `2022-I`                                   |
| Lecturer folder    | Full name in lowercase with hyphens.      | `carlos-landauro-saenz`                    |
| Contributor folder | Name in lowercase.                        | `david`                                    |
| Blog post          | Three-digit number and a hyphenated name. | `003-faq`                                  |
| Resource YAML      | Any name; the shortcode cites it.         | `books-theoretical.yaml`, `playlists.yaml` |

A `contributors` slug in front matter must exist as a folder in
`content/contributors/`, or the build fails. The same holds for the `professor`
field of a syllabus and the folders of `content/professors/`.

Hugo lowercases addresses: `CBE013` is published at
`/unmsm/pregrado/plan-2018/cbe013/`.

## Description

`description` says in one sentence what the page holds, such as "The thermal and
caloric equations of state, and the isothermal, isobaric and isochoric
processes". Search engines show it, and a section index puts it under the page
title. A course does not show it there: its row carries the code and the
credits. Without such a sentence, leave the field empty.

`unmsm/pregrado/_index.md` is not published (`build.render: never`):
`/unmsm/pregrado/` redirects to `plan-2018/`, the only plan.

The team page,
[`layouts/contributors/taxonomy.html`](../../layouts/contributors/taxonomy.html),
shows the current team from `data/authors/members.json`, then the other authors
with their number of publications, and how to collaborate. A member whose `url`
is an author page links to it and is not repeated in the author list. An author
page ([`layouts/term.html`](../../layouts/term.html)) groups their publications
by section, newest first.

## Universities

Each university is a top-level section (`content/unmsm/`) and an entry in
[`data/universities.yaml`](../../data/universities.yaml):

```yaml
unmsm:
  name: Universidad Nacional Mayor de San Marcos
  section: /unmsm
```

The key is the slug the `institution` field of a lecturer uses. `/professors/`
groups lecturers by university with that name, and a lecturer's page links the
section. An `institution` that is not in the file stops the build.

To add a university, create `content/<slug>/_index.md` with
`cascade: {type: docs}`, like `content/unmsm/_index.md`, and add its entry to
the file.

## Create a file

`hugo new content` copies an archetype from [`archetypes/`](../../archetypes).
Hugo picks the archetype by the first folder of the target; for others, pass
`--kind`:

| Archetype      | How it is chosen                      |
| -------------- | ------------------------------------- |
| `blog.md`      | Automatic in `content/blog/`.         |
| `pregrado.md`  | `--kind pregrado`, for course guides. |
| `offering.md`  | `--kind offering`, for syllabi.       |
| `professor.md` | `--kind professor`, for lecturers.    |
| `default.md`   | Any other folder.                     |

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO999/_index.md
```

The `blog`, `pregrado` and `default` archetypes create the page with
`draft: true`; `offering` and `professor`, with `draft: false`. `bun run dev`
shows drafts; the site build (`bun run build`) does not publish them.

## Text format

Content is Markdown processed by goldmark. Unescaped HTML is on
(`unsafe = true`), and so are GitHub-style heading ids (`markup.toml`). To
insert tables, images, PDFs and notices, use the [shortcodes](shortcodes.md).
For formulas, add `math: true` to the front matter and write LaTeX for KaTeX.
