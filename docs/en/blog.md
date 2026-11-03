# Add a blog post

[Español](../es/blog.md)

A post is a folder `content/blog/<NNN-name>/` with an `index.md`
([naming](contenido.md#names)) and its images:

```bash
hugo new content blog/014-consejos/index.md
```

Front matter fields the templates use:

| Field          | Use                                                                 |
| -------------- | ------------------------------------------------------------------- |
| `title`        | Title of the post.                                                  |
| `emoji`        | Emoji beside the title, in the post and its card (`":tada:"`).      |
| `lead`         | Text under the title and on the card in `/blog/`.                   |
| `description`  | Summary for search engines and social networks.                     |
| `contributors` | Slugs in `content/contributors/`. See [naming](contenido.md#names). |
| `math`         | With `true`, loads KaTeX for formulas.                              |
| `mermaid`      | With `true`, loads Mermaid for the `mermaid` shortcode.             |
| `weight`       | Page order; Hugo sorts from lowest to highest.                      |
| `draft`        | With `true`, the page is not published. `bun run dev` shows it.     |

The body is Markdown. Images go in the same folder and are inserted with
`img-simple`:

```markdown
{{< img-simple src="captura.png" alt="Vista del panel" >}}
```

Posts are published at `/blog/<name>/` (`[permalinks]` in
`config/_default/config.toml`).
