// Articles: the index and each article, in both languages.
import { PERSON_ID } from '../config.js';
import { ARTICLES, ARTICLES_COPY, ARTICLES_PAGE, articlePath, articlePaths } from '../articles.js';
import { CONTACT_PAGE, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { sectionIntro } from './section-intro.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';

export function articlesIndex(lang) {
  const t = ARTICLES_COPY[lang];
  return layout({
    lang,
    page: 'articles',
    alternates: ARTICLES_PAGE,
    title: t.title,
    description: t.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'CollectionPage', path: ARTICLES_PAGE[lang], lang, name: t.title, description: t.description }),
      breadcrumbs(lang, [[t.heading, ARTICLES_PAGE[lang]]]),
      itemList(t.heading, ARTICLES.map((a) => ({ '@type': 'Article', headline: a[lang].title, url: absoluteUrl(articlePath(a, lang)) }))),
    ),
    body: html`${sectionIntro(lang, t.heading, t.lead)}
<ol class="article-list">${ARTICLES.map((a) => html`<li>
  <a href="${articlePath(a, lang)}">
    <time datetime="${a.date}">${t.date(a.date)}</time>
    <h2>${a[lang].title}</h2>
    <p>${a[lang].description}</p>
    <span class="article-read">${t.read} <span aria-hidden="true">→</span></span>
  </a>
</li>`)}</ol>`,
  });
}

/** @param {object[]} projects  Active projects; related links only for those that exist. */
export function articlePage(article, lang, projects) {
  const t = ARTICLES_COPY[lang];
  const a = article[lang];
  const path = articlePath(article, lang);
  const related = article.projects.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
  return layout({
    lang,
    page: 'article',
    alternates: articlePaths(article),
    title: `${a.title} | sirtraver`,
    description: a.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'WebPage', path, lang, name: a.title, description: a.description, mainEntity: { '@id': `${absoluteUrl(path)}#article` } }),
      {
        '@type': 'Article',
        '@id': `${absoluteUrl(path)}#article`,
        headline: a.title,
        description: a.description,
        inLanguage: lang,
        datePublished: article.date,
        dateModified: article.date,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        mainEntityOfPage: absoluteUrl(path),
      },
      breadcrumbs(lang, [[t.heading, ARTICLES_PAGE[lang]], [a.title, path]]),
    ),
    body: html`<article class="article-page">
  <p class="article-back"><a href="${ARTICLES_PAGE[lang]}">${t.back}</a></p>
  <header>
    <time datetime="${article.date}">${t.date(article.date)}</time>
    <h1>${a.title}</h1>
    <p class="article-lead">${a.lead}</p>
  </header>
  ${a.sections.map(([heading, paragraphs]) => html`<section><h2>${heading}</h2>${paragraphs.map((text) => html`<p>${text}</p>`)}</section>`)}
  ${related.length ? html`<aside class="article-related"><h2>${t.related}</h2><ul>${related.map((p) => html`<li><a href="${projectPath(p, lang)}">${projectName(p, lang)}</a></li>`)}</ul></aside>` : ''}
  <aside class="article-cta">
    <h2>${t.ctaTitle}</h2>
    <p><a class="more-button" href="${CONTACT_PAGE[lang]}">${t.contact} <span aria-hidden="true">→</span></a> <a class="method-link" href="${PAGES.services[lang]}">${t.services}</a></p>
  </aside>
</article>`,
  });
}
