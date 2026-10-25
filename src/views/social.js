import { SOCIAL } from '../config.js';
import { CONTENT } from '../content.js';
import { html } from '../lib/html.js';
import { ICONS } from './icons.js';

const NETWORKS = ['threads', 'instagram', 'linkedin', 'mail'];
const LABELS = { threads: 'Threads', instagram: 'Instagram', linkedin: 'LinkedIn' };

// Native icon links live in the About profile card.
export function socialIcons(lang, className = '') {
  return html`<div class="social-links social-icons ${className}" role="group" aria-label="${CONTENT[lang].socialLabel}">${NETWORKS.map(key => {
    const mail = key === 'mail';
    const label = mail ? CONTENT[lang].emailLabel : LABELS[key];
    return html`<a class="social-${key}" href="${mail ? SOCIAL.email : SOCIAL[key]}" aria-label="${label}" title="${label}"${mail ? '' : html` target="_blank" rel="noopener noreferrer"`}>${ICONS[key]}</a>`;
  })}</div>`;
}
