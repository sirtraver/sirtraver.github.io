import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { ORIGIN, get, offline, resetCaches, withFetch } from './helpers.mjs';
import { activeProjects, allProjects, archivedProjects } from '../src/projects.js';
import { largestUrl } from '../src/lib/picture.js';

beforeEach(resetCaches);

const ROUTES = {
  en: ['/', '/resources/', '/about/'],
  es: ['/es/', '/es/resources/', '/es/about/'],
};

const render = (path) => withFetch(offline, async () => (await get(path, { GUMROAD_ACCESS_TOKEN: 'seo' })).text());
const jsonLdBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

test('every page has its own title, one h1, canonical, reciprocal hreflang and social metadata', async () => {
  const titles = new Set();
  for (const [lang, paths] of Object.entries(ROUTES)) {
    for (const [index, path] of paths.entries()) {
      const html = await render(path);
      assert.ok(html.includes(`<html lang="${lang}">`), path);
      assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}${path}">`), path);
      assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${ORIGIN}${ROUTES.en[index]}">`), path);
      assert.ok(html.includes(`<link rel="alternate" hreflang="es" href="${ORIGIN}${ROUTES.es[index]}">`), path);
      assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${ROUTES.en[index]}">`), path);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
      assert.match(html, /<meta property="og:image" content="https:\/\/sirtraver\.com\/assets\/share-sirtraver\.png">/);
      assert.match(html, /<meta name="description" content="[^"]{50,}">/);
      assert.equal((html.match(/https:\/\/www\.threads\.com\/@sirtraver/g) || []).length, index === 2 ? 2 : 1, 'profile card when present and JSON-LD sameAs');
      assert.equal((html.match(/https:\/\/www\.instagram\.com\/sirtraver\//g) || []).length, index === 2 ? 2 : 1);
      assert.equal(html.includes('mailto:javier.traver.v@me.com'), index === 2);
      assert.ok(html.includes('aria-current="page"'), 'active navigation is rendered server-side');
      titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
    }
  }
  assert.equal(titles.size, 6);
});

test('structured data parses, identifies the person and contains no HTML entities', async () => {
  for (const path of [...ROUTES.en, ...ROUTES.es]) {
    const html = await render(path);
    const blocks = jsonLdBlocks(html);
    assert.equal(blocks.length, 1, path);
    const data = JSON.parse(blocks[0]);
    assert.ok(data['@graph'].some((node) => node['@id'] === `${ORIGIN}/#javier-traver`));
    assert.ok(!blocks[0].includes('&amp;'), path);
  }
  const home = JSON.parse(jsonLdBlocks(await render('/'))[0]);
  const list = home['@graph'].find((node) => node['@type'] === 'ItemList');
  assert.equal(list.itemListElement.length, activeProjects.length);
});

test('descriptions do not start with the uppercase overline', async () => {
  for (const path of ['/', '/es/', '/resources/', '/es/resources/']) {
    const description = (await render(path)).match(/<meta name="description" content="([^"]*)">/)[1];
    assert.ok(!description.startsWith('JAVIER TRAVER'), path);
    assert.ok(!/^(Resources|Recursos)\b/.test(description), path);
  }
});

test('the sitemap lists pages and project pages with alternates and all gallery images', async () => {
  const response = await withFetch(offline, () => get('/sitemap.xml'));
  assert.equal(response.headers.get('Content-Type'), 'application/xml; charset=utf-8');
  const xml = await response.text();
  for (const path of [...ROUTES.en, ...ROUTES.es]) assert.ok(xml.includes(`<loc>${ORIGIN}${path}</loc>`), path);
  assert.equal((xml.match(/<url>/g) || []).length, 8 + allProjects.length * 2 + (archivedProjects.length ? 2 : 0));
  assert.ok(xml.includes(`<loc>${ORIGIN}/es/projects/kudake/</loc>`));
  assert.ok(!xml.includes('behance.net'), 'the sitemap only lists images hosted on sirtraver.com');
  for (const [, loc] of xml.matchAll(/<image:loc>([^<]+)</g)) assert.ok(loc.startsWith(`${ORIGIN}/`), loc);
  assert.ok(xml.includes(`${ORIGIN}/media/kudake/`));
  // 8 covers + 1 portrait per language on the main pages, 96 gallery images per language.
  assert.equal((xml.match(/<image:image>/g) || []).length, 2 * (activeProjects.length + 1 + allProjects.length + allProjects.reduce((sum, p) => sum + p.images.length, 0)));
  assert.ok(xml.includes('hreflang="x-default"'));
  assert.match(xml, /\/media\/colorsplash\/cover-2400\.[0-9a-f]+\.webp/, 'largest cover is listed');
});

test('the cover sitemap associates each public cover with its own project URL', async () => {
  const response = await get('/sitemap-portadas.xml');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/xml; charset=utf-8');
  assert.equal(response.headers.get('X-Robots-Tag'), null);
  const xml = await response.text();
  assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
  assert.equal((xml.match(/<url>/g) || []).length, allProjects.length);
  assert.equal((xml.match(/<image:image>/g) || []).length, allProjects.length);
  for (const project of allProjects) {
    const entry = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m => m[1].includes(`<loc>${ORIGIN}/es/projects/${project.slug}/</loc>`))?.[1];
    assert.ok(entry, project.slug);
    assert.ok(entry.includes(`<image:loc>${ORIGIN}${largestUrl(project.cover)}</image:loc>`));
    assert.ok(entry.includes(`hreflang="en" href="${ORIGIN}/projects/${project.slug}/"`));
  }
  const robots = await (await get('/robots.txt')).text();
  assert.ok(robots.includes(`Sitemap: ${ORIGIN}/sitemap-portadas.xml`));
});

test('project metadata identifies the selected cover as its primary preview', async () => {
  for (const lang of ['en', 'es']) for (const project of allProjects) {
    const path = `${lang === 'es' ? '/es' : ''}/projects/${project.slug}/`;
    const html = await render(path);
    const nodes = JSON.parse(jsonLdBlocks(html)[0])['@graph'];
    const page = nodes.find(node => node['@type'] === 'WebPage');
    const work = nodes.find(node => node['@type'] === 'CreativeWork');
    const cover = nodes.find(node => node['@id'] === `${ORIGIN}${path}#cover`);
    assert.equal(cover.contentUrl, ORIGIN + largestUrl(project.cover));
    assert.equal(page.primaryImageOfPage['@id'], cover['@id']);
    assert.equal(work.thumbnailUrl, cover.contentUrl);
    assert.equal(work.image[0]['@id'], cover['@id']);
    assert.equal(cover.isPartOf['@id'], work['@id']);
    assert.ok(cover.width > 0 && cover.height > 0);
  }
});

test('preview hosts are kept out of search results', async () => {
  const worker = (await import('../src/worker.js')).default;
  const response = await withFetch(offline, () => worker.fetch(new Request('https://sirtraver.sirtraver.workers.dev/about/'), {}, {}));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  assert.equal((await get('/about/')).headers.get('X-Robots-Tag'), null);
});

test('robots.txt points to the sitemap and keeps APIs out', async () => {
  const text = await (await get('/robots.txt')).text();
  assert.ok(text.includes('Disallow: /api/'));
  assert.ok(text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`));
});
