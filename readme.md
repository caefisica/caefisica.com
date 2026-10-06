# caefisica.com

[![checks](https://github.com/caefisica/caefisica.com/actions/workflows/ci_nodejs.yml/badge.svg)](https://github.com/caefisica/caefisica.com/actions/workflows/ci_nodejs.yml)
[![url health](https://github.com/caefisica/caefisica.com/actions/workflows/check_broken_links.yml/badge.svg)](https://github.com/caefisica/caefisica.com/actions/workflows/check_broken_links.yml)

Sitio web del Centro de Apoyo al Estudiante de Física
([@caefisica](https://linktr.ee/caefisica)) de la
[Escuela Profesional de Física](https://fisica.unmsm.edu.pe) de la UNMSM. Reúne
guías de estudio por curso con libros, listas de reproducción y sílabos, además
de apuntes, una biblioteca, un blog y artículos. Es un sitio estático hecho con
[Hugo](https://gohugo.io), con contenido en español.

## Ejecútalo

Necesitas [mise](https://mise.jdx.dev) o, en su lugar, Bun, Node y Hugo
extendido con las versiones de [`mise.toml`](mise.toml).

```bash
git clone https://github.com/caefisica/caefisica.com.git
cd caefisica.com
mise install
bun install
bun run hugo:start
```

El servidor de desarrollo queda en <http://localhost:1313>. Las direcciones van
en minúsculas: la guía del curso `CBE013` está en
`/unmsm/pregrado/plan-2018/cbe013/`.

Una guía es una carpeta con un `_index.md` y archivos YAML con los libros y las
listas de reproducción que recomienda:

```text
content/unmsm/pregrado/plan-2018/CBE013/
├── _index.md
├── books-theoretical.yaml
├── playlists.yaml
└── 2022-I/index.md
```

## Qué incluye

- Guías de estudio del Plan de Estudios 2018, con tablas de libros y listas de
  reproducción generadas desde YAML.
- Sílabos por semestre y docente, con visor de PDF.
- Apuntes con fórmulas LaTeX (KaTeX) y diagramas Mermaid.
- Biblioteca de archivos, blog, artículos y directorio de colaboradores y
  docentes.
- Búsqueda con Algolia y boletín por correo.
- Edición desde el navegador con Pages CMS, configurado en `.pages.yml`.
- Despliegue en Cloudflare y Netlify.

## Más

- [Manual](docs/readme.md): instalación, estructura del contenido, cómo agregar
  un curso, shortcodes y despliegue.
- [Arquitectura](architecture.md): mapa del código.
- [Contribuir](.github/CONTRIBUTING.md): cómo enviar cambios.

## Licencia

[MIT](LICENCE).

## Contribuidores

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://totallynotdavid.github.io"><img src="https://avatars.githubusercontent.com/u/20960328?v=4?s=100" width="100px;" alt="David"/><br /><sub><b>David</b></sub></a><br /><a href="#maintenance-totallynotdavid" title="Maintenance">🚧</a> <a href="#security-totallynotdavid" title="Security">🛡️</a> <a href="#research-totallynotdavid" title="Research">🔬</a> <a href="#blog-totallynotdavid" title="Blogposts">📝</a></td>
      <td align="center"><a href="https://github.com/alvaro18101"><img src="https://avatars.githubusercontent.com/u/75409414?v=4?s=100" width="100px;" alt="Alvaro Alejandro Siesquen Abad"/><br /><sub><b>Alvaro Alejandro Siesquen Abad</b></sub></a><br /><a href="#research-alvaro18101" title="Research">🔬</a> <a href="#blog-alvaro18101" title="Blogposts">📝</a></td>
      <td align="center"><a href="https://github.com/Ser-CorD"><img src="https://avatars.githubusercontent.com/u/98802192?v=4?s=100" width="100px;" alt="Ser-CorD"/><br /><sub><b>Ser-CorD</b></sub></a><br /><a href="#research-Ser-CorD" title="Research">🔬</a> <a href="#blog-Ser-CorD" title="Blogposts">📝</a></td>
      <td align="center"><a href="https://github.com/Rifejo"><img src="https://avatars.githubusercontent.com/u/99055529?v=4?s=100" width="100px;" alt="Rifejo"/><br /><sub><b>Rifejo</b></sub></a><br /><a href="#research-Rifejo" title="Research">🔬</a> <a href="#blog-Rifejo" title="Blogposts">📝</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
