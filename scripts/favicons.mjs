// Favicons from the SIR TRA VER logo (content/projects/sirtraver/imagenes/…-01.webp).
// Large sizes (48 px and up, the ones Google Search uses) show the full logo tile;
// browser-tab sizes (16/32 px) show the logo's «S» on a black tile, which stays legible.
// Run once after changing the logo: node scripts/favicons.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SOURCE = path.join(ROOT, 'content/projects/sirtraver/imagenes/sirtraver-identidad-visual-01.webp');
const PUBLIC = path.join(ROOT, 'public');

// Positions in the 2560 px source image (logo tile, and the «S» inside it).
const LOGO = { left: 614, top: 453, width: 1331, height: 1660 };
const LETTER = { left: 833, top: 543, width: 340, height: 468 };

const flat = () => sharp(SOURCE).flatten({ background: '#ffffff' });
const logo = await flat().extract(LOGO).png().toBuffer();
const letter = await flat().extract(LETTER).png().toBuffer();

/** Full logo tile centred on a square; transparent or white background. */
const logoIcon = (size, background = { r: 0, g: 0, b: 0, alpha: 0 }, scale = 1) =>
  sharp(logo)
    .resize({ width: Math.round(size * scale), height: Math.round(size * scale), fit: 'contain', background })
    .extend((() => { const pad = Math.round((size - Math.round(size * scale)) / 2); return { top: pad, bottom: size - Math.round(size * scale) - pad, left: pad, right: size - Math.round(size * scale) - pad, background }; })())
    .png()
    .toBuffer();

/** The «S» on a black rounded square. */
async function letterIcon(size) {
  const glyph = await sharp(letter).resize({ height: Math.round(size * 0.64) }).png().toBuffer();
  const { width, height } = await sharp(glyph).metadata();
  const tile = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#000"/></svg>`);
  return sharp(tile).composite([{ input: glyph, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }]).png().toBuffer();
}

/** ICO container with embedded PNG images. */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(([size, png], i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, at);
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(png.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(([, png]) => png)]);
}

const white = { r: 255, g: 255, b: 255, alpha: 1 };
const outputs = {
  'assets/favicon-32.png': await letterIcon(32),
  'assets/favicon-48.png': await logoIcon(48),
  'assets/favicon-96.png': await logoIcon(96),
  'assets/favicon-192.png': await logoIcon(192),
  'assets/icon-512.png': await logoIcon(512, white, 0.8),
  'assets/apple-touch-icon.png': await logoIcon(180, white, 0.8),
  'favicon.ico': ico([[16, await letterIcon(16)], [32, await letterIcon(32)], [48, await logoIcon(48)]]),
};
for (const [file, bytes] of Object.entries(outputs)) {
  await fs.writeFile(path.join(PUBLIC, file), bytes);
  console.log(`  public/${file}`);
}
