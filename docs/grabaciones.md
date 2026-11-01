# Charlas

`/grabaciones/` lista los seminarios, coloquios, conferencias, sesiones del
Consejo de Facultad y sustentaciones de la facultad y de la Sección Física de la
PUCP. El menú y el título la llaman «Charlas». Cada título enlaza el video
original, o la invitación cuando la charla no tiene video. El sitio no aloja
ningún video.

## Páginas

La portada tiene una fila por serie: nombre, organizador, años, y cuántas
charlas tiene y cuántas con video. Una serie es lo que se repite con un mismo
organizador. Cada fila abre `/grabaciones/<serie>/`, que crea
`content/grabaciones/_content.gotmpl` a partir de `series`. Esa página agrupa
las charlas por año, de la más reciente a la más antigua. Una charla sin video
sale atenuada y enlaza su invitación, para que la serie quede completa sin
esconder cuáles se pueden ver.

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
- **YouTube**: los videos del canal de la Red LAFMAT y los que insertan las
  galerías de su sitio, de quince minutos o más. La descripción trae el tema, el
  expositor y la afiliación. Si el video corresponde a una invitación (el mismo
  ponente, con menos de tres meses de diferencia), toma su título y ponentes, e
  `invitation` enlaza la invitación. Un video de LAFMAT en Facebook que también
  está en YouTube no entra.
- **Educast PUCP**: el archivo de videos de la PUCP. No da la duración, así que
  esas filas no muestran minutos.
- **Invitación**: las charlas que la facultad anunció en Facebook y que no
  tienen video. Una invitación entra cuando nombra un título y un ponente. No
  entra si un video de la misma serie ya tiene un ponente con el mismo primer
  nombre y otra palabra en común.

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
