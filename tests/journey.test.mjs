import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { get, offline, resetCaches, withFetch } from './helpers.mjs';

beforeEach(resetCaches);

test('the home CTA leads to a translated contact form with five native FAQs and a real response commitment', async () => {
  for (const [home, contact, phrase] of [['/', '/contact/', '2 business days'], ['/es/', '/es/contacto/', '2 días laborables']]) {
    const html = await (await get(home)).text();
    assert.match(html, new RegExp(`<div class="hero-enquiry"><a class="enquiry-button" href="${contact}"`));
    assert.ok(html.includes(`class="mobile-enquiry" href="${contact}"`));
    assert.ok(html.indexOf('hero-enquiry') < html.indexOf('class="project-grid"'));
    const page = await (await get(contact)).text();
    assert.ok(page.includes(phrase));
    assert.equal((page.match(/<details>/g) || []).length, 5);
    assert.equal((page.match(/<summary>/g) || []).length, 5);
    assert.ok(page.includes('COLORSPLASH'));
    assert.ok(page.includes('class="breadcrumbs"'));
    assert.ok(!page.includes('class="mobile-enquiry"'), 'no fixed CTA over the form');
  }
});

test('thank-you pages are translated, private-data free and excluded from indexing and sitemap', async () => {
  for (const [path, other] of [['/thank-you/', '/es/gracias/'], ['/es/gracias/', '/thank-you/']]) {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
    const html = await response.text();
    assert.ok(html.includes('<meta name="robots" content="noindex">'));
    assert.ok(!html.includes('rel="canonical"'));
    assert.ok(html.includes(`href="${other}?lang=`));
    assert.ok(!html.includes('<form'));
  }
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.ok(!sitemap.includes('/gracias/') && !sitemap.includes('/thank-you/'));
  const resources = await (await get('/es/gracias/?notice=resources')).text();
  assert.ok(resources.includes('Ya estás en la lista.'));
  assert.ok(resources.includes('href="/thank-you/?notice=resources&amp;lang=en"'));
  assert.ok(!resources.includes('2 días laborables'), 'launch sign-up does not promise a project reply');
});

test('when email notifications are absent, contact uses direct email rather than a silent inbox', async () => {
  const html = await (await get('/es/contacto/')).text();
  assert.ok(html.includes('class="contact-email-primary"'));
  assert.ok(html.includes('mailto:javier.traver.v@me.com'));
  assert.ok(!html.includes('<form'));
  const enabled = await (await get('/es/contacto/', { BREVO_API_KEY: 'test', CONTACT_TO: 'local@example.com' })).text();
  assert.ok(enabled.includes('<form class="contact-form"'));
  assert.ok(enabled.includes('data-redirect="/es/gracias/"'));
});

test('project breadcrumbs and study content remain readable on directly shared project URLs', async () => {
  for (const prefix of ['', '/es']) {
    const html = await (await get(`${prefix}/projects/colorsplash/`)).text();
    assert.ok(html.includes('<nav class="breadcrumbs"'));
    assert.ok(html.includes('aria-current="page">COLORSPLASH'));
    assert.ok(html.includes('class="project-story"'));
    assert.ok(html.includes('class="project-enquiry"'));
    const gallery = await (await get((await (await get(`${prefix}/`)).text()).match(/data-gallery="([^"]+)"/)[1])).json();
    assert.ok(gallery.colorsplash.images.some(image => image.caption?.es));
  }
});

test('privacy describes remote gallery requests and all rendered main-page images have alt attributes', async () => {
  for (const path of ['/privacy/', '/es/privacidad/']) {
    const html = await (await get(path)).text();
    assert.ok(html.includes('CDN') && html.includes('Behance') && html.includes('Cloudflare'));
  }
  await withFetch(offline, async () => {
    for (const path of ['/', '/es/', '/about/', '/es/about/', '/resources/', '/es/resources/', '/es/projects/colorsplash/']) {
      const html = await (await get(path)).text();
      for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt="[^"]+"/, path);
      assert.ok(!html.includes('"@type":"LocalBusiness"') && !html.includes('"@type":"AggregateRating"'));
    }
  });
});

const formSource = await readFile(new URL('../public/assets/forms.js', import.meta.url), 'utf8');
async function submit({ ok = true, body = { status: 'sent' }, redirect = '/es/gracias/' } = {}) {
  let handler, navigated;
  const live = { textContent: '' }, button = { disabled: false };
  const form = { action: '/api/contact', dataset: { redirect, sending: 'sending', success: 'success', error: 'error' },
    elements: [{ name: 'email', type: 'email', value: 'local-test@example.com' }],
    querySelector: selector => selector.includes('status') ? live : button,
    addEventListener: (_, fn) => { handler = fn; }, reset() {} };
  vm.runInNewContext(formSource, { document: { querySelectorAll: () => [form] },
    fetch: async () => ({ ok, json: async () => body }), location: { assign: url => { navigated = url; } } });
  await handler({ preventDefault() {} });
  return { navigated, status: live.textContent, disabled: button.disabled };
}
test('enhanced contact forms redirect only on HTTP success; failed submissions stay in place', async () => {
  assert.equal((await submit()).navigated, '/es/gracias/');
  assert.deepEqual(await submit({ ok: false }), { navigated: undefined, status: 'error', disabled: false });
  assert.equal((await submit({ body: { status: 'invalid' } })).navigated, undefined);
  assert.equal((await submit({ redirect: '//another-site.example/' })).navigated, undefined);
});
