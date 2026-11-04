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
de contacto. Guarda también lo que sus bases dicen del puesto y de la selección,
cuando se pueden leer:

- `duties` y `knowledge`: hasta seis puntos de cada uno, copiados de las
  funciones y los conocimientos que piden las bases;
- `stages`: las etapas de selección que nombra, en el orden de una convocatoria
  SERVIR (evaluación curricular, de conocimientos, psicológica, entrevista),
  cada una con su `weight` en el puntaje final cuando las bases lo dan;
- `days`: los días entre la publicación y el último paso de su cronograma.

Un PDF con varios puestos da a cada puesto sus propias funciones y
conocimientos, y las etapas y el cronograma de toda la convocatoria. Las demás
guardan solo los campos de la lista anterior, porque el calendario y los conteos
por empleador no necesitan más. De Bumeran se guardan solo los avisos que piden
física.

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
  última. Un empleador enlaza su propia página, abajo, o si no su página de
  organización cuando un lugar de `data/physicists.json` tiene ese nombre corto.

## Páginas de empleador

`content/oportunidades/_content.gotmpl` crea una página por empleador con una
convocatoria que pide física, salvo las empresas de Bumeran, en
`/oportunidades/<nombre corto>/`. Su título es el nombre completo del lugar
cuando `data/physicists.json` lo tiene. `layouts/oportunidades/single.html` la
dibuja:

- el costado resume el pago, la duración del cronograma, los meses habituales,
  las sedes y la página de organización;
- **Qué piden** cuenta las carreras y habilidades de sus convocatorias de
  física;
- **Cómo es el proceso** lista las etapas que nombran sus bases, en cuántas
  convocatorias aparece cada una y el peso que más se repite;
- **Cuándo publica** es la tabla de años por meses de todas sus convocatorias;
- **Convocatorias** muestra cada convocatoria de física con sus funciones,
  conocimientos, etapas y un enlace a las bases. El ancla de cada una es su
  `id`, y las filas de `/oportunidades/` enlazan ahí.

Las secciones están en `layouts/_partials/oportunidades/employer-sections.html`.
`tally.html` cuenta una lista de nombres, `calendar.html` dibuja la tabla de
años por meses para la lista y para la página de empleador, y
`employer-name.html` enlaza un nombre corto con su página.
