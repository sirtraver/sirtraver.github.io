import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { activeProjects, allProjects, archivedProjects, findProject } from '../src/projects.js';
import { ORIGIN, get, offline, withFetch } from './helpers.mjs';

test('project folders produce a sorted portfolio without a central registry', () => {
  assert.ok(allProjects.length > 0);
  for (let i = 1; i < allProjects.length; i++) assert.ok(allProjects[i - 1].date >= allProjects[i].date);
  assert.equal(findProject('83737217').slug, 'gigantes', 'old Behance IDs still resolve');
});

test('covers have optimized local variants and galleries retain remote originals with dimensions', async () => {
  for (const p of allProjects) {
    for (const image of [p.cover]) {
      assert.match(image.color, /^#[0-9a-f]{6}$/);
      for (const format of ['avif', 'webp']) {
        assert.ok(image[format].length >= 1);
        for (const [url, width] of image[format]) {
          assert.ok(width <= image.width, `${url} is not upscaled`);
          assert.ok((await stat(new URL(`../public${url}`, import.meta.url))).size > 0, url);
        }
      }
    }
    assert.match(p.cover.og, /\.jpg$/, 'covers have a JPEG for social previews');
  }
});

test('each gallery follows its own project folder definition', async () => {
  const { readProjectDefinition } = await import('../scripts/project-files.mjs');
  for (const p of allProjects) {
    const source = await readProjectDefinition(p.slug);
    assert.equal(p.images.length, source.images.length);
    for (const image of p.images) {
      if (image.src) assert.equal(new URL(image.src).hostname, 'mir-s3-cdn-cf.behance.net');
      else assert.ok(image.avif.length && image.webp.length);
      assert.ok(image.width > 0 && image.height > 0);
    }
    source.images.forEach((image, i) => { if (image.src) assert.equal(image.src, p.images[i].src); });
  }
});

test('home: all projects share one complete grid with lazy images', async () => {
  await withFetch(offline, async () => {
    for (const [path, prefix] of [['/', ''], ['/es/', '/es']]) {
      const html = await (await get(path)).text();
      assert.ok(!html.includes('class="featured-project"'));
      const cards = [...html.matchAll(/<a class="project-card" href="([^"]+)" data-project="([^"]+)">/g)].map((m) => m[2]);
      assert.deepEqual(cards, activeProjects.map(p => p.slug), path);
      assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1, 'only the first card cover is high priority');
      assert.ok(html.includes('<source type="image/avif"'));
      assert.match(html, /style="background-color:#[0-9a-f]{6}"/, 'placeholder colour');
    }
    const english = await (await get('/')).text();
    assert.ok(english.includes('<p>Visual identity · 2025</p>'));
    const spanish = await (await get('/es/')).text();
    assert.ok(spanish.includes('<h3>Tipografía en movimiento</h3>'));
    assert.deepEqual(new Set(activeProjects.map(p => p.slug)), new Set(allProjects.map(p => p.slug)));
    assert.equal(archivedProjects.length, 0);
    assert.ok(!spanish.includes('class="archive-link"'));
    assert.equal((spanish.match(/loading="lazy"/g) || []).length, allProjects.length - 1);
    assert.ok(!spanish.includes('Último proyecto'));
  });
});

test('case study pages: facts, captioned gallery and structured data', async () => {
  for (const p of allProjects) {
    for (const prefix of ['', '/es']) {
      const path = `${prefix}/projects/${p.slug}/`;
      const response = await get(path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}${path}">`));
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.equal((html.match(/<figure>/g) || []).length, p.images.length, path);
      assert.ok(html.includes('class="project-facts"'));
      assert.ok(html.includes(`<meta property="og:image" content="${ORIGIN}/media/${p.slug}/cover-og.`));
      const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      const image = data['@graph'].find((node) => node['@type'] === 'ImageObject');
      assert.equal(image.creditText, 'Javier Traver');
      assert.ok(image.contentUrl.startsWith(`${ORIGIN}/media/`) || new URL(image.contentUrl).hostname === 'mir-s3-cdn-cf.behance.net');
    }
  }
});

