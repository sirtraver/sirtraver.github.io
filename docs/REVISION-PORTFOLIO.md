# Revisión del portfolio — 26 de octubre de 2026

La base aprobada v34 permanece recuperable en `BACKUPS/BASE-DEFINITIVA-v34`, fuera del código publicado. Esta revisión responde a dos solicitudes: mejorar el visor y aplicar las mejoras de una lista de conversión, navegación, confianza y SEO que sí encajan con un portfolio personal.

## Decisiones sobre la lista

| Elemento | Decisión y aplicación |
| --- | --- |
| 404 personalizada | Ya existía con estado HTTP 404, ES/EN y noindex. Se añaden accesos a Recursos y Sobre mí junto al retorno a Proyectos. |
| CTA antes del scroll | Se añade Hablemos de tu proyecto en el primer bloque de la portada. |
| Enlaces internos | Portada → Contacto; fichas → Contacto; FAQ → proyectos/recursos; agradecimiento → portfolio/perfil; 404 → secciones principales. |
| Página de agradecimiento | `/es/gracias/` y `/thank-you/`, sin datos personales, noindex y fuera del sitemap. El registro de Recursos correcto lleva a `?notice=resources`; el contacto correcto lleva a la versión de consulta cuando las notificaciones están configuradas. Los errores conservan el formulario. Con doble opt-in se conserva el aviso de confirmar el email. |
| Migas de pan | Visibles en fichas de proyecto y Contacto, con retorno al portfolio; se conserva BreadcrumbList en los datos estructurados. No se añaden jerarquías artificiales a las tres secciones principales. |
| Casos de estudio | Se conservan los tres relatos documentados de COLORSPLASH, Olmedo Clásico y OASIS, ahora accesibles en el panel de información del visor y en sus fichas. Para los otros ocho no se inventan briefs, decisiones ni resultados de negocio. |
| Cinco preguntas frecuentes | Contacto, mediante desplegables nativos: alcance, información inicial, presupuesto/plazos, proyectos conceptuales y recursos. ES/EN. |
| Compromiso de respuesta | Dos días laborables, expresamente confirmado por Javier. Aparece en portada, Contacto y cierre de las fichas. No se aplica al aviso de lanzamiento de Recursos. |
| CTA fijo móvil | Acceso a Contacto en las tres secciones principales. Se oculta mientras el CTA del primer bloque sea visible y cuando hay un visor abierto. Sin invadir formularios. Área táctil de 48 px y espacio inferior reservado. |
| robots.txt | Ya correcto: permite las páginas, excluye APIs y enlaza al sitemap. Verificado. |
| Títulos únicos | Ya existentes en las secciones y en cada proyecto; añadidos para agradecimiento ES/EN. Verificados junto con canonical e idiomas. |
| Meta descripciones | Ya existentes; se conservan y se añaden las necesarias para las nuevas páginas. |
| Imagen para redes | Ya existente a 1200 × 630; cada proyecto utiliza su propia portada. Se conservan Open Graph y Twitter Card. |
| Mapas | Se omiten: no hay dirección verificada de una sede abierta al público. |
| Más indicaciones | Contacto explica qué enviar: contexto, piezas, fecha, referencias y presupuesto orientativo. El visor explica desplazamiento y ampliación. |
| Reseñas reales | No hay testimonios verificables en el contenido. El soporte para publicarlos sigue disponible; no se publican frases ni puntuaciones inventadas. |
| Texto alternativo | Ya había alt en las imágenes; se añaden 18 descripciones específicas ES/EN a las imágenes de los tres conceptos, tanto en las fichas como en el visor/ampliación. |
| Esquema local | Se conserva Person, ProfilePage, CreativeWork, ImageObject y BreadcrumbList con Madrid. Se omite LocalBusiness al no disponer de una dirección de atención al público. |
| Política de privacidad | Ya publicada en ES/EN y enlazada al pie y formularios. Se corrige el texto sobre las imágenes remotas de Behance y proveedores técnicos; se mantiene la explicación de la cookie funcional de idioma y las integraciones opcionales. |
| Foto real del equipo | Se mantiene el retrato real de Javier en Sobre mí. Es un portfolio individual; no se simula un equipo. |

## Contacto: detalle operativo

La configuración actual del sitio tiene almacenamiento y exportación privada, pero no contiene `BREVO_API_KEY` ni `CONTACT_TO`. Un formulario visible que solo almacena mensajes no garantiza que Javier los vea a tiempo. Por ello, Contacto muestra el enlace al correo profesional como acción principal. El formulario se muestra automáticamente cuando ambas variables están configuradas; su backend y confirmación están probados. No se introducen credenciales nuevas ni se cambia el acceso al sitio. El registro de Recursos continúa almacenándose con consentimiento como antes.

## Visor de proyectos

- Galería oscura vertical continua, proporciones originales y carga diferida.
- Selector de imagen, contador y anterior/siguiente de imagen separados de anterior/siguiente proyecto, que aparece con nombres al final de la galería.
- Información en panel lateral de escritorio y superpuesto en móvil: disciplina, año, entregables y relatos cuando existen.
- Ampliación con navegación entre imágenes del mismo proyecto, encajar, ajustar al ancho, zoom y enlace al original.
- Flechas izquierda/derecha: imágenes; +/−: zoom; 0: encajar. Escape cierra primero el detalle o la información, después el proyecto.
- Atrás, URL compartible, enlaces con modificadores y retorno al foco y posición originales conservados. Los fallos permiten enlaces nativos a las fichas/originales.
- Sin bibliotecas nuevas, sin animaciones adicionales ni intervención sobre el desplazamiento táctil nativo.

## Fuentes para las decisiones

- [Google: LocalBusiness y dirección física](https://developers.google.com/search/docs/appearance/structured-data/local-business). No corresponde completar una ficha local con una dirección inventada.
- [AEPD: deber de información por capas](https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos/derecho-de-informacion). La revisión adapta la información al funcionamiento comprobado; no equivale a una certificación jurídica de cumplimiento.

## Verificación

Comprobaciones de rutas, metadatos, formularios con y sin JavaScript, consentimiento, errores, almacenamiento, enlaces nativos, historia del visor y conservación de las seis páginas aprobadas. Revisión visual en móvil estrecho y escritorio. Los datos de prueba se mantienen en memoria local y no se envían al correo ni a la lista de producción.
