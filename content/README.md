# Contenido editable

Cada proyecto vive completo en `projects/<nombre-del-proyecto>/`. El acceso directo `PORTFOLIO` de la carpeta principal abre esta misma ubicación.

Consulta `projects/COMO-ANADIR-PROYECTOS.md` y duplica `projects/_PLANTILLA/` para añadir uno nuevo. La web descubre las carpetas al construir, sin modificar ningún catálogo global. Publicar en Sites sigue siendo un paso explícito.

`about.json` contiene el resumen profesional bilingüe en `resume` (experiencia, formación, competencias, herramientas e idiomas), además de clientes y testimonios; las listas vacías no aparecen. Añadir solo información real confirmada.

Los recursos de venta siguen publicándose en Gumroad, que aporta el catálogo a la web.

El puesto profesional se mantiene exactamente como **Visual Designer & Marketing** en ambos idiomas. Su valor común está en `ROLE`, en `src/content.js`. Los iconos y el correo aparecen en la tarjeta de Sobre mí, no en la cabecera.

Cada `project.json` incluye `tools`, una lista de nombres de herramientas. Javier indica Affinity y ChatGPT como valores comunes iniciales; se pueden cambiar por separado en cada proyecto. La tarjeta del visor muestra las herramientas junto a la descripción, entregables y autor. Los campos vacíos no se publican.
