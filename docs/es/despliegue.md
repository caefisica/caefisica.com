# Despliegue

[English](../en/despliegue.md)

El sitio se publica en `https://web.caefisica.workers.dev/`, el Worker `web` de
la cuenta `caefisica` de Cloudflare. Sirve la carpeta `public/` que genera
`bun run build`: `hugo` y después `pagefind`. El host sale de `baseURL` en
[`config/_default/config.toml`](../../config/_default/config.toml); cámbialo
solo ahí.

## Cloudflare

[`wrangler.toml`](../../wrangler.toml) define el Worker:

- `account_id` es la cuenta que recibe el despliegue.
- `assets.directory = "./public"` sirve el sitio; las rutas inexistentes
  devuelven `404.html` (`not_found_handling = "404-page"`).

## Publicación

El trabajo `deploy` de [`ci.yml`](../../.github/workflows/ci.yml) publica el
sitio. Necesita el trabajo `check` y corre en un push a `master` o al lanzar el
flujo a mano sobre `master`. Sus pasos:

1. Falla con un mensaje si falta el secreto `CLOUDFLARE_API_TOKEN`.
2. Clona el repositorio con todo el historial, porque `enableGitInfo` calcula la
   fecha de última modificación de cada página desde git.
3. Instala las herramientas de `mise.toml`.
4. Ejecuta `bun run deploy`. Instala las dependencias de `bun.lock`. Compila una
   vez con `bun run build` y sube `public/` a Cloudflare (`wrangler deploy`).

Los despliegues hacen cola: uno nuevo espera a que termine el que está en curso.
Cuando `deploy` termina bien, el trabajo `lighthouse` audita el sitio de
Cloudflare.

### Despliegue desde cero

Para publicar el sitio con tus propias cuentas:

1. En el panel de Cloudflare abre **Workers & Pages** y copia el **Account ID**
   de _Account Details_. Pégalo en `account_id` de `wrangler.toml`.
2. En Cloudflare abre **My Profile > API Tokens > Create Token > Custom token**.
   Dale el permiso de cuenta **Workers Scripts: Edit** sobre esa cuenta.
3. En GitHub abre **Settings > Secrets and variables > Actions**. En _Secrets_
   crea `CLOUDFLARE_API_TOKEN` con el token.
4. Cambia `baseURL` en `config/_default/config.toml` y las URL de
   [`audit_lighthouse.yml`](../../.github/workflows/audit_lighthouse.yml) por el
   host de tu Worker.
5. Haz push a `master` o lanza el flujo `checks` desde la pestaña **Actions**.

### Despliegue a mano

Con el token en el entorno, desde la raíz del repositorio:

```bash
export CLOUDFLARE_API_TOKEN=<token de Cloudflare>
bun run deploy
```

`bun run deploy` compila antes de publicar.

## Búsqueda

`bun run build` ejecuta `pagefind --site public` después de `hugo`. Pagefind
indexa el contenido de las páginas dentro del contenedor con el atributo
`data-pagefind-body` ([`layouts/baseof.html`](../../layouts/baseof.html)) y
escribe el índice y su API en `public/pagefind/`.
[`assets/js/search.ts`](../../assets/js/search.ts) consulta esa API y dibuja los
resultados en el diálogo de
[`search/dialog.html`](../../layouts/_partials/search/dialog.html). Cada página
sin portada lleva el metadato `section` con su ruta de secciones, que el
resultado muestra sobre el título. Dónde se carga el buscador:
[arquitectura](architecture.md).

`bun run dev` ejecuta `build` antes, así que el índice también existe en local y
el buscador funciona.

## Cabeceras y redirecciones

Hugo genera `public/_headers` y `public/_redirects` desde
[`layouts/index.headers`](../../layouts/index.headers) y
[`layouts/index.redirects`](../../layouts/index.redirects). Cloudflare lee esos
archivos.

La política `Content-Security-Policy` se arma con las listas de
[`data/fixes/headers.yml`](../../data/fixes/headers.yml). `bun run csp` lee las
páginas generadas y falla por cada origen externo de imagen, script, marco,
medio u hoja de estilos que la política bloquea. `bun run check` lo ejecuta
después de la compilación. Pagefind necesita `'wasm-unsafe-eval'` en
`scriptsrc`.

## Versiones de herramientas

[`mise.toml`](../../mise.toml) fija la versión de cada herramienta. Los flujos
de GitHub las leen de ahí. Cambia una versión solo en `mise.toml`. La versión de
Pagefind está fijada en `package.json`.

## Flujos de GitHub

Todos los flujos se pueden lanzar a mano.

| Flujo                    | Cuándo                                                                      | Qué hace                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                 | Pull request y push a `master`                                              | `check`: `bun run check`. En `master`, `deploy` publica el sitio y después `lighthouse` lo audita.                                                                                                                                                                                                                                |
| `check_broken_links.yml` | Pull request y push a `master` con cambios en `content/`; los lunes         | Ejecuta `bun run links`: [lychee](https://lychee.cli.rs/) revisa los enlaces `http` y `https` de `content/` con [`lychee.toml`](../../lychee.toml). Falla si un enlace no responde y el registro nombra la página y el enlace. Solo usa el `GITHUB_TOKEN` del flujo, con permiso de lectura.                                      |
| `audit_lighthouse.yml`   | Ejecución manual, o el trabajo `lighthouse` de `ci.yml` después de `deploy` | Auditoría Lighthouse de `https://web.caefisica.workers.dev/` y `/blog/` con el presupuesto de `.github/budget.json`. Mide cada URL tres veces y compara con el presupuesto la mediana de las tres corridas; [`.github/lighthouserc.cjs`](../../.github/lighthouserc.cjs) convierte el presupuesto en aserciones sobre la mediana. |
