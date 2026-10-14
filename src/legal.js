// Legal notice and privacy policy (EN/ES). They describe what the site actually does:
// no cookies, no analytics, and personal data only from the launch waitlist form.
// Template text: have it reviewed before relying on it legally.
import { LEGAL } from './config.js';
import { html } from './lib/html.js';

export const LEGAL_PAGES = {
  legal: { en: '/legal/', es: '/es/aviso-legal/' },
  privacy: { en: '/privacy/', es: '/es/privacidad/' },
};

const email = html`<a href="mailto:${LEGAL.email}">${LEGAL.email}</a>`;
const aepd = html`<a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">aepd.es</a>`;

// Lines of the owner block; empty fields are left out (see the build warning).
const ownerLines = (labels) =>
  [
    [labels.holder, LEGAL.holder],
    [labels.taxId, LEGAL.taxId],
    [labels.address, LEGAL.address],
    [labels.email, email],
  ].filter(([, value]) => value);

export const LEGAL_CONTENT = {
  en: {
    legal: {
      title: 'Legal notice | sirtraver',
      heading: 'Legal notice',
      description: 'Legal notice of sirtraver.com, the portfolio of Javier Traver.',
      owner: ownerLines({ holder: 'Owner', taxId: 'Tax ID (NIF)', address: 'Address', email: 'Email' }),
      sections: [
        ['Purpose', [`This website presents the professional work of ${LEGAL.holder} in visual design and marketing, and his digital resources.`]],
        [
          'Intellectual property',
          [
            `The designs, texts and images on this website are by ${LEGAL.holder} unless stated otherwise. They may not be reproduced, distributed or transformed without permission.`,
            'Brands and projects shown may belong to their respective owners and are presented as examples of the work carried out.',
          ],
        ],
        [
          'Digital resources and external links',
          [
            'Digital resources are sold and delivered through Gumroad, under its own terms. Links to Behance, Gumroad, Instagram, Threads and LinkedIn lead to services with their own conditions and privacy policies, for which this website is not responsible.',
          ],
        ],
        ['Applicable law', ['This legal notice is governed by Spanish law.']],
      ],
    },
    privacy: {
      title: 'Privacy policy | sirtraver',
      heading: 'Privacy policy',
      description: 'How sirtraver.com handles personal data: only the launch waitlist, no cookies, no analytics.',
      sections: [
        ['Data controller', [html`${LEGAL.holder}. Contact: ${email}.`]],
        [
          'What data is collected',
          [
            'If you sign up for the resources launch notice: your email address, the language of the page and the date and time of your consent.',
            'If you use the contact form: your name, email address, the type of project and your message.',
            'This website does not use cookies or advertising trackers. The server may process technical data (such as IP address and browser) temporarily to deliver the website securely and prevent abuse.',
          ],
        ],
        ['Purpose', ['Launch notice: to email you when the sirtraver digital resources launch. Contact form: to answer your enquiry.']],
        [
          'Legal basis',
          [
            'Launch notice: your consent, given with the checkbox of the form (art. 6.1.a GDPR); you can withdraw it at any time. Contact form: answering a request you make before a possible agreement (art. 6.1.b GDPR).',
          ],
        ],
        [
          'Retention',
          ['Launch notice: until it is sent or until you ask for deletion. Contact messages: for as long as needed to handle your enquiry and at most two years.'],
        ],
        ['Recipients', ['Your data is not sold or shared with third parties. It is stored on the server that hosts this website.']],
        [
          'Your rights',
          [
            html`You can access, rectify or delete your data, object to or restrict its processing, and request its portability by writing to ${email}. You can also file a complaint with the Spanish Data Protection Agency (${aepd}).`,
          ],
        ],
        [
          'External content',
          ['All images and fonts are served from this website. Product images on the Resources page are loaded from Gumroad. Links to other services (Behance, Gumroad, Instagram, Threads, LinkedIn) are subject to their own privacy policies.'],
        ],
      ],
    },
    optional: {
      email: ['Email provider', ['Confirmation and notification emails are sent through Brevo (Sendinblue SAS, EU), which acts as data processor.']],
      analytics: ['Visit statistics', ['Aggregated, anonymous visit statistics are collected with a cookieless tool hosted for this website (Umami). It does not identify you or track you across sites.']],
    },
    updated: `Last updated: ${LEGAL.updated.en}`,
    footer: { legal: 'Legal notice', privacy: 'Privacy' },
  },

  es: {
    legal: {
      title: 'Aviso legal | sirtraver',
      heading: 'Aviso legal',
      description: 'Aviso legal de sirtraver.com, el portfolio de Javier Traver.',
      owner: ownerLines({ holder: 'Titular', taxId: 'NIF', address: 'Domicilio', email: 'Email' }),
      sections: [
        ['Objeto', [`Esta web presenta el trabajo profesional de ${LEGAL.holder} en diseño visual y marketing, y sus recursos digitales.`]],
        [
          'Propiedad intelectual',
          [
            `Los diseños, textos e imágenes de esta web son obra de ${LEGAL.holder} salvo que se indique lo contrario. No se permite su reproducción, distribución o transformación sin autorización.`,
            'Las marcas y proyectos mostrados pueden pertenecer a sus respectivos titulares y se presentan como muestra del trabajo realizado.',
          ],
        ],
        [
          'Recursos digitales y enlaces externos',
          [
            'Los recursos digitales se venden y entregan a través de Gumroad, según sus propias condiciones. Los enlaces a Behance, Gumroad, Instagram, Threads y LinkedIn llevan a servicios con sus propias condiciones y políticas de privacidad, de las que esta web no es responsable.',
          ],
        ],
        ['Legislación aplicable', ['Este aviso legal se rige por la legislación española.']],
      ],
    },
    privacy: {
      title: 'Política de privacidad | sirtraver',
      heading: 'Política de privacidad',
      description: 'Cómo trata sirtraver.com los datos personales: solo la lista de aviso de lanzamiento, sin cookies ni analítica.',
      sections: [
        ['Responsable del tratamiento', [html`${LEGAL.holder}. Contacto: ${email}.`]],
        [
          'Qué datos se recogen',
          [
            'Si te apuntas al aviso de lanzamiento de recursos: tu email, el idioma de la página y la fecha y hora de tu consentimiento.',
            'Si usas el formulario de contacto: tu nombre, tu email, el tipo de proyecto y tu mensaje.',
            'Esta web no usa cookies ni rastreadores publicitarios. El servidor puede tratar temporalmente datos técnicos (como la dirección IP y el navegador) para servir la web de forma segura y evitar abusos.',
          ],
        ],
        ['Finalidad', ['Aviso de lanzamiento: enviarte un email cuando se publiquen los recursos digitales de sirtraver. Formulario de contacto: responder a tu consulta.']],
        [
          'Base legal',
          [
            'Aviso de lanzamiento: tu consentimiento, que das con la casilla del formulario (art. 6.1.a RGPD); puedes retirarlo en cualquier momento. Formulario de contacto: atender una solicitud tuya previa a un posible encargo (art. 6.1.b RGPD).',
          ],
        ],
        [
          'Conservación',
          ['Aviso de lanzamiento: hasta que se envíe o pidas su eliminación. Mensajes de contacto: el tiempo necesario para atender tu consulta y como máximo dos años.'],
        ],
        ['Destinatarios', ['Tus datos no se venden ni se ceden a terceros. Se guardan en el servidor que aloja esta web.']],
        [
          'Tus derechos',
          [
            html`Puedes acceder a tus datos, rectificarlos o suprimirlos, oponerte a su tratamiento o limitarlo y solicitar su portabilidad escribiendo a ${email}. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (${aepd}).`,
          ],
        ],
        [
          'Contenido externo',
          ['Todas las imágenes y tipografías se sirven desde esta web. Las imágenes de productos de la página de Recursos se cargan desde Gumroad. Los enlaces a otros servicios (Behance, Gumroad, Instagram, Threads, LinkedIn) se rigen por sus propias políticas de privacidad.'],
        ],
      ],
    },
    optional: {
      email: ['Proveedor de email', ['Los emails de confirmación y aviso se envían a través de Brevo (Sendinblue SAS, UE), que actúa como encargado del tratamiento.']],
      analytics: ['Estadísticas de visitas', ['Se recogen estadísticas de visitas agregadas y anónimas con una herramienta sin cookies alojada para esta web (Umami). No te identifica ni te sigue por otras webs.']],
    },
    updated: `Última actualización: ${LEGAL.updated.es}`,
    footer: { legal: 'Aviso legal', privacy: 'Privacidad' },
  },
};
