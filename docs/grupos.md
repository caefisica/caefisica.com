# Grupos de investigación

`/grupos/` tiene una página por cada grupo de `data/groups.json`. El adaptador
`content/grupos/_content.gotmpl` crea las páginas; no hay archivos de contenido
por grupo. El índice los agrupa por universidad.

## Qué grupos entran

Entran todos los grupos de la Facultad de Ciencias Físicas de la UNMSM y
cualquier grupo de la UNMSM o la PUCP que coordina o integra alguien del
[mapa de físicos](fisicos.md#mapa-de-físicos). Un nombre enlaza un perfil solo
cuando sus palabras coinciden con las de un único perfil, sin tildes ni
partículas; dos palabras no bastan.

## Datos

| Campo         | Contenido                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `id`          | La universidad y la sigla del grupo, como `unmsm-gimna`. Es la ruta de su página.                 |
| `institution` | El `id` de su lugar en `data/physicists.json`; enlaza su página de organizaciones.                |
| `members`     | Nombre, `role` (`Coordinador`), grado y `slug` si tiene perfil. La PUCP solo da quien coordina.   |
| `lines`       | Las líneas de investigación (UNMSM).                                                              |
| `projects`    | Título, código y año de convocatoria de cada proyecto registrado (UNMSM).                         |
| `research`    | `count`: trabajos desde `works_from` de sus integrantes con OpenAlex; `works`: los más recientes. |

El código de un proyecto de la UNMSM empieza por la letra del programa y los dos
dígitos del año de la convocatoria.

No se guardan correos, teléfonos ni oficinas: solo datos profesionales públicos.

## Personas

`layouts/_partials/grupos/person-groups.html` muestra los grupos de una persona
en su perfil, y la página de cada universidad en `/organizaciones/` lista sus
grupos. La página antigua `/unmsm/facultad/gi/` conserva la lista del VRIP de
2022 y enlaza esta sección.

## Actualizar

Las herramientas viven fuera de este repositorio: copian los grupos del
Vicerrectorado de Investigación y Posgrado de la UNMSM y del directorio de la
PUCP, buscan sus publicaciones en OpenAlex y escriben `data/groups.json`.
