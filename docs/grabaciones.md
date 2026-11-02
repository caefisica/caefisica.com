# Charlas

`/grabaciones/` lista los seminarios, coloquios, conferencias, sesiones del
Consejo de Facultad y sustentaciones de la facultad, de la Sección Física de la
PUCP y de grupos de física de la UNI y la UNT. El menú y el título la llaman
«Charlas». Cada charla tiene su página, que reproduce el video desde su sitio
original. El sitio no aloja ningún video.

## Páginas

La portada tiene una fila por serie: nombre, organizador, años, y cuántas
charlas tiene y cuántas con video. Una serie es lo que se repite con un mismo
organizador. Cada fila abre `/grabaciones/<serie>/`, que crea
`content/grabaciones/_content.gotmpl` a partir de `series`. Esa página agrupa
las charlas por año, de la más reciente a la más antigua. El título de cada fila
abre la página de la charla, y el nombre del origen enlaza el original: el video
de YouTube, la página de Educast, la publicación de Facebook o la invitación.
Una charla sin video sale atenuada, para que la serie quede completa sin
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

La página de una charla está en `/grabaciones/<serie>/<id>/`, o en
`/grabaciones/<id>/` si no es de una serie. El id va en minúsculas, porque Hugo
las pone en las rutas, y `recordings.py` se niega a escribir dos ids que solo
difieren en eso. La página da el título, los ponentes con su afiliación, la
fecha, la serie y el reproductor, y debajo una ficha con el original, la
invitación y el resumen de Educast. Según el origen:

- **YouTube**, **Facebook** y **Drive** muestran la miniatura con un botón; al
  pulsarlo `assets/js/player.ts` carga el reproductor de YouTube (sin cookies) o
  el de Google Drive. Hasta entonces la página no pide nada a esos sitios.
- **Educast** reproduce el mp4 en el reproductor del sitio
  (`assets/js/video.ts`), tomado del de las historias de clientes de Linear: los
  controles flotan sobre una sombra y se esconden tras dos segundos sin mover el
  puntero; la línea de tiempo muestra lo cargado y, al pasar el puntero, el
  minuto que hay debajo; hay volumen, velocidad, imagen en imagen y pantalla
  completa. Las teclas son las de YouTube: espacio o K, M, F, P, flechas (5 s),
  J y L (10 s) y los dígitos (décimas del video). El navegador guarda dónde se
  quedó cada video, y el botón inicial ofrece continuar desde ahí, porque un
  coloquio dura una hora o dos. Sin JavaScript quedan los controles del
  navegador. La miniatura es la imagen de la página de Educast.
- **Invitación**: un aviso de que no hay video, con el enlace a la invitación.

El ancho del reproductor se ajusta para que entre entero bajo el título en la
altura de la ventana.

## Datos

`data/recordings.json` no se edita a mano: lo regenera `recordings.py`, en el
repositorio de notas del proyecto, que guarda la fecha de la copia en `fetched`.
`series` da por cada serie su nombre, organizador (vacío en las que no son
series), la palabra que cuenta sus filas («charlas» o «sesiones»), el número de
charlas y de videos, y el primer y el último año. Va ordenada por número de
videos. Cada registro tiene serie, título, fecha, mes, minutos, enlace, origen y
ponentes.

Hay cinco orígenes:

- **Facebook**: los videos de la página de la facultad de quince minutos o más.
  Los más cortos son clips, reels o avisos. Los avisos de admisión tampoco
  entran. Cada video tiene una copia pública en Google Drive (`post` guarda el
  enlace a Facebook). La página de la charla usa el reproductor de Drive, para
  no cargar el de Facebook. Facebook borra las transmisiones en vivo a los 30
  días y deja un fragmento de un minuto, así que una sesión del Consejo solo se
  conserva si se copia antes.
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
  ponentes, e `invitation` enlaza la invitación. Un video sin ponente toma la
  única invitación de su serie para el día anterior: cada transmisión del
  coloquio de la UNT lleva la fecha del día siguiente a la charla. Las
  invitaciones del coloquio salen de la página de Facebook del Club de Física
  Teórica de la UNT. Un video de LAFMAT en Facebook que también está en YouTube
  no entra.

- **Educast PUCP**: el archivo de videos de la PUCP. `url` es el mp4, que el
  navegador reproduce sin la página de Educast; `page` es la página y `poster`
  su imagen. La página no da la duración; `educast.py` la lee del mp4 con
  ffprobe.
- **Drive**: las grabaciones que los Peruvian Theoretical Physics Seminars
  (`tps`) enlazan en la página de grabaciones de su sitio. `url` es el
  reproductor de Drive y `page` esa página. Su sitio enlaza el mismo video del 5
  de mayo en los seminarios 3 a 7, así que esos cinco entran como invitaciones,
  con la página del seminario como invitación.
- **Invitación**: las charlas que la facultad anunció en Facebook y que no
  tienen video. Una invitación entra cuando nombra un título y un ponente. No
  entra si un video de la misma serie, con menos de tres meses de diferencia, ya
  tiene un ponente con el mismo primer nombre y otra palabra en común: quien
  vuelve años después da otra charla. Las invitaciones del coloquio de la PUCP
  desde 2024 y las charlas de la ASDF PUCP desde 2025 salen del Instagram de la
  ASDF PUCP, que da la fecha de cada publicación. Entre ellas está la
  conferencia de Alberto Gago en el curso Seminario de Física de la PUCP de
  2026: el sitio no tiene una página de ese curso. Las charlas del Centro de
  Estudiantes de Física de la UNT (`cefunt`), con la Quantum Week UNT de 2024 y
  2025, también son invitaciones: sus transmisiones en vivo ya no están en
  Facebook. Los días de la Quantum Week de 2026 son videos del coloquio de la
  UNT. Las charlas del Club de Física Teórica de la UNT (`cftunt`), sobre todo
  su Seminario Estudiantil de Tópicos en Física Teórica de 2026, son
  invitaciones: el club prometió los videos pero solo subió fragmentos cortos.
  `recordings.py` lee los grupos de una lista hecha a mano con cada publicación
  y su afiche, porque las páginas de Facebook no dan el año; el año sale del día
  de la semana y del orden de las publicaciones.

El mes sale de la fecha de la publicación o, si la copia no la tiene, del número
de la foto, como en las sustentaciones (ver `docs/tesis.md`). `date` es el día
que dice la invitación, si lo dice; si no, la fila muestra el mes.

## Ponentes y perfiles

Un ponente lleva `profile` cuando su nombre coincide con un único perfil de
`/fisicos/` o, si ninguno coincide, con un único perfil de `/professors/`: el
primer nombre debe ser el mismo y cada palabra del nombre debe estar en la
carpeta del perfil. Las charlas nombran a la gente en forma corta, y los
perfiles con el nombre completo. Quien tiene ambos perfiles enlaza al de
`/fisicos/`, como en el resto del sitio. Si hay dos coincidencias en la misma
sección, el nombre sale sin enlace.

El perfil lista las charlas de esa persona en «Charlas», con su serie.
