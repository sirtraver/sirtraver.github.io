# Visor de proyectos con tarjeta de información

Revisión solicitada por Javier el 26 de octubre de 2026. Copia previa: `BACKUPS/v37-antes-tarjeta-visor/`.

## Presentación

La galería sigue siendo oscura, vertical y continua. Las imágenes se alinean a 16 px del borde izquierdo en escritorio, conservando proporciones y ampliación. La cabecera se reduce y se reserva una columna de 340 px a la derecha para una tarjeta permanente, con fondo oscuro, borde discreto, radio de 18 px y retrato real, coherente con Sobre mí.

La tarjeta contiene autor y puesto exacto Visual Designer & Marketing, disciplina/año, nombre del proyecto, etiqueta conceptual si corresponde, descripción, herramientas y entregables cuando existen. Los relatos documentados de los tres conceptos se despliegan dentro de la tarjeta. La información puede desplazarse de forma independiente sin mover las imágenes.

Se retiran los enlaces a la ficha duplicada y a Behance del visor. Las URLs de proyecto y sus rutas renderizadas se mantienen para compartir, indexación y navegación sin JavaScript; estas fichas tampoco muestran el botón a Behance. Las referencias de procedencia siguen conservadas en los datos fuente y estructurados.

## Móvil y teclado

Hasta 900 px la galería ocupa el ancho completo. Información abre la tarjeta superpuesta; el fondo queda inerte. Cerrar información o Escape devuelve el foco al control. Otro Escape cierra el proyecto. En escritorio Escape cierra el proyecto directamente, porque la tarjeta siempre está visible.

Se conservan selector/contador de imagen, flechas, navegación entre proyectos al final, enlace nativo de imagen, zoom, tecla Atrás y retorno al foco/posición de la tarjeta original. En la ampliación se puede avanzar entre imágenes y regresar a la seleccionada en la galería.

## Editar herramientas e información

Javier ha indicado Affinity y ChatGPT como herramientas comunes iniciales. Cada `content/projects/<proyecto>/project.json` incluye:

```json
"tools": ["Affinity", "ChatGPT"]
```

Se puede cambiar esa lista independientemente por proyecto; una lista vacía oculta el bloque. `intro.es` y `intro.en` controlan la descripción. Sin descripción específica se muestra solo una frase neutra sobre la disciplina, sin inventar briefs ni resultados. `deliverables` y `caseStudy` mantienen sus campos bilingües actuales. La plantilla para nuevos proyectos incorpora la lista editable de herramientas.

La galería JSON usa una nueva versión de caché y recoge estos datos al construir. Para publicar un cambio hay que generar y publicar el sitio en Sites.

## Verificación

Comprobaciones de tarjeta visible en escritorio, panel móvil y su foco, herramientas, ausencia de enlaces redundantes, cambios de tamaño sin bloqueo, cierre único mediante Atrás, navegación de imágenes/proyectos y conservación de las páginas aprobadas. Revisión visual a 1440 y 320 px, zoom y desplazamiento de la tarjeta con el relato abierto.
