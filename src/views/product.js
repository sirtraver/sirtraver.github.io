// Resource page on sirtraver.com; payment and download stay on Gumroad.
import { PERSON_ID } from '../config.js';
import { CONTENT, PAGES, resourcePath } from '../content.js';
import { html } from '../lib/html.js';
import { productSlug } from '../services/catalog.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, website } from './schema.js';
import { ORIGIN } from '../config.js';

export function productPage(product, lang) {
  const t = CONTENT[lang].resources;
  const slug = productSlug(product);
  const path = resourcePath(slug, lang);
  const price = product.free ? t.free : product.price;
  return layout({
    lang,
    page: 'resources',
    alternates: { en: resourcePath(slug, 'en'), es: resourcePath(slug, 'es') },
    title: `${product.title} | sirtraver`,
    description: product.summary || product.title,
    ...(product.image ? { shareImage: { url: product.image, alt: product.title } } : {}),
    schema: graph(
      person(lang),
      website(),
      {
        '@type': 'Product',
        '@id': `${ORIGIN}${path}#product`,
        name: product.title,
        description: product.summary,
        ...(product.image ? { image: product.image } : {}),
        brand: { '@id': PERSON_ID },
        offers: { '@type': 'Offer', url: product.url, availability: 'https://schema.org/InStock', ...(product.free ? { price: 0, priceCurrency: 'EUR' } : {}) },
      },
      breadcrumbs(lang, [[t.breadcrumb, PAGES.resources[lang]], [product.title, path]]),
    ),
    body: html`<article class="product-page">
  <a class="back-link" href="${PAGES.resources[lang]}">${t.backToResources}</a>
  <div class="product-layout">
    ${product.image ? html`<img class="product-cover" src="${product.image}" alt="${t.coverOf} ${product.title}" width="600" height="600">` : ''}
    <div class="product-info">
      <h1>${product.title}</h1>
      <p class="product-price">${price}</p>
      ${product.summary ? html`<p class="product-description">${product.summary}</p>` : ''}
      <a class="product-buy" href="${product.url}" target="_blank" rel="noopener">${t.buy}</a>
      <p class="product-note">${t.productNote}</p>
    </div>
  </div>
</article>`,
  });
}
