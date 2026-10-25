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
    assert.ok(html.includes('class="resume-other"'), 'secondary experience remains available');
    assert.ok(!html.includes('tel:'), 'the private CV phone is not turned into a public contact link');
    assert.ok(!html.includes('.pdf'), 'the full private CV is not uploaded as a public download');
  }
});
