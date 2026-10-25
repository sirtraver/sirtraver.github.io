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
    contactLabel: 'Contact',
    networksLabel: 'Social',
    footerRole: `Javier Traver · ${ROLE}`,
    switchToThisLanguage: 'View this page in English',
    shareImageAlt: 'SIRTRAVER visual identity by Javier Traver',
    personCaption: 'Javier Traver — visual designer based in Madrid',
    categories: { 'Visual identity': 'Visual identity', 'Visual design': 'Visual design' },

    home: {
      title: 'sirtraver — Javier Traver | Visual Design Portfolio',
      description:
        'Brand identity, packaging and visual communication by Javier Traver, a visual designer based in Madrid. Explore selected brand systems and their applications.',
      overline: 'JAVIER TRAVER · VISUAL DESIGN',
      heading: 'Brand identities with character.',
      lead: 'From the logo to packaging and visual communication.',
      workTitle: 'Selected work',
      workOrder: 'Identity · Packaging · Communication',
      gridLabel: 'Design projects',
      featured: 'Latest project',
      viewProject: 'View project',
      archive: 'Explore earlier work',
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
        title: 'A small library, in the making.',
        text: 'I’m preparing design resources and templates. Leave your email if you’d like to hear when the first one is ready.',
        emailLabel: 'Email',
        placeholder: 'you@example.com',
        submit: 'Notify me at launch',
        upcoming: 'Coming soon',
        categories: ['Canva templates', 'Notion templates', 'Design resources'],
        consent: 'I’d like an email when the resources launch.',
        privacy: 'Your email will only be used for this notification. To remove it, use the email icon in the Social menu.',
        saving: 'Saving…',
        success: 'You’re on the list. I’ll let you know when the resources launch.',
        confirm: 'Almost there: check your inbox and confirm your email.',
        confirmed: 'Email confirmed. You’re on the list.',
        limited: 'Too many attempts in a short time. Please try again later.',
        error: 'Could not save your subscription. Please try again or email me.',
      },
    },

    about: {
      "title": "Javier Traver — Design, experience & education | sirtraver",
      "description": "Freelance graphic designer since 2017 and a Design graduate from Universidad Complutense de Madrid. Experience in visual identity, communication and product photography. Currently studying Marketing & Advertising.",
      "breadcrumb": "About",
      "overline": "ABOUT / SIRTRAVER",
      "portraitAlt": "Javier Traver — visual designer",
      "role": "Visual designer",
      "location": "Madrid, Spain",
      "positionTitle": [
        "Visual design.",
        "Brand communication."
      ],
      "lead": "I’m Javier Traver, a freelance graphic designer since 2017 and a Design graduate from Universidad Complutense de Madrid.",
      "bio": "I work on visual identity and brand communication, from logos to their digital and printed applications. My experience also includes product photography and visual content editing.",
      "currentStudy": "I’m currently studying Marketing & Advertising, expanding my understanding of brands, their audiences and how they communicate.",
      "studyLabel": "Marketing & Advertising · In progress",
      "experience": "Professional experience",
      "otherExperience": "Other experience",
      "education": "Education",
      "skills": "Skills",
      "tools": "Tools",
      "languages": "Languages",
      "clients": "CLIENTS",
      "testimonials": "WHAT CLIENTS SAY"
    },

    project: {
      back: '← All projects',
      story: 'Concept & applications',
      zoomHint: 'Select an image to explore the details.',
      zoomImage: (name, index) => `Enlarge ${name}, image ${index}`,
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
    contactLabel: 'Contacto',
    networksLabel: 'Social',
    footerRole: `Javier Traver · ${ROLE}`,
    switchToThisLanguage: 'Ver esta página en español',
    shareImageAlt: 'SIRTRAVER visual identity by Javier Traver',
    personCaption: 'Javier Traver — diseñador visual en Madrid',
    categories: { 'Visual identity': 'Identidad visual', 'Visual design': 'Diseño visual' },

    home: {
      title: 'sirtraver — Javier Traver | Portfolio de diseño visual',
      description:
        'Identidad de marca, packaging y comunicación visual de Javier Traver, diseñador visual en Madrid. Una selección de sistemas de marca y sus aplicaciones.',
      overline: 'JAVIER TRAVER · DISEÑO VISUAL',
      heading: 'Identidades de marca con carácter.',
      lead: 'Del logotipo al packaging y la comunicación visual.',
      workTitle: 'Proyectos seleccionados',
      workOrder: 'Identidad · Packaging · Comunicación',
      gridLabel: 'Proyectos de diseño',
      featured: 'Último proyecto',
      viewProject: 'Ver proyecto',
      archive: 'Explorar trabajos anteriores',
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
        title: 'Una biblioteca en preparación.',
        text: 'Estoy preparando recursos de diseño y plantillas. Si quieres saber cuándo esté listo el primero, déjame tu email.',
        emailLabel: 'Email',
        placeholder: 'you@example.com',
        submit: 'Avisarme del lanzamiento',
        upcoming: 'Próximamente',
        categories: ['Plantillas de Canva', 'Plantillas de Notion', 'Recursos de diseño'],
        consent: 'Quiero recibir un email cuando se publiquen los recursos.',
        privacy: 'Tu email se usará solo para este aviso. Puedes pedir su eliminación mediante el icono de correo del menú Social.',
        saving: 'Guardando…',
        success: 'Ya estás en la lista. Te avisaré cuando estén disponibles.',
        confirm: 'Casi listo: revisa tu correo y confirma tu email.',
        confirmed: 'Email confirmado. Ya estás en la lista.',
        limited: 'Demasiados intentos en poco tiempo. Inténtalo más tarde.',
        error: 'No se ha podido guardar. Inténtalo de nuevo o escríbeme por email.',
      },
    },

    about: {
      "title": "Javier Traver — Diseño, experiencia y formación | sirtraver",
      "description": "Diseñador gráfico freelance desde 2017 y graduado en Diseño por la Universidad Complutense de Madrid. Experiencia en identidad visual, comunicación y fotografía de producto. Actualmente estudio Marketing y Publicidad.",
      "breadcrumb": "Sobre mí",
      "overline": "SOBRE MÍ / SIRTRAVER",
      "portraitAlt": "Javier Traver — diseñador visual",
      "role": "Diseñador visual",
      "location": "Madrid, España",
      "positionTitle": [
        "Diseño visual.",
        "Comunicación de marca."
      ],
      "lead": "Soy Javier Traver, diseñador gráfico freelance desde 2017 y graduado en Diseño por la Universidad Complutense de Madrid.",
      "bio": "Trabajo en identidad visual y comunicación de marca, desde el logotipo hasta sus aplicaciones digitales e impresas. Mi experiencia también abarca la fotografía de producto y la edición de contenidos visuales.",
      "currentStudy": "Actualmente estudio Marketing y Publicidad. Una formación que amplía mi perspectiva sobre las marcas, sus públicos y cómo comunicar.",
      "studyLabel": "Marketing y Publicidad · En curso",
      "experience": "Experiencia profesional",
      "otherExperience": "Otras experiencias",
      "education": "Formación",
      "skills": "Competencias",
      "tools": "Herramientas",
      "languages": "Idiomas",
      "clients": "CLIENTES",
      "testimonials": "LO QUE DICEN LOS CLIENTES"
    },

    project: {
      back: '← Todos los proyectos',
      story: 'Concepto y aplicaciones',
      zoomHint: 'Pulsa una imagen para explorar los detalles.',
      zoomImage: (name, index) => `Ampliar ${name}, imagen ${index}`,
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
