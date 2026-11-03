# Shortcodes

[Español](../es/shortcodes.md)

The shortcodes live in [`layouts/_shortcodes/`](../../layouts/_shortcodes). Use
them inside the Markdown of `content/`.

## `resource-table`

A list of books or playlists from a YAML file in the page's folder. Each row
shows title, author and publisher (or lecturer, channel and number of videos)
and a button per link: the edition and year of a book, "Ver lista" for a
playlist. The YAML fields are in [courses](cursos.md#books).

```markdown
{{< resource-table resource="books-theoretical.yaml" type="book" >}}
{{< resource-table resource="playlists.yaml" type="playlist" >}}
```

| Parameter  | Values                                                           |
| ---------- | ---------------------------------------------------------------- |
| `resource` | Name of the YAML in the page's folder. Required.                 |
| `type`     | `book` or `playlist`. Required; any other value stops the build. |

## `research-groups`

Research groups from the `groups` field of the page's front matter: first an
index by research line, then one row per group sorted by acronym. Without
`groups` the build fails. `content/unmsm/facultad/gi.md` uses it.

```yaml
groups:
  - acronym: GISICOF
    name: Grupo de Investigación de Sistemas Complejos Funcionalizados
    url: https://vrip.unmsm.edu.pe/gisicof
    head:
      { person: carlos-vladimir-landauro-saenz, email: clandauros@unmsm.edu.pe }
    lines:
      - Propiedades estructurales de las nanopartículas
```

| Field     | Values                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `acronym` | Acronym. Its lowercase form is the row's anchor (`#gisicof`).                                                          |
| `name`    | Group name. If equal to the acronym, it is shown once.                                                                 |
| `url`     | The group's page. Optional; with it the row shows a "VRIP" button.                                                     |
| `head`    | `email` and either `name` or `person`: the slug of a person, which links their page. A slug that does not exist fails. |
| `lines`   | Research lines. Optional. Write the same line with the same text in every group, or the index splits it.               |

```markdown
{{< research-groups >}}
```

## `alert`

A notice with an icon. The text goes in `text` or between the tags.

```markdown
{{< alert icon="📌" text="Este curso requiere Cálculo II." />}}
```

| Parameter | Values                                                                                        |
| --------- | --------------------------------------------------------------------------------------------- |
| `icon`    | Text or emoji shown on the left.                                                              |
| `context` | Colour variant: `warning` (default), `info`, `danger`, `primary`, `dark`, `light` or `white`. |
| `text`    | HTML content. If missing, the inner content is used.                                          |

## `infobox-alert`

A box with an information icon. It takes `text` or inner content, which is
processed as Markdown.

```markdown
{{< infobox-alert text="En este curso verás los conceptos básicos." />}}
```

## `details`

A collapsible block. The first argument is the title; the second, optional, is
copied as an attribute of `<details>` (for example `open`).

```text
{{< details "Acerca de los libros" >}}
Texto en Markdown.
{{< /details >}}
```

## `pdf`

A PDF as a document: a row with title, size, "Ver" and "Descargar"; "Ver" opens
the viewer. The build fails if the file does not exist.

```markdown
{{< pdf file="plan2018.pdf" title="Plan de estudios 2018" >}}
```

| Parameter | Values                                                                                  |
| --------- | --------------------------------------------------------------------------------------- |
| `file`    | Name of the PDF in the page's folder. A single-file page looks in its section's folder. |
| `title`   | Name of the document. Defaults to the file name.                                        |
| `open`    | `true` shows the viewer open, for a page whose content is the document.                 |

## `img` and `img-simple`

An image from the page's folder. `src` is matched as a fragment of the file
name.

```markdown
{{< img src="feynmann.jpg" alt="Feynman en el CERN" caption="© CERN" class="border-0" >}}
{{< img-simple src="3Blue1Brown.png" alt="Miniatura del video" >}}
```

| Parameter | Shortcode           | Values                     |
| --------- | ------------------- | -------------------------- |
| `src`     | `img`, `img-simple` | Fragment of the file name. |
| `alt`     | `img`, `img-simple` | Alternative text.          |
| `class`   | `img`, `img-simple` | Extra CSS classes.         |
| `caption` | `img`               | Caption in HTML.           |

## `mermaid`

A [Mermaid](https://mermaid.js.org) diagram. The page must have `mermaid: true`
in its front matter; without it the build fails.

```text
{{< mermaid class="text-center" >}}
graph LR
A[Física Matemática III] --> B[Ecuaciones de la Física Matemática]
{{< /mermaid >}}
```

`class` adds CSS classes to the container.