test('old project URLs redirect to the canonical case study', async () => {
  for (const [from, to] of [
    ['/projects/216560651/', '/projects/sirtraver/'],
    ['/es/projects/207304547/', '/es/projects/greens/'],
    ['/projects/kudake', '/projects/kudake/'],
  ]) {
    const response = await get(from);
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('Location'), `${ORIGIN}${to}`);
  }
  assert.equal((await get('/projects/unknown/')).status, 404);
});

test('viewer gallery data is versioned and accepts remote or local project images', async () => {
  const html = await withFetch(offline, async () => (await get('/')).text());
  const url = html.match(/data-gallery="([^"]+)"/)[1];
  const response = await get(url);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
  const galleries = await response.json();
  assert.deepEqual(Object.keys(galleries).sort(), activeProjects.map(p => p.slug).sort());
  assert.ok(url.endsWith('-v2'), 'enriched viewer data has a fresh cache version');
  for (const [slug, gallery] of Object.entries(galleries)) {
    assert.equal(gallery.category, findProject(slug).category);
    assert.equal(gallery.year, findProject(slug).year);
    assert.deepEqual(gallery.deliverables, findProject(slug).deliverables);
    for (const image of gallery.images) {
      if (image.src) assert.equal(new URL(image.src).hostname, 'mir-s3-cdn-cf.behance.net');
      else for (const [url] of [...image.avif, ...image.webp]) assert.ok(url.startsWith('/media/'));
      assert.ok(image.width > 0 && image.height > 0);
    }
  }
});

test('the three PDF projects are labelled as concepts on cards, pages and viewer data', async () => {
  const slugs = ['colorsplash', 'olmedo-clasico', 'autoescuela-oasis'];
  for (const [lang, prefix, label] of [['en', '', 'Concept project'], ['es', '/es', 'Proyecto conceptual']]) {
    const home = await withFetch(offline, async () => (await get(`${prefix}/`)).text());
    const galleries = await (await get(home.match(/data-gallery="([^"]+)"/)[1])).json();
    for (const slug of slugs) {
      const project = findProject(slug);
      assert.equal(project.conceptual, true, slug);
      assert.equal(project.client, '', 'independent concepts have no commissioned client');
      assert.equal(project.behance, '', 'local projects must not point to an invented Behance page');
      assert.equal(project.images.length, 6, 'all six source pages are retained');
      assert.equal(galleries[slug].conceptual, true);
      const card = home.match(new RegExp(`<a class="(?:featured-project|project-card)"[^>]*data-project="${slug}"[\\s\\S]*?</a>`))[0];
      assert.ok(card.includes(label), `${lang}: ${slug} card`);
      const page = await (await get(`${prefix}/projects/${slug}/`)).text();
      assert.ok(page.includes(label), `${lang}: ${slug} page`);
      const work = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'].find(node => node['@type'] === 'CreativeWork');
      assert.equal(work.creativeWorkStatus, label);
    }
  }
});

test('old archive links reach the complete portfolio when the archive is empty', async () => {
  assert.equal(activeProjects.length + archivedProjects.length, allProjects.length);
  for (const [path, target] of [['/archive/', '/'], ['/es/archive/', '/es/']]) {
    const response = await get(path);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), ORIGIN + target);
  }
  const source = await readFile(new URL('../src/projects.js', import.meta.url), 'utf8');
  assert.ok(source.includes('archived'));
});


test('concept narratives reach both SSR pages and the in-page viewer without fabricated outcomes', async () => {
  const home = await withFetch(offline, async () => (await get('/')).text());
  const data = await (await get(home.match(/data-gallery="([^"]+)"/)[1])).json();
  for (const slug of ['colorsplash', 'olmedo-clasico', 'autoescuela-oasis']) {
    const project = findProject(slug);
    assert.equal(project.caseStudy.length, 3);
    assert.equal(project.client, '');
    assert.deepEqual(project.result, { en: '', es: '' });
    assert.deepEqual(data[slug].caseStudy, project.caseStudy);
    for (const [lang, prefix] of [['en', ''], ['es', '/es']]) {
      const html = await (await get(`${prefix}/projects/${slug}/`)).text();
      assert.ok(html.includes('class="project-story"'));
      for (const section of project.caseStudy) assert.ok(html.includes(section.title[lang]));
      assert.equal((html.match(/data-zoom-src=/g) || []).length, project.images.length);
      assert.ok(html.includes('/assets/image-zoom.js?v='));
    }
  }
});
