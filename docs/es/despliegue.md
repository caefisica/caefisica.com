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
- `main = "./worker/index.ts"` responde solo `/api/*` (`run_worker_first`). Las
  demás rutas son archivos estáticos y no ejecutan el script.

## Registro de búsquedas

Cuando el lector cierra el diálogo de búsqueda o sale de la página, `search.ts`
envía la última búsqueda a `POST /api/search`: las palabras, el número de
resultados y la búsqueda más corta que se mostró cuando nada coincidía. Los
prefijos que escribió en el camino no se envían. El Worker las escribe en el
dataset `searches` de Workers Analytics Engine, enlazado como `SEARCHES`. No
guarda IP, cookies, user agent ni página. Analytics Engine conserva los datos
tres meses.

`bun run searches [días]` imprime las búsquedas más frecuentes de los últimos 7
días y las que no encontraron nada. Necesita `CLOUDFLARE_ANALYTICS_TOKEN`, un
token con el permiso de cuenta **Account Analytics: Read**. El token de
despliegue no lo necesita.

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

La página carga solo `search.ts`, unos 4 KB. El motor de Pagefind, su
WebAssembly y `search-words.json` se cargan juntos cuando el puntero entra en un
botón de búsqueda o se abre el diálogo, unos 150 KB. Después, cada búsqueda pide
el bloque del índice que tiene sus palabras, unos 40 KB, y un fragmento por cada
resultado que muestra. El orden usa `pageLength: 0.2` en vez del 0.75 de
Pagefind, porque el valor por defecto pone las páginas largas que reúnen un tema
(un curso, una universidad, el plan de estudios) debajo de páginas cortas que
nombran la palabra una vez.

[`search/keywords.html`](../../layouts/_partials/search/keywords.html) le da a
una página las palabras que los lectores buscan y que ella no dice: las
`keywords` del front matter, el código de un curso y su número en cifras
(«Cálculo 1»), y la sigla de una universidad. La búsqueda las pesa más que el
título. Esas palabras y el título de un curso también van, en minúsculas y sin
tildes, al filtro `exact`: una búsqueda igual a una de ellas pone esa página
primero, así «uni» encuentra la Universidad Nacional de Ingeniería antes que
todas las páginas que dicen «universidad». El buscador envía el filtro junto con
la búsqueda. Un filtro sin búsqueda hace que Pagefind pida el índice entero,
unos 2 MB.

Hugo también escribe `public/search-words.json`
([`layouts/index.words.json`](../../layouts/index.words.json)): cada palabra de
cuatro letras o más de los títulos y las `keywords`, la más usada primero.
Pagefind no tolera erratas y une una palabra que no conoce con cualquier palabra
indexada con la que empiece, así «optcia» encuentra páginas sobre «opt». Una
palabra buscada de cuatro letras o más es conocida cuando una palabra de esa
lista empieza con ella, o cuando su mejor resultado marca una que lo hace. El
buscador cambia una palabra desconocida por la palabra de la lista más cercana:
a una edición si tiene hasta cinco letras, a dos si es más larga, y la más usada
en un empate. Luego muestra «¿Quisiste decir «óptica»?» con los resultados de la
búsqueda corregida.

Pagefind exige que coincidan todas las palabras, así que una palabra de más
puede vaciar la lista. Cuando una búsqueda de varias palabras no encuentra nada,
el buscador quita la palabra con menos resultados propios hasta que vuelvan
resultados, y muestra la búsqueda más corta.

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
