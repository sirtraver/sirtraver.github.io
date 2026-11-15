// Long-form articles about the method. Each one has the same structure in both languages.
// Facts about projects must match their case studies in content/projects/.

export const ARTICLES_PAGE = { en: '/articles/', es: '/es/articulos/' };

export const ARTICLES = [
  {
    key: 'consistent-campaign',
    slug: { en: 'consistent-product-campaign', es: 'campana-de-producto-consistente' },
    date: '2026-11-15',
    projects: ['solfa', 'brasa', 'oye'],
    es: {
      title: 'Cómo producir una campaña de producto sin perder consistencia',
      description: 'Seis reglas para que el producto, la luz, el color y el texto sean los mismos en el packshot, en las redes y en el spot.',
      lead: 'Una campaña de producto se rompe por los detalles: la etiqueta cambia un poco de una imagen a otra, la luz no es la misma en la story que en el cartel, el titular se mueve de sitio. Estas son las reglas que sigo para que todas las piezas parezcan de la misma marca.',
      sections: [
        ['1. Fija el producto antes que la campaña', [
          'Lo primero no es el key visual, es el producto: una sola imagen de referencia con la etiqueta, el color y las proporciones definitivas. Todo lo demás parte de ella.',
          'En BRASA, las etiquetas se diseñaron antes como arte final vectorial, y esa imagen de gama es el origen de todas las fotografías y de los dos spots. En OYE se diseñó el objeto en dos variantes, se eligió una y no se volvió a tocar. Si el producto cambia entre piezas, el público no ve una campaña: ve productos distintos.',
        ]],
        ['2. Una idea que quepa en una frase', [
          'Si la idea necesita un párrafo, cada formato acabará contando una cosa diferente. En SOLFA la idea es «Sube el sol»: el círculo rojo de la lata es a la vez el sol de la tarde y una nota musical. En BRASA, tres nombres que suben de intensidad: CHISPA, LLAMA, INCENDIO.',
          'Una frase así sirve de filtro: cada pieza nueva se compara con ella, y lo que no la cuenta se queda fuera.',
        ]],
        ['3. Un esquema de pieza, no veinte diseños', [
          'Antes de adaptar formatos decido un esquema y lo repito. En SOLFA es siempre el mismo: titular en negro arriba a la izquierda, la línea de marca debajo y el producto como protagonista. En la story solo cambia una cosa, el titular pasa a blanco sobre el cielo.',
          'Con un esquema fijo, pasar de 1:1 a 9:16 o a 16:9 es recolocar, no rediseñar. Y el público reconoce la marca antes de leer nada.',
        ]],
        ['4. Una luz y una paleta para todo', [
          'La luz también es identidad. En SOLFA toda la campaña usa la misma luz dura de última hora de la tarde, con sombras largas y fondos de un solo color; el packshot sobre blanco cumple las normas de la tienda online y las escenas de terraza llevan esa misma luz al contexto.',
          'Con el color, menos es más fácil de mantener: en SOLFA el rojo solo aparece una vez por pieza; en OYE el azul ultramar es el único color vivo. Una regla así se cumple sin pensar en cada imagen.',
        ]],
        ['5. El texto, siempre maquetado aparte', [
          'Los titulares, los precios y la letra pequeña se maquetan después, sobre la imagen, con la tipografía de la marca. Nunca se dejan dentro de la imagen generada o retocada, porque ahí es donde aparecen las erratas y las letras deformadas.',
          'En BRASA las dos líneas finas del packshot se corrigieron a mano, y los carteles se maquetaron sobre las fotografías. Es más trabajo, pero el texto es lo primero que delata una pieza descuidada.',
        ]],
        ['6. Revisa la serie, no la pieza', [
          'Una imagen puede estar bien sola y desentonar al lado de las demás. Antes de entregar pongo todas las piezas juntas, en el orden en que se van a ver, y busco lo que cambia sin motivo: un tono, un margen, un tamaño de logotipo.',
          'Si algo salta a la vista en la serie, se corrige ahí y no pieza a pieza.',
        ]],
        ['En resumen', [
          'Producto fijo, una idea en una frase, un esquema de pieza, una luz, el texto aparte y una revisión en serie. No es una lista de estilo, es lo que permite producir muchas piezas sin que la marca se diluya en ninguna.',
        ]],
      ],
    },
    en: {
      title: 'How to produce a product campaign without losing consistency',
      description: 'Six rules to keep the product, light, colour and copy the same across the packshot, social media and the spot.',
      lead: 'A product campaign breaks down in the details: the label shifts slightly from one image to the next, the light in the story doesn’t match the poster, the headline moves around. These are the rules I follow so every piece looks like the same brand.',
      sections: [
        ['1. Fix the product before the campaign', [
          'The first thing isn’t the key visual, it’s the product: a single reference image with the final label, colour and proportions. Everything else starts from it.',
          'In BRASA, the labels were designed first as vector artwork, and that range image is the source of every photograph and both spots. In OYE the object was designed in two variants, one was chosen and it was never touched again. If the product changes between pieces, people don’t see a campaign: they see different products.',
        ]],
        ['2. One idea that fits in a sentence', [
          'If the idea needs a paragraph, each format will end up telling a different story. In SOLFA the idea is “Turn up the sun”: the red circle on the can is both the evening sun and a musical note. In BRASA, three names that rise in heat: CHISPA, LLAMA, INCENDIO.',
          'A sentence like that works as a filter: every new piece is checked against it, and whatever doesn’t tell it stays out.',
        ]],
        ['3. One layout, not twenty designs', [
          'Before adapting formats I decide on a layout and repeat it. In SOLFA it is always the same: headline in black at the top left, the brand line below and the product as the hero. In the story only one thing changes: the headline turns white over the sky.',
          'With a fixed layout, going from 1:1 to 9:16 or 16:9 means rearranging, not redesigning. And people recognise the brand before they read anything.',
        ]],
        ['4. One light and one palette for everything', [
          'Light is part of the identity too. In SOLFA the whole campaign uses the same hard late-afternoon light, with long shadows and single-colour backgrounds; the packshot on white meets online shop requirements and the terrace scenes carry that same light into context.',
          'With colour, less is easier to keep: in SOLFA the red appears only once per piece; in OYE ultramarine blue is the only vivid colour. A rule like that is followed without thinking about each image.',
        ]],
        ['5. Copy is always laid out separately', [
          'Headlines, prices and small print are laid out afterwards, over the image, in the brand typeface. They are never left inside a generated or retouched image, because that is where typos and warped letters appear.',
          'In BRASA the two fine lines on the packshot were corrected by hand, and the posters were laid out over the photographs. It takes longer, but copy is the first thing that gives away a careless piece.',
        ]],
        ['6. Review the series, not the piece', [
          'An image can work on its own and clash next to the others. Before delivery I put every piece together, in the order people will see them, and look for whatever changes for no reason: a tone, a margin, a logo size.',
          'If something stands out in the series, it is fixed there, not piece by piece.',
        ]],
        ['In short', [
          'A fixed product, an idea in one sentence, one layout, one light, copy laid out separately and a review of the whole series. It isn’t a style list: it is what makes it possible to produce many pieces without the brand fading in any of them.',
        ]],
      ],
    },
  },
  {
    key: 'identity-to-campaign',
    slug: { en: 'from-identity-to-campaign', es: 'de-identidad-a-campana' },
    date: '2026-11-15',
    projects: ['brasa', 'kudake', 'oye'],
    es: {
      title: 'De identidad a campaña: cómo una marca llega del logotipo al spot',
      description: 'Las cuatro fases que sigo, identidad, sistema de producto, campaña y motion, y por qué cada una facilita la siguiente.',
      lead: 'Muchas marcas encargan el logotipo a una persona, las etiquetas a otra y la campaña a una tercera. Cada pieza puede estar bien, pero la marca no se reconoce de una a otra. Trabajo en cuatro fases encadenadas para que eso no pase: cada decisión se toma una vez y se hereda.',
      sections: [
        ['1. Identidad: decisiones que aguanten cualquier tamaño', [
          'La identidad no es solo el logotipo: es el logotipo, el color, la tipografía y unas pocas reglas. La prueba es si funciona tanto en una etiqueta estrecha como en una fachada.',
          'En BRASA, el nombre va en una sans condensada extranegra, girada y a toda la altura de la etiqueta: en una botella estrecha, ponerlo en vertical es la manera de que sea lo más grande del lineal. En KUDAKE! la identidad se organiza alrededor de un sello compacto, capaz de ordenar desde un envase hasta la fachada del local.',
        ]],
        ['2. Sistema de producto: una regla para toda la gama', [
          'Cuando hay más de un producto, la identidad necesita un sistema: una regla que diga qué cambia entre versiones y qué no.',
          'En BRASA cada salsa tiene su color de etiqueta, de tapón y de fondo, y tres puntos que se rellenan según el nivel: el picante se lee de lejos y sin leer. En OYE la regla es un tejido neutro y un color vivo en la banda y el botón: piedra y ultramar, carbón y naranja, arena y salvia. La forma no cambia nunca.',
        ]],
        ['3. Campaña: la identidad ya hace la mitad del trabajo', [
          'Si la identidad y el sistema están claros, la campaña no tiene que inventar un lenguaje nuevo: lo usa. Los carteles de BRASA son tono sobre tono, cada botella sobre su propio color y con el titular en la tipografía del logotipo. Juntos funcionan como tríptico; por separado, cada uno presenta un nivel.',
          'Una firma común ayuda a cerrar la serie: en BRASA, el aviso «Luego no llores» aparece abajo a la derecha en todas las piezas.',
        ]],
        ['4. Motion: el mismo producto, ahora en movimiento', [
          'El spot es la última fase y la que más se beneficia de las anteriores. Parte de la misma imagen de producto que el resto de la campaña, con la misma luz y los mismos colores, así que no hay que reconstruir la marca para el vídeo.',
          'En BRASA hay dos spots de 10 segundos, uno vertical y otro horizontal; en OYE, dos de 15 segundos. Cada canal tiene su formato, pero el producto y la idea son los mismos.',
        ]],
        ['Qué se gana trabajando así', [
          'Coherencia, porque cada fase hereda las decisiones de la anterior. Rapidez, porque las adaptaciones parten de reglas ya escritas y no de cero. Y una marca que se reconoce igual en la etiqueta, en el cartel y en el spot.',
          'Si tu marca está en alguna de estas fases, puedes empezar por la que necesites: el resto se construye sobre ella.',
        ]],
      ],
    },
    en: {
      title: 'From identity to campaign: how a brand gets from the logo to the spot',
      description: 'The four stages I follow, identity, product system, campaign and motion, and why each one makes the next easier.',
      lead: 'Many brands commission the logo from one person, the labels from another and the campaign from a third. Each piece may be fine, but the brand isn’t recognisable from one to the next. I work in four linked stages so that doesn’t happen: each decision is made once and inherited.',
      sections: [
        ['1. Identity: decisions that hold at any size', [
          'An identity isn’t just a logo: it is the logo, colour, typography and a few rules. The test is whether it works on a narrow label as well as on a shopfront.',
          'In BRASA, the name is set in an extra-black condensed sans, rotated and running the full height of the label: on a narrow bottle, setting it vertically is how it becomes the biggest thing on the shelf. In KUDAKE! the identity is built around a compact stamp, able to organise everything from a pack to the restaurant front.',
        ]],
        ['2. Product system: one rule for the whole range', [
          'When there is more than one product, the identity needs a system: a rule that says what changes between versions and what doesn’t.',
          'In BRASA each sauce has its own label, cap and background colour, and three dots fill up with the heat level: you can read the heat from a distance without reading. In OYE the rule is a neutral fabric with one vivid colour on the band and the button: stone and ultramarine, charcoal and orange, sand and sage. The shape never changes.',
        ]],
        ['3. Campaign: the identity already does half the work', [
          'If the identity and the system are clear, the campaign doesn’t need to invent a new language: it uses the existing one. The BRASA posters are tone on tone, each bottle on its own colour with the headline in the logo typeface. Together they work as a triptych; separately, each one introduces a level.',
          'A shared sign-off helps close the series: in BRASA, the warning “Luego no llores” sits at the bottom right of every piece.',
        ]],
        ['4. Motion: the same product, now moving', [
          'The spot is the last stage and the one that benefits most from the others. It starts from the same product image as the rest of the campaign, with the same light and colours, so the brand doesn’t have to be rebuilt for video.',
          'BRASA has two 10-second spots, one vertical and one horizontal; OYE has two 15-second spots. Each channel has its format, but the product and the idea are the same.',
        ]],
        ['What you gain by working this way', [
          'Consistency, because each stage inherits the decisions of the one before. Speed, because adaptations start from rules already written rather than from scratch. And a brand that looks the same on the label, the poster and the spot.',
          'If your brand is at any of these stages, you can start with the one you need: the rest is built on top of it.',
        ]],
      ],
    },
  },
];

