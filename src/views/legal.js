import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { html } from '../lib/html.js';
import { runtime } from '../lib/runtime.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';

/** @param {'legal'|'privacy'} kind */
export function legalPage(kind, lang) {
  const t = LEGAL_CONTENT[lang];
  const page = t[kind];
  const path = LEGAL_PAGES[kind][lang];
  // Integrations are only described while they are switched on.
  const { analytics, newsletter, contactEmail } = runtime();
  const optional = kind === 'privacy'
    ? [...(newsletter || contactEmail ? [t.optional.email] : []), ...(analytics ? [t.optional.analytics] : [])]
    : [];
  const sections = [...page.sections.slice(0, -1), ...optional, ...page.sections.slice(-1)];
  return layout({
    lang,
    page: null,
    alternates: LEGAL_PAGES[kind],
    title: page.title,
    description: page.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'WebPage', path, lang, name: page.title, description: page.description }),
      breadcrumbs(lang, [[page.heading, path]]),
    ),
    body: html`<article class="legal-page">
  <h1>${page.heading}</h1>
  <p class="legal-updated">${t.updated}</p>
  ${page.owner ? html`<dl class="legal-owner">${page.owner.map(([label, value]) => html`<dt>${label}</dt><dd>${value}</dd>`)}</dl>` : ''}
  ${sections.map(
    ([heading, paragraphs]) => html`<section><h2>${heading}</h2>${paragraphs.map((text) => html`<p>${text}</p>`)}</section>`,
  )}
</article>`,
  });
}
