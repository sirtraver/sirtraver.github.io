import { CONTACT_PAGE, CONTENT, PAGES } from '../content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';

// Static hosting serves a single 404.html, so the page also speaks the other language.
export function notFoundPage(lang) {
  const t = CONTENT[lang].notFound;
  const other = lang === 'es' ? 'en' : 'es';
  const o = CONTENT[other].notFound;
  return layout({
    lang,
    page: null,
    alternates: PAGES.home,
    title: t.title,
    noindex: true,
    mainClass: 'not-found',
    body: html`<h1>404</h1>
<p>${t.text}</p>
<div class="not-found-links"><a href="${PAGES.home[lang]}">${t.back} →</a><a href="${PAGES.about[lang]}">${CONTENT[lang].nav.about}</a><a href="${CONTACT_PAGE[lang]}">${CONTENT[lang].nav.contact}</a></div>
<p class="not-found-alt" lang="${other}">${o.text} <a href="${PAGES.home[other]}">${o.back} →</a></p>`,
  });
}
