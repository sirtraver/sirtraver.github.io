import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserLanguage } from '../src/lib/language.js';
import { get, ORIGIN, offline, withFetch } from './helpers.mjs';

const visit = (path, headers = {}) => get(path, {}, {}, { headers });

test('browser preference supports regional tags, quality ordering and English fallback', () => {
  for (const [header, expected] of [
    ['es-ES,es;q=0.9,en;q=0.8', 'es'], ['en-GB,es;q=0.9', 'en'],
    ['en;q=0.4, es-MX;q=0.9', 'es'], ['fr-FR,de;q=0.9,es;q=0.8', 'es'],
    ['es;q=0,en;q=0.5', 'en'], ['es;q=invalid', 'en'], ['fr-FR', 'en'], ['', 'en'],
  ]) assert.equal(browserLanguage(header), expected, header);
});

test('the neutral entry URL detects Spanish without JavaScript and preserves query parameters', async () => {
  const response = await visit('/?utm_source=portfolio', { 'Accept-Language': 'es-ES,en;q=0.8' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), `${ORIGIN}/es/?utm_source=portfolio`);
  assert.equal(response.headers.get('Vary'), 'Cookie, Accept-Language');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Set-Cookie'), null, 'detection alone does not save a manual choice');
  const english = await visit('/', { 'Accept-Language': 'en-US,es;q=0.5' });
  assert.equal(english.status, 200);
  assert.equal(english.headers.get('Vary'), 'Cookie, Accept-Language');
});

test('explicit URLs keep their language regardless of browser or saved preference', async () => {
  for (const [path, expected] of [['/es/', 'es'], ['/es/about/', 'es'], ['/about/', 'en'], ['/projects/colorsplash/', 'en']]) {
    const response = await visit(path, { 'Accept-Language': 'es-ES', Cookie: 'sirtraver_lang=en' });
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).includes(`<html lang="${expected}">`), path);
  }
});

test('the manual selector saves the choice, cleans the URL and remains on the translated page', async () => {
  for (const [path, lang, target] of [
    ['/?lang=en', 'en', '/'], ['/es/?lang=es', 'es', '/es/'],
    ['/es/projects/colorsplash/?lang=es', 'es', '/es/projects/colorsplash/'],
    ['/about/?lang=en&utm_source=test', 'en', '/about/?utm_source=test'],
    ['/es/aviso-legal/?lang=es', 'es', '/es/aviso-legal/'],
  ]) {
    const response = await visit(path, { 'Accept-Language': 'es-ES' });
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get('Location'), ORIGIN + target);
    assert.ok(response.headers.get('Set-Cookie').startsWith(`sirtraver_lang=${lang}; Path=/;`));
    assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure$/);
  }
  const chosenEnglish = await visit('/', { 'Accept-Language': 'es-ES', Cookie: 'sirtraver_lang=en' });
  assert.equal(chosenEnglish.status, 200);
  const chosenSpanish = await visit('/', { 'Accept-Language': 'en-US', Cookie: 'other=x; sirtraver_lang=es; extra=y' });
  assert.equal(chosenSpanish.headers.get('Location'), ORIGIN + '/es/');
  const invalid = await visit('/?lang=fr', { 'Accept-Language': 'en-US', Cookie: 'sirtraver_lang=invalid' });
  assert.equal(invalid.status, 200);
  assert.equal(invalid.headers.get('Set-Cookie'), null);
});

test('language choices are in the header, with matching translated project and legal links', async () => {
  await withFetch(offline, async () => {
    for (const [path, target] of [['/es/', '/?lang=en'], ['/projects/colorsplash/', '/es/projects/colorsplash/?lang=es'], ['/legal/', '/es/aviso-legal/?lang=es']]) {
      const html = await (await get(path)).text();
      const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
      const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
      assert.ok(header.includes('class="language-links"'));
      assert.ok(header.includes(`href="${target}"`), path);
      assert.ok(header.includes('aria-current="true"'));
      assert.ok(!footer.includes('class="language-links"'));
    }
  });
});

test('language negotiation never changes API or asset responses', async () => {
  for (const path of ['/assets/site.css?lang=es', '/assets/galleries.json?lang=es', '/sitemap.xml?lang=es']) {
    const response = await visit(path, { 'Accept-Language': 'es' });
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
});
