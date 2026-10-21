# caefisica

[![checks](https://github.com/caefisica/caefisica.com/actions/workflows/ci.yml/badge.svg)](https://github.com/caefisica/caefisica.com/actions/workflows/ci.yml)
[![url health](https://github.com/caefisica/caefisica.com/actions/workflows/check_broken_links.yml/badge.svg)](https://github.com/caefisica/caefisica.com/actions/workflows/check_broken_links.yml)

Sitio web del Centro de Apoyo al Estudiante de Física de la
[Escuela Profesional de Física](https://fisica.unmsm.edu.pe) de la UNMSM: guías
de estudio por curso, apuntes, biblioteca y blog, en español. Es un sitio
estático hecho con [Hugo](https://gohugo.io), publicado en
<https://web.caefisica.workers.dev/>.

## Ejecútalo

Necesitas [mise](https://mise.jdx.dev).

```bash
git clone https://github.com/caefisica/caefisica.com.git caefisica
cd caefisica
mise install
mise run dev
```

El sitio queda en <http://localhost:1313>. `mise run dev` instala las
dependencias, compila e indexa el sitio una vez y levanta el servidor,
borradores incluidos.

## Más

- [Manual](docs/readme.md): contenido, cursos, blog, shortcodes, capturas y
  despliegue.
- [Contribuir](.github/CONTRIBUTING.md): cómo enviar cambios.
