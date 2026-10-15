# Revisión de continuidad — 15 de octubre de 2026

## Resultado

Se ha integrado la evolución recuperada de Claude en el repositorio del mismo sitio de Sites. La interfaz conserva Inter, sirtraver, los ocho proyectos, sus textos y categorías reales, EN/ES y el visor oscuro.

## Cambios

- Portada editorial alineada a la izquierda, mayor jerarquía tipográfica y descripción más breve.
- KUDAKE! destacado a mayor escala; retícula consistente de dos columnas y una en teléfonos.
- Cabecera translúcida y contacto social preservados; eliminadas llamadas de contacto repetidas al final de las páginas.
- Sobre mí conserva Qué aporto/Cómo trabajo; retirado un bloque de servicios que repetía el contenido.
- Recursos simplifica su encabezado y las categorías de lanzamiento. El catálogo sigue siendo real y conectado a Gumroad.
- Retirada la transición automática entre páginas tras observar un estado visual en blanco en el navegador integrado. La navegación vuelve al render nativo.
- Contraste y tamaño de párrafos mejorados, controles táctiles ampliados, scroll estable y respeto por movimiento reducido.
- Visor con URLs originales de Behance y dimensiones conocidas, navegación entre proyectos, URL compartible, X/Escape y retorno de foco sin desplazar el portfolio.
- Páginas indexables de proyecto, rutas antiguas redirigidas, canonical/hreflang, JSON-LD y sitemap.
- Portadas AVIF/WebP y JPEG social incluidas y servidas directamente por el Worker; no dependen del servidor Node usado por Claude.
- Adaptador al R2 BUCKET de producción, conservando claves y deduplicación de suscriptores.
- Corregido un problema del test del servidor con carpetas que contienen espacios.

## Verificación

- 55 tests pasan: render bilingüe, rutas, redirects, 404, metadatos, sitemap, catálogo, formularios, persistencia simulada, exportación privada y assets del Worker.
- Las 96 URLs remotas responden HTTP 200 con tipo imagen; identidad y orden coinciden con el registro recuperado.
- Inspección visual y funcional en navegador de escritorio y móvil: portada, Sobre mí, Recursos y visor. Revisión a 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal; ajuste específico de la navegación española a 320 px.
- Formularios probados con datos locales de prueba y almacenamiento simulado; no se añaden registros de prueba a la lista real.

## Límites

No se ha comprobado un lector de pantalla ni un dispositivo físico. Las pruebas no certifican entrega de emails, pagos o cambios de indexación en Google. La foto de perfil sigue siendo el original de 150 × 150 px. Las galerías dependen de la disponibilidad de las URLs originales de Behance; no se promete sincronización automática.

## Carpetas y ajustes solicitados después de la versión 25

- Acceso directo `PORTFOLIO` en la carpeta principal. Cada proyecto tiene `project.json`, portada, `galeria.json`, `imagenes/` y sus originales locales en `recursos/originales/`.
- `_PLANTILLA` y `COMO-ANADIR-PROYECTOS.md` explican el alta. Las carpetas se detectan al generar; borradores y directorios con prefijo `_` no se publican.
- Los nuevos proyectos admiten galerías locales ordenadas por nombre, con optimización automática y visor sin requerir Behance. Los ocho existentes conservan intactas las 96 URLs de sus galerías.
- Los archivos privados de `recursos/` quedan fuera de Git y del contenido público. Copiar una carpeta en el Mac requiere luego generar y publicar mediante Sites.
- Textos del portfolio centrados, incluidos introducción, cabecera de selección y pies de proyectos.
- Portfolio, Resources y el encabezado de About usan la misma escala del About anterior: 39 px en escritorio, 34 px hasta 900 px y 33 px hasta 700 px, peso 700 y línea 1.12.
- 57 tests pasan; se verificó también en navegador un proyecto local temporal de dos imágenes, sin Behance. Se retiró después de la prueba. Los tres encabezados se midieron a 1440, 872, 390 y 320 px: coinciden y no hay desbordamientos horizontales.
