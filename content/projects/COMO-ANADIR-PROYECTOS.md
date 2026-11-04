# Nuevo proyecto

1. Duplica esta carpeta al lado de los otros proyectos y renómbrala: `nombre-del-proyecto` (minúsculas, sin tildes, con guiones).
2. Añade `portada.jpg`, `portada.png` o `portada.webp` al lado de `project.json`. Mejor una imagen de al menos 1600 px de ancho; se conserva su calidad sin ampliarla artificialmente.
3. Mete las imágenes de presentación en `imagenes/`, numeradas: `01.jpg`, `02.jpg`, `03.jpg`… Se admiten JPG, PNG, WebP y AVIF. El orden se detecta automáticamente.
4. En `project.json`, rellena `name`, `date` (AAAA-MM-DD) y cambia `draft` a `false` cuando esté listo. `category` admite `Visual identity` o `Visual design`. El resto es opcional: déjalo vacío si no hay información confirmada.
5. Pide a Codex «publica los proyectos nuevos de PORTFOLIO». Se generan portada, galería, tarjeta, página propia, traducciones de interfaz y sitemap sin editar listas globales.

`draft: true` mantiene la carpeta fuera de la web mientras preparas el proyecto. El nombre de carpeta se convierte en su URL: `/projects/nombre-del-proyecto/`.

Usa `"conceptual": true` en `project.json` para identificar una propuesta propia como **Proyecto conceptual** (o **Concept project** en inglés), tanto en la tarjeta como en el visor y la página del proyecto. Deja `client` vacío si no es un encargo real.

`recursos/` es para originales editables, briefing y documentación. No se publica ni se sube al repositorio de Sites. Usa `imagenes/` solo para los archivos que quieras mostrar.

No hace falta crear `galeria.json` para proyectos nuevos: las imágenes de `imagenes/` se ordenan solas. Si necesitas pies de foto u otro orden, puedes crear `galeria.json` con entradas como:

```json
[
  { "file": "imagenes/01.jpg", "caption": { "es": "Texto de la imagen", "en": "Image caption" } },
  { "file": "imagenes/02.jpg" }
]
```

Si existe `galeria.json`, esa lista determina qué imágenes aparecen y en qué orden.

**Copiar una carpeta en el Mac no publica por sí solo:** la web se actualiza después de generar y desplegar en Sites. Para revisar en local, ejecuta `npm run dev` desde `recovered-sites/`.

## Selección y explicación del proyecto

Todos los proyectos publicados aparecen en la portada, con imágenes de carga progresiva al hacer scroll. `portfolioOrder` fija su posición (1 primero). Los proyectos nuevos sin ese campo aparecen después de la selección, por fecha. Mantén `archived: false` para que aparezca en la portada; no hace falta un enlace a otra página para verlos todos.

Puedes añadir `caseStudy` con secciones bilingües para explicar el concepto, sistema y aplicaciones. Se muestra en la página propia y en el visor:

```json
"caseStudy": [
  {
    "title": { "es": "El proyecto", "en": "The project" },
    "text": { "es": "Descripción verificada del proyecto.", "en": "Verified project description." }
  }
]
```

Describe solo información confirmada. Deja vacíos el cliente, rol o resultado cuando no estén documentados; los proyectos conceptuales no deben atribuirse a un encargo real.

## Información y herramientas de la tarjeta

La descripción se edita en `intro.es` e `intro.en`, dentro de cada `project.json`. La lista `"tools"` (por ejemplo `["Affinity", "Figma"]`) es independiente para cada proyecto: cambia, añade o quita sus nombres según corresponda. Si dejas `"tools": []`, no aparecerá ese bloque. Los entregables se editan en `deliverables`; los relatos ampliados, en `caseStudy`. Después de editar, hay que generar y publicar de nuevo la web.
