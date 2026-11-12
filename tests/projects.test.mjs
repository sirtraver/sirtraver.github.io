import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { activeProjects, allProjects, archivedProjects, findProject, homeProjects } from '../src/projects.js';
import { ORIGIN, get, offline, withFetch } from './helpers.mjs';
import { contentHash } from '../src/generated/content.js';

// Versioned gallery data (src/worker.js), kept for the dark viewer even though no page loads it now.
const GALLERIES_URL = `/assets/galleries.json?v=${contentHash}-v3`;

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
      const cards = [...html.matchAll(/<a class="project-card" href="([^"]+)" data-project="([^"]+)"(?: style="--accent:#[0-9A-F]{6}")?>/g)].map((m) => m[2]);
      assert.deepEqual(cards, homeProjects.map(p => p.slug), path);
      assert.equal(cards.length % 2, 0, 'two-column grid: an even number of cards, none left alone');
      assert.ok(html.includes('class="more-button"'), 'a "more projects" button closes the grid');
      assert.ok(!html.includes('<span aria-hidden="true">↗</span></a>'), 'cards drop the corner arrow');
      assert.ok(html.includes('style="view-transition-name:cover-kudake"'), 'card cover morphs into the case hero');
      assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1, 'only the first card cover is high priority');
      assert.ok(html.includes('<source type="image/avif"'));
      assert.match(html, /style="background-color:#[0-9a-f]{6}"/, 'placeholder colour');
    }
    const english = await (await get('/')).text();
    assert.ok(english.includes('<h3>SOLFA</h3><span class="card-year">2026</span>'));
    assert.ok(english.includes('<h3>OYE</h3><span class="card-year">2026</span>'));
    const spanish = await (await get('/es/')).text();
    assert.ok(!spanish.includes('<h3>Tipografía en movimiento</h3>'), 'archived work stays off the home grid');
    assert.deepEqual(activeProjects.map(p => p.slug), ['oye', 'solfa', 'kudake', 'colorsplash', 'olmedo-clasico', 'autoescuela-oasis', 'flamenco-urbano', 'sirtraver']);
    assert.equal(activeProjects.length + archivedProjects.length, allProjects.length);
    assert.ok(spanish.includes('<p class="archive-link"><a class="more-button" href="/es/archive/">Ver más proyectos'));
    const hovers = activeProjects.filter(p => p.hover).length;
    assert.equal(hovers, activeProjects.length, 'every selected project has a hover image');
    assert.equal((spanish.match(/loading="lazy"/g) || []).length, homeProjects.length - 1 + homeProjects.filter(p => p.hover).length);
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
      assert.equal((html.match(/<figure[\s>]/g) || []).length, p.images.length + p.videos.length, path);
      for (const video of p.videos) assert.ok(html.includes('<video controls playsinline preload="none"') && html.includes(`<source src="${video.src}`), 'each spot loads only on play');
      assert.equal((html.match(/class="project-image"/g) || []).length, p.images.length, path);
      assert.ok(!html.includes('class="is-full"') && !html.includes('class="gallery-pair"'), 'every image uses the same page column');
      assert.ok(!html.includes('data-zoom-src') && !html.includes('gallery-zoom') && !html.includes('image-zoom.js'), 'images do not open a viewer or a separate file');
      assert.ok(html.includes('class="project-design"'), 'the formal design is explained independently of the concept');
      for (const section of p.designDetails) {
        const lang = prefix ? 'es' : 'en';
        assert.ok(html.includes(section.title[lang]) && html.includes(section.text[lang]));
      }
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
  assert.ok(!html.includes('data-gallery='), 'home cards link to the case studies; the viewer is not loaded');
  const url = GALLERIES_URL;
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
    const galleries = await (await get(GALLERIES_URL)).json();
    for (const slug of slugs) {
      const project = findProject(slug);
      assert.equal(project.conceptual, true, slug);
      assert.equal(project.client, '', 'independent concepts have no commissioned client');
      assert.equal(project.behance, '', 'local projects must not point to an invented Behance page');
      assert.equal(project.images.length, 6, 'all six source pages are retained');
      assert.ok(project.palette.length >= 2, 'the brand colours are documented as swatches');
      assert.equal(galleries[slug].conceptual, true);
      const card = home.match(new RegExp(`<a class="project-card[^"]*"[^>]*data-project="${slug}"[\\s\\S]*?</a>`))[0];
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
  const data = await (await get(GALLERIES_URL)).json();
  for (const slug of ['colorsplash', 'olmedo-clasico', 'autoescuela-oasis']) {
    const project = findProject(slug);
    assert.equal(project.caseStudy.length, 3);
    assert.equal(project.client, '');
    // The result states what the concept demonstrates; it never claims a client, figures or an outcome.
    assert.ok(project.result.es.startsWith('Proyecto conceptual.') && project.result.en.startsWith('Concept project.'), slug);
    for (const text of Object.values(project.result)) assert.ok(!/\d|client|cliente|ventas|sales|%/.test(text), `${slug}: no invented outcomes`);
    assert.deepEqual(data[slug].caseStudy, project.caseStudy);
    for (const [lang, prefix] of [['en', ''], ['es', '/es']]) {
      const html = await (await get(`${prefix}/projects/${slug}/`)).text();
      assert.ok(html.includes('class="project-story"'));
      for (const section of project.caseStudy) assert.ok(html.includes(section.title[lang]));
      assert.ok(!html.includes('data-zoom-src=') && !html.includes('/assets/image-zoom.js'));
    }
  }
});
