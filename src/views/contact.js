import { SOCIAL } from '../config.js';
import { CONTACT_PAGE, CONTENT } from '../content.js';
import { html } from '../lib/html.js';

/** Closing call to action on the home and project pages. */
export function contactBlock(lang) {
  const t = CONTENT[lang].contact;
  return html`<section class="contact-block" aria-labelledby="contact-title">
  <h2 id="contact-title">${t.title}</h2>
  <p>${t.text}</p>
  <div class="contact-actions">
    <a class="contact-primary" href="${CONTACT_PAGE[lang]}">${t.email}</a>
    <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
  </div>
</section>`;
}
