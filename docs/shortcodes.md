# Shortcodes

Los shortcodes están en [`layouts/shortcodes/`](../layouts/shortcodes). Se usan
dentro del Markdown de `content/`. Esta página describe los que usa `content/`.

## `resource-table`

Tabla de libros o de listas de reproducción desde un YAML de la carpeta de la
página. Los campos del YAML están en [cursos](cursos.md#libros).

```markdown
{{< resource-table resource="books-theoretical.yaml" type="book" >}}
{{< resource-table resource="playlists.yaml" type="playlist" >}}
```

| Parámetro  | Valores                                                              |
| ---------- | -------------------------------------------------------------------- |
| `resource` | Nombre del YAML dentro de la carpeta de la página. Obligatorio.      |
| `type`     | `book` o `playlist`. Obligatorio; otro valor detiene la compilación. |

## `alert`

Aviso con un icono. El texto va en `text` o entre las etiquetas.

```markdown
{{< alert icon="📌" text="Este curso requiere Cálculo II." />}}
```

| Parámetro | Valores                                                           |
| --------- | ----------------------------------------------------------------- |
| `icon`    | Texto o emoji que se muestra a la izquierda.                      |
| `context` | Variante de Bootstrap: `warning` (por defecto), `info`, `danger`… |
| `text`    | Contenido HTML. Si falta se usa el contenido interior.            |

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

## `pdfjs`

Visor de PDF. `file` es el nombre de un PDF de la carpeta de la página.

```markdown
{{< pdfjs file="plan2018.pdf" >}}
```

| Parámetro       | Valores                                  |
| --------------- | ---------------------------------------- |
| `file`          | Nombre del PDF.                          |
| `hidePaginator` | `"true"` oculta los controles de página. |

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
