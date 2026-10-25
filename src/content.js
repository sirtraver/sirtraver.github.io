// All visible copy and metadata, by language. Page templates contain no hard-coded text.

export const LANGUAGES = ['en', 'es'];

export const PAGES = {
  home: { en: '/', es: '/es/' },
  resources: { en: '/resources/', es: '/es/resources/' },
  about: { en: '/about/', es: '/es/about/' },
};

export const ARCHIVE_PAGE = { en: '/archive/', es: '/es/archive/' };
export const CONTACT_PAGE = { en: '/contact/', es: '/es/contacto/' };

export const resourcePath = (slug, lang) => `${lang === 'es' ? '/es' : ''}/resources/${slug}/`;

export const projectPath = (project, lang) => `${lang === 'es' ? '/es' : ''}/projects/${project.slug}/`;

export const languageOf = (path) => (path === '/es' || path.startsWith('/es/') ? 'es' : 'en');

const ROLE = 'Visual Designer & Marketing';

export const CONTENT = {
  en: {
    locale: 'en_GB',
    skip: 'Skip to content',
    brandLabel: 'SIRTRAVER — Home',
    mainNavLabel: 'Main navigation',
    languageLabel: 'Language',
    nav: { home: 'Portfolio', resources: 'Resources', about: 'About' },
    socialLabel: 'Social profiles',
    emailLabel: 'Email sirtraver',
    footerRole: `Javier Traver · ${ROLE}`,
    switchToThisLanguage: 'View this page in English',
    shareImageAlt: 'SIRTRAVER visual identity by Javier Traver',
    personCaption: 'Javier Traver — visual designer based in Madrid',
    categories: { 'Visual identity': 'Visual identity', 'Visual design': 'Visual design' },

    home: {
      title: 'sirtraver — Javier Traver | Visual Design Portfolio',
      description:
        'Visual design & marketing for brands ready to grow. Brand identities and visual communication with strategic thinking. I connect design and marketing to make what sets your brand apart clear.',
      overline: `JAVIER TRAVER · ${ROLE.toUpperCase()}`,
      heading: 'Visual design & marketing for brands ready to grow.',
      lead: 'Brand identities and visual communication with strategic thinking.',
      workTitle: 'Selected work',
      workOrder: 'Latest first',
      gridLabel: 'Design projects',
      featured: 'Latest project',
      viewProject: 'View project',
      archive: 'Earlier projects',
      listName: 'Graphic design projects by Javier Traver',
    },

    resources: {
      title: 'Design resources & templates | sirtraver',
      description:
        'Coming soon: Canva templates, Notion templates & design resources. Practical resources for better design and clearer work. Leave your email and I’ll let you know when they launch.',
      heading: 'Resources',
      breadcrumb: 'Resources',
      gridLabel: 'Gumroad products',
      listName: 'SIRTRAVER digital resources',
      unavailable: 'The catalog is temporarily unavailable. Please try again shortly.',
      coverOf: 'Cover of',
      viewProduct: 'View resource',
      buy: 'Get it on Gumroad ↗',
      backToResources: '← All resources',
      productNote: 'Payment and download are handled securely by Gumroad.',
      free: 'Free · €0',
      launch: {
        badge: 'IN THE MAKING',
        title: 'Templates & resources for clearer creative work.',
        text: 'Practical resources for better design and clearer work. Leave your email and I’ll let you know when they launch.',
        emailLabel: 'Email',
        placeholder: 'you@example.com',
        submit: 'Notify me at launch',
        upcoming: 'Coming soon',
        categories: ['Canva templates', 'Notion templates', 'Design resources'],
        consent: 'I’d like an email when the resources launch.',
        privacy: 'Your email will only be used for this notification. To remove it, use the email icon in the header.',
        saving: 'Saving…',
        success: 'You’re on the list. I’ll let you know when the resources launch.',
        confirm: 'Almost there: check your inbox and confirm your email.',
        confirmed: 'Email confirmed. You’re on the list.',
        limited: 'Too many attempts in a short time. Please try again later.',
        error: 'Could not save your subscription. Please try again or email me.',
      },
    },

    about: {
      title: 'Javier Traver — Visual Designer & Marketing | sirtraver',
      description:
        'Visual identity. Strategic thinking. I connect design and marketing to help brands communicate with clarity, character and consistency. I’m Javier Traver, a visual designer based in Madrid. My focus is identity and brand communication: turning an idea into a visual language that works across the places where a brand meets its audience.',
      breadcrumb: 'About',
      overline: 'ABOUT / SIRTRAVER',
      portraitAlt: 'Javier Traver — visual designer and founder of sirtraver',
      role: ROLE,
      location: 'Madrid, Spain',
      positionTitle: ['Visual identity.', 'Strategic thinking.'],
      lead: 'I connect design and marketing to help brands communicate with clarity, character and consistency.',
      bio: 'I’m Javier Traver, a visual designer based in Madrid. My focus is identity and brand communication: turning an idea into a visual language that works across the places where a brand meets its audience.',
      services: {
        kicker: 'SERVICES',
        title: 'How I can help your brand.',
        items: [
          ['Brand identity', 'New brands: from the first idea to a complete visual system.'],
          ['Rebranding', 'Established brands: a renewed identity that keeps what already works.'],
          ['Communication & campaigns', 'Posters, graphic pieces and campaigns that carry the brand further.'],
        ],
      },
      clients: 'CLIENTS',
      testimonials: 'WHAT CLIENTS SAY',
      bring: {
        kicker: 'WHAT I BRING',
        title: 'Design, communication & direction.',
        items: [
          ['Brand identity', 'Logotypes, typography, colour and visual systems with a clear point of view.'],
          ['Visual communication', 'Brand applications and graphic pieces that keep the message and identity consistent.'],
          ['Marketing perspective', 'A creative direction grounded in context, audience and what the brand needs to communicate.'],
        ],
      },
      method: {
        kicker: 'HOW I WORK',
        title: 'From context to a coherent visual system.',
        items: [
          ['Understand', 'Start with the brand, its context and the people it wants to reach.'],
          ['Define', 'Find the central idea and translate it into a coherent creative direction.'],
          ['Build', 'Develop a visual system and apply it with attention to detail.'],
        ],
      },
      tools: {
        kicker: 'TOOLS & CURIOSITY',
        text: 'I explore practical uses of AI to organise information and develop ideas. It supports the work; the creative judgement remains mine.',
      },
    },

    project: {
      back: '← All projects',
      conceptual: 'Concept project',
      original: 'View on Behance ↗',
      intro: (category, year) =>
        `${category} project by Javier Traver, visual designer and marketer based in Madrid, ${year}.`,
      description: (title, category, count, year) =>
        `${title}: ${category.toLowerCase()} project by Javier Traver, visual designer based in Madrid. ${count} images, ${year}.`,
      imageAlt: (title, index, total) => `${title} — image ${index} of ${total}, by Javier Traver`,
      pagerLabel: 'More projects',
      client: 'Client',
      discipline: 'Discipline',
      year: 'Year',
      role: 'Role',
      deliverables: 'Deliverables',
      resultTitle: 'Result',
      previous: '← Previous',
      next: 'Next →',
    },

    archive: {
      title: 'Earlier projects | sirtraver',
      heading: 'Earlier projects',
      description: 'Earlier visual design projects by Javier Traver.',
    },

    contact: {
      title: 'Have a project in mind?',
      text: 'Tell me about your brand and what it needs.',
      email: 'Write to me',
    },

    contactPage: {
      title: 'Contact | sirtraver',
      description: 'Contact Javier Traver about a brand identity, rebranding or communication project.',
      heading: 'Let’s talk about your project',
      lead: 'Tell me about your brand and what it needs.',
      altEmail: 'Prefer email? Write to',
      name: 'Name',
      email: 'Email',
      type: 'Project type',
      types: { identity: 'Brand identity', rebranding: 'Rebranding', campaigns: 'Communication & campaigns', other: 'Something else' },
      message: 'Message',
      messageHint: 'What is the brand, what do you need and for when?',
      submit: 'Send message',
      privacy: 'Your details will only be used to answer your message.',
      sending: 'Sending…',
      success: 'Thank you, your message has been sent.',
      error: 'The message could not be sent. Please try again or write to me by email.',
      limited: 'Too many messages in a short time. Please try again later or write to me by email.',
    },

    notFound: {
      title: 'Page not found | SIRTRAVER',
      text: 'This page could not be found.',
      back: 'Back to SIRTRAVER',
    },
  },

  es: {
    locale: 'es_ES',
    skip: 'Saltar al contenido',
    brandLabel: 'SIRTRAVER — Inicio',
    mainNavLabel: 'Navegación principal',
    languageLabel: 'Idioma',
    nav: { home: 'Proyectos', resources: 'Recursos', about: 'Sobre mí' },
    socialLabel: 'Perfiles sociales',
    emailLabel: 'Enviar un email a sirtraver',
    footerRole: `Javier Traver · ${ROLE}`,
    switchToThisLanguage: 'Ver esta página en español',
    shareImageAlt: 'SIRTRAVER visual identity by Javier Traver',
    personCaption: 'Javier Traver — diseñador visual en Madrid',
    categories: { 'Visual identity': 'Identidad visual', 'Visual design': 'Diseño visual' },

    home: {
      title: 'sirtraver — Javier Traver | Portfolio de diseño visual',
      description:
        'Diseño visual y marketing para marcas que quieren crecer. Identidad de marca y comunicación visual con criterio estratégico. Conecto diseño y marketing para que lo que hace diferente a tu marca se entienda.',
      overline: `JAVIER TRAVER · ${ROLE.toUpperCase()}`,
      heading: 'Diseño visual y marketing para marcas que quieren crecer.',
      lead: 'Identidad de marca y comunicación visual con criterio estratégico.',
      workTitle: 'Proyectos seleccionados',
      workOrder: 'Del más reciente al más antiguo',
      gridLabel: 'Proyectos de diseño',
      featured: 'Último proyecto',
      viewProject: 'Ver proyecto',
      archive: 'Proyectos anteriores',
      listName: 'Proyectos de diseño gráfico de Javier Traver',
    },

    resources: {
      title: 'Recursos y plantillas de diseño | sirtraver',
      description:
        'Próximamente: plantillas de Canva, Notion y recursos de diseño. Recursos prácticos para diseñar mejor y trabajar con más claridad. Deja tu email y te avisaré cuando estén disponibles.',
      heading: 'Recursos',
      breadcrumb: 'Recursos',
      gridLabel: 'Productos de Gumroad',
      listName: 'Recursos digitales de SIRTRAVER',
      unavailable: 'El catálogo no está disponible temporalmente. Inténtalo de nuevo en unos instantes.',
      coverOf: 'Portada de',
      viewProduct: 'Ver recurso',
      buy: 'Conseguirlo en Gumroad ↗',
      backToResources: '← Todos los recursos',
      productNote: 'El pago y la descarga se gestionan de forma segura en Gumroad.',
      free: 'Gratis · 0 €',
      launch: {
        badge: 'EN PREPARACIÓN',
        title: 'Plantillas y recursos para trabajar con más claridad.',
        text: 'Recursos prácticos para diseñar mejor y trabajar con más claridad. Déjame tu email y te avisaré del lanzamiento.',
        emailLabel: 'Email',
        placeholder: 'you@example.com',
        submit: 'Avisarme del lanzamiento',
        upcoming: 'Próximamente',
        categories: ['Plantillas de Canva', 'Plantillas de Notion', 'Recursos de diseño'],
        consent: 'Quiero recibir un email cuando se publiquen los recursos.',
        privacy: 'Tu email se usará solo para este aviso. Puedes pedir su eliminación mediante el icono de correo de la cabecera.',
        saving: 'Guardando…',
        success: 'Ya estás en la lista. Te avisaré cuando estén disponibles.',
        confirm: 'Casi listo: revisa tu correo y confirma tu email.',
        confirmed: 'Email confirmado. Ya estás en la lista.',
        limited: 'Demasiados intentos en poco tiempo. Inténtalo más tarde.',
        error: 'No se ha podido guardar. Inténtalo de nuevo o escríbeme por email.',
      },
    },

    about: {
      title: 'Javier Traver — Diseño visual y marketing | sirtraver',
      description:
        'Identidad visual. Criterio estratégico. Conecto diseño y marketing para que las marcas comuniquen con claridad, personalidad y coherencia. Soy Javier Traver, diseñador visual en Madrid. Mi enfoque es la identidad y la comunicación de marca: convertir una idea en un lenguaje visual que funcione en los distintos puntos de contacto con su público.',
      breadcrumb: 'Sobre mí',
      overline: 'SOBRE MÍ / SIRTRAVER',
      portraitAlt: 'Javier Traver — diseñador visual y creador de sirtraver',
      role: ROLE,
      location: 'Madrid, España',
      positionTitle: ['Identidad visual.', 'Criterio estratégico.'],
      lead: 'Conecto diseño y marketing para que las marcas comuniquen con claridad, personalidad y coherencia.',
      bio: 'Soy Javier Traver, diseñador visual en Madrid. Mi enfoque es la identidad y la comunicación de marca: convertir una idea en un lenguaje visual que funcione en los distintos puntos de contacto con su público.',
      services: {
        kicker: 'SERVICIOS',
        title: 'Cómo puedo ayudar a tu marca.',
        items: [
          ['Identidad de marca', 'Marcas nuevas: de la primera idea a un sistema visual completo.'],
          ['Rebranding', 'Marcas con recorrido: una identidad renovada que conserva lo que ya funciona.'],
          ['Comunicación y campañas', 'Carteles, piezas gráficas y campañas que llevan la marca más lejos.'],
        ],
      },
      clients: 'CLIENTES',
      testimonials: 'LO QUE DICEN LOS CLIENTES',
      bring: {
        kicker: 'QUÉ APORTO',
        title: 'Diseño, comunicación y dirección.',
        items: [
          ['Identidad de marca', 'Logotipos, tipografía, color y sistemas visuales con una dirección clara.'],
          ['Comunicación visual', 'Aplicaciones de marca y piezas gráficas que mantengan la coherencia del mensaje y la identidad.'],
          ['Perspectiva de marketing', 'Una dirección creativa conectada con el contexto, el público y lo que la marca necesita comunicar.'],
        ],
      },
      method: {
        kicker: 'CÓMO TRABAJO',
        title: 'Del contexto a un sistema visual coherente.',
        items: [
          ['Entender', 'Partir de la marca, su contexto y las personas a las que quiere llegar.'],
          ['Definir', 'Encontrar la idea central y traducirla en una dirección creativa coherente.'],
          ['Construir', 'Desarrollar un sistema visual y aplicarlo con atención al detalle.'],
        ],
      },
      tools: {
        kicker: 'HERRAMIENTAS Y CURIOSIDAD',
        text: 'Exploro usos prácticos de la IA para ordenar información y desarrollar ideas. Apoya el trabajo; el criterio creativo sigue siendo mío.',
      },
    },

    project: {
      back: '← Todos los proyectos',
      conceptual: 'Proyecto conceptual',
      original: 'Ver en Behance ↗',
      intro: (category, year) =>
        `Proyecto de ${category.toLowerCase()} de Javier Traver, diseñador visual y de marketing en Madrid, ${year}.`,
      description: (title, category, count, year) =>
        `${title}: proyecto de ${category.toLowerCase()} de Javier Traver, diseñador visual en Madrid. ${count} imágenes, ${year}.`,
      imageAlt: (title, index, total) => `${title} — imagen ${index} de ${total}, de Javier Traver`,
      pagerLabel: 'Más proyectos',
      client: 'Cliente',
      discipline: 'Disciplina',
      year: 'Año',
      role: 'Rol',
      deliverables: 'Entregables',
      resultTitle: 'Resultado',
      previous: '← Anterior',
      next: 'Siguiente →',
    },

    archive: {
      title: 'Proyectos anteriores | sirtraver',
      heading: 'Proyectos anteriores',
      description: 'Proyectos de diseño visual anteriores de Javier Traver.',
    },

    contact: {
      title: '¿Tienes un proyecto en mente?',
      text: 'Cuéntame sobre tu marca y lo que necesita.',
      email: 'Escríbeme',
    },

    contactPage: {
      title: 'Contacto | sirtraver',
      description: 'Contacta con Javier Traver para un proyecto de identidad de marca, rebranding o comunicación.',
      heading: 'Hablemos de tu proyecto',
      lead: 'Cuéntame sobre tu marca y lo que necesita.',
      altEmail: '¿Prefieres el email? Escribe a',
      name: 'Nombre',
      email: 'Email',
      type: 'Tipo de proyecto',
      types: { identity: 'Identidad de marca', rebranding: 'Rebranding', campaigns: 'Comunicación y campañas', other: 'Otro' },
      message: 'Mensaje',
      messageHint: '¿Qué marca es, qué necesitas y para cuándo?',
      submit: 'Enviar mensaje',
      privacy: 'Tus datos solo se usarán para responder a tu mensaje.',
      sending: 'Enviando…',
      success: 'Gracias, tu mensaje se ha enviado.',
      error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbeme por email.',
      limited: 'Demasiados mensajes en poco tiempo. Inténtalo más tarde o escríbeme por email.',
    },

    notFound: {
      title: 'Página no encontrada | SIRTRAVER',
      text: 'No se ha encontrado esta página.',
      back: 'Volver a SIRTRAVER',
    },
  },
};

// Display name in the page language.
export const projectName = (project, lang) => (lang === 'es' && project.nameEs) || project.name;

export const projectYear = (project) => project.year;

/** Cover media entry of a project. */
export const projectCover = (project) => project.cover;