export const articlePath = (article, lang) => `${ARTICLES_PAGE[lang]}${article.slug[lang]}/`;
export const articlePaths = (article) => ({ en: articlePath(article, 'en'), es: articlePath(article, 'es') });

export const ARTICLES_COPY = {
  es: {
    title: 'Artículos sobre identidad, packaging y campañas | sirtraver',
    description: 'Artículos de Javier Traver sobre cómo llevar una marca de la identidad a la campaña sin perder consistencia.',
    heading: 'Artículos',
    lead: 'Cómo trabajo, contado paso a paso con los proyectos del portfolio.',
    read: 'Leer artículo',
    back: '← Todos los artículos',
    related: 'Proyectos que aparecen en este artículo',
    ctaTitle: '¿Tienes una marca en alguna de estas fases?',
    services: 'Ver servicios',
    contact: 'Cuéntame tu proyecto',
    date: (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  },
  en: {
    title: 'Articles on identity, packaging and campaigns | sirtraver',
    description: 'Articles by Javier Traver on taking a brand from identity to campaign without losing consistency.',
    heading: 'Articles',
    lead: 'How I work, step by step, with the projects in the portfolio.',
    read: 'Read article',
    back: '← All articles',
    related: 'Projects in this article',
    ctaTitle: 'Is your brand at one of these stages?',
    services: 'See services',
    contact: 'Tell me about your project',
    date: (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  },
};
