import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get } from './helpers.mjs';

test('About pages link to the curriculum in their own language', async () => {
  for (const [path, target, label] of [['/es/about/', '/cv/', 'Ver CV'], ['/about/', '/resume/', 'View Resume']]) {
    const html = await (await get(path)).text();
    assert.ok(html.includes(`class="profile-cv-link" href="${target}">${label}`));
  }
});

test('both curriculum pages preserve confirmed levels, language switching and printable assets', async () => {
  for (const [path, lang, heading, filename] of [['/cv/', 'es', 'Experiencia profesional', 'Javier_Traver_CV_ES.pdf'], ['/resume/', 'en', 'Professional experience', 'Javier_Traver_Resume_EN.pdf']]) {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Robots-Tag'), null);
    const html = await response.text();
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(heading));
    assert.ok(html.includes('Universidad Francisco de Vitoria'));
    assert.ok(html.includes('https://sirtraver.com' + path));
    assert.ok(html.includes('href="/cv/" hreflang="es"'));
    assert.ok(html.includes('href="/resume/" hreflang="en"'));
    assert.ok(html.includes(`download="${filename}"`));
    assert.equal((html.match(/class="level-row"/g) || []).length, 9);
    assert.ok(!html.includes('<style>') && !html.includes('onclick='));
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(match => match[1]);
    for (const url of assets) {
      const asset = await get(url);
      assert.equal(asset.status, 200, url);
      assert.ok((await asset.arrayBuffer()).byteLength > 0, url);
    }
    const pdf = await get('/assets/' + filename);
    assert.equal(pdf.headers.get('Content-Type'), 'application/pdf');
    assert.match(pdf.headers.get('Content-Disposition'), /attachment/);
    assert.equal(pdf.headers.get('X-Robots-Tag'), 'noindex');
    assert.equal(new TextDecoder().decode((await pdf.arrayBuffer()).slice(0, 5)), '%PDF-');
    assert.equal((await get(path, {}, {}, { method: 'HEAD' })).status, 200);
  }
});

test('curriculum URL variants canonicalize and sitemap lists the two languages', async () => {
  for (const [path, target] of [['/cv', '/cv/'], ['/cv/index.html', '/cv/'], ['/resume', '/resume/'], ['/resume/index.html', '/resume/']]) {
    const response = await get(path);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), 'https://sirtraver.com' + target);
  }
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.ok(sitemap.includes('<loc>https://sirtraver.com/cv/</loc>'));
  assert.ok(sitemap.includes('<loc>https://sirtraver.com/resume/</loc>'));
});
