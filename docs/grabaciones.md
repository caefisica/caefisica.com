# Charlas

`/grabaciones/` lista los seminarios, coloquios, conferencias, sesiones del
Consejo de Facultad y sustentaciones de la facultad y de la Sección Física de la
PUCP. El menú y el título la llaman «Charlas». La lista agrupa por serie o por
año. Cada título enlaza el video original, o la invitación cuando la charla no
tiene video. El sitio no aloja ningún video.

## Datos

`data/recordings.json` no se edita a mano: lo regenera `recordings.py`, en el
repositorio de notas del proyecto, que guarda la fecha de la copia en `fetched`.
`series` fija los nombres de las series y su orden en la página. Cada registro
tiene serie, título, fecha, mes, minutos, enlace, origen y ponentes.

Hay tres orígenes:

- **Facebook**: los videos de la página de la facultad de quince minutos o más.
  Los más cortos son clips, reels o avisos. Los avisos de admisión tampoco
  entran. Cada video tiene una copia pública en Google Drive (`post` guarda el
  enlace a Facebook). El título abre el reproductor de Drive, para que la página
  no cargue el de Facebook, y «Facebook» enlaza la publicación.
- **Educast PUCP**: el archivo de videos de la PUCP. No da la duración, así que
  esas filas no muestran minutos.
- **Invitación**: las charlas que la facultad anunció en Facebook y que no
  tienen video. Una invitación entra cuando nombra un título y un ponente. No
  entra si un video de la misma serie ya tiene un ponente con el mismo primer
  nombre y otra palabra en común.

La copia de Facebook no trae la fecha de cada publicación. Como en las
sustentaciones (ver `docs/tesis.md`), el mes sale del número de la foto. `date`
es el día que dice la invitación, si lo dice; si no, la fila muestra el mes.

## Ponentes y perfiles

Un ponente lleva `profile` cuando su nombre coincide con un único perfil de
`/fisicos/` o de `/professors/`: el primer nombre debe ser el mismo y cada
palabra del nombre debe estar en la carpeta del perfil. Las charlas nombran a la
gente en forma corta, y los perfiles con el nombre completo. Si no hay una
coincidencia única, el nombre sale sin enlace.

El perfil lista las charlas de esa persona en «Charlas», con su serie.
