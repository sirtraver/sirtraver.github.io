import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { subscribe, waitlistAdmin } from '../src/services/waitlist.js';
import { OFF, ORIGIN, get, memoryKv, resetCaches } from './helpers.mjs';

beforeEach(resetCaches);

const jsonRequest = (data, origin = ORIGIN) =>
  new Request(`${ORIGIN}/api/subscribe`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

test('sign-ups need consent, are stored once and reject other origins', async () => {
  const KV = memoryKv();
  assert.equal((await subscribe(jsonRequest({ email: 'test@example.com' }), { KV })).status, 400);
  assert.equal((await subscribe(jsonRequest({ email: 'not-an-email', consent: true }), { KV })).status, 400);
  assert.equal((await subscribe(jsonRequest({ email: 'test@example.com', consent: true }), { KV })).status, 200);
  await subscribe(jsonRequest({ email: ' TEST@example.com ', consent: true, language: 'es' }), { KV });
  assert.equal(KV.store.size, 1);
  const record = JSON.parse([...KV.store.values()][0]);
  assert.equal(record.email, 'test@example.com');
  assert.equal(record.language, 'en', 'the first sign-up is kept');
  assert.equal((await subscribe(jsonRequest({ email: 'test@example.com', consent: true }, 'https://other.example'), { KV })).status, 403);
  assert.equal((await subscribe(jsonRequest({ email: 'test@example.com', consent: true }), {})).status, 503);
});

test('the honeypot answers like a success without storing anything', async () => {
  const KV = memoryKv();
  const response = await subscribe(jsonRequest({ email: 'bot@example.com', consent: true, website: 'spam' }), { KV });
  assert.equal(response.status, 200);
  assert.equal(KV.store.size, 0);
});

test('without JavaScript the form posts and is redirected back with the result', async () => {
  const KV = memoryKv();
  const request = new Request(`${ORIGIN}/api/subscribe`, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email: 'form@example.com', consent: 'on', website: '', language: 'es' }),
  });
  const response = await subscribe(request, { KV });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), `${ORIGIN}/es/gracias/?notice=resources`);
  assert.equal(KV.store.size, 1);
});

test('the export stays private: 404 without the right token, CSV with it', async () => {
  const KV = memoryKv();
  await subscribe(jsonRequest({ email: 'test@example.com', consent: true }), { KV });
  const env = { KV, WAITLIST_ADMIN_TOKEN: 'private-export-token' };

  const anonymous = await get('/api/waitlist-admin', env);
  assert.equal(anonymous.status, 404);
  assert.ok(!(await anonymous.text()).includes('test@example.com'));

  const wrong = await waitlistAdmin(new Request(`${ORIGIN}/api/waitlist-admin`, { headers: { Authorization: 'Bearer nope' } }), env);
  assert.equal(wrong.status, 404);

  const ok = await waitlistAdmin(new Request(`${ORIGIN}/api/waitlist-admin`, { headers: { Authorization: 'Bearer private-export-token' } }), env);
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('Content-Type'), /text\/csv/);
  assert.match(await ok.text(), /^email,language,subscribed_at,consent\r\n"test@example.com","en"/);
});

test('with Brevo configured, sign-ups get a double opt-in email', async () => {
  const calls = [];
  const KV = memoryKv();
  const env = { ...OFF, KV, BREVO_API_KEY: 'k', BREVO_LIST_ID: '7', BREVO_DOI_TEMPLATE_ID: '3' };
  const { configure } = await import('../src/lib/runtime.js');
  configure(env);
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => (calls.push({ url: String(url), body: JSON.parse(options.body) }), new Response(null, { status: 204 }));
  try {
    const response = await subscribe(jsonRequest({ email: 'new@example.com', consent: true, language: 'es' }), env);
    assert.deepEqual(await response.json(), { status: 'confirm' });
  } finally {
    globalThis.fetch = original;
  }
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation');
  assert.deepEqual(calls[0].body.includeListIds, [7]);
  assert.equal(calls[0].body.redirectionUrl, `${ORIGIN}/es/resources/?subscription=confirmed`);
});
