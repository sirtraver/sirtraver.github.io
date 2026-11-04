import { PERSON_ID } from '../config.js';
import { ARCHIVE_PAGE, CONTACT_PAGE, CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { largestUrl, picture } from '../lib/picture.js';
import { ICONS } from './icons.js';
import { JOURNEY } from './journey.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';

const imageId = (project) => `${absoluteUrl('/')}#project-image-${project.slug}`;

// All portfolio cards share the same frame and responsive widths.
const CARD_SIZES = '(max-width: 560px) calc(100vw - 40px), (max-width: 1360px) calc(50vw - 64px), 616px';

export const categoryLine = (project, lang) => `${CONTENT[lang].categories[project.category] ?? project.category} · ${project.year}${project.conceptual ? ` · ${CONTENT[lang].project.conceptual}` : ''}`;

export function projectCard(project, lang, { priority = false } = {}) {
  const name = projectName(project, lang);
  return html`<a class="project-card" href="${projectPath(project, lang)}" data-project="${project.slug}"><div class="card-media">${picture(project.cover, { alt: name, sizes: CARD_SIZES, priority })}</div><div class="card-caption"><span class="card-tag">${lang === 'es' ? 'Caso' : 'Case'}</span><h3>${name}</h3><span aria-hidden="true">→</span></div><p>${categoryLine(project, lang)}</p></a>`;
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

// Large project panels: cover as background, copy on top (abhaysingh.in rhythm).
function projectPanel(project, lang, i) {
  const name = projectName(project, lang);
  const t = CONTENT[lang];
  const meta = [t.categories[project.category] ?? project.category, String(project.year), ...(project.conceptual ? [t.project.conceptual] : [])].join(' · ');
  return html`<a class="project-card" href="${projectPath(project, lang)}" data-project="${project.slug}"><div class="card-media">${picture(project.cover, { alt: name, sizes: '(max-width: 760px) calc(100vw - 32px), 1200px', priority: i === 0 })}</div><div class="card-caption"><h3>${name}</h3>${project.intro?.[lang] ? html`<span class="card-intro">${project.intro[lang]}</span>` : ''}<span class="card-cta" aria-hidden="true">${lang === 'es' ? 'Ver caso' : 'Case study'}</span>${project.deliverables[lang].length ? html`<span class="card-deliv">${project.deliverables[lang].join(' · ')}</span>` : ''}</div><p>${meta}</p></a>`;
}

/**
 * @param {'en'|'es'} lang
 * @param {object} data
 * @param {object[]} data.projects  Active projects, newest first.
 * @param {number} [data.archived]  How many earlier projects live in the archive.
 * @param {number} [data.since]  Year of the earliest project.
 */
export function homePage(lang, { projects, archived = 0, since }) {
  const t = CONTENT[lang].home;
  const a = CONTENT[lang].about;
  const es = lang === 'es';
  return layout({
    lang,
    page: 'home',
    title: t.title,
    description: t.description,
    schema: schema(lang, projects),
    mainClass: 'ab-home',
    body: html`<section class="ab-hero">
  <span class="ab-icon" aria-hidden="true"></span>
  <h1>${t.heading}</h1>
  <div class="hero-copy"><p class="ab-lead">${t.description}</p></div>
  <!-- journey:hero --><div class="hero-enquiry"><a class="enquiry-button" href="${CONTACT_PAGE[lang]}" aria-label="${JOURNEY[lang].cta}" title="${JOURNEY[lang].cta}"><span class="hero-contact-label">${JOURNEY[lang].cta}</span>${ICONS.mail}</a></div><!-- /journey:hero -->
  <a class="ab-see" href="#work">${es ? 'Ver proyectos' : 'See work'} <span aria-hidden="true">↓</span></a>
</section>
<section class="ab-work" id="work" aria-label="${t.gridLabel}">
  <h2 class="visually-hidden">${t.workTitle}</h2>
  <div class="project-grid">${projects.map((p, i) => projectPanel(p, lang, i))}</div>
  ${archived ? html`<p class="archive-link"><a href="${ARCHIVE_PAGE[lang]}">${t.archive} →</a></p>` : ''}
</section>
<section class="ab-about" aria-labelledby="about-title">
  <div class="ab-about-head"><h2 id="about-title">${a.positionTitle.join(' ')}</h2></div>
  <div class="ab-about-text"><p>${a.lead}</p><p>${a.bio}</p><p class="ab-muted">${a.currentStudy}</p><p><a class="ab-text-link" href="${PAGES.about[lang]}">${es ? 'Más sobre mí' : 'More about me'} →</a></p></div>
</section>
<section class="ab-contact" aria-labelledby="contact-title">
  <span class="ab-icon" aria-hidden="true"></span>
  <h2 id="contact-title">${JOURNEY[lang].cta}</h2>
  <a class="ab-pill" href="${CONTACT_PAGE[lang]}">${ICONS.mail}<span>${JOURNEY[lang].shortCta}</span></a>
  <p class="ab-muted">${JOURNEY[lang].response}</p>
</section>
`,
  });
}
