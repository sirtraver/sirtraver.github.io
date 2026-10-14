import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { catalogApi, getCatalog, publicProducts } from '../src/services/catalog.js';
import { get, gumroadProduct as product, resetCaches, withFetch } from './helpers.mjs';

beforeEach(resetCaches);

test('only published products from the seller are exposed; the hidden one stays hidden', () => {
  const items = [
    product(),
    product({ id: 'draft', published: false }),
    product({ id: 'deleted', deleted: true }),
    product({ id: 'hidden' }),
    product({ id: 'foreign', short_url: 'https://other.gumroad.com/l/x' }),
    product({ id: 'free', price: 0, thumbnail_url: 'https://evil.example/cover' }),
  ];
  const result = publicProducts(items, 'hidden');
  assert.deepEqual(result.map((p) => p.id), ['live', 'free']);
  assert.ok(!JSON.stringify(result).includes('secret'));
  assert.equal(result[1].price, 'Free · €0');
  assert.equal(result[1].free, true);
  assert.equal(result[1].image, '', 'untrusted image hosts are dropped');
});

test('the token is sent to Gumroad but never returned', async () => {
  let options;
  const fetcher = async (url, opts) => {
    options = opts;
    assert.equal(url, 'https://api.gumroad.com/v2/products');
    return Response.json({ success: true, products: [product()] });
  };
  const response = await catalogApi({ GUMROAD_ACCESS_TOKEN: 'test-token' }, fetcher);
  assert.equal(options.headers.Authorization, 'Bearer test-token');
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.ok(!text.includes('test-token'));
  assert.ok(!text.includes('file_info'));
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
});

test('upstream failure is reported as unavailable, never as an empty catalog', async () => {
  const response = await catalogApi({ GUMROAD_ACCESS_TOKEN: 'failure-token' }, async () => {
    throw new Error('failure-token');
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: 'unavailable', products: [] });
});

test('missing token means unavailable', async () => {
  assert.deepEqual(await getCatalog({}), { status: 'unavailable', products: [] });
});

test('a short outage keeps serving the last good catalog', async () => {
  const env = { GUMROAD_ACCESS_TOKEN: 'stale-test' };
  await getCatalog(env, async () => Response.json({ success: true, products: [product()] }));
  const realNow = Date.now;
  Date.now = () => realNow() + 5 * 60 * 1000; // past freshness, within the stale window
  try {
    const result = await getCatalog(env, async () => new Response('down', { status: 500 }));
    assert.equal(result.status, 'ok');
    assert.equal(result.products.length, 1);
  } finally {
    Date.now = realNow;
  }
});

test('the public API route is noindex', async () => {
  const response = await get('/api/catalogo-gumroad');
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
});

test('each resource has its own page; old product URLs redirect to it', async () => {
  await withFetch(async () => Response.json({ success: true, products: [product()] }), async () => {
    const env = { GUMROAD_ACCESS_TOKEN: 'resource-page' };
    for (const [from, to] of [['/resources/product/live/', '/resources/live/'], ['/es/resources/product/live/', '/es/resources/live/']]) {
      const response = await get(from, env);
      assert.equal(response.status, 301, from);
      assert.equal(response.headers.get('Location'), `https://sirtraver.com${to}`);
    }
    const html = await (await get('/es/resources/live/', env)).text();
    assert.ok(html.includes('<h1>Live product</h1>'));
    assert.ok(html.includes('href="https://sirtraver.gumroad.com/l/live"'));
    assert.ok(html.includes('<link rel="canonical" href="https://sirtraver.com/es/resources/live/">'));
    assert.ok(html.includes('"@type":"Product"'));
    assert.equal((await get('/resources/unknown/', env)).status, 404);
  });
});
