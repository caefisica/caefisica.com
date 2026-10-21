# Regenerar las capturas

Las tarjetas de `content/experimental/` muestran una captura del sitio enlazado.
[`scripts/screenshots.ts`](../scripts/screenshots.ts) las vuelve a tomar:

```bash
mise run install:browser   # instala el Chromium de Playwright, una vez
mise run screenshots
```

La tarea recorre las carpetas de `content/experimental/` cuyo `index.md` tiene
`link: "…"` e `images: ["…"]` en el front matter. Busca en la carpeta un archivo
`.png`, `.jpg` o `.jpeg` cuyo nombre contenga el primer valor de `images`, abre
el `link` en una ventana de 1920×1080, espera a que la red quede inactiva (30 s
como máximo) y **sobrescribe** ese archivo con la captura.

Pasa nombres de carpeta para limitar la ejecución:

```bash
mise run screenshots aps.org
```

- Si el `link` responde con un estado HTTP de error, no guarda la captura,
  conserva la imagen anterior y lo avisa.
- Omite, con un mensaje de error, las carpetas sin archivo coincidente o con
  otro formato.
- Termina con error si no encuentra carpetas o si ninguna captura sale bien.

Ningún flujo de GitHub ejecuta la tarea. Revisa las imágenes antes de enviarlas.
