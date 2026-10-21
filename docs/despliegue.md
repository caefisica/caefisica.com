# Despliegue

El sitio se publica en `https://web.empirical.workers.dev/`, el Worker `web` de
Cloudflare. Sirve la carpeta `public/` que genera `mise run build`: `hugo` y
después `pagefind`. El host sale de `baseURL` en
[`config/_default/config.toml`](../config/_default/config.toml); cámbialo solo
ahí.

## Cloudflare

[`wrangler.toml`](../wrangler.toml) define el proyecto `web`:

- `build.command` ejecuta [`build.sh`](../build.sh).
- `assets.directory = "./public"` sirve el sitio; las rutas inexistentes
  devuelven `404.html` (`not_found_handling = "404-page"`).

`build.sh` instala su propia copia de mise en `~/.local/bin` e ignora el mise y
las variables `MISE_*` de la imagen de compilación. Después instala las
herramientas de `mise.toml` (sin `wrangler`, `go` ni `gotmplfmt`), antepone al
`PATH` el `node` de mise, porque Hugo ejecuta `postcss` con el primer `node` que
encuentra, completa el historial de git si el clon es superficial y ejecuta
`mise run install` y `mise run build`. Hugo necesita el historial completo
porque `enableGitInfo` calcula la fecha de última modificación de cada página
desde git.

`bash build.sh -b <url>` compila con ese `baseURL` en lugar del de
`config.toml`.

El paso de compilación de Workers Builds es el campo **Build command** de
_Settings > Build_ del Worker `web` en el panel de Cloudflare. Debe ser
`bash build.sh`. El campo **Deploy command** se queda en `npx wrangler deploy`.

## Netlify

El sitio `caefis` de Netlify compila las vistas previas de cada pull request y
de las ramas con [`netlify.toml`](../netlify.toml): publica `public/` y ejecuta
`bash build.sh -b $DEPLOY_PRIME_URL`, así que cada vista previa usa su propio
host como `baseURL`. El plugin `netlify-plugin-cloudinary` carga las imágenes de
Cloudinary. La producción es solo el Worker de Cloudflare.

## Búsqueda

`mise run build` ejecuta `pagefind --site public` después de `hugo`. Pagefind
indexa el contenido de `<div class="content">` de cada página (el atributo
`data-pagefind-body` está en [`layouts/baseof.html`](../layouts/baseof.html)) y
escribe el índice y la interfaz en `public/pagefind/`.
[`assets/js/search.ts`](../assets/js/search.ts) carga esa interfaz. Dónde se
carga el buscador: [arquitectura](architecture.md#estilos-y-scripts).

`mise run dev` no genera el índice. Sin `public/pagefind/`, el buscador muestra
«La búsqueda no está disponible.». Ejecuta `mise run build` antes y `dev` sirve
el índice desde `public/`.

## Cabeceras y redirecciones

Hugo genera `public/_headers` y `public/_redirects` desde
[`layouts/index.headers`](../layouts/index.headers) y
[`layouts/index.redirects`](../layouts/index.redirects). Cloudflare lee esos
archivos.

La política `Content-Security-Policy` se arma con las listas de
[`data/fixes/headers.yml`](../data/fixes/headers.yml). Si el navegador bloquea
un recurso externo, agrega su dominio a la lista que corresponda: `scriptsrc`,
`stylesrc`, `imgsrc`, `fontsrc`, `connectsrc`, `framesrc`, `workersrc` o
`manifestsrc`. Pagefind necesita `'wasm-unsafe-eval'` en `scriptsrc`.

## Versiones de herramientas

[`mise.toml`](../mise.toml) fija la versión de cada herramienta: Hugo, Bun,
Node, Go, Wrangler y `gotmplfmt`. Los flujos de GitHub y
[`build.sh`](../build.sh) las leen de ahí. Cambia una versión solo en
`mise.toml`. La versión de Pagefind está fijada en `package.json`.

## Flujos de GitHub

Todos los flujos se pueden lanzar a mano.

| Flujo                      | Cuándo                                                                                                      | Qué hace                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`                   | Pull request y push a `master`                                                                              | `mise run install` y `mise run check`.                                                                                                                                                                                                                                                                                         |
| `check_broken_links.yml`   | Pull request y push a `master` con cambios en `content/`; los lunes                                         | Revisa los enlaces de `content/` con [`.404-links.yml`](../.404-links.yml).                                                                                                                                                                                                                                                    |
| `generate_screenshots.yml` | El día 1 de cada mes                                                                                        | Abre un pull request con capturas nuevas.                                                                                                                                                                                                                                                                                      |
| `audit_lighthouse.yml`     | Ejecución manual, o cuando el check `Workers Builds: web` de un commit que ya está en `master` termina bien | Auditoría Lighthouse de `https://web.empirical.workers.dev/` y `/blog/` con el presupuesto de `.github/budget.json`. Mide cada URL tres veces y compara con el presupuesto la mediana de las tres corridas; [`.github/lighthouserc.cjs`](../.github/lighthouserc.cjs) convierte el presupuesto en aserciones sobre la mediana. |
