// Static export for GitHub Pages: renders every page through the same Worker into _site/.
//  1. pages: sitemap URLs, contact, legal and thank-you pages, Gumroad product pages,
//  2. redirect stubs for legacy, archive and Behance-ID URLs (static hosts have no 301),
//  3. every public/ asset, galleries.json, sitemaps, 404.html and CNAME,
//  4. a link check: every internal href/src/srcset (and gallery image) must exist in _site/.
// Run after `npm run build`. Environment: WEB3FORMS_ACCESS_KEY (launch form),
// GUMROAD_ACCESS_TOKEN (optional; without it the catalog is taken as empty, the current state),
// PREVIEW=1 (no CNAME: the site stays at https://sirtraver.github.io/ while the DNS still points elsewhere).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../src/worker.js';
import { CANONICAL_HOST, ORIGIN } from '../src/config.js';
import { ARCHIVE_PAGE, CONTACT_PAGE, LEGACY_REDIRECTS, projectPath } from '../src/content.js';
import { assets } from '../src/generated/assets.js';
import { LEGAL_PAGES } from '../src/legal.js';
import { allProjects } from '../src/projects.js';
import { THANKS_PAGE } from '../src/views/journey.js';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = path.join(ROOT, '_site');

const env = { WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY ?? '' };
if (process.env.GUMROAD_ACCESS_TOKEN) env.GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;
else {
  env.GUMROAD_ACCESS_TOKEN = 'static-export';
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = async (input, options) =>
    new URL(typeof input === 'string' ? input : input.url).hostname === 'api.gumroad.com'
      ? Response.json({ success: true, products: [] })
      : nativeFetch(input, options);
}
if (!env.WEB3FORMS_ACCESS_KEY) console.warn('Warning: WEB3FORMS_ACCESS_KEY is not set; the launch form will post to /api/subscribe, which does not exist on static hosting.');

const get = (urlPath, init) => worker.fetch(new Request(ORIGIN + urlPath, { headers: { 'Accept-Language': 'en' }, ...init }), env, {});
const fileFor = (urlPath) => path.join(OUT, decodeURIComponent(urlPath.split('?')[0]), urlPath.split('?')[0].endsWith('/') ? 'index.html' : '');

