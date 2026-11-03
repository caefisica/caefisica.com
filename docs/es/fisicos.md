# Físicos

[English](../en/fisicos.md)

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
De LinkedIn solo se toman grados, puestos y los campos de trabajo que la persona
nombra en su «Acerca de», como una lista breve en palabras nuestras (`fields` en
el JSON), nunca su texto; tampoco publicaciones, fotos ni datos de contacto.

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
lista, que se ve por institución, por área, por formación o por persona.

`data/physicists.json` no se edita a mano: se genera fuera de este repositorio.
Para corregir a una persona, abre un issue. `fetched` guarda la fecha de la
copia.

### Quién entra

El mapa reúne el mundo de la física, no solo a los físicos. Entra quien:

- tiene un grado terminado en física, astrofísica, biofísica o geofísica en una
  universidad del Perú;
- trabaja en física con otra formación (una ingeniera en teledetección en la
  agencia espacial, un químico en un laboratorio de materiales), siempre que su
  trabajo sea de investigación o de especialista en una ciencia física;
- está en la plantilla de la Sección Física de la PUCP, sea cual sea su grado.

La meteorología y la oceanografía física cuentan como física de la atmósfera y
del océano. El pronóstico de rutina y la geología sin geofísica no cuentan. Un
grado en curso no cuenta, ni uno de educación física, terapia física o docencia.

### Datos

`source` dice de dónde sale cada persona: `ctivitae`, `pucp`, `orcid` o `web`.
Con `web`, `site` nombra el sitio de `url`. `track` dice de qué formación viene
cada persona, y la vista por formación las agrupa. OpenAlex da el área, a partir
de los temas de sus publicaciones, y la obra (`works_count` y `cited_by`).
`places` lista las instituciones con sus coordenadas (`lat` y `lon` nulos si no
tienen ubicación). `people` lista a cada persona con:

| Campo      | Uso                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `degree`   | Su grado más alto, «Doctorado en física», o nulo sin grado.                                                         |
| `track`    | Su formación: física, geofísica, ingeniería u otra.                                                                 |
| `studied`  | Sus grados, con institución, nivel y años.                                                                          |
| `works`    | Sus puestos actuales.                                                                                               |
| `jobs`     | Todos sus puestos, para la cronología del perfil.                                                                   |
| `path`     | Su ruta: cada parada con su institución y lo que hizo ahí.                                                          |
| `area`     | El área según OpenAlex, o nulo con pocas publicaciones indexadas.                                                   |
| `fields`   | Opcional: los campos que nombra su «Acerca de» de LinkedIn.                                                         |
| `linkedin` | Opcional: el perfil de LinkedIn que la persona publica en su ORCID o su ficha de CTI Vitae, o que revisamos a mano. |

Un perfil de la PUCP da el grado y la institución pero no los años, así que esos
perfiles ordenan los grados por nivel.

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
institución. El globo dibuja sus primeros puntos a cerca de 1° de distancia, así
que 0,2° mantiene suave la costa. Con zoom, el Perú y la caja alrededor de cada
institución en el extranjero pasan a 0,01°, cerca de un kilómetro.

### Formato de `land.bin`

`assets/js/physicists-map.ts` dibuja el globo con estas máscaras de tierra. El
archivo es little-endian:

| Campo        | Tipo  | Contenido                                     |
| ------------ | ----- | --------------------------------------------- |
| cantidad     | `u8`  | Número de máscaras.                           |
| `kind`       | `u8`  | `0` tierra, `1` territorio del Perú.          |
| sur y oeste  | `i32` | Bordes de la máscara, en centésimas de grado. |
| celdas       | `u16` | Celdas por grado.                             |
| ancho y alto | `u16` | Tamaño de la máscara en celdas.               |
| longitud     | `u32` | Bytes que ocupan sus filas.                   |
| filas        | —     | Del sur al norte; ver abajo.                  |

Cada máscara repite los campos desde `kind`. Una fila es una serie de enteros
LEB128: largos alternos de tramo fuera y dentro, que empieza fuera y suma el
ancho. Una celda está dentro cuando su centro cae dentro de los polígonos.
