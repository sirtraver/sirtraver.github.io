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
      assert.ok(!image.src, 'gallery images are local');
      assert.ok(image.avif.length && image.webp.length);
      assert.ok(image.width > 0 && image.height > 0);
    }
    source.images.forEach((image) => assert.ok(image.file, 'galeria.json lists local files'));
  }
});

test('home: the selected projects share one grid with lazy images and link to the archive', async () => {
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
    assert.ok(!spanish.includes('<h3>Tipografía en movimiento</h3>'), 'archived work stays off the home grid');
    assert.deepEqual(activeProjects.map(p => p.slug), ['kudake', 'colorsplash', 'olmedo-clasico', 'autoescuela-oasis', 'flamenco-urbano', 'sirtraver']);
    assert.equal(activeProjects.length + archivedProjects.length, allProjects.length);
    assert.ok(spanish.includes('<p class="archive-link"><a href="/es/archive/">'));
    assert.equal((spanish.match(/loading="lazy"/g) || []).length, activeProjects.length - 1);
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
      if (p.tools.length) assert.ok(html.includes(p.tools.join(' · ')), path);
      else assert.ok(!html.includes('<dt>Tools</dt>') && !html.includes('<dt>Herramientas</dt>'), path);
      assert.ok(!html.includes('class="project-original"'), 'the shared project page also avoids the redundant Behance action');
      assert.ok(html.includes(`<meta property="og:image" content="${ORIGIN}/media/${p.slug}/cover-og.`));
      const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      const image = data['@graph'].find((node) => node['@type'] === 'ImageObject');
      assert.equal(image.creditText, 'Javier Traver');
      assert.ok(image.contentUrl.startsWith(`${ORIGIN}/media/`), image.contentUrl);
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
  assert.ok(url.endsWith('-v3'), 'project tools have a fresh cache version');
  for (const [slug, gallery] of Object.entries(galleries)) {
    assert.equal(gallery.category, findProject(slug).category);
    assert.equal(gallery.year, findProject(slug).year);
    assert.deepEqual(gallery.deliverables, findProject(slug).deliverables);
    assert.deepEqual(gallery.tools, findProject(slug).tools);
    assert.ok(!('behance' in gallery), 'the viewer no longer includes external project links');
    for (const image of gallery.images) {
      assert.ok(!image.src, 'gallery images are local');
      for (const [url] of [...image.avif, ...image.webp]) assert.ok(url.startsWith("/media/"));
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

test('earlier projects live in the archive with their own pages', async () => {
  assert.deepEqual(archivedProjects.map(p => p.slug).sort(), ['gigantes', 'greens', 'more', 'type-in-motion', 'wobble']);
  for (const p of archivedProjects) assert.ok(!p.tools.includes('ChatGPT') || p.year >= 2023, `${p.slug}: no anachronistic tools`);
  for (const [path, lang] of [['/archive/', 'en'], ['/es/archive/', 'es']]) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    for (const p of archivedProjects) assert.ok(html.includes(`data-project="${p.slug}"`), `${path} ${p.slug}`);
  }
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
