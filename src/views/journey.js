// Small, bilingual additions to the approved portfolio. No invented client claims.
import { CONTACT_PAGE, PAGES } from '../content.js';
import { html } from '../lib/html.js';

export const THANKS_PAGE = { en: '/thank-you/', es: '/es/gracias/' };
export const JOURNEY = {
  es: {
    cta: 'Hablemos de tu proyecto', shortCta: 'Cuéntame tu proyecto',
    response: 'Respondo a las consultas de proyectos en un máximo de 2 días laborables.',
    brief: 'Cuéntame qué necesita tu marca, qué piezas tienes en mente y para cuándo las necesitas. Si tienes un presupuesto orientativo o referencias, inclúyelos también.',
    faqTitle: 'Antes de empezar',
    faq: [
      ['¿Qué tipo de proyectos puedo proponerte?', 'Visuales de campaña, imágenes de producto y spots con IA, además de identidad visual y packaging. Cuéntame el contexto y el alcance para valorar cómo puedo ayudarte.'],
      ['¿Qué información necesitas para empezar?', 'El nombre de la marca, qué quieres conseguir, las piezas que necesitas y la fecha prevista. Las referencias visuales y un presupuesto orientativo ayudan a concretar la propuesta.'],
      ['¿Cómo se acuerdan el presupuesto y los plazos?', 'Se valoran según el alcance, los entregables y la disponibilidad. El contacto inicial es una consulta: el trabajo comienza cuando se acuerdan la propuesta y sus condiciones.'],
      ['¿Todos los proyectos del portfolio son encargos reales?', 'El portfolio también incluye exploraciones personales. COLORSPLASH, Olmedo Clásico y Autoescuela OASIS están identificados como «Proyecto conceptual»; sus aplicaciones muestran propuestas de diseño.'],
      ['¿Dónde encuentro tus recursos digitales?', 'En la sección Recursos. Cuando haya productos disponibles, podrás consultar sus fichas y acceder a Gumroad. Mientras tanto, puedes apuntarte al aviso de lanzamiento.'],
    ],
    thanksTitle: 'Consulta recibida | sirtraver', thanksHeading: 'Gracias por contar conmigo.',
    thanksLead: 'Tu consulta se ha registrado correctamente.',
    thanksNext: 'Revisaré el contexto y te responderé al email que has indicado. Si necesitas añadir algo, puedes escribirme directamente.',
    back: 'Volver a los proyectos', about: 'Conoce mi perfil', resources: 'Explorar recursos',
    privacy: 'Responsable: Javier Traver. Uso tus datos para atender tu consulta previa a un posible encargo. No se venden; intervienen los proveedores técnicos de alojamiento y, si está activado, de email. Puedes ejercer tus derechos por email. Más información en la',
  },
  en: {
    cta: 'Let’s talk about your project', shortCta: 'Tell me about your project',
    response: 'I respond to project enquiries within 2 business days.',
    brief: 'Tell me what your brand needs, which deliverables you have in mind and your target date. An indicative budget and references are helpful too.',
    faqTitle: 'Before we start',
    faq: [
      ['What kinds of projects can I propose?', 'Campaign visuals, product images and AI spots, as well as visual identity and packaging. Share the context and scope so I can assess how I can help.'],
      ['What information do you need to get started?', 'Your brand name, what you want to achieve, the deliverables and your target date. Visual references and an indicative budget help define the proposal.'],
      ['How are budgets and timelines agreed?', 'They depend on scope, deliverables and availability. The first contact is an enquiry: work begins once the proposal and its terms have been agreed.'],
      ['Is every portfolio project a real commission?', 'The portfolio also includes personal explorations. COLORSPLASH, Olmedo Clásico and Autoescuela OASIS are labelled “Concept project”; their applications show design proposals.'],
      ['Where can I find your digital resources?', 'In Resources. When products are available, you can explore their details and continue to Gumroad. Until then, you can sign up for the launch notice.'],
    ],
    thanksTitle: 'Enquiry received | sirtraver', thanksHeading: 'Thank you for getting in touch.',
    thanksLead: 'Your enquiry has been recorded successfully.',
    thanksNext: 'I’ll review the context and reply to the email address you provided. You can email me directly if you need to add anything.',
    back: 'Back to the projects', about: 'Explore my profile', resources: 'Explore resources',
    privacy: 'Controller: Javier Traver. Your data is used to handle your enquiry before a possible commission. It is not sold; technical hosting and, when enabled, email providers process it. You can exercise your rights by email. More information in the',
  },
};

export const projectCta = lang => html`<section class="project-enquiry"><h2>${JOURNEY[lang].cta}</h2><p>${JOURNEY[lang].response}</p><a class="enquiry-button" href="${CONTACT_PAGE[lang]}">${JOURNEY[lang].shortCta} <span aria-hidden="true">↗</span></a></section>`;

export const visibleBreadcrumbs = (lang, label) => html`<nav class="breadcrumbs" aria-label="${lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}"><ol><li><a href="${PAGES.home[lang]}">${lang === 'es' ? 'Proyectos' : 'Portfolio'}</a></li><li aria-current="page">${label}</li></ol></nav>`;

export const contactFaq = lang => html`<section class="contact-faq" aria-labelledby="contact-faq-title"><h2 id="contact-faq-title">${JOURNEY[lang].faqTitle}</h2>${JOURNEY[lang].faq.map(([question, answer], index) => html`<details><summary>${question}</summary><p>${answer}${index === 3 ? html` <a href="${PAGES.home[lang]}">${JOURNEY[lang].back} →</a>` : index === 4 ? html` <a href="${PAGES.resources[lang]}">${JOURNEY[lang].resources} →</a>` : ''}</p></details>`)}</section>`;
