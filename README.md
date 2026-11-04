# sirtraver — fuente de sirtraver.com (GitHub Pages)

Portfolio bilingüe de Javier Traver. HTML renderizado por un Worker con CSS y JavaScript sin framework. Node 22.9+ para desarrollo; `sharp` solo interviene en el build.

```sh
npm install
npm run dev   # http://127.0.0.1:4173, catálogo vacío simulado y almacenamiento en memoria
npm test      # build y tests, incluido un servidor local real
npm run build
npm run export   # build + HTML estático en _site/ con comprobación de enlaces
```

## Contenido y assets

El acceso directo `../PORTFOLIO/` abre `content/projects/`. Cada carpeta de proyecto contiene todos sus datos y recursos:

```
mi-proyecto/
  project.json        Nombre, fecha, estado y textos opcionales
  portada.webp        Portada JPG, PNG, WebP o AVIF
  imagenes/           Galería local: 01.jpg, 02.jpg…
  galeria.json        Opcional: orden y pies de las imágenes locales
  recursos/           Originales y documentos privados, fuera de hosting y Git
```

Duplica `_PLANTILLA/` y sigue `COMO-ANADIR-PROYECTOS.md`. No hay que editar registros globales: el build descubre las carpetas, excluye borradores (`draft: true`) y genera las tarjetas, páginas, metadatos y galerías. Al hacer push a `main`, GitHub Actions genera y publica la web.

Todas las galerías son locales: desde el 4 de noviembre de 2026 las 96 imágenes que antes se cargaban desde Behance están en `imagenes/` de cada proyecto (WebP, nombres descriptivos como `kudake-japan-burgers-identidad-visual-01.webp`, máx. 2560 px). En `galeria.json`, el campo `behance` guarda solo la URL de procedencia; el build no acepta imágenes remotas. Los originales sin recomprimir están en `recursos/originales-behance/` y no se publican. Si existe `galeria.json`, esa lista tiene prioridad sobre la detección de `imagenes/`. Los proyectos nuevos pueden utilizar solo imágenes locales y no necesitan cuenta ni enlaces de Behance.

El build crea variantes AVIF/WebP y JPEG social, nunca amplía las imágenes y conserva sus dimensiones para evitar saltos de carga. La interfaz y las galerías locales optimizadas se sirven desde el propio Worker.

`content/about.json` conserva clientes y testimonios; no rellenar con ejemplos ficticios. `src/content.js` contiene el texto de interfaz EN/ES y `public/assets/site.css` el sistema visual.

## Hosting

GitHub Pages, dominio `sirtraver.com`, repositorio `sirtraver/sirtraver.github.io`. Se publica desde la rama `gh-pages`:

```sh
npm run deploy   # tests, exportación a _site/ y push de _site/ a gh-pages
```

Necesita `WEB3FORMS_ACCESS_KEY` en `.env` (no versionado). Hay un workflow equivalente para publicar automáticamente con cada push en `deploy/github-actions-pages.yml`.

El exportador ejecuta el mismo Worker (`src/worker.js`) para cada URL y guarda el HTML resultante, así que el diseño y las URLs son los mismos que servía Sites. También escribe páginas de redirección para URLs antiguas (`/sobre-mi/`, `/portfolio/`, IDs de Behance…), `404.html`, `CNAME`, los sitemaps y todos los assets, y falla si encuentra un enlace interno roto. La CSP viaja en una etiqueta `<meta>`.

- Aviso de lanzamiento de Recursos: Web3Forms. La clave pública va en la variable de repositorio `WEB3FORMS_ACCESS_KEY` (Settings → Secrets and variables → Actions → Variables).
- Gumroad: sin `GUMROAD_ACCESS_TOKEN` el catálogo se exporta vacío (estado «En preparación»). Si se añade como secreto y se pasa al paso de exportación, se generan las fichas de producto en cada publicación.
- Idioma: `/assets/language.js` recuerda la elección EN/ES y envía `/` a `/es/` para navegadores en español, como hacía el servidor.
- `/resume/` y `/cv/` (documentos A4) se generan desde `content/cv.json` con `src/views/cv.js`.

`server/node.mjs` y `deploy/` siguen sirviendo para ejecutar el Worker en un servidor propio.

## Criterios de continuidad

Selección de 6 proyectos en la portada (`portfolioOrder`); los anteriores, con `"archived": true`, viven en `/archive/` y la portada enlaza ahí. Navegación principal: Proyectos · Sobre mí · Contacto; Recursos va en el pie hasta que haya productos. EN/ES. Las imágenes aportan el color. El visor oscuro mantiene X/Escape, siguiente/anterior y retorno a la posición del portfolio. No inventar clientes, resultados ni productos de muestra; los textos de los casos salen de las propias presentaciones.

Revisar escritorio y móvil después de cambios visuales. El test `approved-design` protege el diseño aprobado: tras un cambio visual intencionado y revisado, ejecuta `node scripts/approve-design.mjs`. Ver `REVISION.md` para el alcance de las verificaciones de esta entrega.
