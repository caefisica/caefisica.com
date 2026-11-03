# Contenido

[English](../en/contenido.md)

Dónde va cada archivo de `content/` y cómo se nombra.

## Estructura

```text
content/
├── unmsm/
│   ├── pregrado/plan-2018/<CÓDIGO>/   guías de curso
│   ├── posgrado/                      maestría y doctorado
│   └── facultad/                      información de la facultad
├── apuntes/<tema>/                    apuntes por tema
├── blog/<NNN-nombre>/index.md         entradas del blog
├── unmsm/docentes/_index.md           lista de quienes dictan los sílabos
├── personas/_content.gotmpl           una página por persona de los registros
├── personas/<slug>/index.md           texto escrito sobre una persona
├── fisicos/_index.md                  el mapa de los físicos peruanos
├── videos/_content.gotmpl             una página por lista de los playlists.yaml
├── tesis/_content.gotmpl              una página por tesis de data/theses.json
├── grabaciones/_index.md              lista de data/recordings.json
├── equipo/_index.md                   el equipo, de data/team.yaml
├── contacto/, privacidad/
├── redes.md
└── _index.md                          portada
```

## Nombres

| Elemento          | Regla                                         | Ejemplo                                    |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| Carpeta de curso  | Código del curso en mayúsculas.               | `CBE013`                                   |
| Carpeta de sílabo | Semestre académico `AAAA-I` o `AAAA-II`.      | `2022-I`                                   |
| Slug de persona   | Nombre y apellidos en minúsculas con guiones. | `carlos-vladimir-landauro-saenz`           |
| Entrada de blog   | Número de tres cifras y nombre con guiones.   | `003-faq`                                  |
| YAML de recursos  | Cualquier nombre; el shortcode lo cita.       | `books-theoretical.yaml`, `playlists.yaml` |

Hugo pone las direcciones en minúsculas: `CBE013` se publica en
`/unmsm/pregrado/plan-2018/cbe013/`.

## Descripción

`description` dice en una frase qué contiene la página, como «Las ecuaciones de
estado térmica y calórica, y los procesos isotérmico, isobárico e isocórico».
Los buscadores la muestran, y el índice de una sección la pone bajo el título de
la página. Un curso no la muestra ahí: su fila lleva el código y los créditos.
Sin una frase así, deja el campo vacío.

`unmsm/pregrado/_index.md` no se publica (`build.render: never`):
`/unmsm/pregrado/` redirige a `plan-2018/`, el único plan.

## Personas

Cada persona tiene una sola página, `/personas/<slug>/`, y el slug es su única
clave. El slug está en uno de dos registros:

- [`data/physicists.json`](../../data/physicists.json): los físicos del mapa.
  Ver [físicos](fisicos.md).
- [`data/people.toml`](../../data/people.toml): los demás, como quienes escriben
  las guías. Cada entrada lleva `slug`, `name` y, si se quiere, `about`.

Un slug no puede estar en los dos. Para escribir sobre una persona, crea
`content/personas/<slug>/index.md`; la plantilla agrega los datos de los
registros. La foto va en `static/images/personas/<slug>.webp` o `.jpg`, y su
origen en [`data/photos.yaml`](../../data/photos.yaml).

La página pone el nombre y una línea arriba que dice quién es: `role` en una
página escrita; en una de datos, su puesto actual y su grado más alto con la
institución, como «Profesor principal, UNMSM · Doctorado en física, TU
Chemnitz». Pone los datos en una columna fija al lado y, bajo ellos, el índice
«En esta página», con cada sección y su cantidad, cuando tiene tres o más. Cada
sección empieza con `<h2 id="…">Título <span class="count">N</span></h2>`, con
texto plano en el título: el índice se arma leyendo esos títulos. Una lista de
ocho filas o más muestra cinco y un botón con el resto.

Estos campos nombran a una persona por su slug:

| Dónde                                               | Campo          |
| --------------------------------------------------- | -------------- |
| Sílabo                                              | `professor`    |
| Guía y entrada de blog                              | `contributors` |
| Lista de `playlists.yaml`                           | `person`       |
| Expositor de `data/recordings.json`                 | `slug`         |
| Grupo de investigación (`gi.md`)                    | `head.person`  |
| Miembro de [`data/team.yaml`](../../data/team.yaml) | `person`       |

Un slug que no está en ningún registro detiene la compilación. Una lista de
videos sin `person` muestra el texto de `lecturer` sin enlace.

[`/equipo/`](../../layouts/equipo/list.html) dibuja el organigrama de
`data/team.yaml`, después a los demás autores con su número de publicaciones, y
cómo colaborar. [`/unmsm/docentes/`](../../layouts/docentes/list.html) lista a
cada `professor` de los sílabos con sus cursos.
[`/personas/`](../../layouts/personas/list.html) lista a todos de la A a la Z.

## Crear un archivo

`hugo new content` copia un molde de [`archetypes/`](../../archetypes). Hugo
elige el molde por la primera carpeta del destino; para otros, indícalo con
`--kind`:

| Molde         | Cómo se elige                           |
| ------------- | --------------------------------------- |
| `blog.md`     | Automático en `content/blog/`.          |
| `pregrado.md` | `--kind pregrado`, para guías de curso. |
| `offering.md` | `--kind offering`, para sílabos.        |
| `default.md`  | Cualquier otra carpeta.                 |

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO999/_index.md
```

Los moldes `blog`, `pregrado` y `default` crean la página con `draft: true`;
`offering`, con `draft: false`. `bun run dev` muestra los borradores; la
compilación del sitio (`bun run build`) no los publica.

## Formato del texto

El contenido es Markdown procesado por goldmark. Está activado el HTML sin
escapar (`unsafe = true`) y los identificadores de títulos al estilo de GitHub
(`markup.toml`). Para insertar tablas, imágenes, PDF y avisos usa los
[shortcodes](shortcodes.md). Para fórmulas, agrega `math: true` al front matter
y escribe LaTeX con KaTeX.
