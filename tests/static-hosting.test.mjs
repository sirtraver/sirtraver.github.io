import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get, offline, resetCaches, withFetch } from './helpers.mjs';

const STATIC = { GUMROAD_ACCESS_TOKEN: 'static-export', WEB3FORMS_ACCESS_KEY: 'public-form-key' };

test('with Web3Forms configured the launch form posts there, with redirect and honeypot', async () => {
  resetCaches();
  await withFetch(offline, async () => {
    for (const [path, thanks] of [['/resources/', '/thank-you/'], ['/es/resources/', '/es/gracias/']]) {
      const html = await (await get(path, STATIC)).text();
      const form = html.match(/<form class="launch-form"[\s\S]*?<\/form>/)[0];
      assert.ok(form.includes('action="https://api.web3forms.com/submit"'), path);
      assert.ok(form.includes('name="access_key" value="public-form-key"'));
      assert.ok(form.includes(`name="redirect" value="https://sirtraver.com${thanks}"`));
      assert.ok(form.includes('name="botcheck"') && form.includes('name="consent" type="checkbox" required'));
    }
  });
  const privacy = await (await get('/privacy/', STATIC)).text();
  assert.ok(privacy.includes('Web3Forms'));
  resetCaches();
});

test('every page loads the language preference script and no link carries ?lang=', async () => {
  await withFetch(offline, async () => {
    for (const path of ['/', '/es/', '/about/', '/es/contacto/']) {
      const html = await (await get(path)).text();
      assert.match(html, /<script src="\/assets\/language\.js\?v=[0-9a-f]+"><\/script>/, path);
      assert.ok(!html.includes('?lang='), path);
    }
  });
});

test('the resume pages are served as published', async () => {
  for (const [path, lang] of [['/resume/', 'en'], ['/cv/', 'es']]) {
    const response = await get(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.startsWith(`<!doctype html><html lang="${lang}">`), path);
    assert.ok(html.includes('<link rel="alternate" hreflang="es" href="https://sirtraver.com/cv/">'));
  }
  for (const [path, href] of [['/about/', '/resume/'], ['/es/about/', '/cv/']]) {
    assert.ok((await (await get(path)).text()).includes(`<a class="profile-cv-link" href="${href}">`), path);
  }
});

test('with a Brevo form configured the Resources sign-up posts to Brevo, with CSP, tracking and privacy text', async () => {
  resetCaches();
  const BREVO = { ...STATIC, NEWSLETTER_FORM_URL: 'https://abc123.sibforms.com/serve/TOKEN', ANALYTICS_WEBSITE_ID: 'site-id' };
  await withFetch(offline, async () => {
    for (const path of ['/resources/', '/es/resources/']) {
      const response = await get(path, BREVO);
      const html = await response.text();
      const form = html.match(/<form class="launch-form"[\s\S]*?<\/form>/)[0];
      assert.ok(form.includes('action="https://abc123.sibforms.com/serve/TOKEN"'), path);
      assert.ok(form.includes('data-format="brevo"') && form.includes('name="EMAIL"') && form.includes('name="email_address_check"'));
      assert.ok(!form.includes('access_key'), 'Brevo replaces Web3Forms');
      const csp = response.headers.get('Content-Security-Policy');
      assert.match(csp, /form-action 'self' https:\/\/api\.web3forms\.com https:\/\/abc123\.sibforms\.com/);
      assert.match(csp, /connect-src [^;]*https:\/\/cloud\.umami\.is https:\/\/api-gateway\.umami\.dev/);
      assert.ok(html.includes('data-website-id="site-id"') && /\/assets\/track\.js/.test(html));
    }
  });
  const privacy = await (await get('/es/privacidad/', BREVO)).text();
  assert.ok(privacy.includes('Brevo') && privacy.includes('Umami Cloud') && !privacy.includes('Web3Forms'));
  resetCaches();
});

test('a newsletter form URL outside sibforms.com is ignored', async () => {
  resetCaches();
  await withFetch(offline, async () => {
    const html = await (await get('/resources/', { ...STATIC, NEWSLETTER_FORM_URL: 'https://evil.example.com/serve/x' })).text();
    assert.ok(!html.includes('evil.example.com'));
    assert.ok(html.includes('action="https://api.web3forms.com/submit"'));
  });
  resetCaches();
});
