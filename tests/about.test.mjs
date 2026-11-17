import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get } from './helpers.mjs';

test('About is a short profile plus «How I work»; the CV details live on the CV page', async () => {
  for (const [path, cv, method, experience] of [
    ['/es/about/', '/cv/', 'Cómo trabajo', 'Experiencia profesional'],
    ['/about/', '/resume/', 'How I work', 'Professional experience'],
  ]) {
    const html = await (await get(path)).text();
    assert.ok(html.includes('class="about-profile"'));
    assert.ok(html.includes('profile-social'));
    assert.ok(html.includes(`href="${cv}"`), 'About links to the CV');
    assert.ok(html.includes('class="about-method"'));
    assert.ok(html.includes(method));
    assert.ok(html.includes('2017'));
    assert.ok(html.includes('Universidad Complutense de Madrid'));
    assert.ok(html.includes('Visual Designer &amp; Marketing'));
    assert.ok(!html.includes('resume-main'), 'the CV sections are not repeated on About');
    assert.ok(!html.includes(experience));
    assert.ok(!html.includes('tel:'), 'the private CV phone is not turned into a public contact link');
    assert.ok(!html.includes('.pdf'), 'the full private CV is not uploaded as a public download');
  }
});


test('the professional role is identical in both languages and in public metadata', async () => {
  const { CONTENT, ROLE } = await import('../src/content.js');
  for (const lang of ['es', 'en']) {
    assert.equal(CONTENT[lang].about.role, ROLE);
    assert.ok(CONTENT[lang].home.overline.includes(ROLE));
    assert.ok(CONTENT[lang].project.intro('Identity', 2026).includes(ROLE));
    assert.ok(CONTENT[lang].project.description('Project', 'Identity', 6, 2026).includes(ROLE));
    const html = await (await get(lang === 'es' ? '/es/about/' : '/about/')).text();
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data['@graph'].find(node => node['@type'] === 'Person').jobTitle, ROLE);
    assert.ok(html.includes(`<p class="profile-role">Visual Designer &amp; Marketing</p>`));
  }
});
