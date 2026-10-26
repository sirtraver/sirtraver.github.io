# Google Imágenes: portadas del portfolio

Revisión del 26 de octubre de 2026. La plantilla visual definitiva es la versión 38; esta revisión cambia solo metadatos y descubrimiento de imágenes.

## Estado comprobado antes de los ajustes

- Search Console de la propiedad de prefijo `https://sirtraver.com/`: 24 páginas indexadas y 4 no indexadas en el resumen; 192 elementos de metadatos de imagen válidos. Estos últimos no equivalen a 192 imágenes indexadas ni a impresiones en Google Imágenes.
- Sitemap principal: estado Correcto, última lectura 22 de octubre de 2026, 22 páginas descubiertas. La versión actual del sitio tiene 28 URLs principales/de proyecto en ES/EN.
- Inspección de `https://sirtraver.com/es/projects/colorsplash/`: Google no reconoce esta URL, sin rastreo ni sitemap de referencia detectado. Es una ficha nueva aún no descubierta por Google en el informe consultado.
- Comprobación HTTP pública: robots.txt, sitemap.xml y ficha COLORSPLASH responden 200. Las once portadas WebP también responden 200 como imagen, sin cabecera noindex ni bloqueo en robots.txt. La prueba con agente declarado Googlebot-Image no sustituye el rastreo real de Google.

## Ajustes

1. Se conservan los archivos y URLs de imágenes existentes, incluidos AVIF/WebP y su carga nativa. No se renombran imágenes ni se altera su representación.
2. La portada elegida se declara como imagen principal y miniatura de cada ficha en JSON-LD, enlazada a su CreativeWork, con autor, dimensiones y contexto.
3. El sitemap principal incluye la portada en la entrada de su propio proyecto, además de las imágenes de galería.
4. `/sitemap-portadas.xml` recoge las once portadas locales y sus fichas, con alternancia ES/EN. Solo contiene imágenes de sirtraver.com; evita depender de la verificación de un CDN ajeno para este envío específico.
5. robots.txt anuncia ambos sitemaps. El nuevo sitemap se envía desde la propiedad verificada de prefijo URL en Search Console; no se crea una propiedad de dominio nueva ni se cambian permisos.
6. La plantilla y los scripts visuales de la v38 quedan registrados en `plantilla-definitiva-v38.json` y sus hashes se comprueban automáticamente. La copia recuperable completa está en `BACKUPS/BASE-DEFINITIVA-v38/`.

## Qué puede verificarse

- Envío y procesamiento de sitemaps: informe Sitemaps de Search Console. Enviado no equivale a procesado; registrar el estado real que devuelve Google.
- Descubrimiento e indexación de fichas: Inspección de URLs e informe Páginas. Solicitar una vez el rastreo de las fichas nuevas; repetir solicitudes no acelera el proceso.
- Aparición: informe Rendimiento con tipo de búsqueda Imagen y, cuando existan, resultados que apunten a sirtraver.com. Resultados de Behance o redes sociales no confirman la aparición de las portadas alojadas en este dominio.
- No prometer inclusión, posiciones ni un plazo fijo. El rastreo y la selección de resultados dependen de Google.

## Fuentes oficiales

- [Prácticas para Google Imágenes](https://developers.google.com/search/docs/appearance/google-images)
- [Sitemaps de imágenes](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Solicitar nuevo rastreo](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
