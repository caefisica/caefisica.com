# Shortcodes

Los shortcodes están en [`layouts/_shortcodes/`](../layouts/_shortcodes). Se
usan dentro del Markdown de `content/`.

## `resource-table`

Lista de libros o de listas de reproducción desde un YAML de la carpeta de la
página. Cada fila muestra título, autor y editorial (o docente, canal y número
de videos) y un botón por enlace: la edición y el año de un libro, «Ver lista»
de una lista. Los campos del YAML están en [cursos](cursos.md#libros).

```markdown
{{< resource-table resource="books-theoretical.yaml" type="book" >}}
{{< resource-table resource="playlists.yaml" type="playlist" >}}
```

| Parámetro  | Valores                                                              |
| ---------- | -------------------------------------------------------------------- |
| `resource` | Nombre del YAML dentro de la carpeta de la página. Obligatorio.      |
| `type`     | `book` o `playlist`. Obligatorio; otro valor detiene la compilación. |

## `research-groups`

Grupos de investigación desde el campo `groups` del front matter de la página:
primero un índice por línea de investigación, después una fila por grupo
ordenada por sigla. Sin `groups` la compilación falla. Lo usa
`content/unmsm/facultad/gi.md`.

```yaml
groups:
  - acronym: GISICOF
    name: Grupo de Investigación de Sistemas Complejos Funcionalizados
    url: https://vrip.unmsm.edu.pe/gisicof
    head: { professor: carlos-landauro-saenz, email: clandauros@unmsm.edu.pe }
    lines:
      - Propiedades estructurales de las nanopartículas
```

| Campo     | Valores                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `acronym` | Sigla. Su versión en minúsculas es el ancla de la fila (`#gisicof`).                                                    |
| `name`    | Nombre del grupo. Si es igual a la sigla, se muestra una vez.                                                           |
| `url`     | Página del grupo. Opcional; con ella la fila muestra el botón «VRIP».                                                   |
| `head`    | `email` y, o bien `name`, o bien `professor`: el slug de un docente, que enlaza su página. Un slug que no existe falla. |
| `lines`   | Líneas de investigación. Opcional. Escribe la misma línea con el mismo texto en cada grupo, o el índice la separa.      |

```markdown
{{< research-groups >}}
```

## `alert`

Aviso con un icono. El texto va en `text` o entre las etiquetas.

```markdown
{{< alert icon="📌" text="Este curso requiere Cálculo II." />}}
```

| Parámetro | Valores                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------- |
| `icon`    | Texto o emoji que se muestra a la izquierda.                                                       |
| `context` | Variante de color: `warning` (por defecto), `info`, `danger`, `primary`, `dark`, `light` o `white` |
| `text`    | Contenido HTML. Si falta se usa el contenido interior.                                             |

## `infobox-alert`

Recuadro con un icono de información. Acepta `text` o contenido interior, que se
procesa como Markdown.

```markdown
{{< infobox-alert text="En este curso verás los conceptos básicos." />}}
```

## `details`

Bloque desplegable. El primer argumento es el título; el segundo, opcional, se
copia como atributo de `<details>` (por ejemplo `open`).

```text
{{< details "Acerca de los libros" >}}
Texto en Markdown.
{{< /details >}}
```

## `pdf`

Un PDF como documento: una fila con título, tamaño, «Ver» y «Descargar»; «Ver»
despliega el visor. La compilación falla si el archivo no existe.

```markdown
{{< pdf file="plan2018.pdf" title="Plan de estudios 2018" >}}
```

| Parámetro | Valores                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `file`    | Nombre del PDF en la carpeta de la página. Una página de un solo archivo lo busca en la carpeta de su sección. |
| `title`   | Nombre del documento. Por defecto, el nombre del archivo.                                                      |
| `open`    | `true` muestra el visor abierto, para una página cuyo contenido es el documento.                               |

## `img` e `img-simple`

Imagen de la carpeta de la página. `src` se busca como fragmento del nombre de
archivo.

```markdown
{{< img src="feynmann.jpg" alt="Feynman en el CERN" caption="© CERN" class="border-0" >}}
{{< img-simple src="3Blue1Brown.png" alt="Miniatura del video" >}}
```

| Parámetro | Shortcode           | Valores                           |
| --------- | ------------------- | --------------------------------- |
| `src`     | `img`, `img-simple` | Fragmento del nombre del archivo. |
| `alt`     | `img`, `img-simple` | Texto alternativo.                |
| `class`   | `img`, `img-simple` | Clases CSS adicionales.           |
| `caption` | `img`               | Pie de imagen en HTML.            |

## `mermaid`

Diagrama [Mermaid](https://mermaid.js.org). La página debe tener `mermaid: true`
en el front matter; sin él la compilación falla.

```text
{{< mermaid class="text-center" >}}
graph LR
A[Física Matemática III] --> B[Ecuaciones de la Física Matemática]
{{< /mermaid >}}
```

`class` agrega clases CSS al contenedor.
