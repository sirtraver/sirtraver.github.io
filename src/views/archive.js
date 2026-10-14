// Earlier projects removed from the home page. Their case study pages keep existing.
import { ARCHIVE_PAGE, CONTENT } from '../content.js';
import { html } from '../lib/html.js';
import { projectCard } from './home.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';

export function archivePage(lang, projects) {
  const t = CONTENT[lang].archive;
  return layout({
    lang,
    page: 'home',
    alternates: ARCHIVE_PAGE,
    title: t.title,
    description: t.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'CollectionPage', path: ARCHIVE_PAGE[lang], lang, name: t.title, description: t.description }),
      breadcrumbs(lang, [[t.heading, ARCHIVE_PAGE[lang]]]),
    ),
    body: html`<div class="page-title"><h1>${t.heading}</h1></div>
<section class="project-grid project-grid--even" aria-label="${t.heading}">${projects.map((p) => projectCard(p, lang))}</section>`,
  });
}
