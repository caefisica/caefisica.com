# Contenido

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
├── experimental/<dominio>/index.md    artículos de otros sitios
├── professors/<slug>/index.md         docentes
├── contributors/<slug>/_index.md      colaboradores; el índice es /equipo/
├── types/, functionalities/           índices de las taxonomías de experimental
├── contacto/, privacidad/
├── redes.md
└── _index.md                          portada
```

## Nombres

| Elemento               | Regla                                         | Ejemplo                                    |
| ---------------------- | --------------------------------------------- | ------------------------------------------ |
| Carpeta de curso       | Código del curso en mayúsculas.               | `CBE013`                                   |
| Carpeta de sílabo      | Semestre académico `AAAA-I` o `AAAA-II`.      | `2022-I`                                   |
| Carpeta de docente     | Nombre y apellidos en minúsculas con guiones. | `carlos-landauro-saenz`                    |
| Carpeta de colaborador | Nombre en minúsculas.                         | `david`                                    |
| Entrada de blog        | Número de tres cifras y nombre con guiones.   | `003-faq`                                  |
| YAML de recursos       | Cualquier nombre; el shortcode lo cita.       | `books-theoretical.yaml`, `playlists.yaml` |

Un slug de `contributors` en el front matter debe existir como carpeta en
`content/contributors/`; si no, la compilación falla. Lo mismo vale para el
campo `professor` de un sílabo y las carpetas de `content/professors/`.

Hugo pone las direcciones en minúsculas: `CBE013` se publica en
`/unmsm/pregrado/plan-2018/cbe013/`.

`unmsm/pregrado/_index.md` no se publica (`build.render: never`):
`/unmsm/pregrado/` redirige a `plan-2018/`, el único plan.

La página del equipo,
[`layouts/contributors/taxonomy.html`](../layouts/contributors/taxonomy.html),
muestra el equipo actual de `data/authors/members.json`, después los demás
autores con su número de publicaciones, y cómo colaborar. Un miembro cuyo `url`
es la página de un autor enlaza a ella y no se repite en la lista de autores. La
página de un autor ([`layouts/term.html`](../layouts/term.html)) agrupa sus
publicaciones por sección, de la más reciente a la más antigua.

## Universidades

Cada universidad es una sección de primer nivel (`content/unmsm/`) y una entrada
de [`data/universities.yaml`](../data/universities.yaml):

```yaml
unmsm:
  name: Universidad Nacional Mayor de San Marcos
  section: /unmsm
```

La clave es el slug que usa el campo `institution` de un docente. `/professors/`
agrupa a los docentes por universidad con ese nombre, y la página de un docente
enlaza la sección. Un `institution` que no está en el archivo detiene la
compilación.

Para agregar una universidad, crea `content/<slug>/_index.md` con
`cascade: {type: docs}`, como `content/unmsm/_index.md`, y agrega su entrada al
archivo.

## Crear un archivo

`hugo new content` copia un molde de [`archetypes/`](../archetypes). Hugo elige
el molde por la primera carpeta del destino; para otros, indícalo con `--kind`:

| Molde             | Cómo se elige                           |
| ----------------- | --------------------------------------- |
| `blog.md`         | Automático en `content/blog/`.          |
| `experimental.md` | Automático en `content/experimental/`.  |
| `pregrado.md`     | `--kind pregrado`, para guías de curso. |
| `offering.md`     | `--kind offering`, para sílabos.        |
| `professor.md`    | `--kind professor`, para docentes.      |
| `default.md`      | Cualquier otra carpeta.                 |

```bash
hugo new content --kind pregrado unmsm/pregrado/plan-2018/CFO999/_index.md
```

Los moldes `blog`, `experimental`, `pregrado` y `default` crean la página con
`draft: true`; `offering` y `professor`, con `draft: false`. `bun run dev`
muestra los borradores; la compilación del sitio (`bun run build`) no los
publica.

## Formato del texto

El contenido es Markdown procesado por goldmark. Está activado el HTML sin
escapar (`unsafe = true`) y los identificadores de títulos al estilo de GitHub
(`markup.toml`). Para insertar tablas, imágenes, PDF y avisos usa los
[shortcodes](shortcodes.md). Para fórmulas, agrega `math: true` al front matter
y escribe LaTeX con KaTeX.
