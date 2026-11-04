// Cloudflare Worker entry: routing, server-rendered pages, redirects and APIs.
import { ALIAS_HOSTS, CANONICAL_HOST } from './config.js';
import { ARCHIVE_PAGE, CONTACT_PAGE, LEGACY_REDIRECTS, PAGES, languageOf, projectPath, resourcePath } from './content.js';
import { buildDate } from './generated/assets.js';
import { contentHash } from './generated/content.js';
import { getAsset } from './lib/assets.js';
import { configure } from './lib/runtime.js';
import { storageEnv } from './lib/storage.js';
import { languagePreferenceResponse } from './lib/language.js';
import { SECURITY_HEADERS, emptyResponse, htmlResponse, jsonResponse, redirect } from './lib/http.js';
import { catalogApi, getCatalog, productSlug } from './services/catalog.js';
import { activeProjects, archivedProjects, findProject } from './projects.js';
import { contact } from './services/contact.js';
import { subscribe, waitlistAdmin } from './services/waitlist.js';
import { aboutPage } from './views/about.js';
import { cvPage } from './views/cv.js';
import { contactPage } from './views/contact-page.js';
import { productPage } from './views/product.js';
import { homePage } from './views/home.js';
import { notFoundPage } from './views/not-found.js';
import { legalPage } from './views/legal.js';
import { LEGAL_PAGES } from './legal.js';
import { archivePage } from './views/archive.js';
import { projectPage } from './views/project.js';
import { resourcesPage } from './views/resources.js';
import { coverSitemap, sitemap } from './views/sitemap.js';
import { THANKS_PAGE } from './views/journey.js';
import { thankYouPage } from './views/thank-you.js';

const PAGE_ROUTES = new Map(
  Object.entries({ ...PAGES, ...LEGAL_PAGES, archive: ARCHIVE_PAGE, contact: CONTACT_PAGE, thanks: THANKS_PAGE }).flatMap(([page, paths]) =>
    Object.entries(paths).map(([lang, path]) => [path, { page, lang }]),
  ),
);

// Canonical curriculum URLs retain an explicit document language.
PAGE_ROUTES.set('/cv/', { page: 'cv', lang: 'es' });
PAGE_ROUTES.set('/resume/', { page: 'cv', lang: 'en' });

// Gallery data for the home page viewer, keyed by project slug.
const GALLERIES_PATH = '/assets/galleries.json';
const galleryVersion = `${contentHash}-v3`;
const galleriesUrl = `${GALLERIES_PATH}?v=${galleryVersion}`;
// (The viewer takes each project's title from its card, already in the page language.)
const galleries = () =>
  Object.fromEntries(activeProjects.map((p) => [p.slug, { category: p.category, year: p.year, deliverables: p.deliverables, tools: p.tools, conceptual: p.conceptual, intro: p.intro, caseStudy: p.caseStudy, images: p.images }]));

const withSlash = (path) => (path.endsWith('/') ? path : `${path}/`);

async function renderPage({ page, lang }, request, url, env, ctx) {
  switch (page) {
    case 'thanks':
      return htmlResponse(request, thankYouPage(lang, url.searchParams.get('notice') === 'resources'), { noindex: true });
    case 'home':
      return htmlResponse(
        request,
        homePage(lang, { projects: activeProjects, galleriesUrl, archived: archivedProjects.length }),
      );
    case 'archive':
      return archivedProjects.length ? htmlResponse(request, archivePage(lang, archivedProjects)) : redirect(new URL(PAGES.home[lang], url).href);
    case 'resources':
      return htmlResponse(request, resourcesPage(lang, await getCatalog(env), url.searchParams.get('subscription')));
    case 'cv':
      return htmlResponse(request, cvPage(lang));
    case 'about':
      return htmlResponse(request, aboutPage(lang));
    case 'contact':
      return htmlResponse(request, contactPage(lang, url.searchParams.get('sent')));
    case 'legal':
    case 'privacy':
      return htmlResponse(request, legalPage(page, lang));
  }
}

