# Tesis

`/tesis/` lista las tesis de licenciatura y de maestría y los trabajos de
suficiencia profesional de la Facultad de Ciencias Físicas. Cada uno tiene su
página en `/tesis/<número>/`, donde el número es el del handle de Cybertesis.

## Datos

`data/theses.json` es una copia de tres colecciones de Cybertesis, el
repositorio de San Marcos. No se edita a mano: se regenera con el script que la
escribe, que guarda la fecha de la copia en `fetched`. Cada tesis tiene título,
autores, asesores, jurado, año, grado, área, temas, resumen, handle y licencia.

El PDF no se copia. La página enlaza el registro en Cybertesis, donde están el
texto completo y su licencia.

El área es el primer código OCDE del registro. `areas` guarda la etiqueta de
cada código usado, según el vocabulario de
[pe-repo](https://purl.org/pe-repo/ocde/ford).

## Nombres y perfiles

Cybertesis escribe los nombres como `Apellidos, Nombres`. Cada autor y asesor
trae en `slugs` las formas en que el sitio podría nombrar su carpeta: todos los
nombres o el primero, con los dos apellidos o el primero. El partial
`data/person-page.html` busca cada slug en `/fisicos/` y luego en `/professors/`
y devuelve la primera página que existe. Si ninguna existe, el nombre sale sin
enlace.

El ORCID de un asesor se guarda solo si el registro nombra un único asesor,
porque Cybertesis lista los ORCID aparte de los nombres y sin orden fijo.

## Vistas

La lista agrupa por área, por año o por asesor. Un área con menos de ocho
trabajos entra en «Otras áreas», donde cada fila dice su área. La vista por
asesor muestra a quienes asesoraron tres trabajos o más.
