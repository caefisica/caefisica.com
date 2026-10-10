# Convenciones

Dónde va cada archivo de `content/` y cómo se nombra.

## Estructura de `content/`

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
├── contributors/<slug>/_index.md      colaboradores
├── types/, functionalities/           índices de las taxonomías de experimental
├── biblioteca/, contacto/, privacidad/
├── newsletter.md, suscrito.md, desuscrito.md, redes.md
└── _index.md                          portada
```

La guía del curso `CBO106` es
`content/unmsm/pregrado/plan-2018/CBO106/_index.md`. Cómo escribirla:
[cursos](cursos.md).

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

## Formato del texto

El contenido es Markdown procesado por goldmark. Está activado el HTML sin
escapar (`unsafe = true`) y los identificadores de títulos al estilo de GitHub
(`markup.toml`). Para insertar tablas, imágenes, PDF y avisos usa los
[shortcodes](shortcodes.md). Para fórmulas, agrega `math: true` al front matter
y escribe LaTeX con KaTeX.

## Crear un archivo

`bun run hugo:create content` (`hugo new content`) copia un molde de
[`archetypes/`](../archetypes). Hugo elige el molde por la carpeta; para otros,
indícalo con `--kind`:

| Molde             | Cómo se elige                           |
| ----------------- | --------------------------------------- |
| `blog.md`         | Automático en `content/blog/`.          |
| `experimental.md` | Automático en `content/experimental/`.  |
| `pregrado.md`     | `--kind pregrado`, para guías de curso. |
| `offering.md`     | `--kind offering`, para sílabos.        |
| `professor.md`    | `--kind professor`, para docentes.      |
| `default.md`      | Cualquier otra carpeta.                 |

```bash
bun run hugo:create content --kind pregrado unmsm/pregrado/plan-2018/CFO999/_index.md
```

Los moldes `blog`, `experimental`, `pregrado` y `default` crean la página con
`draft: true`; `offering` y `professor`, con `draft: false`. Para ver una página
con `draft: true` en local, ver [instalación](instalación.md#ejecutar-el-sitio).

## Editar desde GitHub

Cada página tiene al pie el enlace «Edita esta página», que abre el archivo en
GitHub (plantilla [`edit-page.html`](../layouts/partials/main/edit-page.html)).
El esquema de campos que ofrece Pages CMS está en [`.pages.yml`](../.pages.yml).
