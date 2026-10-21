# Despliegue

El sitio se publica en `https://web.caefisica.workers.dev/`, el Worker `web` de
la cuenta `caefisica` de Cloudflare. Sirve la carpeta `public/` que genera
`mise run build`: `hugo` y después `pagefind`. El host sale de `baseURL` en
[`config/_default/config.toml`](../config/_default/config.toml); cámbialo solo
ahí.

## Cloudflare

[`wrangler.toml`](../wrangler.toml) define el Worker:

- `account_id` es la cuenta que recibe el despliegue.
- `assets.directory = "./public"` sirve el sitio; las rutas inexistentes
  devuelven `404.html` (`not_found_handling = "404-page"`).

## Publicación

El trabajo `deploy` de [`ci.yml`](../.github/workflows/ci.yml) publica el sitio.
Necesita el trabajo `check` y corre en un push a `master` o al lanzar el flujo a
mano sobre `master`. Sus pasos:

1. Falla con un mensaje que nombra cada secreto ausente: `CLOUDFLARE_API_TOKEN`,
   `NETLIFY_AUTH_TOKEN` o la variable `NETLIFY_SITE_ID`.
2. Clona el repositorio con todo el historial, porque `enableGitInfo` calcula la
   fecha de última modificación de cada página desde git.
3. Instala las herramientas de `mise.toml` y las dependencias.
4. Ejecuta `mise run deploy`. Compila una vez con `mise run build` y sube
   `public/` a Cloudflare (`wrangler deploy`) y a Netlify
   (`netlify deploy --prod --no-build`). La opción `--no-build` evita el comando
   de compilación configurado en la app de Netlify. La compilación ya ocurrió en
   la tarea `build`.

Los despliegues hacen cola: uno nuevo espera a que termine el que está en curso.
Cuando `deploy` termina bien, el trabajo `lighthouse` audita el sitio de
Cloudflare. Netlify recibe la carpeta ya construida y este repositorio no le
define ningún comando de compilación. Un sitio de Netlify enlazado a un
repositorio de Git compila por su cuenta además de recibir la carga de Actions:
desvincúlalo en **Project configuration > Build & deploy > Continuous
deployment > Link repository**. De [`netlify.toml`](../netlify.toml) solo se usa
`[dev]`, para `netlify dev`.

El trabajo `preview` corre en cada pull request del propio repositorio. Compila
con el `baseURL` que Netlify da al alias,
`https://pr-<número>--<sitio>.netlify.app/`, y publica `public/` con
`netlify deploy --no-build --alias pr-<número>`. La URL queda en el resumen del
trabajo. Un pull request de un fork o de Dependabot no tiene acceso a los
secretos: el trabajo avisa del motivo y termina bien, sin vista previa.

### Despliegue desde cero

Para publicar el sitio con tus propias cuentas:

1. En el panel de Cloudflare abre **Workers & Pages** y copia el **Account ID**
   de _Account Details_. Pégalo en `account_id` de `wrangler.toml`.
2. En Cloudflare abre **My Profile > API Tokens > Create Token > Custom token**.
   Dale el permiso de cuenta **Workers Scripts: Edit** sobre esa cuenta.
3. En Netlify crea un sitio vacío en **Sites > Add new site > Deploy manually**
   y copia el **Project ID** de _Project configuration > General_.
4. En Netlify abre **User settings > Applications > Personal access tokens** y
   crea un token.
5. En GitHub abre **Settings > Secrets and variables > Actions**. En _Secrets_
   crea `CLOUDFLARE_API_TOKEN` y `NETLIFY_AUTH_TOKEN` con los dos tokens. En
   _Variables_ crea `NETLIFY_SITE_ID` con el Project ID.
6. Cambia `baseURL` en `config/_default/config.toml` y las URL de
   [`audit_lighthouse.yml`](../.github/workflows/audit_lighthouse.yml) por el
   host de tu Worker.
7. Haz push a `master` o lanza el flujo `checks` desde la pestaña **Actions**.

### Despliegue a mano

Con los dos tokens y el ID del sitio en el entorno, desde la raíz del
repositorio:

```bash
export CLOUDFLARE_API_TOKEN=<token de Cloudflare>
export NETLIFY_AUTH_TOKEN=<token de Netlify>
export NETLIFY_SITE_ID=<Project ID de Netlify>
mise run deploy
```

`mise run deploy` compila antes de publicar. Para publicar en un solo host,
ejecuta `mise run deploy:cloudflare` o `mise run deploy:netlify`.

## Búsqueda

`mise run build` ejecuta `pagefind --site public` después de `hugo`. Pagefind
indexa el contenido de las páginas dentro del contenedor con el atributo
`data-pagefind-body` ([`layouts/baseof.html`](../layouts/baseof.html)) y escribe
el índice y la interfaz en `public/pagefind/`.
[`assets/js/search.ts`](../assets/js/search.ts) carga esa interfaz. Dónde se
carga el buscador: [arquitectura](architecture.md).

`mise run dev` ejecuta `build` antes, así que el índice también existe en local
y el buscador funciona.

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

[`mise.toml`](../mise.toml) fija la versión de cada herramienta. Los flujos de
GitHub las leen de ahí. Cambia una versión solo en `mise.toml`. La versión de
Pagefind está fijada en `package.json`.

## Flujos de GitHub

Todos los flujos se pueden lanzar a mano.

| Flujo                    | Cuándo                                                                      | Qué hace                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`                 | Pull request y push a `master`                                              | `check`: `mise run install` y `mise run check`. En `master`, `deploy` publica el sitio y después `lighthouse` lo audita. En un pull request, `preview` publica una vista previa en Netlify.                                                                                                                                    |
| `check_broken_links.yml` | Pull request y push a `master` con cambios en `content/`; los lunes         | Ejecuta `mise run links`: [lychee](https://lychee.cli.rs/) revisa los enlaces `http` y `https` de `content/` con [`lychee.toml`](../lychee.toml). Falla si un enlace no responde y el registro nombra la página y el enlace. Solo usa el `GITHUB_TOKEN` del flujo, con permiso de lectura.                                     |
| `audit_lighthouse.yml`   | Ejecución manual, o el trabajo `lighthouse` de `ci.yml` después de `deploy` | Auditoría Lighthouse de `https://web.caefisica.workers.dev/` y `/blog/` con el presupuesto de `.github/budget.json`. Mide cada URL tres veces y compara con el presupuesto la mediana de las tres corridas; [`.github/lighthouserc.cjs`](../.github/lighthouserc.cjs) convierte el presupuesto en aserciones sobre la mediana. |
