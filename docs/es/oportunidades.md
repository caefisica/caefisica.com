# Oportunidades

[English](../en/oportunidades.md)

`/oportunidades/` es un archivo de convocatorias, no una bolsa de trabajo. Dice
quién contrata físicos en el Perú, qué carreras y habilidades pide y en qué
meses suele convocar prácticas. Guarda también las convocatorias cerradas y las
de años anteriores, porque el calendario sale de ellas.

## Datos

`data/opportunities.json` no se edita a mano: se genera fuera de este
repositorio, con un script por fuente que copia su portal y lee las bases en
PDF. Las fuentes son:

- los portales de convocatorias del IGP, el SENAMHI, el INAIGEM y el ITP;
- las convocatorias en gob.pe del IPEN, el INACAL, el IMARPE, el INGEMMET, el
  INEN y el OSINERGMIN;
- las bases en PDF de la UNSA y la UNJFSC;
- los avisos de Bumeran que aceptan una carrera de física.

Cada convocatoria tiene `id`, `source`, `employer`, `kind`, `number`, `title`,
`published`, `closes`, `place`, `stipend`, `vacancies` y `url`, que apunta a las
bases que publicó el empleador. `published` es una fecha `AAAA-MM-DD` o solo el
año, si la fuente no da más.

Una convocatoria que pide física guarda además `physics: true`, `fields` (las
carreras de la familia de la física que acepta), `skills` (las habilidades que
nombran sus bases) y `degrees`, un extracto de la formación académica sin datos
de contacto. Las demás guardan solo los campos de la lista anterior, porque el
calendario y los conteos por empleador no necesitan más. De Bumeran se guardan
solo los avisos que piden física.

## Cuándo pide física

La regla lee solo los pasajes de formación académica de las bases, porque el
resto del documento nombra «salud física» o «archivo físico». Acepta física,
ingeniería física, física médica, geofísica, astrofísica y biofísica. Descarta
«física» cuando la palabra de al lado dice otra cosa: terapia física, educación
física, seguridad física, persona física. Unas bases escaneadas no tienen texto
que leer y cuentan como que no piden física.

Un aviso de Bumeran no tiene sección de formación académica, así que la regla es
más estricta: la palabra cuenta solo cuando, en la misma oración y poco antes,
hay una señal de carrera, como «bachiller», «egresado», «carrera», «docente» o
«ingeniero». Así quedan fuera «modelo de datos físico», «tienda física» o
«información geoquímica y geofísica».

## Vistas

- **Piden física**: las convocatorias que piden física, por empleador. Un
  empleador con menos de tres entra en «Otros empleadores», donde cada fila dice
  su empleador.
- **Calendario de prácticas**: por empleador, una tabla de años por meses con
  cuántas convocatorias de prácticas publicó, pidan o no física. Debajo nombra
  los meses con convocatorias en más años, si hay alguno en dos años o más.
- **Habilidades**: cada habilidad, cuántas convocatorias que piden física la
  nombran y qué empleadores.
- **Empleadores**: el Estado y las universidades por un lado y las empresas por
  otro, con su número de convocatorias, el año de la primera y la fecha de la
  última. Un empleador enlaza su página de organización cuando un lugar de
  `data/physicists.json` tiene ese nombre corto.
