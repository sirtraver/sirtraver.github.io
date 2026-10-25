import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ORIGIN, get, offline, withFetch } from './helpers.mjs';

const LEGAL_PATHS = [
  ['/legal/', 'en', 'Legal notice'],
  ['/privacy/', 'en', 'Privacy policy'],
  ['/es/aviso-legal/', 'es', 'Aviso legal'],
  ['/es/privacidad/', 'es', 'Política de privacidad'],
];

test('legal notice and privacy policy exist in both languages', async () => {
  for (const [path, lang, heading] of LEGAL_PATHS) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`<h1>${heading}</h1>`));
    assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}${path}">`));
    assert.ok(html.includes('mailto:javier.traver.v@me.com'));
  }
  const privacy = await (await get('/es/privacidad/')).text();
  assert.ok(privacy.includes('sirtraver_lang'));
  assert.ok(privacy.includes('seis meses'));
  assert.ok(!privacy.includes('no usa cookies'));
  const englishPrivacy = await (await get('/privacy/')).text();
  assert.ok(englishPrivacy.includes('sirtraver_lang'));
  assert.ok(englishPrivacy.includes('six months'));
  assert.ok(privacy.includes('https://www.aepd.es/'));
});

test('every page links to the legal pages from the footer', async () => {
  await withFetch(offline, async () => {
    for (const [path, legal, privacy] of [['/', '/legal/', '/privacy/'], ['/es/about/', '/es/aviso-legal/', '/es/privacidad/']]) {
      const html = await (await get(path)).text();
      assert.ok(html.includes(`<a href="${legal}">`), path);
      assert.ok(html.includes(`<a href="${privacy}">`), path);
    }
  });
});

test('the waitlist form links to the privacy policy', async () => {
  await withFetch(offline, async () => {
    const html = await (await get('/es/resources/', { GUMROAD_ACCESS_TOKEN: 'legal' })).text();
    assert.match(html, /<p class="launch-privacy">[^<]*<a href="\/es\/privacidad\/">/);
  });
});

test('legal pages switch language to their own counterpart', async () => {
  const html = await (await get('/legal/')).text();
  assert.ok(html.includes('<a href="/es/aviso-legal/?lang=es" lang="es"'));
});
