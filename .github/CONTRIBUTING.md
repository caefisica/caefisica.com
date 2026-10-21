# Contribuir

Aceptamos guías de estudio, apuntes, correcciones y recursos nuevos. Para
reportar un error o proponer algo, usa las
[plantillas de incidencias](https://github.com/caefisica/caefisica.com/issues/new/choose).

## Editar desde el navegador

1. En la página que quieres cambiar, haz clic en «Edita esta página», al final.
   Se abre el archivo en GitHub.
2. Pulsa el lápiz para editar. El formato es Markdown.
3. Pulsa «Commit changes» y describe qué cambiaste. GitHub te guía para abrir un
   pull request.

El esquema de campos que ofrece Pages CMS está en [`.pages.yml`](../.pages.yml).

## Trabajar en tu equipo

Necesitas `git` y [mise](https://mise.jdx.dev).

```bash
git clone https://github.com/caefisica/caefisica.com.git caefisica
cd caefisica
mise install
mise run dev
```

`mise install` instala las herramientas de [`mise.toml`](../mise.toml) (Hugo
extended, Bun, Node, Go y Wrangler). `mise run dev` instala las dependencias,
compila e indexa el sitio y lo sirve en <http://localhost:1313>, borradores
incluidos. `mise tasks` lista el resto de las tareas.

Ejecuta Hugo siempre con `mise run`. Hugo llama al binario `tailwindcss` para
compilar el CSS y `mise.toml` pone `node_modules/.bin` en el `PATH` de las
tareas.

## Comprobar un cambio

```bash
mise run fix
mise run check
```

`fix` da formato a plantillas, Markdown, scripts, YAML y JSON. `check` ejecuta
lo mismo que CI: lint (`oxlint`, `markdownlint-cli2`, `gotmplfmt`, `actionlint`,
`oxfmt --check`), `tsc --noEmit` y la compilación completa (`hugo --gc --minify`

- `pagefind`). `check` solo comprueba, sin escribir.

## Enviar el cambio

Abre un pull request a `master` con un título y una descripción claros. El flujo
[`checks`](workflows/ci.yml) corre en cada pull request:

- `check` ejecuta `mise run install` y `mise run check`.
- `preview` publica una vista previa en Netlify y deja la URL en el resumen del
  trabajo. Un pull request de un fork o de Dependabot no tiene acceso a los
  secretos: el trabajo avisa del motivo y termina bien, sin vista previa.

Si el pull request toca `content/`, el flujo
[`url health`](workflows/check_broken_links.yml) revisa los enlaces de esa
carpeta. Para revisarlos antes, ejecuta `mise run links`.

Al participar aceptas el [Código de Conducta](../CODE_OF_CONDUCT.md) y publicas
tu aporte bajo la [licencia MIT](../LICENCE).

## Qué puedes aportar

- [Agregar un curso](../docs/cursos.md) con su guía, libros y sílabos.
- [Agregar una entrada de blog](../docs/blog.md).
- Insertar tablas, avisos, imágenes, PDF o diagramas con los
  [shortcodes](../docs/shortcodes.md).
- El mapa del código está en [arquitectura](../docs/architecture.md) y el resto
  del manual en [docs](../docs/readme.md).
