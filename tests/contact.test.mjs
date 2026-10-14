import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { configure } from '../src/lib/runtime.js';
import { waitlistAdmin } from '../src/services/waitlist.js';
import { ORIGIN, get, memoryKv, resetCaches, withFetch } from './helpers.mjs';

beforeEach(resetCaches);

const message = { name: 'Ana', email: 'ana@example.com', type: 'rebranding', message: 'We need a new identity for our bakery.', language: 'es' };
const send = (KV, body, options = {}) =>
  get('/api/contact', { KV, ...(options.env ?? {}) }, {}, {
    method: 'POST',
    headers: { Origin: options.origin ?? ORIGIN, 'Content-Type': options.form ? 'application/x-www-form-urlencoded' : 'application/json' },
    body: options.form ? new URLSearchParams(body) : JSON.stringify(body),
  });

test('contact page renders in both languages with an accessible form', async () => {
  for (const [path, lang] of [['/contact/', 'en'], ['/es/contacto/', 'es']]) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes('<form class="contact-form" method="post" action="/api/contact" data-enhance'));
    for (const name of ['name', 'email', 'type', 'message', 'website']) assert.ok(html.includes(`name="${name}"`), name);
    assert.ok(html.includes(lang === 'es' ? 'href="/es/privacidad/"' : 'href="/privacy/"'));
  }
});

test('valid messages are stored; invalid, foreign and honeypot ones are not', async () => {
  const KV = memoryKv();
  assert.equal((await send(KV, message)).status, 200);
  assert.equal((await send(KV, { ...message, email: 'nope' })).status, 400);
  assert.equal((await send(KV, { ...message, message: 'short' })).status, 400);
  assert.equal((await send(KV, message, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await send(KV, { ...message, website: 'spam' })).status, 200);
  const stored = [...KV.store.entries()].filter(([key]) => key.startsWith('contact/'));
  assert.equal(stored.length, 1);
  assert.equal(JSON.parse(stored[0][1]).type, 'rebranding');
  assert.equal((await send(undefined, message)).status, 503, 'no storage, no false success');
});

test('without JavaScript the form redirects back with the result', async () => {
  const response = await send(memoryKv(), message, { form: true });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), `${ORIGIN}/es/contacto/?sent=ok`);
  const page = await (await get('/es/contacto/?sent=ok')).text();
  assert.ok(page.includes('Gracias, tu mensaje se ha enviado.'));
});

test('repeated submissions from one client are limited', async () => {
  const KV = memoryKv();
  const statuses = [];
  for (let i = 0; i < 7; i++) statuses.push((await send(KV, message)).status);
  assert.deepEqual(statuses.slice(-2), [429, 429]);
});

test('with Brevo configured, a notification email is sent with reply-to the visitor', async () => {
  const calls = [];
  await withFetch(async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(options.body), key: options.headers['api-key'] });
    return new Response('{}', { status: 201 });
  }, async () => {
    const response = await send(memoryKv(), message, { env: { BREVO_API_KEY: 'test-key', CONTACT_TO: 'javier@example.com' } });
    assert.equal(response.status, 200);
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(calls[0].body.to[0].email, 'javier@example.com');
  assert.equal(calls[0].body.replyTo.email, 'ana@example.com');
  assert.equal(calls[0].key, 'test-key');
});

test('messages can be exported privately as CSV', async () => {
  const KV = memoryKv();
  await send(KV, message);
  const env = { KV, WAITLIST_ADMIN_TOKEN: 'secret' };
  const response = await waitlistAdmin(new Request(`${ORIGIN}/api/waitlist-admin?type=contact`, { headers: { Authorization: 'Bearer secret' } }), env);
  const csv = await response.text();
  assert.ok(csv.startsWith('received_at,name,email,type,language,message'));
  assert.ok(csv.includes('"ana@example.com"'));
});

test('privacy policy mentions Brevo and analytics only when they are enabled', async () => {
  const plain = await (await get('/privacy/')).text();
  assert.ok(!plain.includes('Brevo') && !plain.includes('Umami'));
  configure({ BREVO_API_KEY: 'k', CONTACT_TO: 'j@example.com', ANALYTICS_SRC: 'https://stats.example.com/script.js', ANALYTICS_WEBSITE_ID: 'abc' });
  const env = { BREVO_API_KEY: 'k', CONTACT_TO: 'j@example.com', ANALYTICS_SRC: 'https://stats.example.com/script.js', ANALYTICS_WEBSITE_ID: 'abc' };
  const response = await get('/privacy/', env);
  const html = await response.text();
  assert.ok(html.includes('Brevo') && html.includes('Umami'));
  assert.ok(html.includes('<script defer src="https://stats.example.com/script.js" data-website-id="abc"></script>'));
  assert.match(response.headers.get('Content-Security-Policy'), /script-src 'self' https:\/\/stats\.example\.com/);
});
