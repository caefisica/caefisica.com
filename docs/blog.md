# Agregar una entrada de blog

Una entrada es una carpeta `content/blog/<NNN-nombre>/` con un `index.md`
([nombre](contenido.md#nombres)) y sus imágenes:

```bash
mise run new content blog/014-consejos/index.md
```

Campos del front matter que usan las plantillas:

| Campo          | Uso                                                                      |
| -------------- | ------------------------------------------------------------------------ |
| `title`        | Título de la entrada.                                                    |
| `emoji`        | Emoji junto al título, en la entrada y en su tarjeta (`":tada:"`).       |
| `lead`         | Texto bajo el título y en la tarjeta de `/blog/`.                        |
| `description`  | Resumen para buscadores y redes sociales.                                |
| `contributors` | Slugs de `content/contributors/`. Ver [contenido](contenido.md#nombres). |
| `math`         | Con `true`, carga KaTeX para las fórmulas.                               |
| `mermaid`      | Con `true`, carga Mermaid para el shortcode `mermaid`.                   |
| `weight`       | Orden de la página; Hugo ordena de menor a mayor.                        |
| `draft`        | Con `true`, la página no se publica. `mise run dev` la muestra.          |

El cuerpo es Markdown. Las imágenes van en la misma carpeta y se insertan con
`img-simple`:

```markdown
{{< img-simple src="captura.png" alt="Vista del panel" >}}
```

Las entradas se publican en `/blog/<nombre>/` ([permalinks] de
`config/_default/config.toml`).
