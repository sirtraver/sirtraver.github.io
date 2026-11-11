import { html } from '../lib/html.js';

// Shared heading for the two collections: title and one line, in a single compact row.
export function sectionIntro(lang, heading, lead) {
  return html`<section class="value-hero">
  <div class="hero-copy">
  <h1>${heading}</h1>
  <p class="value-description">${lead}</p>
  </div>
</section>`;
}
