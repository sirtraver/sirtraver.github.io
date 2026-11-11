// Image pipeline: each project folder → optimized media, keeping remote galleries remote.
// Each image gets AVIF + WebP versions at several widths (never upscaled), its
// dimensions and dominant colour. File names carry a content hash, so they can be
// cached forever. Incremental: unchanged originals are not re-encoded.
//
// Exported for build.mjs; can also run alone: node scripts/images.mjs
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PROJECTS_DIR, projectFile, projectFolders, readProjectDefinition } from './project-files.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUTPUT = path.join(ROOT, 'public/media');
const CACHE = path.join(ROOT, 'src/generated/media-cache.json');

export const WIDTHS = [800, 1600, 2400];
// Galleries render at up to 1120 CSS pixels. Keep 2400px masters in the project
// folder and ship up to 1600px for a sharp gallery without duplicating heavy media.
const GALLERY_WIDTHS = [800, 1600];
const SETTINGS = 'v2|avif:q52e3|webp:q80';
const exists = (file) => fs.access(file).then(() => true, () => false);

/** @param {{og?: boolean}} options og: also write a 1200×630 JPEG for social previews (covers). */
async function processImage(slug, file, cache, { og = false, projectsDir, outputDir } = {}) {
  const source = projectFile(path.join(projectsDir, slug), file);
  const bytes = await fs.readFile(source);
  const hash = createHash('sha256').update(bytes).update(SETTINGS + (og ? '|og:1200x630' : '|gallery:max1600')).digest('hex').slice(0, 10);
  const key = `${slug}/${file}`;

  const cached = cache[key];
  if (cached?.hash === hash && (await Promise.all(cached.files.map((f) => exists(path.join(outputDir, f))))).every(Boolean)) {
    return cached.entry;
  }

  const image = sharp(bytes, { limitInputPixels: false }).rotate();
  const { width, height } = await image.metadata().then((m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  const { dominant, isOpaque } = await image.clone().stats();
  // Standard widths that are clearly smaller than the original, plus the largest useful size.
  const targetWidths = og ? WIDTHS : GALLERY_WIDTHS;
  const widths = [...new Set([...targetWidths.filter((w) => w <= width * 0.9), Math.min(width, targetWidths.at(-1))])].sort((a, b) => a - b);
  const stem = og ? 'cover' : (path.parse(file).name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').toLowerCase() || 'image');
  const files = [];
  const sources = { avif: [], webp: [] };

  await fs.mkdir(path.join(outputDir, slug), { recursive: true });
  for (const w of widths) {
    const resized = image.clone().resize({ width: w, withoutEnlargement: true }).toColourspace('srgb');
    for (const [format, options] of [['avif', { quality: 52, effort: 3 }], ['webp', { quality: 80 }]]) {
      const name = `${slug}/${stem}-${w}.${hash}.${format}`;
      await resized.clone()[format](options).toFile(path.join(outputDir, name));
      files.push(name);
      sources[format].push([`/media/${name}`, w]);
    }
  }

  let ogUrl = '';
  if (og) {
    const name = `${slug}/${stem}-og.${hash}.jpg`;
    // Exactly 1200×630, the size every social network expects, centred on the most salient area.
    await image.clone().resize({ width: 1200, height: 630, fit: 'cover', position: sharp.strategy.attention }).toColourspace('srgb').jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outputDir, name));
    files.push(name);
    ogUrl = `/media/${name}`;
  }

  const entry = {
    width,
    height,
    // Transparent images (a logo on its own) sit on white: their dominant colour would show through.
    color: isOpaque ? `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}` : '#ffffff',
    avif: sources.avif,
    webp: sources.webp,
    ...(ogUrl ? { og: ogUrl } : {}),
  };
  cache[key] = { hash, files, entry };
  console.log(`  ${key} ${width}×${height} → ${widths.join('/')}`);
  return entry;
}

/** Processes every project; returns { [slug]: { cover, images: [] } }. */
export async function buildMedia({ projectsDir = PROJECTS_DIR, outputDir = OUTPUT, cacheFile = CACHE } = {}) {
  const cache = JSON.parse(await fs.readFile(cacheFile, 'utf8').catch(() => '{}'));
  const media = {};
  const used = new Set();
  const slugs = await projectFolders(projectsDir);

  for (const slug of slugs) {
    const project = await readProjectDefinition(slug, projectsDir);
    if (!project) continue;
    const process = async (file, og = false) => {
      used.add(`${slug}/${file}`);
      return processImage(slug, file, cache, { og, projectsDir, outputDir });
    };
    media[slug] = {
      cover: await process(project.cover, true),
      images: [],
    };
    for (const image of project.images) {
      media[slug].images.push(image.file ? await process(image.file) : image);
    }
  }

  // Only outputs referenced by this build survive, including removed/draft projects.
  for (const key of Object.keys(cache)) {
    if (!used.has(key)) delete cache[key];
  }
  const live = new Set(Object.values(cache).flatMap((c) => c.files));
  // Remove outputs that no longer belong to any current image (e.g. after re-encoding).
  for (const slug of await fs.readdir(outputDir).catch(() => [])) {
    for (const file of await fs.readdir(path.join(outputDir, slug)).catch(() => [])) {
      if (!live.has(`${slug}/${file}`)) await fs.rm(path.join(outputDir, slug, file), { force: true });
    }
  }
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(cache));
  return media;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const media = await buildMedia();
  console.log(`Media OK: ${Object.keys(media).length} projects`);
}
