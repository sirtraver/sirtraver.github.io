import { SOCIAL } from '../config.js';
import { PAGES } from '../content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { JOURNEY, THANKS_PAGE, visibleBreadcrumbs } from './journey.js';

// No personal data in the URL or page; this page is not indexed or in the sitemap.
export function thankYouPage(lang, resources = false) {
  const t = JOURNEY[lang];
  const heading = resources ? (lang === 'es' ? 'Ya estás en la lista.' : 'You’re on the list.') : t.thanksHeading;
  const lead = resources ? (lang === 'es' ? 'Tu registro para el aviso de Recursos se ha guardado correctamente.' : 'Your Resources launch registration has been saved successfully.') : t.thanksLead;
  const next = resources ? (lang === 'es' ? 'Te avisaré cuando se publiquen los recursos. Puedes retirar tu consentimiento escribiéndome por email.' : 'I’ll let you know when the resources launch. You can withdraw your consent by emailing me.') : t.thanksNext;
  // Preserve the resource notice when switching language, without exposing an email in the URL.
  const paths = resources ? Object.fromEntries(Object.entries(THANKS_PAGE).map(([code,path]) => [code, `${path}?notice=resources`])) : THANKS_PAGE;
  return layout({ lang, page: null, alternates: paths, title: resources ? (lang === 'es' ? 'Registro confirmado | sirtraver' : 'Registration saved | sirtraver') : t.thanksTitle, description: lead, noindex: true,
    body: html`<section class="contact-page thank-you-page">${visibleBreadcrumbs(lang, lang === 'es' ? 'Gracias' : 'Thank you')}<p class="overline">${resources ? (lang === 'es' ? 'Recursos' : 'Resources') : (lang === 'es' ? 'Mensaje recibido' : 'Message received')}</p><h1>${heading}</h1><p class="contact-lead">${lead}</p>${!resources ? html`<p class="response-time">${t.response}</p>` : ''}<p>${next} <a href="${SOCIAL.email}">${SOCIAL.email.slice(7)}</a></p><div class="journey-links"><a class="enquiry-button" href="${PAGES.home[lang]}">${t.back} →</a><a href="${PAGES.about[lang]}">${t.about}</a></div></section>` });
}
