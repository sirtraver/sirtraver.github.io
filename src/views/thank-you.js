import { SOCIAL } from '../config.js';
import { PAGES } from '../content.js';
import { html } from '../lib/html.js';
import { runtime } from '../lib/runtime.js';
import { layout } from './layout.js';
import { JOURNEY, THANKS_PAGE, visibleBreadcrumbs } from './journey.js';

// No personal data in the URL or page; this page is not indexed or in the sitemap.
export function thankYouPage(lang, resources = false) {
  const t = JOURNEY[lang];
  // With the Brevo newsletter on, this page is where its double opt-in link lands.
  const newsletter = resources && Boolean(runtime().newsletterForm);
  const copy = newsletter
    ? lang === 'es'
      ? { title: 'Suscripción confirmada | sirtraver', heading: 'Suscripción confirmada.', lead: 'Ya estás en la newsletter de sirtraver.', next: 'Te escribiré cuando haya recursos nuevos. Puedes darte de baja con el enlace de cualquier email o escribiéndome a' }
      : { title: 'Subscription confirmed | sirtraver', heading: 'Subscription confirmed.', lead: 'You’re on the sirtraver newsletter.', next: 'I’ll write when there are new resources. You can unsubscribe with the link in any email or by writing to' }
    : resources
      ? lang === 'es'
        ? { title: 'Registro confirmado | sirtraver', heading: 'Ya estás en la lista.', lead: 'Tu registro para el aviso de Recursos se ha guardado correctamente.', next: 'Te avisaré cuando se publiquen los recursos. Puedes retirar tu consentimiento escribiéndome por email.' }
        : { title: 'Registration saved | sirtraver', heading: 'You’re on the list.', lead: 'Your Resources launch registration has been saved successfully.', next: 'I’ll let you know when the resources launch. You can withdraw your consent by emailing me.' }
      : { title: t.thanksTitle, heading: t.thanksHeading, lead: t.thanksLead, next: t.thanksNext };
  const { heading, lead, next } = copy;
  // Preserve the resource notice when switching language, without exposing an email in the URL.
  const paths = resources ? Object.fromEntries(Object.entries(THANKS_PAGE).map(([code,path]) => [code, `${path}?notice=resources`])) : THANKS_PAGE;
  return layout({ lang, page: null, alternates: paths, title: copy.title, description: lead, noindex: true,
    body: html`<section class="contact-page thank-you-page">${visibleBreadcrumbs(lang, lang === 'es' ? 'Gracias' : 'Thank you')}<p class="overline">${resources ? (lang === 'es' ? 'Recursos' : 'Resources') : (lang === 'es' ? 'Mensaje recibido' : 'Message received')}</p><h1>${heading}</h1><p class="contact-lead">${lead}</p>${!resources ? html`<p class="response-time">${t.response}</p>` : ''}<p>${next} <a href="${SOCIAL.email}">${SOCIAL.email.slice(7)}</a></p><div class="journey-links"><a class="enquiry-button" href="${PAGES.home[lang]}">${t.back} →</a><a href="${PAGES.about[lang]}">${t.about}</a></div></section>` });
}
