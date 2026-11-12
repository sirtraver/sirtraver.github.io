import { PERSON_ID } from '../config.js';
import { CONTENT, PAGES, resourcePath } from '../content.js';
import { productSlug } from '../services/catalog.js';
import { html } from '../lib/html.js';
import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';
import { THANKS_PAGE } from './journey.js';
import { ORIGIN } from '../config.js';
import { runtime } from '../lib/runtime.js';
import { sectionIntro } from './section-intro.js';

// Same card as the portfolio (home.js projectCard): cover, name with the price where the year goes, and a tag.
function productCard(product, t, lang) {
  const slug = productSlug(product);
  const image = product.cover || product.image;
  return html`<a class="project-card" href="${resourcePath(slug, lang)}" data-project="resource-${slug}"><div class="card-media">${
    image ? html`<img src="${image}" alt="${t.coverOf} ${product.title}" width="1200" height="800" loading="lazy" decoding="async">` : ''
  }</div><div class="card-caption"><h3>${product.title}</h3><span class="card-year">${product.free ? t.free : product.price}</span></div><p>${t.cardKind}</p></a>`;
}

// Shown only when Gumroad answers successfully with an empty catalog.
function launchState(lang, subscription) {
  const t = CONTENT[lang].resources.launch;
  const status = { ok: t.success, confirm: t.confirm, confirmed: t.confirmed, error: t.error }[subscription] ?? '';
  const form = runtime().waitlistForm;
  return html`<section class="launch-state">
  <div class="launch-copy">
  <span class="launch-badge">${t.badge}</span>
  <h2>${t.title}</h2>
  <p>${t.text}</p>
  <ul class="launch-categories launch-categories--compact">${t.categories.map((name) => html`<li>${name}</li>`)}</ul>
  </div>
  <form class="launch-form" method="post" action="${form ? form.action : '/api/subscribe'}" data-enhance data-redirect="${THANKS_PAGE[lang]}?notice=resources" data-sending="${t.saving}" data-success="${t.success}" data-confirm="${t.confirm}" data-error="${t.error}" data-limited="${t.limited}">
    <input type="hidden" name="language" value="${lang}">
    ${form ? html`<input type="hidden" name="access_key" value="${form.accessKey}">
    <input type="hidden" name="subject" value="sirtraver.com · Aviso de lanzamiento de Recursos (${lang.toUpperCase()})">
    <input type="hidden" name="from_name" value="sirtraver.com">
    <input type="hidden" name="redirect" value="${ORIGIN}${THANKS_PAGE[lang]}">
    ` : ''}<label for="launch-email">${t.emailLabel}</label>
    <div class="launch-input"><input id="launch-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="${t.placeholder}"><button type="submit">${t.submit}</button></div>
    <div class="form-trap" aria-hidden="true"><label>Website<input name="${form ? 'botcheck' : 'website'}" tabindex="-1" autocomplete="off"></label></div>
    <label class="launch-consent"><input name="consent" type="checkbox" required> <span>${t.consent}</span></label>
    <p class="launch-privacy">${t.privacy} <a href="${LEGAL_PAGES.privacy[lang]}">${LEGAL_CONTENT[lang].privacy.heading}</a>.</p>
    <p role="status" aria-live="polite">${status}</p>
  </form>
</section>`;
}

function schema(lang, catalog) {
  const t = CONTENT[lang].resources;
  const nodes = [
    person(lang),
    website(),
    webPage({ type: 'CollectionPage', path: PAGES.resources[lang], lang, name: t.title, description: t.description }),
    breadcrumbs(lang, [[t.breadcrumb, PAGES.resources[lang]]]),
  ];
  if (catalog.products.length) {
    nodes.push(
      itemList(
        t.listName,
        catalog.products.map((p) => ({
          '@type': 'CreativeWork',
          name: p.title,
          url: p.url,
          ...(p.image ? { image: p.image } : {}),
          creator: { '@id': PERSON_ID },
        })),
      ),
    );
  }
  return graph(...nodes);
}

/**
 * @param {'en'|'es'} lang
 * @param {{status: string, products: object[]}} catalog
 * @param {string|null} subscription  Result of a no-JavaScript form submission ('ok' | 'error').
 */
export function resourcesPage(lang, catalog, subscription = null) {
  const t = CONTENT[lang].resources;
  const isLaunch = catalog.status === 'ok' && catalog.products.length === 0;

  let content;
  if (catalog.status !== 'ok') content = html`<p class="catalog-status">${t.unavailable}</p>`;
  else if (isLaunch) content = launchState(lang, subscription);
  else content = catalog.products.map((p) => productCard(p, t, lang));

  return layout({
    lang,
    page: 'resources',
    title: t.title,
    description: t.description,
    schema: schema(lang, catalog),
    scripts: isLaunch ? [{ src: '/assets/forms.js' }] : [],
    body: html`${sectionIntro(lang, t.heading, t.lead)}
<div class="work-heading"><h2>${t.libraryTitle}${catalog.status === 'ok' && catalog.products.length ? html`<span class="work-count">${String(catalog.products.length).padStart(2, '0')}</span>` : ''}</h2><span>${t.libraryTypes}</span></div>
<section id="gumroad-products" class="${isLaunch || catalog.status !== 'ok' ? 'project-grid' : 'project-grid project-grid--editorial'}" aria-label="${t.gridLabel}"${isLaunch || catalog.status !== 'ok' ? '' : html` data-cursor-label="${t.viewProduct}"`}>${content}</section>`,
  });
}
