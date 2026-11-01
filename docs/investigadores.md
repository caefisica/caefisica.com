# Agregar un investigador

Cada investigador es una carpeta `content/investigadores/<slug>/` con un
`index.md`. La página se lee como un artículo de enciclopedia: cada dato enlaza
una fuente pública.

## Fuentes

`sources` es la lista de fuentes, en el orden en que se numeran. Cada una tiene
`key`, `title` y `url`. Las entradas de `timeline` las citan con `cite` y el
texto con el shortcode `cite`:

```markdown
Volvió a la PUCP en 2015 {{</* cite "orcid" */>}}.
```

Una clave que no está en `sources` detiene la compilación.

Sirven el registro ORCID, la ficha de la universidad, una nota de prensa de la
universidad y el perfil de OpenAlex. Un perfil de LinkedIn no sirve: no es
público sin cuenta.

## Front matter

| Campo            | Contenido                                                   |
| ---------------- | ----------------------------------------------------------- |
| `role`           | Puesto actual e institución.                                |
| `fields`         | Campos de investigación. La lista muestra los dos primeros. |
| `studied`        | Universidades donde estudió.                                |
| `collaborations` | Experimentos o colaboraciones.                              |
| `timeline`       | `years`, `text` y `cite` (lista de claves).                 |
| `sources`        | Ver arriba.                                                 |
| `openalex`       | `ids` (autores de OpenAlex) y `maxAuthors`.                 |
| `images`         | Foto opcional. Sin ella, la página muestra la inicial.      |

## Foto

Solo una foto con licencia libre (Wikimedia Commons) o enviada por la persona.
Las fotos de las universidades y de la prensa tienen derechos reservados.

## Publicaciones

`bun run researchers` consulta OpenAlex y escribe
`data/researchers/<slug>.json`: total de trabajos y citas, y los seis trabajos
más citados con a lo sumo `maxAuthors` autores. Un autor puede tener varios
perfiles en OpenAlex; `ids` los suma. `maxAuthors` deja fuera los artículos de
las grandes colaboraciones, que firman cientos de personas. Vuelve a correrlo
para actualizar los datos y confirma el JSON.

## Mapa de físicos

`/fisicos/` dibuja un globo con las instituciones donde estudiaron o trabajan
las personas de `data/physicists.json`, y debajo la misma información como
lista. El JSON sale de las fichas públicas de CTI Vitae: `places` lista las
instituciones con sus coordenadas (`lat` y `lon` nulos si no tienen ubicación) y
`people` lista a cada persona con sus grados (`studied`) y sus puestos
(`works`). Las fichas cambian poco; actualízalo a lo sumo una vez al año y
cambia `fetched`.

Cuando el JSON gana una institución fuera del Perú, corre `bun run landmask`.
Reescribe `assets/maps/land.bin` con la costa detallada alrededor de cada
institución; el formato está al inicio de `scripts/landmask.ts`.
