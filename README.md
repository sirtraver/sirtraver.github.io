# sirtraver — fuente actual para Sites

Portfolio bilingüe de Javier Traver. HTML renderizado por un Worker con CSS y JavaScript sin framework. Node 22.9+ para desarrollo; `sharp` solo interviene en el build.

```sh
npm install
npm run dev   # http://127.0.0.1:4173, catálogo vacío simulado y almacenamiento en memoria
npm test      # build y tests, incluido un servidor local real
npm run build
```

## Contenido y assets

El acceso directo `../PORTFOLIO/` abre `content/projects/`. Cada carpeta de proyecto contiene todos sus datos y recursos:

```
mi-proyecto/
  project.json        Nombre, fecha, estado y textos opcionales
  portada.webp        Portada JPG, PNG, WebP o AVIF
  imagenes/           Galería local: 01.jpg, 02.jpg…
  galeria.json        Opcional: orden, pies o URLs de Behance
  recursos/           Originales y documentos privados, fuera de hosting y Git
```

Duplica `_PLANTILLA/` y sigue `COMO-ANADIR-PROYECTOS.md`. No hay que editar registros globales: el build descubre las carpetas, excluye borradores (`draft: true`) y genera las tarjetas, páginas, metadatos y galerías. La publicación en Sites se hace después de la generación.

En los ocho proyectos recuperados, `galeria.json` conserva las 96 URLs originales de Behance y sus dimensiones. Los originales locales se reúnen en `recursos/originales/` de cada proyecto; esas copias de trabajo no se publican. Si existe `galeria.json`, esa lista tiene prioridad sobre la detección de `imagenes/`. Los proyectos nuevos pueden utilizar solo imágenes locales y no necesitan cuenta ni enlaces de Behance.

El build crea variantes AVIF/WebP y JPEG social, nunca amplía las imágenes y conserva sus dimensiones para evitar saltos de carga. La interfaz y las galerías locales optimizadas se sirven desde el propio Worker.

`content/about.json` conserva clientes y testimonios; no rellenar con ejemplos ficticios. `src/content.js` contiene el texto de interfaz EN/ES y `public/assets/site.css` el sistema visual.

## Hosting

`src/worker.js` es la entrada. `scripts/build.mjs` genera `dist/server/index.js` y copia `.openai/hosting.json`. Las imágenes locales optimizadas y los assets se sirven desde el propio Worker: el hosting no necesita un servidor Node ni archivos de media externos. El adaptador `src/lib/storage.js` usa el binding R2 `BUCKET` existente y conserva las claves de la lista de espera. Node emplea una interfaz equivalente de almacenamiento.

Publicar mediante el flujo nativo de Sites: abrir/sincronizar el repositorio del mismo proyecto, ejecutar checks/build, crear el archivo desde el commit enviado, guardar versión y desplegarla manteniendo su audiencia. Nunca crear un proyecto duplicado para actualizar esta web.

Gumroad requiere la variable existente `GUMROAD_ACCESS_TOKEN`. Sin catálogo válido aparece indisponibilidad; no se simulan productos ni se publica el estado de catálogo vacío por error. Las altas guardan el consentimiento en R2; el envío de avisos solo existe si se configura explícitamente un servicio de correo. Las integraciones opcionales heredadas de Claude están desactivadas sin sus variables.

## Criterios de continuidad

Conservar la identidad tipográfica sirtraver, el sistema claro y monocromo, los ocho proyectos, EN/ES, navegación Portfolio/Resources/About y contacto en cabecera. Las imágenes aportan el color. El visor oscuro mantiene X/Escape, siguiente/anterior y retorno a la posición del portfolio; las páginas de proyecto permiten compartir y abrir directamente los trabajos. No introducir animaciones ornamentales, clientes ficticios o productos de muestra.

Revisar escritorio y móvil después de cambios visuales. Ver `REVISION.md` para el alcance de las verificaciones de esta entrega.
