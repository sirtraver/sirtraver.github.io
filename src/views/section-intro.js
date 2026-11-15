import { CONTENT } from '../content.js';
import { html } from '../lib/html.js';

// Shared heading for the two collections: title and one line, in a single compact row.
export function sectionIntro(lang, heading, lead, extra = '') {
  return html`<section class="value-hero">
  <div class="hero-copy">
  <h1>${heading}</h1>
  <p class="value-description">${lead}</p>
  ${extra}
  </div>
</section>`;
}

// Verifiable facts only (they repeat what About and the CV already say).
export function trustStrip(lang) {
  const { label, items } = CONTENT[lang].trust;
  return html`<ul class="trust-strip" aria-label="${label}">${items.map((item) => html`<li>${item}</li>`)}</ul>`;
}
