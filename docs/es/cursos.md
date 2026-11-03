# Agregar un curso

[English](../en/cursos.md)

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO601/_index.md
```

Una guía de curso es una carpeta de `content/unmsm/pregrado/plan-2018/` con el
código del curso. Contiene la guía, los YAML de recursos y una carpeta por
semestre con el sílabo:

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

Campos del front matter que usan las plantillas:

| Campo           | Uso                                                                    |
| --------------- | ---------------------------------------------------------------------- |
| `title`         | Nombre del curso.                                                      |
| `lead`          | Texto de apertura bajo el título.                                      |
| `description`   | Resumen para buscadores y redes sociales.                              |
| `id`            | Código del curso. Sin `id` no aparece la caja de información.          |
| `credits`       | Créditos, en la caja de información.                                   |
| `prerequisites` | Lista de textos; se unen con « y » en la caja de información.          |
| `semester`      | Número de ciclo. El menú lateral agrupa los cursos por este valor.     |
| `contributors`  | Slugs de `content/contributors/`. Ver [nombres](contenido.md#nombres). |
| `working`       | Con `true`, muestra el aviso «Estamos trabajando en este curso».       |
| `math`          | Con `true`, carga KaTeX para las fórmulas.                             |
| `mermaid`       | Con `true`, carga Mermaid para el shortcode `mermaid`.                 |
| `weight`        | Orden de la página; Hugo ordena de menor a mayor.                      |
| `draft`         | Con `true`, la página no se publica. `bun run dev` la muestra.         |

La caja de información (código, créditos, prerrequisitos, docentes y sílabos)
aparece en las páginas de `content/unmsm/` que tienen `id`:
`content/unmsm/_index.md` activa `showInformationBox` para sus descendientes. La
fila «Profesores» reúne el `professor` de los sílabos de la guía, sin
repetirlos. La fila «Sílabos» enlaza, del semestre más reciente al más antiguo,
cada sílabo que tiene un `silabo*.pdf`. Una fila sin datos no se dibuja.

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
- title: "Physics I: Classical Mechanics (1999)"
  channel: CosmoLearning
  lecturer: Walter Lewin
  videos: "35"
  url: https://www.youtube.com/playlist?list=…
  description: >-
    Las clases de 8.01 que Walter Lewin dictó en el MIT en 1999…
```

Cada entrada aparece también en `/videos/`, agrupada por curso. Una lista de
YouTube (una `url` con `list=`) o una carpeta compartida de Google Drive (una
`url` con `/drive/folders/`) tiene allí su propia página: un reproductor, sus
clases con su duración y `description`, que se escribe en Markdown y dice qué
cubre la lista, a qué nivel y en qué idioma. Si `lecturer` coincide con el
nombre de un perfil de `/fisicos/`, la página enlaza el perfil y el perfil lista
la clase. Las subcarpetas de una carpeta de Drive son secciones de la lista, en
el orden de los números con que empiezan sus nombres. Si las carpetas de primer
nivel no llevan número, `sections` las lista en el orden de la clase:

```yaml
- title: Mecánica
  url: https://drive.google.com/drive/folders/…
  sections:
    - Vectores
    - Cinemática
```

Una carpeta que `sections` no nombra va después, por nombre. Una lista que
varios cursos citan tiene una sola página, con el título y la descripción del
primer curso. Cualquier otro enlace (un canal, una página con enlaces) se lista
y abre donde está.

Las clases salen de `data/playlists/<id>.json`, que escribe `bun run playlists`
con [yt-dlp](https://github.com/yt-dlp/yt-dlp); el `<id>` es el de la lista o el
de la carpeta. `bun run playlists <id>…` actualiza solo esas listas. En Drive,
solo consulta los archivos que el JSON aún no tiene: la duración de un archivo
no cambia, y Drive corta una ráfaga de consultas con un error 429. Ante ese
error el script no escribe la lista. El script omite los videos privados o
eliminados, y en Drive los archivos que no son video. También omite los que
`skip` nombra por su id: videos que el autor subió a la lista y no son del
curso, porque la lista se descarga entera cada vez. Una lista sin JSON se lista
como enlace externo. Una lista que YouTube o Drive ya no sirve se borra del
`playlists.yaml`. `videos` solo se muestra para los enlaces sin página; para las
demás cuenta el JSON.

## Sílabos

Un sílabo es una carpeta de semestre dentro del curso
([nombre](contenido.md#nombres)), con un `index.md` y, opcionalmente, un PDF
cuyo nombre empiece por `silabo`:

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

`professor` es el slug de un docente (ver [nombres](contenido.md#nombres)); si
no existe esa carpeta, la compilación falla. Sin `professor` el sílabo no
muestra la fila «Docente». La página del sílabo muestra el semestre, el docente
y cada archivo `silabo*.pdf` en un visor. Sin PDF muestra «No hay sílabo
disponible para este semestre».

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

`honorific` y `title` forman el nombre del docente en la caja de información de
la guía, en la cabecera del sílabo y en las páginas de `content/professors/`.
`institution` es una clave de `data/universities.yaml` (ver
[universidades](contenido.md#universidades)). La página del docente lista los
cursos de los sílabos que lo nombran en `professor`, con un enlace por semestre.
