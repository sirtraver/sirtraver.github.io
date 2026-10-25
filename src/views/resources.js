import { PERSON_ID } from '../config.js';
import { CONTENT, PAGES, resourcePath } from '../content.js';
import { productSlug } from '../services/catalog.js';
import { html } from '../lib/html.js';
import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, itemList, person, webPage, website } from './schema.js';

function productCard(product, t, lang) {
  return html`<article class="project-card product-card">${
    product.image
      ? html`<img src="${product.image}" alt="${t.coverOf} ${product.title}" width="600" height="600" loading="lazy" decoding="async">`
      : ''
  }<div class="card-caption"><h2>${product.title}</h2></div><p class="product-summary">${product.summary}</p><div class="product-bottom"><span>${product.free ? t.free : product.price}</span><a href="${resourcePath(productSlug(product), lang)}">${t.viewProduct} →</a></div></article>`;
}

// Shown only when Gumroad answers successfully with an empty catalog.
function launchState(lang, subscription) {
  const t = CONTENT[lang].resources.launch;
  const status = { ok: t.success, confirm: t.confirm, confirmed: t.confirmed, error: t.error }[subscription] ?? '';
  return html`<section class="launch-state">
  <span class="launch-badge">${t.badge}</span>
  <h2>${t.title}</h2>
  <p>${t.text}</p>
  <ul class="launch-categories launch-categories--compact">${t.categories.map((name) => html`<li>${name}</li>`)}</ul>
  <form class="launch-form" method="post" action="/api/subscribe" data-enhance data-sending="${t.saving}" data-success="${t.success}" data-confirm="${t.confirm}" data-error="${t.error}" data-limited="${t.limited}">
    <input type="hidden" name="language" value="${lang}">
    <label for="launch-email">${t.emailLabel}</label>
    <div class="launch-input"><input id="launch-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="${t.placeholder}"><button type="submit">${t.submit}</button></div>
    <div class="form-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
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
    body: html`<div class="page-title"><h1>${t.heading}</h1></div>
<section id="gumroad-products" class="project-grid" aria-label="${t.gridLabel}">${content}</section>`,
  });
}
