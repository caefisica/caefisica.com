# Instalación

## Software necesario

Para desarrollar y contribuir a este proyecto, necesitarás tener instalado
cierto software en tu sistema operativo. A continuación se describen los pasos
para instalar cada uno de estos programas en un sistema operativo Windows:

- `npm`: es el administrador de paquetes de Node.js. Puedes instalarlo a través
  de la página de descargas de [Node.js](https://nodejs.org/es/download/).
  Asegúrate de descargar la versión `18.16.0` y sigue los pasos predeterminados
  durante la instalación. Una vez finalizada, reinicia tu ordenador y abre una
  consola (por ejemplo, cmd). Escribe npm -v y presiona Enter. Si aparece una
  serie de números como 1.4, significa que npm se ha instalado correctamente.
  Alternativamente, puedes utilizar
  [nvm-windows](https://github.com/coreybutler/nvm-windows). Si decides usar
  nvm, no utilices el instalador de Node.js.
- `git`: es una herramienta de control de versiones que nos permitirá gestionar
  y mantener el código fuente del proyecto. Puedes descargarlo desde la página
  de [`git-scm`](https://git-scm.com/downloads). Sigue los pasos predeterminados
  durante la instalación. Una vez finalizada la instalación, abre una consola
  (por ejemplo, Powershell) y escribe git --version. Si aparece una línea como
  `git version 2.37.3.windows.1`, significa que git se ha instalado
  correctamente.
- `VSCode` (opcional): es un editor de código fuente muy popular y completo.
  Puedes descargarlo desde la página de
  [VSCode](https://code.visualstudio.com/download).

## Configuración del entorno de desarrollo

En adelante, se denominará como consola a un terminal como Powershell o Command
Prompt (CMD). Para configurar tu entorno de desarrollo, sigue estos pasos:

1. Clona el repositorio en tu equipo usando git. Abre una consola y escribe
   `git clone https://github.com/caefisica/web.git`. Esto creará una copia del
   repositorio en tu equipo en una carpeta llamada web.
2. Accede a la carpeta del proyecto. En la consola, escribe `cd web` para entrar
   en la carpeta del proyecto.
3. Instala las dependencias del proyecto. En la consola, escribe `npm install`.
   Este comando instalará todas las dependencias necesarias para ejecutar y
   desarrollar el proyecto.
4. Arranca el servidor de desarrollo. En la consola, escribe `npm run start`.
   Este comando arrancará el servidor de desarrollo y abrirá automáticamente una
   pestaña en tu navegador con la página del proyecto. A partir de ahora, cada
   vez que hagas un cambio en el código fuente, el servidor se reiniciará
   automáticamente y podrás ver los cambios en tiempo real. Podrás acceder a la
   página en `http://localhost:1313`.
5. Para comenzar a editar el proyecto utilizando VSCode, escribe `code .` (no te
   olvides del punto y el espacio después de `code`). Una vez que hayas
   realizado los cambios que desees en el proyecto, puedes publicarlos en el
   repositorio de GitHub siguiendo estos pasos:

- Abre la lista de archivos modificados en VSCode haciendo clic en el icono de
  control de código fuente en la barra lateral izquierda o presionando Ctrl +
  Mayús + G.
- Selecciona los archivos que deseas incluir en el commit haciendo clic en el
  icono de "staged changes" al lado de cada archivo.
- Escribe una descripción clara y concisa del commit en el campo "Message" en la
  parte inferior de la ventana.
- Haz clic en el botón "Commit All" para realizar el commit.
- Para enviar tus cambios al repositorio de GitHub, haz clic en el botón "Push"
  en la barra superior o selecciona "Push" en el menú "Control de código
  fuente". Esto enviará tus cambios al repositorio de GitHub y los hará
  disponibles para todos los miembros del equipo.
