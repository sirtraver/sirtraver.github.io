import { CONTENT, PAGES } from '../content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';

export function notFoundPage(lang) {
  const t = CONTENT[lang].notFound;
  return layout({
    lang,
    page: null,
    alternates: PAGES.home,
    title: t.title,
    noindex: true,
    mainClass: 'not-found',
    body: html`<h1>404</h1>
<p>${t.text}</p>
<div class="not-found-links"><a href="${PAGES.home[lang]}">${t.back} →</a><a href="${PAGES.resources[lang]}">${CONTENT[lang].nav.resources}</a><a href="${PAGES.about[lang]}">${CONTENT[lang].nav.about}</a></div>`,
  });
}
