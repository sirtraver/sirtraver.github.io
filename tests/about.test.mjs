import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get } from './helpers.mjs';

test('the professional profile has a translated CV summary and clearly marks current study', async () => {
  for (const [path, study, status, experience] of [
    ['/es/about/', 'Marketing y Publicidad', 'En curso', 'Experiencia profesional'],
    ['/about/', 'Marketing &amp; Advertising', 'In progress', 'Professional experience'],
  ]) {
    const html = await (await get(path)).text();
    assert.ok(html.includes('class="about-profile"'));
    assert.ok(html.includes('profile-social'));
    assert.ok(html.includes(experience));
    assert.ok(html.includes('2017'));
    assert.ok(html.includes('Universidad Complutense de Madrid'));
    assert.ok(html.includes('Founderz'));
    assert.ok(html.includes('Google Certificates'));
    assert.ok(html.includes('C1 · Advanced'));
    const current = html.match(/<li class="is-current">([\s\S]*?)<\/li>/)[1];
    assert.ok(current.includes(study));
    assert.ok(current.includes(status));
    assert.ok(!current.includes('2019'), 'no invented date for current studies');
    assert.ok(!html.includes('resume-other'), 'unrelated experience is removed');
    assert.ok(!html.includes('Ciudad de la Raqueta'));
    assert.ok(!html.includes('Somontes'));
    assert.ok(current.includes('UFV'));
    assert.ok(html.includes('Visual Designer &amp; Marketing'));
    assert.ok(current.includes(path.startsWith('/es/') ? 'Grado Superior' : 'Advanced Vocational Qualification'));
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
