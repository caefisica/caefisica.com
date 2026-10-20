# Despliegue

El sitio se publica desde la carpeta `public/` que genera `hugo`. Hay dos
destinos con su propia configuración: Netlify y Cloudflare.

## Netlify

[`netlify.toml`](../netlify.toml):

- Compila con `bash build.sh` y publica `public/`. Ver [Cloudflare](#cloudflare)
  para lo que hace `build.sh`.
- Las vistas previas de pull requests y los despliegues de rama compilan con
  `bash build.sh -b $DEPLOY_PRIME_URL` para que los enlaces apunten a la URL de
  la vista previa.
- El contexto `next` define `HUGO_ENV=next`, que activa `config/next/`.
- El plugin `@algolia/netlify-plugin-crawler` rastrea el sitio en los
  despliegues de la rama `master`. `netlify-plugin-cloudinary` se ejecuta en
  cada despliegue.
- `functions = "functions"` publica la carpeta [`functions/`](../functions).

### Boletín

El formulario de suscripción es un formulario de Netlify. Al enviarse, Netlify
ejecuta [`functions/submission-created.js`](../functions/submission-created.js),
que agrega el correo a una lista de SendGrid. Si SendGrid responde 202 y están
definidas `ADMIN_EMAIL` y `NOTIFICATION_EMAIL`, envía un aviso de nuevo
suscriptor.

Variables de entorno de la función:

| Variable             | Obligatoria | Uso                                           |
| -------------------- | ----------- | --------------------------------------------- |
| `SENDGRID_API_KEY`   | Sí          | Clave de la API de SendGrid.                  |
| `SENDGRID_LIST_ID`   | Sí          | Lista de contactos donde se agrega el correo. |
| `ADMIN_EMAIL`        | No          | Destinatario del aviso.                       |
| `NOTIFICATION_EMAIL` | No          | Remitente del aviso.                          |

Sin las dos primeras, la función responde 500.

### Búsqueda

`assets/js/docsearch.ts` consulta un índice de Algolia que el plugin del
rastreador actualiza en cada despliegue de `master`. Dónde se carga el buscador:
[arquitectura](architecture.md#estilos-y-scripts).

## Cloudflare

[`wrangler.toml`](../wrangler.toml) define el proyecto `web`:

- `build.command` ejecuta [`build.sh`](../build.sh).
- `assets.directory = "./public"` sirve el sitio; las rutas inexistentes
  devuelven `404.html` (`not_found_handling = "404-page"`).

`build.sh` instala su propia copia de mise en `~/.local/bin` e ignora el mise y
las variables `MISE_*` de la imagen de compilación. Después instala las
herramientas de `mise.toml` (sin `wrangler`, `go` ni `gotmplfmt`), antepone al
`PATH` el `node` de mise, porque Hugo ejecuta `postcss` con el primer `node` que
encuentra y la imagen de Netlify trae uno más antiguo (Node 16, de nvm),
completa el historial de git si el clon es superficial y ejecuta
`mise run install` y `mise run build`. Los argumentos de `build.sh` pasan a
`hugo`. Hugo necesita el historial completo porque `enableGitInfo` calcula la
fecha de última modificación de cada página desde git.

El paso de compilación de Workers Builds es el campo **Build command** de
_Settings > Build_ del Worker `web` en el panel de Cloudflare. Debe ser
`bash build.sh`. El campo **Deploy command** se queda en `npx wrangler deploy`.

## Cabeceras y redirecciones

Hugo genera `public/_headers` y `public/_redirects` desde
[`layouts/index.headers`](../layouts/index.headers) y
[`layouts/index.redirects`](../layouts/index.redirects). Los dos destinos leen
esos archivos.

La política `Content-Security-Policy` se arma con las listas de
[`data/fixes/headers.yml`](../data/fixes/headers.yml). Si el navegador bloquea
un recurso externo, agrega su dominio a la lista que corresponda: `scriptsrc`,
`stylesrc`, `imgsrc`, `fontsrc`, `connectsrc`, `framesrc`, `workersrc` o
`manifestsrc`.

## Versiones de herramientas

[`mise.toml`](../mise.toml) fija la versión de cada herramienta: Hugo, Bun,
Node, Go, Wrangler y `gotmplfmt`. Los flujos de GitHub y
[`build.sh`](../build.sh) las leen de ahí. Cambia una versión solo en
`mise.toml`.

## Flujos de GitHub

Todos los flujos se pueden lanzar a mano.

| Flujo                      | Cuándo                                                                                          | Qué hace                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                   | Pull request y push a `master`                                                                  | `mise run install` y `mise run check`.                                                                                                                                                                      |
| `check_broken_links.yml`   | Pull request y push a `master` con cambios en `content/`; los lunes                             | Revisa los enlaces de `content/` con [`.404-links.yml`](../.404-links.yml).                                                                                                                                 |
| `generate_screenshots.yml` | El día 1 de cada mes                                                                            | Abre un pull request con capturas nuevas.                                                                                                                                                                   |
| `analyze_codeql.yml`       | Pull request y push a `master` con cambios en `layouts/`, `assets/` o `functions/`; los viernes | Análisis CodeQL de JavaScript.                                                                                                                                                                              |
| `audit_lighthouse.yml`     | Ejecución manual, o cuando el check `Workers Builds: web` de `master` termina bien              | Auditoría Lighthouse de `https://web.caefisica.workers.dev/` y `/blog/` con el presupuesto de `.github/budget.json`. El dominio `caefisica.com` no está disponible. La auditoría usa el host `workers.dev`. |
| `analyze_legitify.yml`     | Los lunes                                                                                       | Análisis de la configuración del repositorio con Legitify.                                                                                                                                                  |