async function write(urlPath, body) {
  const file = fileFor(urlPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

// Without response headers, the Content-Security-Policy travels in the page itself
// (frame-ancestors is header-only and is dropped).
const withCsp = (html, csp) => {
  const policy = csp.split('; ').filter((rule) => !rule.startsWith('frame-ancestors')).join('; ');
  return html.replace(/<meta charset="utf-8">/i, (tag) => `${tag}<meta http-equiv="Content-Security-Policy" content="${policy}">`);
};

async function exportPage(urlPath, source = urlPath, { status = 200 } = {}) {
  const response = await get(source);
  if (response.status !== status) throw new Error(`${source}: expected ${status}, got ${response.status}`);
  await write(urlPath, withCsp(await response.text(), response.headers.get('Content-Security-Policy')));
}

const redirectStub = (target) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${ORIGIN}${target}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body><a href="${target}">${ORIGIN}${target}</a></body>
</html>
`;

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

// 1. Pages
const sitemapXml = await (await get('/sitemap.xml')).text();
const pages = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc)).filter((url) => url.hostname === CANONICAL_HOST && url.pathname.endsWith('/')).map((url) => url.pathname),
);
for (const paths of [CONTACT_PAGE, LEGAL_PAGES.legal, LEGAL_PAGES.privacy]) for (const urlPath of Object.values(paths)) pages.add(urlPath);
for (const urlPath of pages) await exportPage(urlPath);
// Only the Resources launch form leads to the thank-you pages (the contact form is off).
for (const urlPath of Object.values(THANKS_PAGE)) await exportPage(urlPath, `${urlPath}?notice=resources`);
// Gumroad product pages, when the catalog has any.
for (const lang of ['en', 'es']) {
  const html = await (await get(lang === 'es' ? '/es/resources/' : '/resources/')).text();
  for (const [, href] of html.matchAll(/href="(\/(?:es\/)?resources\/[^"/]+\/)"/g)) if (!pages.has(href)) await exportPage(href);
}

// 2. Redirect stubs
const redirects = { ...LEGACY_REDIRECTS };
for (const archive of Object.values(ARCHIVE_PAGE)) {
  const response = await get(archive, { redirect: 'manual' });
  if (response.status === 200) await exportPage(archive);
  else redirects[archive] = new URL(response.headers.get('Location')).pathname;
}
for (const project of allProjects.filter((p) => p.id !== null)) {
  for (const lang of ['en', 'es']) redirects[`${lang === 'es' ? '/es' : ''}/projects/${project.id}/`] = projectPath(project, lang);
}
for (const [from, to] of Object.entries(redirects)) await write(from, redirectStub(to));

// 3. Assets, data and hosting files
for (const [urlPath, { base64 }] of Object.entries(assets)) await write(urlPath, Buffer.from(base64, 'base64'));
const home = await (await get('/')).text();
const galleriesUrl = home.match(/data-gallery="([^"]+)"/)?.[1] ?? '/assets/galleries.json';
const galleries = await (await get(galleriesUrl.replaceAll('&amp;', '&'))).text();
await write('/assets/galleries.json', galleries);
await write('/sitemap.xml', sitemapXml);
await write('/sitemap-portadas.xml', await (await get('/sitemap-portadas.xml')).text());
const notFound = await get('/404-not-found/');
await fs.writeFile(path.join(OUT, '404.html'), withCsp(await notFound.text(), notFound.headers.get('Content-Security-Policy')));
if (!process.env.PREVIEW) await fs.writeFile(path.join(OUT, 'CNAME'), `${CANONICAL_HOST}\n`);
await fs.writeFile(path.join(OUT, '.nojekyll'), '');

// 4. Link check
const exists = async (urlPath) => {
  try {
    const file = fileFor(urlPath);
    return (await fs.stat(file)).isFile();
  } catch {
    return false;
  }
};
const htmlFiles = [];
const walk = async (dir) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
await walk(OUT);
const broken = [];
const external = new Set();
const check = async (ref, from) => {
  const url = new URL(ref.replaceAll('&amp;', '&'), ORIGIN + '/');
  if (url.hostname !== CANONICAL_HOST) {
    if (/^https?:$/.test(url.protocol)) external.add(url.href);
    return;
  }
  if (!(await exists(url.pathname))) broken.push(`${from} → ${ref}`);
};
for (const file of htmlFiles) {
  const from = '/' + path.relative(OUT, file).split(path.sep).join('/');
  const html = await fs.readFile(file, 'utf8');
  const refs = [...html.matchAll(/\s(?:href|src|content)="([^"]+)"/g)].map((m) => m[1]).filter((ref) => /^(\/|https?:\/\/)/.test(ref));
  const srcsets = [...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((part) => part.trim().split(/\s+/)[0]));
  for (const ref of [...refs, ...srcsets]) await check(ref, from);
}
for (const ref of galleries.match(/"(\/media\/[^"]+|https?:\/\/[^"]+)"/g) ?? []) await check(ref.slice(1, -1), '/assets/galleries.json');
for (const [, loc] of sitemapXml.matchAll(/<(?:loc|image:loc)>([^<]+)</g)) await check(loc.replaceAll('&amp;', '&'), '/sitemap.xml');

const count = htmlFiles.length;
console.log(`Static export OK: ${count} HTML files (${pages.size + 2} pages, ${Object.keys(redirects).length} redirects), ${Object.keys(assets).length} assets in _site/`);
console.log(`External URLs referenced: ${external.size} (${[...new Set([...external].map((u) => new URL(u).hostname))].join(', ')})`);
if (broken.length) {
  console.error(`Broken internal links (${broken.length}):\n${broken.slice(0, 50).join('\n')}`);
  process.exit(1);
}
