# Revista de Investigación de Física

`/revista/` lista todos los artículos de la revista de la Facultad de Ciencias
Físicas de la UNMSM, número por número y del más reciente al más antiguo.
`layouts/revista/list.html` arma la página desde `data/journal.json`, y
`layouts/_partials/revista/person.html` muestra en cada perfil los artículos que
firmó.

## Datos

| Campo      | Contenido                                                                            |
| ---------- | ------------------------------------------------------------------------------------ |
| `fetched`  | La fecha de cada copia: `crossref` y `sisbib`.                                       |
| `issues`   | Un número por fila: `volume`, `number` (`1-2` si es doble), `year` y sus `articles`. |
| `articles` | Título, `url` del texto completo, `doi` y `pages` si los tiene, y sus autores.       |
| `authors`  | Nombre y `slug` si tiene perfil. Un artículo sin DOI trae en su lugar `byline`.      |

Crossref es la fuente principal: la revista registra un DOI por artículo
desde 1998. El archivo de la biblioteca de San Marcos, en sisbib, añade los
artículos de 1998 a 2011 que no tienen DOI. Su `byline` es la firma impresa, con
iniciales, y no enlaza perfiles.

Un autor enlaza su perfil por su ORCID, o por su nombre con la regla de los
[grupos](grupos.md#qué-grupos-entran): sus palabras coinciden con las de un
único perfil, y dos palabras no bastan.

Algunos números antiguos se registraron en Crossref años después, con la fecha
del registro. `year` es el año del volumen; queda vacío cuando es posterior al
de un volumen más alto.

## Actualizar

Las herramientas viven fuera de este repositorio. Copian Crossref y el archivo
de sisbib, y escriben `data/journal.json`. El sitio de la revista pide confirmar
que se es humano, así que no se copia de él.
