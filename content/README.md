# Cómo añadir o editar contenido

Todo el contenido editable vive en esta carpeta. Después de cambiar algo, ejecuta
`npm run build` (o `npm run dev` para verlo en local): las imágenes se optimizan solas.

## Añadir un proyecto

1. Crea una carpeta en `content/projects/` con el nombre corto del proyecto, en minúsculas y
   con guiones: por ejemplo `content/projects/cafe-lumbre/`. Ese nombre será la URL:
   `sirtraver.com/projects/cafe-lumbre/`.
2. Dentro, crea `originals/` y copia las imágenes **en la máxima calidad que tengas**
   (JPG, PNG o WebP). Nómbralas en el orden en que deben aparecer: `01.jpg`, `02.jpg`…
   La portada aparte, por ejemplo `cover.jpg`, con proporción 808 × 632 (unos 1616 × 1264 px).
3. Crea `project.json` copiando este ejemplo:

```json
{
  "name": "Café Lumbre",
  "category": "Visual identity",
  "date": "2026-11-20",
  "client": "Café Lumbre",
  "role": { "en": "Brand identity and packaging", "es": "Identidad de marca y packaging" },
  "deliverables": { "en": ["Logotype", "Packaging", "Signage"], "es": ["Logotipo", "Packaging", "Señalética"] },
  "intro": {
    "en": "Two or three sentences: what the brand is, what it needed and what you did.",
    "es": "Dos o tres frases: qué es la marca, qué necesitaba y qué hiciste."
  },
  "result": { "en": "", "es": "" },
  "behance": "",
  "cover": "cover.jpg",
  "images": [
    { "file": "01.jpg", "caption": { "en": "Logotype and colour palette", "es": "Logotipo y paleta de color" } },
    { "file": "02.jpg", "caption": { "en": "", "es": "" } }
  ],
  "featured": false,
  "archived": false
}
```

Campos:

| Campo | Obligatorio | Para qué sirve |
|---|---|---|
| `name` | sí | Nombre del proyecto. `nameEs` si cambia en español. |
| `category` | sí | `Visual identity` o `Visual design`. |
| `date` | sí | Fecha de publicación (`AAAA-MM-DD`); ordena la home, el más reciente primero. `order` desempata proyectos del mismo día (menor primero). |
| `cover`, `images` | sí | Archivos de `originals/`. Los pies de foto son opcionales. |
| `client`, `role`, `deliverables` | no | Ficha del caso de estudio; lo que se deja vacío no aparece. |
| `intro`, `result` | no | Textos del caso de estudio; `intro` también es la descripción para Google. |
| `behance` | no | Enlace al proyecto en Behance, si existe. |
| `featured` | no | `true` para mostrarlo grande arriba en la home (si no, va el más reciente). |
| `archived` | no | `true` lo saca de la home y lo pasa a «Proyectos anteriores»; su página se mantiene. |

Si algo está mal escrito, `npm run build` se detiene y dice qué archivo y qué campo revisar.

## Clientes y testimonios (página Sobre mí)

Edita `content/about.json`. Mientras las listas estén vacías, esas secciones no aparecen.

```json
{
  "clients": [{ "name": "Café Lumbre", "url": "https://cafelumbre.es" }],
  "testimonials": [
    {
      "quote": { "en": "…", "es": "…" },
      "author": "Nombre Apellido",
      "role": { "en": "Founder, Café Lumbre", "es": "Fundadora, Café Lumbre" }
    }
  ]
}
```

## Recursos

Los recursos se publican en Gumroad; la web los muestra solos (con su propia página en
sirtraver.com) en cuanto están publicados allí.
