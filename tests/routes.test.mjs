import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import { ORIGIN, get, gumroadProduct, offline, resetCaches, withFetch } from './helpers.mjs';

beforeEach(resetCaches);

const PAGES = ['/', '/resources/', '/about/', '/es/', '/es/resources/', '/es/about/'];

test('all pages render with security headers and no-cache HTML', async () => {
  await withFetch(offline, async () => {
    for (const path of PAGES) {
      const response = await get(path, { GUMROAD_ACCESS_TOKEN: 'routes' });
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('Content-Type'), 'text/html; charset=utf-8');
      assert.equal(response.headers.get('Cache-Control'), 'no-cache');
      assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
      assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    }
  });
});

test('legacy and non-canonical URLs reach the canonical page in one redirect', async () => {
  const cases = [
    ['/portfolio', '/'],
    ['/portfolio/', '/'],
    ['/es/portfolio/', '/es/'],
    ['/recursos/', '/resources/'],
    ['/recursos/brief-claro/', '/resources/'],
    ['/sobre-mi/', '/about/'],
    ['/index.html', '/'],
    ['/about/index.html', '/about/'],
    ['/es/index.html', '/es/'],
    ['/portfolio/index.html', '/'],
    ['/about', '/about/'],
    ['/es', '/es/'],
  ];
  for (const [from, to] of cases) {
    const response = await get(from);
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('Location'), ORIGIN + to, from);
  }
});

test('duplicate hosts redirect to sirtraver.com', async () => {
  for (const host of ['https://www.sirtraver.com', 'https://sirtraver.sirtraver.chatgpt.site']) {
    const response = await (await import('../src/worker.js')).default.fetch(new Request(`${host}/portfolio/`), {}, {});
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), `${ORIGIN}/portfolio/`);
  }
});

test('unknown URLs return a real, localized, noindex 404', async () => {
  for (const [path, lang] of [['/missing/', 'en'], ['/es/missing/', 'es'], ['/project-template.html', 'en']]) {
    const response = await get(path);
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
    const html = await response.text();
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes('<meta name="robots" content="noindex">'));
  }
});

test('write methods are rejected on pages', async () => {
  const response = await get('/', {}, {}, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, HEAD');
});

test('HEAD returns headers without a body', async () => {
  await withFetch(offline, async () => {
    const response = await get('/about/', {}, {}, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
  });
});

test('versioned assets are cached forever; referenced assets exist', async () => {
  const html = await (await get('/about/')).text();
  const urls = [...html.matchAll(/(?:href|src)="(\/assets\/[^"]+\?v=[0-9a-f]{12})"/g)].map((m) => m[1]);
  assert.ok(urls.some((u) => u.startsWith('/assets/site.css?v=')));
  for (const url of urls) {
    const response = await get(url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
  }
  const plain = await get('/assets/site.css');
  assert.equal(plain.headers.get('Cache-Control'), 'public, max-age=3600');
  assert.equal(plain.headers.get('Content-Type'), 'text/css; charset=utf-8');
});

test('resources: products, launch form and unavailable state are distinct', async () => {
  const env = { GUMROAD_ACCESS_TOKEN: 'resources' };

  await withFetch(async () => Response.json({ success: true, products: [gumroadProduct(), gumroadProduct({ id: 'draft', published: false, name: 'Private draft' })] }), async () => {
    const html = await (await get('/resources/', env)).text();
    assert.match(html, /<h2>Live product<\/h2>/);
    assert.ok(html.includes('Imported summary'));
    assert.ok(!html.includes('Private draft'));
    assert.ok(!html.includes('class="launch-form"'));
    assert.ok(html.includes('"@type":"ItemList"'));
    const spanish = await (await get('/es/resources/', env)).text();
    assert.ok(spanish.includes('<a href="/es/resources/live/">Ver recurso →</a>'));
  });

  resetCaches();
  await withFetch(async () => Response.json({ success: true, products: [] }), async () => {
    const html = await (await get('/resources/', env)).text();
    assert.ok(html.includes('Canva templates'));
    assert.ok(html.includes('class="launch-form" method="post" action="/api/subscribe"'));
    assert.ok(html.includes('/assets/forms.js?v='));
    assert.ok(!html.includes('DEMO'));
    const confirmed = await (await get('/resources/?subscription=ok', env)).text();
    assert.ok(confirmed.includes('You’re on the list.'));
  });

  resetCaches();
  const unavailable = await (await get('/resources/', {})).text();
  assert.ok(unavailable.includes('class="catalog-status"'));
  assert.ok(!unavailable.includes('class="launch-form"'));
});

test('the bundled worker behaves like the source', async () => {
  const source = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8');
  const { default: bundled } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  await withFetch(offline, async () => {
    for (const path of PAGES) {
      const response = await bundled.fetch(new Request(ORIGIN + path), { GUMROAD_ACCESS_TOKEN: 'bundle' }, {});
      assert.equal(response.status, 200, path);
    }
    const redirect = await bundled.fetch(new Request(`${ORIGIN}/sobre-mi/`), {}, {});
    assert.equal(redirect.headers.get('Location'), `${ORIGIN}/about/`);
  });
});

test('social and email links live in About instead of the header or duplicated calls to action', async () => {
  for (const path of ['/', '/es/projects/kudake/', '/es/about/']) {
    const html = await (await get(path)).text();
    const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
    assert.ok(!header.includes('social-'), path);
    assert.ok(!header.includes('mailto:'), path);
    assert.ok(!html.includes('class="contact-block"'), path);
    assert.equal(html.includes('mailto:javier.traver.v@me.com'), path.endsWith('/about/'));
  }
});

test('the font is self-hosted, preloaded and allowed by the CSP', async () => {
  const font = await get('/assets/fonts/inter-latin.woff2');
  assert.equal(font.status, 200);
  assert.equal(font.headers.get('Content-Type'), 'font/woff2');
  const html = await (await get('/about/')).text();
  assert.ok(html.includes('<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>'));
  assert.ok(html.includes('/assets/site.js?v='));
});

test('the launch page lists the upcoming resource types', async () => {
  await withFetch(offline, async () => {
    const html = await (await get('/es/resources/', { GUMROAD_ACCESS_TOKEN: 'cats' })).text();
    assert.ok(html.includes('<li>Plantillas de Canva</li>'));
  });
});


test('header shows Projects, About and Contact; Resources moves to the footer', async () => {
  const html = await (await get('/es/')).text();
  const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
  const nav = header.match(/<nav[^>]*>([\s\S]*?)<\/nav>/)[1];
  assert.equal((nav.match(/<a /g) || []).length, 3);
  assert.ok(!header.includes('header-actions'));
  assert.ok(!header.includes('social-menu'));
  assert.ok(header.includes('language-links'));
  assert.ok(!nav.includes('/es/resources/'));
  assert.ok(nav.includes('/es/contacto/'));
  assert.ok(html.match(/<footer[\s\S]*?<\/footer>/)[0].includes('/es/resources/'));
  const contact = await (await get('/es/contacto/')).text();
  assert.match(contact, /<a href="\/es\/contacto\/" aria-current="page">Contacto<\/a>/);
});
