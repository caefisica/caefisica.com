# Grabaciones

`/grabaciones/` lista las sesiones, seminarios, coloquios y sustentaciones
grabados en la página de Facebook de la facultad y en Educast, el archivo de
videos de la PUCP. La lista agrupa por serie o por año. Cada título enlaza el
video original; el sitio no aloja ningún video.

## Datos

`data/recordings.json` no se edita a mano: se regenera con el script que lo
escribe, que guarda la fecha de la copia en `fetched`. `series` fija los nombres
de las series y su orden en la página. Cada grabación tiene serie, título,
fecha, minutos, enlace, sitio de origen y ponentes.

De Facebook entran los videos de quince minutos o más. Los más cortos son clips,
reels o avisos. Los avisos de admisión tampoco entran. Educast no da la
duración, así que esas filas no muestran minutos.

Los videos de Facebook tienen una copia de respaldo privada en Google Drive. La
página enlaza siempre el video público, nunca la copia.

## Ponentes y perfiles

Un ponente lleva `profile` cuando su nombre coincide con un único perfil de
`/fisicos/` o de `/professors/`: el primer nombre debe ser el mismo y cada
palabra del nombre debe estar en la carpeta del perfil. Las charlas nombran a la
gente en forma corta, y los perfiles con el nombre completo. Si no hay una
coincidencia única, el nombre sale sin enlace.
