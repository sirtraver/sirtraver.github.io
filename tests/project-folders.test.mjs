import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import sharp from 'sharp';
import { projectFolders, readProjectDefinition } from '../scripts/project-files.mjs';
import { buildMedia } from '../scripts/images.mjs';
import { loadContent } from '../scripts/content.mjs';
import { homePage } from '../src/views/home.js';
import { projectPage } from '../src/views/project.js';

async function fixture(fn) {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'sirtraver-folders-'));
  try { return await fn(root); }
  finally { await fs.rm(root, { recursive: true, force: true }); }
}
const metadata = { name: 'Local project fixture', category: 'Visual identity', date: '2026-10-15', draft: false };

test('a new folder creates a complete local-image project without editing a central JSON', () => fixture(async root => {
  const projectsDir = path.join(root, 'projects');
  const folder = path.join(projectsDir, 'local-project');
  await fs.mkdir(path.join(folder, 'imagenes'), { recursive: true });
  await fs.mkdir(path.join(folder, 'recursos'));
  await fs.writeFile(path.join(folder, 'project.json'), JSON.stringify(metadata));
  const image = sharp({ create: { width: 90, height: 60, channels: 3, background: '#334455' } });
  await image.clone().jpeg().toFile(path.join(folder, 'portada.jpg'));
  for (const name of ['10.jpg', '2.jpg', '01.jpg']) await image.clone().jpeg().toFile(path.join(folder, 'imagenes', name));
  await fs.writeFile(path.join(folder, 'recursos/privado.pdf'), 'PRIVATE WORKING FILE');
  await fs.writeFile(path.join(folder, 'imagenes/LEEME.md'), 'Not a gallery image');
  await fs.mkdir(path.join(projectsDir, '_PLANTILLA'));
  await fs.mkdir(path.join(projectsDir, 'unfinished'));
  await fs.writeFile(path.join(projectsDir, 'unfinished/project.json'), JSON.stringify({ draft: true }));

  assert.deepEqual(await projectFolders(projectsDir), ['local-project', 'unfinished']);
  const definition = await readProjectDefinition('local-project', projectsDir);
  assert.deepEqual(definition.images.map(i => i.file), ['imagenes/01.jpg', 'imagenes/2.jpg', 'imagenes/10.jpg']);
  const options = { projectsDir, outputDir: path.join(root, 'media'), cacheFile: path.join(root, 'cache.json') };
  const media = await buildMedia(options);
  assert.deepEqual(Object.keys(media), ['local-project']);
  const content = await loadContent(media, { projectsDir });
  const project = content.projects[0];
  assert.equal(project.images.length, 3);
  for (const img of [project.cover, ...project.images]) {
    assert.equal(img.width, 90);
    assert.equal(img.height, 60);
    for (const [url] of [...img.avif, ...img.webp]) assert.ok((await fs.stat(path.join(root, url))).size > 0);
  }
  const home = String(homePage('en', { projects: content.projects, hasArchive: false, galleriesUrl: '/assets/galleries.json' }));
  assert.ok(home.includes('data-project="local-project"'));
  const page = String(projectPage(project, content.projects, 'es'));
  assert.equal((page.match(/<figure>/g) || []).length, 3);
  assert.ok(page.includes('/media/local-project/'));
  assert.ok(!page.includes('PRIVATE WORKING FILE'));

  // Incremental builds keep shared outputs; removing an image cleans only its unused outputs.
  assert.deepEqual(await buildMedia(options), media);
  await fs.rm(path.join(folder, 'imagenes/2.jpg'));
  const reduced = await buildMedia(options);
  assert.equal(reduced['local-project'].images.length, 2);
  for (const [url] of reduced['local-project'].cover.webp) assert.ok((await fs.stat(path.join(root, url))).size > 0);
}));

test('drafts are excluded; invalid dates, empty galleries and escaping paths stop the build', () => fixture(async root => {
  const folder = path.join(root, 'valid-name');
  await fs.mkdir(folder);
  const save = data => fs.writeFile(path.join(folder, 'project.json'), JSON.stringify(data));
  await save({ draft: true });
  assert.equal(await readProjectDefinition('valid-name', root), null);
  await save({ ...metadata, date: '2026-02-30' });
  await assert.rejects(readProjectDefinition('valid-name', root), /fecha real/);
  await save({ ...metadata, cover: '../outside.jpg', images: [{ file: 'imagenes/01.jpg' }] });
  await assert.rejects(readProjectDefinition('valid-name', root), /invalid image path/);
  await save({ ...metadata, cover: 'portada.jpg' });
  await assert.rejects(readProjectDefinition('valid-name', root), /añade imágenes/);
}));
