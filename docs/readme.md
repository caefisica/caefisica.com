# Documentación

**Índices**:

- [Instalación](instalaci%C3%B3n.md)
- [Convenciones](convenciones.md)
- [CSS](#css)
- [Plantillas](#plantillas)
- [Listas](#listas)

---

## CSS

Con el motivo de simplificar el código. A continuación una lista de clases
personalizadas reutilizables.

1. Background cover:

   ```css
   .bg-cover {
     background-repeat: no-repeat;
   }
   ```

## Plantillas

### Shortcode

```html
{{ ":zap:" | emojify }}
```

### Markdown

1. Tablas:

   ```markdown
   {{< content_table type="book" >}}
   {{< book_row title="" author="" editorial="" year="" edition="" url="" >}}
   {{< book_row_multiple title="" author="" editorial="" urls="" editions="" years="" >}}
   {{< playlist_row title="" channel="" lecturer="" videos="" url="" >}}
   {{< /content_table >}}
   ```

## Listas

1. Profesores:

   ```yaml
   - name: ""
     title: ""
     courses:
       - code: ""
         semesters:
           - ""
   ```
