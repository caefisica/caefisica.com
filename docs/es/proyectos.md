# Proyectos

[English](../en/proyectos.md)

`/proyectos/` lista los proyectos con fondos de PROCIENCIA que son de física o
que tienen físicos en su equipo. Dice quién los lleva, en qué organización,
cuándo y con cuánto dinero. Un perfil muestra los suyos en «Proyectos con fondos
públicos», con «Líder» en los que esa persona lleva.

## Datos

`data/grants.json` no se edita a mano: se genera fuera de este repositorio,
desde el
[Observatorio de PROCIENCIA](https://observatorio.prociencia.gob.pe/subvenciones).
Entran las subvenciones de investigación científica, equipamiento e innovación.

Cada proyecto tiene `id` (el número de subvención), `title`, `programme`,
`contest`, `organisation`, `place`, `region`, `start`, `end`, `amount` (en
soles), `area` (la subárea OCDE), `discipline`, `keywords`, `physics_area`,
`leader`, `members`, `team_total` y `url`, que apunta a su ficha en el
Observatorio. `place` es el id de un lugar de `data/physicists.json` cuando el
nombre de la organización coincide con él. `leader` y `members` son slugs de
perfiles: del equipo solo se guarda a quien tiene perfil, y `team_total` cuenta
a todos. Un proyecto no tiene estado: está en curso mientras `end` no ha pasado.

## Cuándo es de física

Un proyecto entra cuando su subárea OCDE es ciencias físicas o cuando su líder o
alguien de su equipo está en el mapa de físicos. La ficha del Observatorio
muestra solo los diez primeros del equipo, así que un físico que va después no
cuenta. Un nombre del Observatorio, «APELLIDOS ,NOMBRES», coincide con un perfil
cuando todos sus apellidos y su primer nombre están en el nombre del perfil, y
con uno solo.

## Vistas

- **Año de inicio**: los proyectos por el año en que empezaron. «En curso» marca
  los que terminan después de la fecha de la última compilación del sitio.
- **Organización**: los proyectos por organización. Una con menos de tres entra
  en «Otras organizaciones». Una organización enlaza su página cuando tiene
  `place`.