function serveAsset(request, url, asset) {
  const versioned = url.searchParams.get('v') === asset.hash || url.pathname.startsWith('/media/');
  return new Response(request.method === 'HEAD' ? null : asset.bytes, {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': asset.type,
      ...(asset.type === 'application/pdf' ? { 'Content-Disposition': `attachment; filename="${url.pathname.split('/').pop()}"`, 'X-Robots-Tag': 'noindex' } : {}),
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    },
  });
}

const notFound = (request, path) => htmlResponse(request, notFoundPage(languageOf(path)), { status: 404, noindex: true });

async function route(request, url, env, ctx) {
  if (ALIAS_HOSTS.includes(url.hostname)) {
    url.hostname = CANONICAL_HOST;
    return redirect(url.href);
  }

  // Write endpoints handle their own methods.
  if (url.pathname === '/api/subscribe') return subscribe(request, env);
  if (url.pathname === '/api/contact') return contact(request, env, ctx);
  if (url.pathname === '/api/waitlist-admin') return waitlistAdmin(request, env);

  if (request.method !== 'GET' && request.method !== 'HEAD') return emptyResponse(405, { Allow: 'GET, HEAD' });

  const languageResponse = languagePreferenceResponse(request, url);
  if (languageResponse) return languageResponse;

  if (url.pathname === '/api/catalogo-gumroad') return catalogApi(env);
  if (url.pathname === GALLERIES_PATH) {
    const cache = url.searchParams.get('v') === galleryVersion ? 'public, max-age=31536000, immutable' : 'public, max-age=300';
    return jsonResponse(galleries(), { cache });
  }

  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return notFound(request, '/');
  }

  // One hop to the canonical URL: strip index.html, add the trailing slash, follow legacy paths.
  const directory = path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
  const target = LEGACY_REDIRECTS[withSlash(directory)] ?? (PAGE_ROUTES.has(withSlash(directory)) ? withSlash(directory) : null);
  if (target && target !== path) return redirect(new URL(target, url).href);

  const route = PAGE_ROUTES.get(path);
  if (route) {
    const response = await renderPage(route, request, url, env, ctx);
    if (path === '/') response.headers.set('Vary', 'Cookie, Accept-Language');
    return response;
  }

  // Project pages: /projects/<slug>/. Old numeric URLs redirect to the slug.
  const projectRoute = path.match(/^\/(es\/)?projects\/([^/]+)(\/?)$/);
  if (projectRoute) {
    const [, es, key] = projectRoute;
    const lang = es ? 'es' : 'en';
    const project = findProject(key);
    if (project) {
      const canonical = projectPath(project, lang);
      if (path !== canonical) return redirect(new URL(canonical, url).href);
      const siblings = project.archived ? archivedProjects : activeProjects;
      return htmlResponse(request, projectPage(project, siblings, lang));
    }
  }
  // Resource pages: /resources/<slug>/ (old /resources/product/<slug>/ URLs redirect here).
  const productRoute = path.match(/^\/(es\/)?resources\/(?:product\/)?([^/]+)\/?$/);
  if (productRoute) {
    const lang = productRoute[1] ? 'es' : 'en';
    const product = (await getCatalog(env)).products.find((p) => productSlug(p) === productRoute[2]);
    if (product) {
      const canonical = resourcePath(productRoute[2], lang);
      if (path !== canonical) return redirect(new URL(canonical, url).href);
      return htmlResponse(request, productPage(product, lang));
    }
  }

  if (path === '/sitemap.xml' || path === '/sitemap-portadas.xml') {
    const xml = path === '/sitemap-portadas.xml' ? coverSitemap([...activeProjects, ...archivedProjects], buildDate) : sitemap(activeProjects, archivedProjects, buildDate);
    return new Response(request.method === 'HEAD' ? null : xml, {
      headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  const asset = getAsset(path);
  if (asset) return serveAsset(request, url, asset);

  return notFound(request, path);
}

export default {
  async fetch(request, env = {}, ctx = {}) {
    env = storageEnv(env);
    configure(env);
    const url = new URL(request.url);
    const response = await route(request, url, env, ctx);
    // Preview hosts (workers.dev, localhost) must never compete with sirtraver.com in search results.
    if (url.hostname === CANONICAL_HOST) return response;
    const preview = new Response(response.body, response);
    preview.headers.set('X-Robots-Tag', 'noindex');
    return preview;
  },
};
