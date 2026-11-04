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

// Thumbnails for the rotating sphere: each cover plus two gallery images per project.
function sphereTiles(projects) {
  const tiles = projects.flatMap((p) => [p.cover, ...p.images.slice(1, 3)].map((image) => ({ image, project: p })));
  const n = tiles.length;
  return tiles.map(({ image, project }, i) => {
    // Fibonacci sphere: even spacing on the surface.
    const y = 1 - (2 * (i + 0.5)) / n;
    const lat = Math.round(Math.asin(y) * 180 / Math.PI);
    const lon = Math.round((i * 137.508) % 360);
    return html`<img class="sphere-tile" src="${imageUrl(image, 800)}" alt="${project.name}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" style="--lat:${lat}deg;--lon:${lon}deg;background-color:${image.color}">`;
  });
}

// Index rows: every project, newest first, linking to its case.
const indexRow = (p, lang) => html`<li><a href="${projectPath(p, lang)}"><span class="ix-year">’${String(p.year).slice(2)}</span><span class="ix-name">${projectName(p, lang)}</span><span class="ix-cat">${CONTENT[lang].categories[p.category] ?? p.category}${p.conceptual ? ` · ${CONTENT[lang].project.conceptual}` : ''}</span><span class="ix-deliv">${p.deliverables[lang].join(', ')}</span></a></li>`;

/**
 * @param {'en'|'es'} lang
 * @param {object} data
 * @param {object[]} data.projects  Active projects, newest first.
 * @param {object[]} [data.earlier]  Archived projects, newest first.
 * @param {number} [data.archived]  How many earlier projects live in the archive.
 * @param {number} [data.since]  Year of the earliest project.
 */
export function homePage(lang, { projects, earlier = [], archived = 0, since }) {
  const t = CONTENT[lang].home;
  const es = lang === 'es';
  const latest = Math.max(...projects.map((p) => p.year));
  const span = since ? `${String(since).slice(2)}–${String(latest).slice(2)}` : '';
  const all = [...projects, ...earlier].sort((a, b) => b.year - a.year);
  return layout({
    lang,
    page: 'home',
    title: t.title,
    description: t.description,
    schema: schema(lang, projects),
    scripts: [{ src: '/assets/motion.js' }],
    mainClass: 'bg-home',
    body: html`<section class="bg-hero">
  <div class="bg-axis" aria-hidden="true"></div>
  <span class="bg-avatar" aria-hidden="true"></span>
  <p class="bg-meta bg-meta--role">Visual Designer<br>&amp; Marketing</p>
  <p class="bg-meta bg-meta--place">${es ? 'Basado en Madrid' : 'Based in Madrid'}<br>${es ? 'Identidad · Packaging · Comunicación' : 'Identity · Packaging · Communication'}</p>
  <h1 class="bg-name"><span>Javier</span> <span>Traver</span></h1>
  <p class="bg-lines"><span class="visually-hidden">${t.heading} ${t.lead}</span>${(es ? [['l', 'Identidades'], ['l', 'con'], ['l', 'carácter.'], ['a', 'Del logotipo'], ['a', 'al packaging'], ['a', 'y la comuni-'], ['f', 'cación visual.']] : [['l', 'Identity'], ['l', 'with'], ['l', 'character.'], ['a', 'From the logo'], ['a', 'to packaging'], ['a', 'and visual'], ['f', 'communication.']]).map(([pos, text]) => html`<span class="bg-line bg-line--${pos}" aria-hidden="true">${text}</span>`)}</p>
  <div class="bg-hero-foot">
    <div class="hero-copy"><p class="bg-desc">${t.description}</p></div>
    <!-- journey:hero --><div class="hero-enquiry"><a class="enquiry-button" href="${CONTACT_PAGE[lang]}" aria-label="${JOURNEY[lang].cta}" title="${JOURNEY[lang].cta}"><span class="hero-contact-label">${JOURNEY[lang].cta}</span>${ICONS.mail}</a></div><!-- /journey:hero -->
    <p class="bg-year">© ’${String(new Date().getUTCFullYear()).slice(2)}</p>
  </div>
</section>
<section class="bg-sphere-wrap" aria-labelledby="work-title">
  <div class="bg-sphere-head"><h2 id="work-title">${CONTENT[lang].nav.home}</h2><span aria-hidden="true">${span}</span></div>
  <div class="bg-sphere" aria-hidden="true"><div class="bg-sphere-rot">${sphereTiles(projects)}</div></div>
</section>
<section class="bg-work" aria-label="${t.gridLabel}">
  <div class="project-grid">${projects.map((p, i) => projectCard(p, lang, { priority: i === 0 }))}</div>
  ${archived ? html`<p class="archive-link"><a href="${ARCHIVE_PAGE[lang]}">${t.archive}</a></p>` : ''}
</section>
<section class="bg-index" aria-labelledby="index-title">
  <h2 id="index-title" class="bg-index-title"><span>${es ? 'Índice' : 'Index'}</span><span class="bg-amp">&amp;</span><span>${es ? 'Proyec-' : 'Pro-'}</span><span>${es ? 'tos' : 'jects'}</span></h2>
  <ol class="bg-index-list">${all.map((p) => indexRow(p, lang))}</ol>
</section>
<section class="bg-close" aria-labelledby="close-title">
  <h2 id="close-title" class="bg-close-lines"><span class="bg-line bg-line--l">${es ? 'Hablemos' : 'Let’s talk'}</span><span class="bg-line bg-line--l">${es ? 'de tu' : 'about your'}</span><span class="bg-line bg-line--a">${es ? 'proyecto.' : 'project.'}</span></h2>
  <p class="bg-clock" aria-hidden="true"><span>(</span><span class="bg-clock-h">--</span><span>:</span><span class="bg-clock-mark"></span><span>:</span><span class="bg-clock-m">--</span><span>)</span></p>
  <div class="bg-close-info"><p><strong>Javier Traver</strong><br>Madrid, ES</p><p>${JOURNEY[lang].response}</p><a class="bg-link" href="${CONTACT_PAGE[lang]}">${JOURNEY[lang].shortCta} →</a></div>
</section>
`,
  });
}
