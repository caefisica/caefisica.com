# Charlas

`/grabaciones/` lista los seminarios, coloquios, conferencias, sesiones del
Consejo de Facultad y sustentaciones de la facultad, de la Sección Física de la
PUCP y de grupos de física de la UNI y la UNT. El menú y el título la llaman
«Charlas». Cada título enlaza el video original, o la invitación cuando la
charla no tiene video. El sitio no aloja ningún video.

## Páginas

La portada tiene una fila por serie: nombre, organizador, años, y cuántas
charlas tiene y cuántas con video. Una serie es lo que se repite con un mismo
organizador. Cada fila abre `/grabaciones/<serie>/`, que crea
`content/grabaciones/_content.gotmpl` a partir de `series`. Esa página agrupa
las charlas por año, de la más reciente a la más antigua. Una charla sin video
sale atenuada y enlaza su invitación, para que la serie quede completa sin
esconder cuáles se pueden ver. Cada año lleva su cuenta con el sustantivo («26
charlas»), porque un número junto al año se lee como parte de él.

Sobre los años hay una barra con un filtro y un enlace por año; desde md queda
fija bajo la cabecera. El filtro (`assets/js/list-filter.ts`) deja las filas que
contienen todas las palabras escritas, sin distinguir mayúsculas ni tildes, y
esconde los años que quedan vacíos con su enlace. Sin JavaScript el campo no
aparece y los enlaces siguen funcionando.

Las sustentaciones y la divulgación no son series: son actos sueltos sin
organizador común. Sus grabaciones salen directamente en la portada, bajo la
lista de series.

## Datos

`data/recordings.json` no se edita a mano: lo regenera `recordings.py`, en el
repositorio de notas del proyecto, que guarda la fecha de la copia en `fetched`.
`series` da por cada serie su nombre, organizador (vacío en las que no son
series), la palabra que cuenta sus filas («charlas» o «sesiones»), el número de
charlas y de videos, y el primer y el último año. Va ordenada por número de
videos. Cada registro tiene serie, título, fecha, mes, minutos, enlace, origen y
ponentes.

Hay cuatro orígenes:

- **Facebook**: los videos de la página de la facultad de quince minutos o más.
  Los más cortos son clips, reels o avisos. Los avisos de admisión tampoco
  entran. Cada video tiene una copia pública en Google Drive (`post` guarda el
  enlace a Facebook). El título abre el reproductor de Drive, para que la página
  no cargue el de Facebook, y «Facebook» enlaza la publicación. Facebook borra
  las transmisiones en vivo a los 30 días y deja un fragmento de un minuto, así
  que una sesión del Consejo solo se conserva si se copia antes.
- **YouTube**: cada canal es una serie, con los videos de quince minutos o más:
  - la Red LAFMAT, más los videos que insertan las galerías de su sitio;
  - la Asociación Estudiantil de Física Teórica de la UNI (`aeft-uni`);
  - el Encuentro de Física de la Facultad de Ciencias de la UNI (`encuentro`);
  - el coloquio del grupo GRACOCC de la UNT (`unt`), sin las clases de sus
    cursos («Curso:», «Práctica»), que no son charlas;
  - la Asociación de Estudiantes de Física de la PUCP (`asdf-pucp`): solo sus
    webinars y las charlas de Huellas de la Ciencia. Sus talleres de examen,
    asesorías y clases no son charlas.

  El ponente sale del título o de la descripción. Dos subidas del mismo día con
  el mismo título y casi la misma duración son una sola; si las duraciones
  difieren, son partes y se numeran. Si un video corresponde a una invitación
  (el mismo ponente, con menos de tres meses de diferencia), toma su título y
  ponentes, e `invitation` enlaza la invitación. Un video de LAFMAT en Facebook
  que también está en YouTube no entra.

- **Educast PUCP**: el archivo de videos de la PUCP. El título enlaza el mp4,
  que el navegador reproduce sin la página de Educast, y «Educast PUCP» enlaza
  la página (`page`). La página no da la duración; `educast.py` la lee del mp4
  con ffprobe.
- **Invitación**: las charlas que la facultad anunció en Facebook y que no
  tienen video. Una invitación entra cuando nombra un título y un ponente. No
  entra si un video de la misma serie ya tiene un ponente con el mismo primer
  nombre y otra palabra en común. Las charlas del Centro de Estudiantes de
  Física de la UNT (`cefunt`) también son invitaciones: sus transmisiones en
  vivo ya no están en Facebook. `recordings.py` las lee de una lista hecha a
  mano con cada publicación y su afiche, porque la página no da el año; el año
  sale del día de la semana y del orden de las publicaciones.

El mes sale de la fecha de la publicación o, si la copia no la tiene, del número
de la foto, como en las sustentaciones (ver `docs/tesis.md`). `date` es el día
que dice la invitación, si lo dice; si no, la fila muestra el mes.

## Ponentes y perfiles

Un ponente lleva `profile` cuando su nombre coincide con un único perfil de
`/fisicos/` o de `/professors/`: el primer nombre debe ser el mismo y cada
palabra del nombre debe estar en la carpeta del perfil. Las charlas nombran a la
gente en forma corta, y los perfiles con el nombre completo. Si no hay una
coincidencia única, el nombre sale sin enlace.

El perfil lista las charlas de esa persona en «Charlas», con su serie.
