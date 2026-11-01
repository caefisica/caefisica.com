# Físicos

Cada persona de `data/physicists.json` tiene un perfil en `/fisicos/<slug>/`
(ver [Mapa de físicos](#mapa-de-físicos)). Para escribir el perfil de alguien,
crea `content/fisicos/<slug>/index.md` con el mismo `slug` del JSON: esa página
reemplaza a la generada y la misma plantilla le suma los datos del JSON. Se lee
como un artículo de enciclopedia: cada dato enlaza una fuente pública.

Si el perfil escrito tenía otra dirección, `aliases` la guarda; Cloudflare la
redirige con `_redirects`.

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

## Prensa

`data/press.yaml` lista los artículos de prensa escritos por una persona o sobre
ella: `person` (la carpeta del perfil), medio, fecha, título, enlace y `author`
si lo firmó ella. El perfil los muestra en «En la prensa», del más reciente al
más antiguo. Un artículo entra solo si nombra a la persona con una institución
que coincide con su perfil; un nombre igual no basta.

## Mapa de físicos

`/fisicos/` dibuja un globo con las instituciones donde estudiaron o trabajan
las personas de `data/physicists.json`, y debajo la misma información como
lista, que se ve por institución, por área o por persona.

El JSON sale de las fichas públicas de CTI Vitae, del Portal del Profesorado de
la PUCP para su Sección Física y, para quien no está en ninguno, de su registro
de ORCID o, si ORCID no lista sus grados, de la página de su universidad
(`source` dice cuál: `ctivitae`, `pucp`, `orcid` o `web`; con `web`, `site`
nombra el sitio de `url`). Quien está en CTI Vitae y en la PUCP queda con la
ficha de CTI Vitae, que tiene años. El portal de la PUCP da el grado y la
institución pero no los años, así que esos perfiles ordenan los grados por
nivel. OpenAlex da el área, a partir de los temas de sus publicaciones, y la
obra (`works_count` y `cited_by`). `places` lista las instituciones con sus
coordenadas (`lat` y `lon` nulos si no tienen ubicación). `people` lista a cada
persona con:

| Campo     | Uso                                                               |
| --------- | ----------------------------------------------------------------- |
| `studied` | Sus grados, con institución, nivel y años.                        |
| `works`   | Sus puestos actuales.                                             |
| `jobs`    | Todos sus puestos, para la cronología del perfil.                 |
| `path`    | Las instituciones de sus grados y luego las de sus puestos.       |
| `area`    | El área según OpenAlex, o nulo con pocas publicaciones indexadas. |

Las fichas cambian poco; actualízalo a lo sumo una vez al año y cambia
`fetched`.

Al elegir una institución, el globo traza la ruta (`path`) de cada persona que
estudió o trabaja ahí. Un nombre de esa lista, o la dirección
`/fisicos/#ruta-<slug>`, abre en el panel la ficha de la persona y traza solo su
ruta.

`content/fisicos/_content.gotmpl` crea un perfil por persona en
`/fisicos/<slug>/`, con lo que dice el JSON. Así los datos siguen a la vista
cuando CTI Vitae no responde. El perfil usa la foto
`static/images/fisicos/<slug>.jpg` si existe; la regla de la sección Foto vale
también aquí. Sin foto, muestra las iniciales del nombre y del primer apellido.

Cuando el JSON gana una institución fuera del Perú, corre `bun run landmask`.
Reescribe `assets/maps/land.bin` con la costa detallada alrededor de cada
institución; el formato está al inicio de `scripts/landmask.ts`.
