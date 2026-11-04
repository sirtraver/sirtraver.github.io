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
import { projectCta, visibleBreadcrumbs } from './journey.js';

const GALLERY_SIZES = '(max-width: 800px) calc(100vw - 48px), 1000px';

function facts(project, lang, t) {
  const rows = [
    [t.client, project.client],
    [t.discipline, CONTENT[lang].categories[project.category] ?? project.category],
    [t.year, String(project.year)],
    [t.role, project.role[lang]],
    [t.deliverables, project.deliverables[lang].join(', ')],
    [lang === 'es' ? 'Herramientas' : 'Tools', project.tools.join(' · ')],
  ].filter(([, value]) => value);
  return html`<dl class="project-facts">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>`;
}

function figure(image, index, total, name, lang, t) {
  const caption = image.caption[lang];
  return html`<figure><a class="gallery-zoom" href="${largestUrl(image)}" target="_blank" rel="noopener noreferrer" data-zoom-src="${largestUrl(image)}" aria-label="${t.zoomImage(name, index + 1)}">${picture(image, {
    alt: caption || t.imageAlt(name, index + 1, total),
    sizes: GALLERY_SIZES,
    priority: false,
  })}</a>${caption ? html`<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

function schema(project, lang, path, name, description) {
  const t = CONTENT[lang];
  const pageUrl = ORIGIN + path;
  const cover = {
    '@type': 'ImageObject',
    '@id': `${pageUrl}#cover`,
    contentUrl: absoluteUrl(largestUrl(project.cover)),
    url: absoluteUrl(largestUrl(project.cover)),
    name,
    caption: `${name} — Javier Traver`,
    description,
    width: project.cover.width,
    height: project.cover.height,
    creator: { '@id': PERSON_ID },
    creditText: 'Javier Traver',
    copyrightNotice: `© ${project.year} Javier Traver`,
    isPartOf: { '@id': `${pageUrl}#work` },
  };
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
      primaryImageOfPage: { '@id': cover['@id'] },
    },
    {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#work`,
      name,
      genre: t.categories[project.category] ?? project.category,
      ...(project.conceptual ? { creativeWorkStatus: t.project.conceptual } : {}),
      creator: { '@id': PERSON_ID },
      dateCreated: project.date,
      ...(project.client ? { sourceOrganization: { '@type': 'Organization', name: project.client } } : {}),
      ...(project.intro[lang] ? { abstract: project.intro[lang] } : {}),
      thumbnailUrl: cover.contentUrl,
      image: [cover, ...imageNodes].map((node) => ({ '@id': node['@id'] })),
      ...(project.behance ? { sameAs: project.behance } : {}),
      inLanguage: lang,
    },
    breadcrumbs(lang, [[name, path]]),
    cover,
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
  const next = index >= 0 ? siblings[index + 1] : null;
  const cover = project.cover;

  // Case template: hero, cover, facts, numbered chapters each followed by its images,
  // the rest of the gallery, result, enquiry and a large "next project" link.
  const chapters = project.caseStudy;
  const perChapter = chapters.length ? Math.min(2, Math.floor(project.images.length / (chapters.length + 1))) : 0;
  const chunk = (from, count) => project.images.slice(from, from + count).map((image, j) => figure(image, from + j, project.images.length, name, lang, t.project));
  const rest = chapters.length * perChapter;
  const following = siblings.length > 1 ? (next ?? siblings[0]) : null;
  const nextLabel = lang === 'es' ? 'Siguiente proyecto' : 'Next project';
  const backLabel = lang === 'es' ? 'Todos los proyectos' : 'All projects';

  return layout({
    lang,
    page: 'home',
    alternates: { en: projectPath(project, 'en'), es: projectPath(project, 'es') },
    title: `${name} — Javier Traver | sirtraver`,
    description,
    shareImage: { url: absoluteUrl(cover.og ?? largestUrl(cover)), alt: name },
    schema: schema(project, lang, path, name, description),
    scripts: [{ src: '/assets/image-zoom.js' }],
    body: html`<article class="project-page case">
  ${visibleBreadcrumbs(lang, name)}
  <header class="case-hero">
    <p class="overline">${category} · ${project.year}${project.conceptual ? ` · ${t.project.conceptual}` : ''}</p>
    <h1>${name}</h1>
    <p class="project-intro">${intro || t.project.intro(category, project.year)}</p>
  </header>
  <figure class="case-cover">${picture(cover, { alt: name, sizes: '(max-width: 1360px) calc(100vw - 48px), 1296px', priority: true })}</figure>
  <div class="case-facts">${facts(project, lang, t.project)}</div>
  ${chapters.length ? html`<section class="project-story case-story" aria-label="${t.project.story}">${chapters.map((section, i) => html`<div class="case-chapter"><p class="case-index">${String(i + 1).padStart(2, '0')}</p><h2>${section.title[lang]}</h2><p class="case-text">${section.text[lang]}</p></div>${perChapter ? html`<div class="project-gallery case-gallery">${chunk(i * perChapter, perChapter)}</div>` : ''}`)}</section>` : ''}
  <div class="project-gallery case-gallery">${chunk(rest, project.images.length - rest)}</div>
  ${project.result[lang] ? html`<section class="project-result"><h2>${t.project.resultTitle}</h2><p>${project.result[lang]}</p></section>` : ''}
  ${projectCta(lang)}
  <nav class="case-end" aria-label="${t.project.pagerLabel}">
    ${following ? html`<a class="case-next" href="${projectPath(following, lang)}" rel="next"><span class="case-next-label">${nextLabel} <span aria-hidden="true">→</span></span><span class="case-next-name">${projectName(following, lang)}</span><span class="case-next-media">${picture(following.cover, { alt: projectName(following, lang), sizes: '(max-width: 1360px) calc(100vw - 48px), 1296px' })}</span></a>` : ''}
    <a class="case-back" href="${PAGES.home[lang]}">← ${backLabel}</a>
  </nav>
</article>
`,
  });
}
