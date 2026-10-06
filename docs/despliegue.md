# Despliegue

El sitio se publica desde la carpeta `public/` que genera `hugo`. Hay dos
destinos con su propia configuración: Netlify y Cloudflare.

## Netlify

[`netlify.toml`](../netlify.toml):

- Compila con `git config core.quotepath false && bun install && bun run build`
  y publica `public/`.
- `HUGO_VERSION`, `NODE_VERSION` y `BUN_VERSION` fijan las herramientas.
- Las vistas previas de pull requests y los despliegues de rama compilan con
  `-b $DEPLOY_PRIME_URL` para que los enlaces apunten a la URL de la vista
  previa.
- El contexto `next` define `HUGO_ENV=next`, que activa `config/next/`.
- Los plugins `@algolia/netlify-plugin-crawler` (rama `master`) y
  `netlify-plugin-cloudinary` se ejecutan en cada despliegue.
- `functions = "functions"` publica la carpeta [`functions/`](../functions).

### Boletín

El formulario de suscripción es un formulario de Netlify. Al enviarse, Netlify
ejecuta [`functions/submission-created.js`](../functions/submission-created.js),
que agrega el correo a una lista de SendGrid y, si están definidas `ADMIN_EMAIL`
y `NOTIFICATION_EMAIL`, envía un aviso de nuevo suscriptor.

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
rastreador actualiza en cada despliegue de `master`. La búsqueda aparece en la
portada y en `unmsm`, `apuntes` y `blog`.

## Cloudflare

[`wrangler.toml`](../wrangler.toml) define el proyecto `web`:

- `build.command` ejecuta [`build.sh`](../build.sh).
- `assets.directory = "./public"` sirve el sitio; las rutas inexistentes
  devuelven `404.html` (`not_found_handling = "404-page"`).

`build.sh` descarga Hugo extendido, completa el historial de git si el clon es
superficial, ejecuta `bun install` y `bun run build`. Hugo necesita el historial
completo porque `enableGitInfo` calcula la fecha de última modificación de cada
página desde git.

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

La versión de Hugo está en [`mise.toml`](../mise.toml),
[`netlify.toml`](../netlify.toml), [`build.sh`](../build.sh) y
[`ci_nodejs.yml`](../.github/workflows/ci_nodejs.yml). La de Bun está en
`mise.toml`, `netlify.toml`, `ci_nodejs.yml` y
[`generate_screenshots.yml`](../.github/workflows/generate_screenshots.yml).
Cámbiala en todos a la vez.

## Flujos de GitHub

| Flujo                      | Cuándo                                                              | Qué hace                                                                                   |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ci_nodejs.yml`            | Pull request y push a `master`                                      | `bun run check` y `gotmplfmt`.                                                             |
| `check_broken_links.yml`   | Cambios en `content/`, los lunes                                    | Revisa los enlaces de `content/`.                                                          |
| `generate_screenshots.yml` | El día 1 de cada mes                                                | Abre un pull request con capturas nuevas.                                                  |
| `analyze_codeql.yml`       | Cambios en `layouts/`, `assets/` o `functions/`, los viernes        | Análisis CodeQL.                                                                           |
| `audit_lighthouse.yml`     | Push a `master` con cambios en `layouts/`, `assets/` o `functions/` | Auditoría Lighthouse de la portada y `/blog/` con el presupuesto de `.github/budget.json`. |
| `analyze_legitify.yml`     | Los lunes                                                           | Análisis de la configuración del repositorio con Legitify.                                 |
