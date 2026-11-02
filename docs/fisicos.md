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
universidad y el perfil de OpenAlex. Un perfil de LinkedIn sirve para grados y
puestos, pero pide cuenta para verse: cita primero una fuente abierta si la hay.
De LinkedIn solo se toman grados y puestos; nunca publicaciones, fotos ni datos
de contacto.

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
ella: `person` (la carpeta del perfil), medio, fecha, título, enlace, `author`
si lo firmó ella y `video` si es un video. El perfil los muestra en «En la
prensa», del más reciente al más antiguo. Un artículo entra solo si nombra a la
persona con una institución que coincide con su perfil; un nombre igual no
basta. Un video entra si lo publica un medio o una institución (RPP, Andina, TV
Perú, una universidad) y es una nota o una entrevista; una charla o un seminario
va en grabaciones, y un canal personal no cuenta.

## Mapa de físicos

`/fisicos/` dibuja un globo con las instituciones donde estudiaron o trabajaron
las personas de `data/physicists.json`, y debajo la misma información como
lista, que se ve por institución, por área o por persona.

Entra quien tiene un grado en física, astrofísica, biofísica o geofísica. El
JSON sale de las fichas públicas de CTI Vitae, del Portal del Profesorado de la
PUCP para su Sección Física y, para quien no está en ninguno, de su registro de
ORCID o, si ORCID no lista sus grados, de una página pública: la de su
universidad, su tesis en un repositorio o su perfil de LinkedIn (`source` dice
cuál: `ctivitae`, `pucp`, `orcid` o `web`; con `web`, `site` nombra el sitio de
`url`). Quien está en CTI Vitae y en la PUCP queda con la ficha de CTI Vitae,
que tiene años. Además entran quienes aparecen al buscar en ORCID las
universidades peruanas junto con la física y tienen un grado de física terminado
en una universidad del Perú. Así entran estudiantes y egresados recientes que no
están en CTI Vitae. Al final entran los autores de las tesis de física y
geofísica que registra el RENATI de SUNEDU, con un grado por tesis; su `site` es
«RENATI» y `url` su página de autor. Un grado en curso no cuenta, ni uno de
educación física, terapia física o docencia. Si un registro de ORCID da a una
persona con un nombre más corto que otro perfil y comparten una institución de
estudios, es la misma persona y no entra. El portal de la PUCP da el grado y la
institución pero no los años, así que esos perfiles ordenan los grados por
nivel. OpenAlex da el área, a partir de los temas de sus publicaciones, y la
obra (`works_count` y `cited_by`). `places` lista las instituciones con sus
coordenadas (`lat` y `lon` nulos si no tienen ubicación). `people` lista a cada
persona con:

| Campo     | Uso                                                               |
| --------- | ----------------------------------------------------------------- |
| `degree`  | Su grado más alto, con el campo: «Doctorado en física».           |
| `studied` | Sus grados, con institución, nivel y años.                        |
| `works`   | Sus puestos actuales.                                             |
| `jobs`    | Todos sus puestos, para la cronología del perfil.                 |
| `path`    | Su ruta: cada parada con su institución y lo que hizo ahí.        |
| `area`    | El área según OpenAlex, o nulo con pocas publicaciones indexadas. |

Las fichas cambian poco; actualízalo a lo sumo una vez al año y cambia
`fetched`.

La ruta sigue la carrera en orden: cada grado y cada puesto, actual o pasado,
por su primer año. En el mismo año, el grado va antes que el puesto, y una
entrada sin año sigue a la anterior. Quien vuelve a una institución vuelve a
pasar por ella en la ruta. Un puesto entra solo si su institución tiene fila en
`places`: universidades, centros de investigación, observatorios, hospitales y
organismos técnicos del Estado. Las empresas, los colegios, los ministerios y
los bancos quedan en la cronología del perfil, no en la ruta. La lista por
institución separa a quienes trabajan ahí hoy («Trabajan») de quienes trabajaron
antes («Trabajaron»).

Al elegir una institución, el globo traza la ruta de cada persona que estudió o
trabajó ahí. Un nombre de esa lista, o la dirección `/fisicos/#ruta-<slug>`,
abre en el panel la ficha de la persona y traza solo su ruta.

`content/fisicos/_content.gotmpl` crea un perfil por persona en
`/fisicos/<slug>/`, con lo que dice el JSON. Así los datos siguen a la vista
cuando CTI Vitae no responde. El perfil usa la foto
`static/images/fisicos/<slug>.jpg` si existe; la regla de la sección Foto vale
también aquí. Sin foto, muestra las iniciales del nombre y del primer apellido.

Cuando el JSON gana una institución fuera del Perú, corre `bun run landmask`.
Reescribe `assets/maps/land.bin` con la costa detallada alrededor de cada
institución; el formato está al inicio de `scripts/landmask.ts`.
