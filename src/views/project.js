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
import { coverTransition } from './home.js';

// Gallery formats (galeria.json "layout"): default column, "full" edge to edge, "pair" side by side.
const GALLERY_SIZES = {
  '': '(max-width: 700px) calc(100vw - 32px), 1120px',
  full: '100vw',
  pair: '(max-width: 700px) calc(100vw - 32px), (max-width: 1360px) calc(50vw - 56px), 640px',
};

function facts(project, lang, t) {
  const rows = [
    [t.client, project.client],
    [t.discipline, CONTENT[lang].categories[project.category] ?? project.category],
    [t.year, String(project.year)],
    [t.role, project.role[lang]],
    [t.deliverables, project.deliverables[lang].join(', ')],
    [t.tools, project.tools.join(' · ')],
  ].filter(([, value]) => value);
  return html`<dl class="project-facts">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>`;
}

function figure(image, index, total, name, lang, t) {
  const caption = image.caption[lang];
  // In a pair, each figure grows with its aspect ratio so both images share one height.
  const style = image.layout === 'pair' ? html` style="flex:${(image.width / image.height).toFixed(3)} 1 0"` : '';
  return html`<figure${image.layout === 'full' ? html` class="is-full"` : ''}${style}><a class="gallery-zoom" href="${largestUrl(image)}" target="_blank" rel="noopener noreferrer" data-zoom-src="${largestUrl(image)}" aria-label="${t.zoomImage(name, index + 1)}">${picture(image, {
    alt: caption || t.imageAlt(name, index + 1, total),
    sizes: GALLERY_SIZES[image.layout] ?? GALLERY_SIZES[''],
  })}</a>${caption ? html`<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

// Consecutive "pair" images become one diptych row.
function gallery(images, name, lang, t) {
  const blocks = [];
  images.forEach((image, index) => {
    const node = figure(image, index, images.length, name, lang, t);
    const last = blocks.at(-1);
    if (image.layout === 'pair' && Array.isArray(last) && last.length < 2) last.push(node);
    else blocks.push(image.layout === 'pair' ? [node] : node);
  });
  return blocks.map((block) => (Array.isArray(block) ? html`<div class="gallery-pair">${block}</div>` : block));
}

function palette(project, lang, t) {
  if (!project.palette.length) return '';
  const total = project.palette.reduce((sum, swatch) => sum + (swatch.share || 0), 0);
  return html`<section class="project-palette" aria-labelledby="palette-title"><h2 id="palette-title">${t.palette}</h2><ul>${project.palette.map((swatch) => {
    const grow = total ? swatch.share : 1;
    return html`<li style="flex-grow:${grow};--swatch:${swatch.hex}"><span class="swatch-chip" aria-hidden="true"></span><strong>${swatch.name[lang]}</strong><code>${swatch.hex}</code>${swatch.share ? html`<span>${t.paletteShare(swatch.share)}</span>` : ''}</li>`;
  })}</ul></section>`;
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
  const previous = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 ? siblings[index + 1] : null;
  const cover = project.cover;

  return layout({
    lang,
    page: 'home',
    alternates: { en: projectPath(project, 'en'), es: projectPath(project, 'es') },
    title: `${name} — Javier Traver | sirtraver`,
    description,
    shareImage: { url: absoluteUrl(cover.og ?? largestUrl(cover)), ...(cover.og ? { width: 1200, height: 630 } : {}), alt: name },
    enquiry: true,
    schema: schema(project, lang, path, name, description),
    scripts: [{ src: '/assets/image-zoom.js' }],
    body: html`<article class="project-page">
  ${visibleBreadcrumbs(lang, name)}
  <header class="project-header">
    <p class="overline">${category} · ${project.year}${project.conceptual ? ` · ${t.project.conceptual}` : ''}</p>
    <h1>${name}</h1>
    <p class="project-intro">${intro || t.project.intro(category, project.year)}</p>
  </header>
  <div class="project-hero" style="${coverTransition(project)}">${picture(cover, { alt: name, sizes: '100vw', priority: true })}</div>
  <div class="project-summary">
    ${facts(project, lang, t.project)}
  </div>
  ${project.caseStudy.length ? html`<section class="project-story" aria-label="${t.project.story}">${project.caseStudy.map(section => html`<div><h2>${section.title[lang]}</h2><p>${section.text[lang]}</p></div>`)}</section>` : ''}
  ${palette(project, lang, t.project)}
  <p class="gallery-hint">${t.project.zoomHint}</p>
  <div class="project-gallery">${gallery(project.images, name, lang, t.project)}</div>
  ${project.result[lang] ? html`<section class="project-result"><h2>${t.project.resultTitle}</h2><p>${project.result[lang]}</p></section>` : ''}
  ${projectCta(lang)}
  <nav class="project-pager" aria-label="${t.project.pagerLabel}">${
    previous ? html`<a href="${projectPath(previous, lang)}" rel="prev">${t.project.previous}<span>${projectName(previous, lang)}</span></a>` : html`<span></span>`
  }${next ? html`<a href="${projectPath(next, lang)}" rel="next">${t.project.next}<span>${projectName(next, lang)}</span></a>` : ''}</nav>
</article>
`,
  });
}
