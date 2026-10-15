// Document shell shared by all pages: <head> metadata, header, footer.
import { ORIGIN, SHARE_IMAGE, SITE_VERIFICATION, SOCIAL } from '../config.js';
import { CONTENT, LANGUAGES, PAGES } from '../content.js';
import { assetUrl } from '../lib/assets.js';
import { html, jsonLd } from '../lib/html.js';
import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { runtime } from '../lib/runtime.js';
import { ICONS } from './icons.js';

const SOCIAL_LINKS = [
  { key: 'threads', label: 'Threads' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
];

function header(lang, page) {
  const t = CONTENT[lang];
  return html`<header class="site-header">
  <a class="brand" href="${PAGES.home[lang]}" aria-label="${t.brandLabel}"><span class="wordmark">sirtraver</span></a>
  <nav aria-label="${t.mainNavLabel}">
    ${Object.keys(PAGES).map(
      (key) => html`<a href="${PAGES[key][lang]}"${key === page ? html` aria-current="page"` : ''}>${t.nav[key]}</a>`,
    )}
  </nav>
  <div class="social-links" role="group" aria-label="${t.socialLabel}">
    ${SOCIAL_LINKS.map(
      ({ key, label }) =>
        html`<a class="social-${key}" aria-label="${label}" href="${SOCIAL[key]}" target="_blank" rel="noopener noreferrer">${ICONS[key]}<span class="social-label">${label}</span></a>`,
    )}
    <a class="social-mail" href="${SOCIAL.email}" aria-label="${t.emailLabel}" title="Email">${ICONS.mail}</a>
  </div>
</header>`;
}

function footer(lang, alternates) {
  const t = CONTENT[lang];
  return html`<footer class="site-footer">
  <div class="footer-legal">
    <span>© ${new Date().getUTCFullYear()} SIRTRAVER</span><a href="${LEGAL_PAGES.legal[lang]}">${LEGAL_CONTENT[lang].footer.legal}</a><a href="${LEGAL_PAGES.privacy[lang]}">${LEGAL_CONTENT[lang].footer.privacy}</a>
  </div>
  <span>${t.footerRole}</span>
  <div class="language-links">
    ${LANGUAGES.map((code) =>
      code === lang
        ? html`<span aria-current="true">${code.toUpperCase()}</span>`
        : html`<a href="${alternates[code]}" lang="${code}" hreflang="${code}" aria-label="${CONTENT[code].switchToThisLanguage}">${code.toUpperCase()}</a>`,
    )}
  </div>
</footer>`;
}

/**
 * @param {object} options
 * @param {'en'|'es'} options.lang
 * @param {'home'|'resources'|'about'|null} options.page  Navigation section; null for the 404.
 * @param {{en: string, es: string}} [options.alternates]  Paths of this page per language (defaults to the section).
 * @param {{url: string, width?: number, height?: number, alt: string}} [options.shareImage]  Social preview image.
 * @param {boolean} [options.canonicalPage]  false for pages without a canonical URL (404).
 * @param {string} options.title
 * @param {string} options.description
 * @param {object} [options.schema]   JSON-LD graph.
 * @param {Array<{src: string, data?: object}>} [options.scripts]
 * @param {boolean} [options.noindex]
 * @param {string} [options.mainClass]
 * @param {*} options.body
 */
export function layout({ lang, page, alternates, title, description, shareImage, schema, scripts = [], noindex = false, mainClass, body }) {
  const t = CONTENT[lang];
  const paths = alternates ?? (page ? PAGES[page] : null);
  const canonical = paths && !noindex ? ORIGIN + paths[lang] : null;
  const image = shareImage ?? { url: ORIGIN + SHARE_IMAGE.path, width: SHARE_IMAGE.width, height: SHARE_IMAGE.height, alt: t.shareImageAlt };

  return html`<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${title}</title>
${description ? html`<meta name="description" content="${description}">` : ''}
<meta name="robots" content="${noindex ? 'noindex' : 'index,follow,max-image-preview:large'}">
${canonical
  ? html`<link rel="canonical" href="${canonical}">
${LANGUAGES.map((code) => html`<link rel="alternate" hreflang="${code}" href="${ORIGIN + paths[code]}">\n`)}<link rel="alternate" hreflang="x-default" href="${ORIGIN + paths.en}">`
  : ''}
<link rel="icon" type="image/png" sizes="32x32" href="${assetUrl('/assets/favicon-32.png')}">
<link rel="apple-touch-icon" href="${assetUrl('/assets/apple-touch-icon.png')}">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assetUrl('/assets/site.css')}">
${canonical
  ? html`<meta property="og:type" content="${alternates ? 'article' : 'website'}">
<meta property="og:site_name" content="SIRTRAVER">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image.url}">
${image.width ? html`<meta property="og:image:width" content="${image.width}">
<meta property="og:image:height" content="${image.height}">
` : ''}<meta property="og:image:alt" content="${image.alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image.url}">
<meta name="twitter:image:alt" content="${image.alt}">`
  : ''}
${page === 'home' && !alternates
  ? html`<meta name="google-site-verification" content="${SITE_VERIFICATION.google}">
<meta name="msvalidate.01" content="${SITE_VERIFICATION.bing}">`
  : ''}
${schema ? jsonLd(schema) : ''}
${runtime().analytics ? html`<script defer src="${runtime().analytics.src}" data-website-id="${runtime().analytics.websiteId}"></script>` : ''}
${[{ src: '/assets/site.js' }, { src: '/assets/navigation.js' }, ...scripts].map(
  ({ src, data = {} }) =>
    html`<script defer src="${assetUrl(src)}"${Object.entries(data).map(([key, value]) => html` data-${key}="${value}"`)}></script>\n`,
)}</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
${header(lang, page)}
<main id="main"${mainClass ? html` class="${mainClass}"` : ''}>
${body}
</main>
${footer(lang, paths ?? PAGES.home)}
</body>
</html>
`;
}
