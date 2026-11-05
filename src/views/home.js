import { PERSON_ID } from '../config.js';
import { ARCHIVE_PAGE, CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { largestUrl, picture } from '../lib/picture.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';
import { sectionIntro } from './section-intro.js';

const imageId = (project) => `${absoluteUrl('/')}#project-image-${project.slug}`;

// Responsive widths per card format (see .project-card--full / --wide / --narrow in site.css).
const CARD_SIZES = {
  full: '(max-width: 700px) calc(100vw - 32px), min(100vw - 96px, 1264px)',
  wide: '(max-width: 700px) calc(100vw - 32px), (max-width: 1360px) calc(58vw - 56px), 737px',
  narrow: '(max-width: 700px) calc(100vw - 32px), (max-width: 1360px) calc(42vw - 40px), 527px',
  even: '(max-width: 700px) calc(100vw - 32px), (max-width: 1360px) calc(50vw - 64px), 616px',
};

export const categoryLine = (project, lang) => `${CONTENT[lang].categories[project.category] ?? project.category} · ${project.year}${project.conceptual ? ` · ${CONTENT[lang].project.conceptual}` : ''}`;
const cardKind = (project, lang) => `${CONTENT[lang].categories[project.category] ?? project.category}${project.conceptual ? ` · ${CONTENT[lang].project.conceptual}` : ''}`;

// Shared by the card cover and the case-study hero so the View Transition can morph one into the other.
export const coverTransition = (project) => `view-transition-name:cover-${project.slug}`;

/**
 * Home layout: the first project at full width, then pairs alternating wide/narrow;
 * an odd last project closes the grid at full width.
 */
export function cardFormat(index, count) {
  if (index === 0) return 'full';
  const k = index - 1;
  if (k === count - 2 && k % 2 === 0) return 'full';
  const wideFirst = Math.floor(k / 2) % 2 === 0;
  return (k % 2 === 0) === wideFirst ? 'wide' : 'narrow';
}

export function projectCard(project, lang, { priority = false, format = 'even' } = {}) {
  const name = projectName(project, lang);
  const sizes = CARD_SIZES[format];
  const hover = project.hover ? html`<div class="card-hover" aria-hidden="true">${picture(project.hover, { alt: '', sizes })}</div>` : '';
  return html`<a class="project-card project-card--${format}" href="${projectPath(project, lang)}" data-project="${project.slug}"><div class="card-media" style="${coverTransition(project)}">${picture(project.cover, { alt: name, sizes, priority })}${hover}</div><div class="card-caption"><h3>${name}</h3><span class="card-year">${project.year}</span></div><p>${cardKind(project, lang)}</p></a>`;
}

function schema(lang, projects) {
  const t = CONTENT[lang].home;
  return graph(
    person(lang),
    website(),
    webPage({
      type: 'CollectionPage',
      path: PAGES.home[lang],
      lang,
      name: t.title,
      description: t.description,
      ...(projects[0] ? { primaryImageOfPage: { '@id': imageId(projects[0]) } } : {}),
    }),
    breadcrumbs(lang),
    itemList(
      t.listName,
      projects.map((p) => ({
        '@type': 'CreativeWork',
        name: projectName(p, lang),
        url: absoluteUrl(projectPath(p, lang)),
        ...(p.behance ? { sameAs: p.behance } : {}),
        image: { '@id': imageId(p) },
        creator: { '@id': PERSON_ID },
      })),
    ),
    ...projects.map((p) => ({
      '@type': 'ImageObject',
      '@id': imageId(p),
      contentUrl: absoluteUrl(largestUrl(p.cover)),
      url: absoluteUrl(largestUrl(p.cover)),
      name: projectName(p, lang),
      caption: `${projectName(p, lang)} — Javier Traver`,
      isPartOf: { '@id': `${absoluteUrl(projectPath(p, lang))}#work` },
      creator: { '@id': PERSON_ID },
      creditText: 'Javier Traver',
      width: p.cover.width,
      height: p.cover.height,
    })),
  );
}

/**
 * @param {'en'|'es'} lang
 * @param {object} data
 * @param {object[]} data.projects  Active projects, newest first.
 * @param {number} [data.archived]  How many earlier projects live in the archive.
 */
export function homePage(lang, { projects, archived = 0 }) {
  const t = CONTENT[lang].home;
  return layout({
    lang,
    page: 'home',
    title: t.title,
    description: t.description,
    schema: schema(lang, projects),
    // Cards are plain links to the case studies; the transition between them is a View Transition (site.css).
    body: html`${sectionIntro(lang, t.heading, t.lead)}
<div class="work-heading"><h2>${t.workTitle}<span class="work-count">${String(projects.length).padStart(2, '0')}</span></h2><span>${t.workOrder}</span></div>
<section class="project-grid project-grid--editorial" aria-label="${t.gridLabel}">${projects.map((p, i) => projectCard(p, lang, { priority: i === 0, format: cardFormat(i, projects.length) }))}</section>
${archived ? html`<p class="archive-link"><a href="${ARCHIVE_PAGE[lang]}">${t.archive} →</a></p>` : ''}
`,
  });
}
