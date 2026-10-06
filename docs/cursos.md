# Agregar un curso

Una guía de curso es una carpeta de `content/unmsm/pregrado/plan-2018/` con el
código del curso. Contiene la guía, los YAML de recursos y una carpeta por
semestre con el sílabo.

```text
content/unmsm/pregrado/plan-2018/CFO601/
├── _index.md                           guía del curso
├── books-theoretical-practical.yaml    libros
├── books-documents.yaml                libros
└── 2022-II/
    ├── index.md                        sílabo del semestre
    └── silabo.pdf
```

## La guía

Crea el archivo con el molde `pregrado`:

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO601/_index.md
```

Campos del front matter que usan las plantillas:

| Campo           | Uso                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------- |
| `title`         | Nombre del curso.                                                                             |
| `lead`          | Texto de apertura bajo el título.                                                             |
| `description`   | Resumen para buscadores y redes sociales.                                                     |
| `id`            | Código del curso. Sin `id` no aparece la caja de información.                                 |
| `credits`       | Créditos, en la caja de información.                                                          |
| `prerequisites` | Lista de textos; se unen con « y » en la caja de información.                                 |
| `semester`      | Número de ciclo. El menú lateral agrupa los cursos por este valor.                            |
| `topics`        | Lista de temas. La página muestra «Cursos equivalentes» con las que comparten el primer tema. |
| `contributors`  | Slugs de `content/contributors/`. Uno inexistente detiene la compilación.                     |
| `working`       | Con `true`, muestra el aviso «Estamos trabajando en este curso».                              |
| `math`          | Con `true`, carga KaTeX para las fórmulas.                                                    |
| `mermaid`       | Con `true`, carga Mermaid para el shortcode `mermaid`.                                        |
| `weight`        | Orden de la página; Hugo ordena de menor a mayor.                                             |
| `draft`         | Con `true`, la página no se publica.                                                          |

La caja de información (código, créditos, prerrequisitos, docentes y sílabos)
aparece en las páginas de `content/unmsm/` que tienen `id`:
`content/unmsm/_index.md` activa `showInformationBox` para sus descendientes.

El cuerpo es Markdown. Los libros y las listas de reproducción se insertan con
el shortcode `resource-table`:

```markdown
## Libros recomendados

{{< resource-table resource="books-theoretical.yaml" type="book" >}}

## Listas de reproducción

{{< resource-table resource="playlists.yaml" type="playlist" >}}
```

`resource` es el nombre de un archivo YAML en la carpeta del curso.

## Libros

`type="book"`. Cada elemento de la lista es un libro:

```yaml
- author: Mesherski
  title: Problemas de mecánica teórica
  editorial: Mir Moscú
  year: "1974"
  edition: 1ra ed.
  url: https://drive.google.com/file/d/…/view
```

Si un libro tiene varias ediciones, reemplaza `url`, `edition` y `year` por una
lista `links`; cada enlace lleva `url`, `edition` y `year`:

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

## Listas de reproducción

`type="playlist"`:

```yaml
- title: "Physics I: Classical Mechanics"
  channel: MIT OpenCourseWare
  lecturer: Walter Lewin
  videos: "35"
  url: https://www.youtube.com/playlist?list=…
```

## Sílabos

Un sílabo es una carpeta `AAAA-I` o `AAAA-II` dentro del curso, con un
`index.md` y, opcionalmente, un PDF cuyo nombre empiece por `silabo`:

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

`professor` es el nombre de una carpeta de `content/professors/`. La página del
sílabo muestra el semestre, el docente y cada archivo `silabo*.pdf` en un visor.
Sin PDF muestra «No hay sílabo disponible para este semestre».

## Docentes

Un docente es `content/professors/<slug>/index.md`:

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

`honorific` y `title` forman el nombre que se muestra en las tablas de sílabos.
