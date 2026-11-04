# Tesis

[English](../en/tesis.md)

`/tesis/` lista las tesis de licenciatura y de maestría y los trabajos de
suficiencia profesional de la Facultad de Ciencias Físicas. Cada uno tiene su
página en `/tesis/<número>/`, donde el número es el del handle de Cybertesis.

## Datos

`data/theses.json` es una copia de tres colecciones de Cybertesis, el
repositorio de San Marcos. No se edita a mano: se genera fuera de este
repositorio. `fetched` guarda la fecha de la copia. Cada tesis tiene título,
autores, asesores, jurado, año, grado, área, temas, resumen, handle y licencia.

El PDF no se copia. La página enlaza el registro en Cybertesis, donde están el
texto completo y su licencia.

El área es el primer código OCDE del registro. `areas` guarda la etiqueta de
cada código usado, según el vocabulario de
[pe-repo](https://purl.org/pe-repo/ocde/ford).

## Nombres y perfiles

Cybertesis escribe los nombres como `Apellidos, Nombres`. Cada autor y asesor
trae en `slugs` las formas en que el sitio podría nombrarlo: todos los nombres o
el primero, con los dos apellidos o el primero. El partial
`data/person-page.html` busca cada slug en `/personas/` y devuelve la primera
página que existe. Si ninguna existe, el nombre sale sin enlace.

El ORCID de un asesor se guarda solo si el registro nombra un único asesor,
porque Cybertesis lista los ORCID aparte de los nombres y sin orden fijo.

## Sustentaciones

`data/defences.json` reúne las invitaciones a sustentación que la facultad
publicó en su página de Facebook. Tampoco se edita a mano: se genera fuera de
este repositorio. Cada sustentación tiene candidato, grado, título, fecha, mes,
jurado, tesis y enlace a la invitación.

`date` es el día que dice la invitación, si lo dice. El mes sale de la fecha de
la publicación o, si la copia no la tiene, del número de la foto, que crece con
el tiempo: se interpola entre las publicaciones con fecha.

`thesis` es el número de Cybertesis cuando un autor comparte con el candidato
dos palabras del nombre, una de ellas un apellido. El grado elige la colección y
el año más cercano a la invitación elige el registro. Así resiste un nombre mal
escrito y a quien tiene tesis de licenciatura y de maestría.

El jurado guarda el rol que dice la invitación: Presidente, Miembro, Miembro
externo, Miembro suplente, Asesor o Coasesor. Las sustentaciones de Ingeniería
Mecánica de Fluidos no entran, porque sus tesis no están en las colecciones de
física.

La página de una tesis enlazada muestra su jurado por rol, la fecha y la
invitación. El perfil de cada jurado lista sus sustentaciones en «Jurado de
sustentaciones», sin las que asesoró, que ya salen en «Tesis asesoradas».

## Vistas

La lista agrupa por área, por año, por asesor o por sustentación. Un área con
menos de ocho trabajos entra en «Otras áreas», donde cada fila dice su área. La
vista por asesor muestra a quienes asesoraron tres trabajos o más. La vista de
sustentaciones agrupa las invitaciones por año; cada fila abre la tesis si ya
está en Cybertesis y la invitación si no.

La página de una tesis termina con las charlas, tesis y artículos sobre su tema,
si los hay (ver [contenido relacionado](grabaciones.md#contenido-relacionado)).
