# sirtraver — fuente actual para Sites

Portfolio bilingüe de Javier Traver. HTML renderizado por un Worker con CSS y JavaScript sin framework. Node 22.9+ para desarrollo; `sharp` solo interviene en el build.

```sh
npm install
npm run dev   # http://127.0.0.1:4173, catálogo vacío simulado y almacenamiento en memoria
npm test      # build y tests, incluido un servidor local real
npm run build
```

## Contenido y assets

- `content/projects/<slug>/project.json`: título, orden, categoría, datos y textos opcionales. No introducir clientes, resultados o métricas no confirmados.
- `content/projects/<slug>/originals/cover.webp`: portada maestra. El build crea variantes AVIF/WebP y JPEG social y las incluye en el Worker.
- `content/remote-media.json`: originales remotos de Behance, en orden, con dimensiones y color de fondo. El visor y las páginas de proyecto sirven esas mismas URLs. No hay sincronización automática de galerías.
- `content/behance-galleries.json`: referencia recuperada de las 96 URLs originales para comprobar identidad y orden.
- `content/about.json`: clientes y testimonios; actualmente vacío. No rellenar con ejemplos ficticios.
- `src/content.js`: interfaz y textos en inglés y español.
- `public/assets/site.css`: sistema visual, responsive y movimiento reducido.

Los originales locales de las galerías permanecen en `../site/content/projects/`; no se duplican en hosting. Para incorporar un proyecto hay que añadir su portada, datos y URLs/dimensiones a ambos registros de galerías y actualizar las pruebas de catálogo correspondientes.

## Hosting

`src/worker.js` es la entrada. `scripts/build.mjs` genera `dist/server/index.js` y copia `.openai/hosting.json`. Las portadas y assets pequeños se sirven desde el propio Worker: el hosting no necesita un servidor Node ni archivos de media externos. El adaptador `src/lib/storage.js` usa el binding R2 `BUCKET` existente y conserva las claves de la lista de espera. Node emplea una interfaz equivalente de almacenamiento.

Publicar mediante el flujo nativo de Sites: abrir/sincronizar el repositorio del mismo proyecto, ejecutar checks/build, crear el archivo desde el commit enviado, guardar versión y desplegarla manteniendo su audiencia. Nunca crear un proyecto duplicado para actualizar esta web.

Gumroad requiere la variable existente `GUMROAD_ACCESS_TOKEN`. Sin catálogo válido aparece indisponibilidad; no se simulan productos ni se publica el estado de catálogo vacío por error. Las altas guardan el consentimiento en R2; el envío de avisos solo existe si se configura explícitamente un servicio de correo. Las integraciones opcionales heredadas de Claude están desactivadas sin sus variables.

## Criterios de continuidad

Conservar la identidad tipográfica sirtraver, el sistema claro y monocromo, los ocho proyectos, EN/ES, navegación Portfolio/Resources/About y contacto en cabecera. Las imágenes aportan el color. El visor oscuro mantiene X/Escape, siguiente/anterior y retorno a la posición del portfolio; las páginas de proyecto permiten compartir y abrir directamente los trabajos. No introducir animaciones ornamentales, clientes ficticios o productos de muestra.

Revisar escritorio y móvil después de cambios visuales. Ver `REVISION.md` para el alcance de las verificaciones de esta entrega.
