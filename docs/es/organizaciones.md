# Organizaciones

[English](../en/organizaciones.md)

`/organizaciones/` tiene una página por cada lugar de `places` en
`data/physicists.json`: las universidades, institutos, entidades del Estado,
hospitales y empresas donde estudió o trabaja alguien del
[mapa de físicos](fisicos.md#mapa-de-físicos). El adaptador
`content/organizaciones/_content.gotmpl` crea las páginas; no hay archivos de
contenido por organización.

## Datos

Cada lugar tiene `kind`: `universidad`, `instituto`, `estado`, `hospital` o
`empresa`. El índice agrupa por tipo, en el orden de
`layouts/_partials/organizaciones/kinds.html`, que también da sus nombres.

Un lugar del Perú que OpenAlex registra tiene además `research`:

| Campo      | Contenido                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `openalex` | La institución en OpenAlex. Sus sedes y laboratorios cuentan como suyos.                       |
| `count`    | Trabajos desde `research_from` con un autor de la institución y tema principal de física.      |
| `works`    | Los más recientes: título, DOI, año, revista y los primeros autores más los que tienen perfil. |
| `authors`  | Los autores que más aparecen en esos trabajos, con `slug` si tienen perfil.                    |

«Física» es el subcampo del tema principal: física y astronomía, geofísica,
ciencias de la atmósfera, ciencias planetarias y radiología, donde cae la física
médica. Los autores incluyen a los coautores de otras instituciones.

## Personas

`layouts/_partials/fisicos/place-groups.html` reparte a las personas de un lugar
en Trabajan, Trabajaron, Posgrado y Pregrado, en ese orden: primero quienes
están ahí hoy. `fisicos/place-people.html` las muestra. `/fisicos/` y la página
de la organización usan los dos, así que muestran lo mismo. La trayectoria de un
perfil enlaza la página de cada organización.

## Página

La página de una organización y la de un grupo de investigación siguen el
contrato de la página de una persona (ver [personas](contenido.md#personas)):
cada sección abre con un `h2` con su cantidad, y una lista de ocho filas o más
muestra cinco y un botón con el resto. `organizaciones/sections.html` y
`grupos/sections.html` arman las secciones. El `summary` de un grupo es el
párrafo bajo su título.

## Actualizar

Los datos salen de las mismas herramientas que el mapa de físicos. Una
organización nueva entra cuando alguien del mapa estudió o trabaja ahí.
