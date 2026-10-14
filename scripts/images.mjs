// Image pipeline: content/projects/<slug>/originals/* → public/media/<slug>/*
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

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const CONTENT = path.join(ROOT, 'content/projects');
const OUTPUT = path.join(ROOT, 'public/media');
const CACHE = path.join(ROOT, 'src/generated/media-cache.json');

export const WIDTHS = [800, 1600, 2400];
const SETTINGS = 'v2|avif:q52e3|webp:q80';
const exists = (file) => fs.access(file).then(() => true, () => false);

/** @param {{og?: boolean}} options og: also write a 1200px JPEG for social previews (covers). */
async function processImage(slug, file, cache, { og = false } = {}) {
  const source = path.join(CONTENT, slug, 'originals', file);
  const bytes = await fs.readFile(source);
  const hash = createHash('sha256').update(bytes).update(SETTINGS + (og ? '|og' : '')).digest('hex').slice(0, 10);
  const key = `${slug}/${file}`;

  const cached = cache[key];
  if (cached?.hash === hash && (await Promise.all(cached.files.map((f) => exists(path.join(OUTPUT, f))))).every(Boolean)) {
    return cached.entry;
  }

  const image = sharp(bytes, { limitInputPixels: false }).rotate();
  const { width, height } = await image.metadata().then((m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  const { dominant } = await image.clone().stats();
  // Standard widths that are clearly smaller than the original, plus the largest useful size.
  const widths = [...new Set([...WIDTHS.filter((w) => w <= width * 0.9), Math.min(width, WIDTHS.at(-1))])].sort((a, b) => a - b);
  const stem = path.parse(file).name;
  const files = [];
  const sources = { avif: [], webp: [] };

  await fs.mkdir(path.join(OUTPUT, slug), { recursive: true });
  for (const w of widths) {
    const resized = image.clone().resize({ width: w, withoutEnlargement: true }).toColourspace('srgb');
    for (const [format, options] of [['avif', { quality: 52, effort: 3 }], ['webp', { quality: 80 }]]) {
      const name = `${slug}/${stem}-${w}.${hash}.${format}`;
      await resized.clone()[format](options).toFile(path.join(OUTPUT, name));
      files.push(name);
      sources[format].push([`/media/${name}`, w]);
    }
  }

  let ogUrl = '';
  if (og) {
    const name = `${slug}/${stem}-og.${hash}.jpg`;
    await image.clone().resize({ width: 1200, withoutEnlargement: true }).toColourspace('srgb').jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUTPUT, name));
    files.push(name);
    ogUrl = `/media/${name}`;
  }

  const entry = {
    width,
    height,
    color: `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`,
    avif: sources.avif,
    webp: sources.webp,
    ...(ogUrl ? { og: ogUrl } : {}),
  };
  cache[key] = { hash, files, entry };
  console.log(`  ${key} ${width}×${height} → ${widths.join('/')}`);
  return entry;
}

/** Processes every project; returns { [slug]: { cover, images: [] } }. */
export async function buildMedia() {
  const cache = JSON.parse(await fs.readFile(CACHE, 'utf8').catch(() => '{}'));
  const remote = JSON.parse(await fs.readFile(path.join(ROOT, 'content/remote-media.json'), 'utf8'));
  const media = {};
  const slugs = (await fs.readdir(CONTENT, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();

  for (const slug of slugs) {
    const project = JSON.parse(await fs.readFile(path.join(CONTENT, slug, 'project.json'), 'utf8'));
    media[slug] = {
      cover: await processImage(slug, project.cover, cache, { og: true }),
      images: [],
    };
    if (remote[slug]?.length !== project.images.length) throw new Error(`Gallery metadata mismatch: ${slug}`);
    for (const image of remote[slug]) {
      const url = new URL(image.src);
      if (url.protocol !== 'https:' || url.hostname !== 'mir-s3-cdn-cf.behance.net') throw new Error(`Invalid gallery URL: ${slug}`);
      if (!(image.width > 0 && image.height > 0)) throw new Error(`Missing gallery dimensions: ${slug}`);
      media[slug].images.push(image);
    }
  }

  // Drop outputs of originals that no longer exist.
  const live = new Set(Object.values(cache).flatMap((c) => c.files));
  for (const key of Object.keys(cache)) {
    const [slug, file] = key.split('/');
    if (!(await exists(path.join(CONTENT, slug, 'originals', file)))) {
      for (const f of cache[key].files) {
        live.delete(f);
        await fs.rm(path.join(OUTPUT, f), { force: true });
      }
      delete cache[key];
    }
  }
  // Remove outputs that no longer belong to any current image (e.g. after re-encoding).
  for (const slug of await fs.readdir(OUTPUT).catch(() => [])) {
    for (const file of await fs.readdir(path.join(OUTPUT, slug)).catch(() => [])) {
      if (!live.has(`${slug}/${file}`)) await fs.rm(path.join(OUTPUT, slug, file), { force: true });
    }
  }
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, JSON.stringify(cache));
  return media;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const media = await buildMedia();
  console.log(`Media OK: ${Object.keys(media).length} projects`);
}
