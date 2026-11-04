# Charlas

[English](../en/grabaciones.md)

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
las pone en las rutas. La página da el título, los ponentes con su afiliación,
la fecha, la serie y el reproductor, y debajo una ficha con el original, la
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

`data/recordings.json` no se edita a mano: se genera fuera de este repositorio.
Para corregir una charla, abre un issue. `fetched` guarda la fecha de la copia.

`series` da por cada serie su nombre, organizador (vacío en las que no son
series), la palabra que cuenta sus filas («charlas» o «sesiones»), el número de
charlas y de videos, y el primer y el último año. Va ordenada por número de
videos. Cada registro tiene serie, título, fecha, mes, minutos, enlace, origen y
ponentes. El id de un registro es único sin distinguir mayúsculas.

| Origen       | Qué entra                                                                           | Campos propios                                     |
| ------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| `facebook`   | Videos de la página de la facultad de 15 minutos o más, con copia pública en Drive. | `post`: la publicación de Facebook.                |
| `youtube`    | Videos de 15 minutos o más de cada canal que es una serie; sin clases ni talleres.  | `invitation`, si el video corresponde a una.       |
| `educast`    | El archivo de videos de la PUCP.                                                    | `url` (mp4), `page` (página de Educast), `poster`. |
| `drive`      | Grabaciones que un sitio de seminarios enlaza en su página de grabaciones.          | `url` (reproductor de Drive), `page`.              |
| `invitation` | Charlas anunciadas sin video, con título y ponente.                                 | `invitation`: el enlace a la invitación.           |

Reglas comunes:

- Dos subidas del mismo día con el mismo título y casi la misma duración son un
  solo registro. Si las duraciones difieren, son partes y se numeran.
- Un video que corresponde a una invitación (mismo ponente, menos de tres meses
  de diferencia) toma su título y sus ponentes, y enlaza la invitación.
- Una invitación no entra si un video de la misma serie, con menos de tres meses
  de diferencia, ya tiene un ponente con el mismo primer nombre y otra palabra
  en común.
- `date` es el día que dice la invitación, si lo dice; si no, la fila muestra el
  mes. El mes sale de la fecha de la publicación o, si la copia no la tiene, del
  número de la foto, como en las sustentaciones (ver [tesis](tesis.md)).

## Ponentes y personas

Un ponente lleva `slug` cuando su nombre coincide con una única persona de
`data/physicists.json` o, si ninguna coincide, con una única de
`data/people.toml`: el primer nombre debe ser el mismo y cada palabra del nombre
debe estar en el slug. Las charlas nombran a la gente en forma corta, y los
registros con el nombre completo. Si hay dos coincidencias en el mismo registro,
el nombre sale sin enlace.

El perfil lista las charlas de esa persona en «Charlas», con su serie.

## Charlas y tesis relacionadas

La página de una charla termina con hasta tres «Charlas relacionadas» y hasta
tres «Tesis relacionadas». La página de una tesis lista hasta tres charlas.
Salen de `data/related.json`, que tampoco se edita a mano: se genera fuera de
este repositorio. Para eso, el modelo multilingual-e5-large convierte en
vectores cada charla (título y resumen de Educast) y cada tesis (título). Una
pareja entra si su similitud llega a 0,35. Debajo de ese corte las parejas ya no
tratan del mismo tema. Las sesiones del Consejo de Facultad no entran, porque no
tienen tema.

`related.json` se genera después de `recordings.json` y `theses.json`. Si nombra
una charla o una tesis que ya no está, la página la omite.
