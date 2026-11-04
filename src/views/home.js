import { PERSON_ID } from '../config.js';
import { ARCHIVE_PAGE, CONTACT_PAGE, CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { imageUrl, largestUrl, picture } from '../lib/picture.js';
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
  return html`<a class="project-card" href="${projectPath(project, lang)}" data-project="${project.slug}"><div class="card-media">${picture(project.cover, { alt: name, sizes: CARD_SIZES, priority })}</div><div class="card-caption"><h3>${name}</h3><span aria-hidden="true">→</span></div><p>${categoryLine(project, lang)}</p></a>`;
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

// Hero covers: small eager images, fanned out by /assets/motion.js while scrolling.
const stackImage = (project, lang, i) => {
  const cover = project.cover;
  const set = cover.src ? '' : cover.webp.filter(([, w]) => w <= 1600).map(([url, w]) => `${url} ${w}w`).join(', ');
  return html`<img class="mx-stack-item" src="${imageUrl(cover, 800)}"${set ? html` srcset="${set}" sizes="(max-width: 700px) 62vw, 30vw"` : ''} alt="${projectName(project, lang)}" width="${cover.width}" height="${cover.height}" decoding="async"${i === 0 ? html` fetchpriority="high"` : ''} style="--i:${i};background-color:${cover.color}">`;
};

/**
 * @param {'en'|'es'} lang
 * @param {object} data
 * @param {object[]} data.projects  Active projects, newest first.
 * @param {number} [data.archived]  How many earlier projects live in the archive.
 * @param {number} [data.since]  Year of the earliest project.
 */
export function homePage(lang, { projects, archived = 0, since }) {
  const t = CONTENT[lang].home;
  const years = since ? `© ${since}–${String(new Date().getUTCFullYear()).slice(2)}` : '';
  const words = `${t.heading} ${t.lead}`.split(/\s+/);
  return layout({
    lang,
    page: 'home',
    title: t.title,
    description: t.description,
    schema: schema(lang, projects),
    scripts: [{ src: '/assets/motion.js' }],
    mainClass: 'mx-home',
    body: html`<section class="mx-hero">
  <div class="hero-copy">
    <p class="mx-intro"><strong>SIRTRAVER</strong> — ${t.description}</p>
    <!-- journey:hero --><div class="hero-enquiry"><a class="enquiry-button" href="${CONTACT_PAGE[lang]}" aria-label="${JOURNEY[lang].cta}" title="${JOURNEY[lang].cta}"><span class="hero-contact-label">${JOURNEY[lang].cta}</span>${ICONS.mail}</a></div><!-- /journey:hero -->
  </div>
  <div class="mx-stack" aria-hidden="true">${[...projects].reverse().map((p, i) => stackImage(p, lang, projects.length - 1 - i))}</div>
  ${years ? html`<p class="mx-years">${years}</p>` : ''}
  <h1 class="mx-giant">SIRTRAVER</h1>
</section>
<section class="mx-statement" aria-label="${t.overline}">
  <p class="mx-words">${words.map((w, i) => html`<span class="mx-w" style="--w:${i}">${w}</span> `)}</p>
</section>
<section class="mx-work" aria-labelledby="work-title">
  <div class="mx-work-head"><h2 id="work-title">${t.workTitle}</h2><span>${String(projects.length).padStart(2, '0')}</span></div>
  <div class="project-grid" aria-label="${t.gridLabel}">${projects.map((p) => projectCard(p, lang))}</div>
  ${archived ? html`<p class="archive-link"><a href="${ARCHIVE_PAGE[lang]}">${t.archive} →</a></p>` : ''}
</section>
`,
  });
}
