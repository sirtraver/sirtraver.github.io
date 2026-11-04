import { PERSON_ID } from '../config.js';
import { ARCHIVE_PAGE, CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { largestUrl, picture } from '../lib/picture.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';
import { sectionIntro } from './section-intro.js';

const imageId = (project) => `${absoluteUrl('/')}#project-image-${project.slug}`;

// All portfolio cards share the same frame and responsive widths.
const CARD_SIZES = '(max-width: 560px) calc(100vw - 40px), (max-width: 1360px) calc(50vw - 64px), 616px';

export const categoryLine = (project, lang) => `${CONTENT[lang].categories[project.category] ?? project.category} · ${project.year}${project.conceptual ? ` · ${CONTENT[lang].project.conceptual}` : ''}`;

export function projectCard(project, lang, { priority = false } = {}) {
  const name = projectName(project, lang);
  return html`<a class="project-card" href="${projectPath(project, lang)}" data-project="${project.slug}"><div class="card-media">${picture(project.cover, { alt: name, sizes: CARD_SIZES, priority })}</div><div class="card-caption"><h3>${name}</h3><span aria-hidden="true">↗</span></div><p>${categoryLine(project, lang)}</p></a>`;
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
 * @param {string} data.galleriesUrl  Versioned URL of the viewer's gallery data.
 * @param {number} [data.archived]  How many earlier projects live in the archive.
 */
export function homePage(lang, { projects, galleriesUrl, archived = 0 }) {
  const t = CONTENT[lang].home;
  return layout({
    lang,
    page: 'home',
    title: t.title,
    description: t.description,
    schema: schema(lang, projects),
    scripts: [{ src: '/assets/image-zoom.js' }, { src: '/assets/project-viewer.js', data: { gallery: galleriesUrl } }],
    body: html`${sectionIntro(lang, t.heading, t.lead)}
<div class="work-heading"><h2>${t.workTitle}<span class="work-count">${String(projects.length).padStart(2, '0')}</span></h2><span>${t.workOrder}</span></div>
<section class="project-grid" aria-label="${t.gridLabel}">${projects.map((p, i) => projectCard(p, lang, { priority: i === 0 }))}</section>
${archived ? html`<p class="archive-link"><a href="${ARCHIVE_PAGE[lang]}">${t.archive} →</a></p>` : ''}
`,
  });
}
