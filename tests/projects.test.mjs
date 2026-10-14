import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { activeProjects, allProjects, featuredProject, findProject } from '../src/projects.js';
import { ORIGIN, get, offline, withFetch } from './helpers.mjs';

const ORDER = ['kudake', 'flamenco-urbano', 'sirtraver', 'greens', 'more', 'wobble', 'type-in-motion', 'gigantes'];
const GALLERY_SIZES = { kudake: 15, 'flamenco-urbano': 15, sirtraver: 3, greens: 15, more: 14, wobble: 9, 'type-in-motion': 1, gigantes: 24 };

test('projects come from content/ in publication order, with all 96 images', () => {
  assert.deepEqual(allProjects.map((p) => p.slug), ORDER);
  for (const p of allProjects) assert.equal(p.images.length, GALLERY_SIZES[p.slug], p.slug);
  assert.equal(featuredProject.slug, 'kudake', 'the newest project is featured by default');
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

test('all galleries match the recovered original Behance URLs in order', async () => {
  const recovered = JSON.parse(await readFile(new URL('../content/behance-galleries.json', import.meta.url), 'utf8'));
  for (const p of allProjects) {
    assert.deepEqual(p.images.map(i => i.src), recovered[p.id].media.map(i => i.src), p.slug);
    for (const image of p.images) {
      assert.equal(new URL(image.src).hostname, 'mir-s3-cdn-cf.behance.net');
      assert.ok(image.width > 0 && image.height > 0);
    }
  }
});

test('home: featured project first, then the grid, all linking to case studies', async () => {
  await withFetch(offline, async () => {
    for (const [path, prefix] of [['/', ''], ['/es/', '/es']]) {
      const html = await (await get(path)).text();
      assert.match(html, new RegExp(`<a class="featured-project" href="${prefix}/projects/kudake/" data-project="kudake">`));
      const cards = [...html.matchAll(/<a class="project-card" href="([^"]+)" data-project="([^"]+)">/g)].map((m) => m[2]);
      assert.deepEqual(cards, ORDER.slice(1), path);
      assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1, 'only the featured cover is high priority');
      assert.ok(html.includes('<source type="image/avif"'));
      assert.match(html, /style="background-color:#[0-9a-f]{6}"/, 'placeholder colour');
    }
    const english = await (await get('/')).text();
    assert.ok(english.includes('<p>Visual identity · 2025</p>'));
    const spanish = await (await get('/es/')).text();
    assert.ok(spanish.includes('<h3>Tipografía en movimiento</h3>'));
    assert.ok(spanish.includes('Último proyecto'));
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
      assert.equal(new URL(image.contentUrl).hostname, 'mir-s3-cdn-cf.behance.net');
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

test('viewer gallery data is versioned and uses original Behance media', async () => {
  const html = await withFetch(offline, async () => (await get('/')).text());
  const url = html.match(/data-gallery="([^"]+)"/)[1];
  const response = await get(url);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
  const galleries = await response.json();
  assert.deepEqual(Object.keys(galleries).sort(), [...ORDER].sort());
  for (const gallery of Object.values(galleries)) {
    for (const image of gallery.images) { assert.equal(new URL(image.src).hostname, 'mir-s3-cdn-cf.behance.net'); assert.ok(image.width > 0 && image.height > 0); }
  }
});

test('the archive page only exists when projects are archived', async () => {
  assert.equal(activeProjects.length, allProjects.length);
  assert.equal((await get('/archive/')).status, 404);
  const source = await readFile(new URL('../src/projects.js', import.meta.url), 'utf8');
  assert.ok(source.includes('archived'));
});
