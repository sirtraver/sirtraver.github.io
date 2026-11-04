import { CONTACT_PAGE, CONTENT } from '../content.js';
import { html } from '../lib/html.js';
import { JOURNEY } from './journey.js';
import { ICONS } from './icons.js';

// Shared typography, spacing and right-hand contact action for the two collections.
export function sectionIntro(lang, heading, lead, { home = false } = {}) {
  return html`<section class="value-hero${home ? ' value-hero--home' : ''}">
  <div class="hero-copy">
  <p class="overline">${CONTENT[lang].home.overline}</p>
  <h1>${heading}</h1>
  <p class="value-description">${lead}</p>
  </div>
<!-- journey:hero --><div class="hero-enquiry"><a class="enquiry-button" href="${CONTACT_PAGE[lang]}" aria-label="${JOURNEY[lang].cta}" title="${JOURNEY[lang].cta}"><span class="hero-contact-label">${JOURNEY[lang].cta}</span>${ICONS.mail}</a><span>${lang === 'es' ? 'Respuesta en 2 días laborables.' : 'Reply within 2 business days.'}</span></div><!-- /journey:hero -->
</section>`;
}
