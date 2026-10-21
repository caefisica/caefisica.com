---
title: "Acceso a artículos científicos"
emoji: ":lock_with_ink_pen:"
description:
  "En muchas ocasiones, necesitarás acceder a un artículo que se encuentra tras
  un muro de pago. Veremos algunos métodos para acceder a estos artículos."
lead:
  "En muchas ocasiones, necesitarás acceder a un artículo que se encuentra tras
  un muro de pago. Veremos algunos métodos para acceder a estos artículos."
date: 2022-09-15T14:44:30-05:00
lastmod: 2022-09-15T14:44:30-05:00
images: []
thumbnail: ""
contributors: ["david"]
author_id: "david"
tags: ["tips"]
toc: true
weight: 90
pinned: false
draft: false
---

Antes de comenzar, es necesario que sepas los significados de los siguientes
términos.

1. DOI: Siglas en inglés de _Digital Object Identifier_ (Identificador de Objeto
   Digital). Es un código alfanumérico que identifica de forma única a un
   artículo científico, imagen, libro, noticia, entre otros. Este código es
   permanente.
2. Sci-Hub: Sitio web fundado por Alexandra Elbakyan en 2011. Los enlaces
   oficiales son [Sci-Hub.se](https://sci-hub.se/),
   [Sci-Hub.st](https://sci-hub.st/) y [Sci-Hub.ru](https://sci-hub.ru/).

### Formas de acceder

#### Favoritos

Sin profundizar demasiado (por ahora), puedes añadir el siguiente script como
favorito en tu navegador de preferencia.

```javascript
javascript: location.hostname += ".sci-hub.ru";
```

Cuando te encuentres en la página del artículo, al hacer click en el elemento
favorito que contiene el script, este se ejecutará y te redigirá a la página del
artículo en Sci-Hub.

#### Extensiones

Este proceso puede automatizarse usando extensiones en tu navegador.

1. Si utilizas un navegador basado en Chromium que permita instalar desde la
   Chrome Web Store. Puedes utilizar
   [Sci-Hub X Now!](https://github.com/gchenfc/sci-hub-now).

{{< img-simple src="1.jpg" alt="Captura de pantalla al buscar el término DOI en el navegador" class="mx-auto block shadow-lg my-12" >}}

2. Otra alternativa es [Sci-Hub-Fly](https://github.com/allanino/sci-hub-fy),
   aunque en este caso tienes que instalar las extensiones de forma manual,
   activando el modo desarrollador. El repositorio contiene los pasos a detalle.

#### Telegram

Existe un bot en Telegram ([@scihubot](https://telegram.me/scihubot)) al cual
puedes enviar como mensaje el URL de un artículo científico y el bot responde
con el archivo PDF del artículo científico.

#### Manualmente

1. Necesitas el DOI del artículo científico al que quieres acceder. También
   puedes utilizar el enlace URL del mismo artículo.
2. Pega el DOI o enlace en la página web de Sci-Hub. Eso es todo. :tada:

##### Ejemplo

Supongamos que quiero acceder al siguiente artículo:

- Autor: Jonathan Adams
- Título: "_Early citation counts correlate with accumulated impact_"
- URL: `https://link.springer.com/article/10.1007/s11192-005-0228-9`

Al ingresar al enlace, se puede ver lo siguiente:

{{< img-simple src="2.jpeg" alt="Captura de pantalla de un artículo científico en Springer" class="mx-auto block shadow-lg my-12" >}}

Primero, necesitamos identificar el DOI. Cada revista científica tiene una forma
distinta de mostrar la información de sus artículos, por lo que estará en
distintas posiciones. Utiliza `Ctrl+F` en tu navegador y busca el término "DOI".
Habitualmente se encuentran en la parte final de la página.

{{< img-simple src="3.png" alt="Captura de pantalla al buscar el término DOI en el navegador" class="mx-auto block shadow-lg my-12" >}}

En este caso, el código DOI es `10.1007/s11192-005-0228-9`. Pegas esto en la
página de Sci-Hub y te cargará el documento. Puedes usar `Ctrl+S` para guardar
el documento de forma local.

{{< img-simple src="4.png" alt="Captura de pantalla al buscar el término DOI en el navegador" class="mx-auto block shadow-lg my-12" >}}
