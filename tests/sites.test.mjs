import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { activeProjects } from '../src/projects.js';
import { get, resetCaches, ORIGIN } from './helpers.mjs';

beforeEach(resetCaches);

// Tests the Worker directly: Node's disk server must not hide missing production assets.
test('every responsive cover and social JPEG is served by the Sites Worker itself', async () => {
  for (const project of activeProjects) {
    for (const url of [...project.cover.avif, ...project.cover.webp].map(([url]) => url).concat(project.cover.og)) {
      const response = await get(url);
      assert.equal(response.status, 200, url);
      assert.match(response.headers.get('Content-Type'), /^image\//);
      assert.ok((await response.arrayBuffer()).byteLength > 1000, url);
    }
  }
});

test('local galleries are served by the production Worker without the disk preview fallback', async () => {
  for (const project of activeProjects) {
    for (const image of project.images.filter(image => !image.src)) {
      for (const [url] of [...image.avif, ...image.webp]) {
        const response = await get(url);
        assert.equal(response.status, 200, url);
        assert.match(response.headers.get('Content-Type'), /^image\//);
        assert.ok((await response.arrayBuffer()).byteLength > 1000, url);
      }
    }
  }
});

function bucketFixture() {
  const records = new Map();
  return {
    records,
    async get(key) {
      const value = records.get(key);
      return value === undefined ? null : { text: async () => value, json: async () => JSON.parse(value) };
    },
    async put(key, value) { records.set(key, value); },
    async list({ prefix, cursor }) {
      const keys = [...records.keys()].filter(key => key.startsWith(prefix));
      const offset = Number(cursor || 0);
      const page = keys.slice(offset, offset + 1); // Force pagination to exercise CSV export.
      const truncated = offset + 1 < keys.length;
      return { objects: page.map(key => ({ key })), truncated, cursor: truncated ? String(offset + 1) : undefined };
    },
  };
}

test('existing R2 binding retains waitlist keys, deduplication and private paginated export', async () => {
  const BUCKET = bucketFixture();
  const env = { BUCKET, WAITLIST_ADMIN_TOKEN: 'fixture-only-token' };
  const send = email => get('/api/subscribe', env, {}, {
    method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, consent: true, language: 'es' }),
  });
  assert.equal((await send('one@example.com')).status, 200);
  assert.equal((await send(' ONE@example.com ')).status, 200);
  assert.equal((await send('two@example.com')).status, 200);
  assert.equal(BUCKET.records.size, 2);
  for (const key of BUCKET.records.keys()) assert.match(key, /^waitlist\/[a-f0-9]{64}\.json$/);
  assert.equal((await get('/api/waitlist-admin', env)).status, 404);
  const csv = await (await get('/api/waitlist-admin', env, {}, { headers: { Authorization: 'Bearer fixture-only-token' } })).text();
  assert.ok(csv.includes('one@example.com'));
  assert.ok(csv.includes('two@example.com'));
});
