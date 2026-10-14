// Case study page: introduction, project facts, captioned gallery and result.
// Every text field is optional; the page reads well with images alone.
// On the home page a click still opens the dark viewer; this page is what search engines index.
import { ORIGIN, PERSON_ID } from '../config.js';
import { CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { largestUrl, picture } from '../lib/picture.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, website } from './schema.js';

const GALLERY_SIZES = '(max-width: 800px) calc(100vw - 48px), 1000px';

function facts(project, lang, t) {
  const rows = [
    [t.client, project.client],
    [t.discipline, CONTENT[lang].categories[project.category] ?? project.category],
    [t.year, String(project.year)],
    [t.role, project.role[lang]],
    [t.deliverables, project.deliverables[lang].join(', ')],
  ].filter(([, value]) => value);
  return html`<dl class="project-facts">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>`;
}

function figure(image, index, total, name, lang, t) {
  const caption = image.caption[lang];
  return html`<figure>${picture(image, {
    alt: caption || t.imageAlt(name, index + 1, total),
    sizes: GALLERY_SIZES,
    priority: index === 0,
  })}${caption ? html`<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

function schema(project, lang, path, name, description) {
  const t = CONTENT[lang];
  const pageUrl = ORIGIN + path;
  const imageNodes = project.images.map((image, index) => ({
    '@type': 'ImageObject',
    '@id': `${pageUrl}#image-${index + 1}`,
    contentUrl: absoluteUrl(largestUrl(image)),
    url: absoluteUrl(largestUrl(image)),
    width: image.width,
    height: image.height,
    caption: image.caption[lang] || t.project.imageAlt(name, index + 1, project.images.length),
    creator: { '@id': PERSON_ID },
    creditText: 'Javier Traver',
    copyrightNotice: `© ${project.year} Javier Traver`,
  }));
  return graph(
    person(lang),
    website(),
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#page`,
      url: pageUrl,
      name: `${name} — Javier Traver`,
      description,
      inLanguage: lang,
      isPartOf: { '@id': `${ORIGIN}/#website` },
      mainEntity: { '@id': `${pageUrl}#work` },
      primaryImageOfPage: { '@id': imageNodes[0]['@id'] },
    },
    {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#work`,
      name,
      genre: t.categories[project.category] ?? project.category,
      creator: { '@id': PERSON_ID },
      dateCreated: project.date,
      ...(project.client ? { sourceOrganization: { '@type': 'Organization', name: project.client } } : {}),
      ...(project.intro[lang] ? { abstract: project.intro[lang] } : {}),
      image: imageNodes.map((node) => ({ '@id': node['@id'] })),
      ...(project.behance ? { sameAs: project.behance } : {}),
      inLanguage: lang,
    },
    breadcrumbs(lang, [[name, path]]),
    ...imageNodes,
  );
}

/**
 * @param {object} project  Project from content/.
 * @param {object[]} siblings  Projects to page through (same list the project belongs to).
 */
export function projectPage(project, siblings, lang) {
  const t = CONTENT[lang];
  const name = projectName(project, lang);
  const category = t.categories[project.category] ?? project.category;
  const intro = project.intro[lang];
  const description = intro || t.project.description(name, category, project.images.length, project.year);
  const path = projectPath(project, lang);
  const index = siblings.indexOf(project);
  const previous = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 ? siblings[index + 1] : null;
  const cover = project.cover;

  return layout({
    lang,
    page: 'home',
    alternates: { en: projectPath(project, 'en'), es: projectPath(project, 'es') },
    title: `${name} — Javier Traver | sirtraver`,
    description,
    shareImage: { url: absoluteUrl(cover.og ?? largestUrl(cover)), alt: name },
    schema: schema(project, lang, path, name, description),
    body: html`<article class="project-page">
  <a class="back-link" href="${PAGES.home[lang]}">${t.project.back}</a>
  <header class="project-header">
    <p class="overline">${category} · ${project.year}</p>
    <h1>${name}</h1>
    <p class="project-intro">${intro || t.project.intro(category, project.year)}</p>
  </header>
  <div class="project-summary">
    ${facts(project, lang, t.project)}
    ${project.behance ? html`<a class="project-original" href="${project.behance}" target="_blank" rel="noopener noreferrer">${t.project.original}</a>` : ''}
  </div>
  <div class="project-gallery">${project.images.map((image, i) => figure(image, i, project.images.length, name, lang, t.project))}</div>
  ${project.result[lang] ? html`<section class="project-result"><h2>${t.project.resultTitle}</h2><p>${project.result[lang]}</p></section>` : ''}
  <nav class="project-pager" aria-label="${t.project.pagerLabel}">${
    previous ? html`<a href="${projectPath(previous, lang)}" rel="prev">${t.project.previous}<span>${projectName(previous, lang)}</span></a>` : html`<span></span>`
  }${next ? html`<a href="${projectPath(next, lang)}" rel="next">${t.project.next}<span>${projectName(next, lang)}</span></a>` : ''}</nav>
</article>
`,
  });
}
