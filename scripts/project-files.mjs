// One folder is the complete input for one project. No central project registry.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECTS_DIR = fileURLToPath(new URL('../content/projects/', import.meta.url));
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;
const CATEGORIES = ['Visual identity', 'Visual design'];
const optionalJson = async (file) => {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw new Error(`${file}: ${error.message}`); }
};

export function projectFile(folder, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error(`${folder}: image paths must be relative`);
  const resolved = path.resolve(folder, relative);
  if (!resolved.startsWith(path.resolve(folder) + path.sep) || !IMAGE_FILE.test(relative)) {
    throw new Error(`${folder}: invalid image path ${relative}`);
  }
  return resolved;
}

export async function projectFolders(projectsDir = PROJECTS_DIR) {
  return (await fs.readdir(projectsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !/^[._]/.test(entry.name))
    .map((entry) => entry.name).sort();
}

export async function readProjectDefinition(slug, projectsDir = PROJECTS_DIR) {
  const folder = path.join(projectsDir, slug);
  const file = path.join(folder, 'project.json');
  const data = await optionalJson(file);
  const fail = (message) => { throw new Error(`${file}: ${message}`); };
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail('falta project.json con los datos del proyecto');
  if (data.draft === true) return null; // Drafts need not have all their files yet.
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('usa un nombre de carpeta en minúsculas y con guiones');
  if (typeof data.name !== 'string' || !data.name.trim()) fail('falta name (nombre del proyecto)');
  if (!CATEGORIES.includes(data.category)) fail(`category debe ser ${CATEGORIES.join(' o ')}`);
  if (data.conceptual !== undefined && typeof data.conceptual !== 'boolean') fail('conceptual debe ser true o false');
  if (data.tools !== undefined && (!Array.isArray(data.tools) || data.tools.some(tool => typeof tool !== 'string' || !tool.trim()))) fail('tools debe ser una lista de nombres de herramientas');
  if (data.portfolioOrder !== undefined && (!Number.isInteger(data.portfolioOrder) || data.portfolioOrder < 1)) fail('portfolioOrder debe ser un entero positivo');
  if (data.caseStudy !== undefined && (!Array.isArray(data.caseStudy) || data.caseStudy.some(section => !['en', 'es'].every(lang => typeof section?.title?.[lang] === 'string' && typeof section?.text?.[lang] === 'string')))) fail('caseStudy debe contener title y text en español e inglés');
  if (data.designDetails !== undefined && (!Array.isArray(data.designDetails) || data.designDetails.some(section => !['en', 'es'].every(lang => typeof section?.title?.[lang] === 'string' && typeof section?.text?.[lang] === 'string')))) fail('designDetails debe contener title y text en español e inglés');
  if (data.paletteNote !== undefined && !['en', 'es'].every(lang => typeof data.paletteNote?.[lang] === 'string')) fail('paletteNote debe contener texto en español e inglés');
  if (data.palette !== undefined && (!Array.isArray(data.palette) || data.palette.some(swatch => !/^#[0-9a-f]{6}$/i.test(swatch?.hex ?? '') || !['en', 'es'].every(lang => typeof swatch?.name?.[lang] === 'string')))) fail('palette debe ser una lista de colores con name (es/en) y hex (#RRGGBB)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date ?? '') || !Number.isFinite(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date) {
    fail('date debe ser una fecha real con formato AAAA-MM-DD');
  }
  const files = await fs.readdir(folder);
  const covers = files.filter((name) => /^portada\.(jpe?g|png|webp|avif)$/i.test(name));
  if (!data.cover && covers.length > 1) fail('deja una sola portada o indica cover en project.json');
  const cover = data.cover || covers[0];
  if (!cover) fail('falta portada.jpg, portada.png, portada.webp o portada.avif');
  projectFile(folder, cover);

  let images;
  if (Array.isArray(data.images)) images = data.images;
  else {
    images = await optionalJson(path.join(folder, 'galeria.json'));
    if (images === null) {
      const names = await fs.readdir(path.join(folder, 'imagenes')).catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
      images = names.filter((name) => IMAGE_FILE.test(name) && !name.startsWith('.'))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
        .map((name) => ({ file: `imagenes/${name}` }));
    }
  }
  if (!Array.isArray(images) || !images.length) fail('añade imágenes a imagenes/ o una galería en galeria.json');
  for (const image of images) {
    if (!image || typeof image !== 'object') fail('cada imagen debe indicar file');
    // Every gallery image is served from sirtraver.com: remote URLs (src) are not accepted.
    if (!image.file) fail('cada imagen debe ser un archivo local: {"file": "imagenes/01.webp"}');
    projectFile(folder, image.file);
    if (image.layout !== undefined && !['full', 'pair'].includes(image.layout)) fail(`${image.file}: layout debe ser "full" o "pair"`);
  }
  if (data.hover !== undefined && !images.some((image) => image.file === data.hover)) fail('hover debe ser una de las imágenes de la galería');
  // Optional crop of the cover on portfolio cards (CSS object-position, e.g. "50% 85%").
  if (data.coverPosition !== undefined && !/^\d{1,3}% \d{1,3}%$/.test(data.coverPosition)) fail('coverPosition debe tener el formato "50% 85%"');
  // Optional spot: an MP4 in public/video/ (served from sirtraver.com) with a gallery image as poster.
  if (data.video !== undefined) {
    const video = data.video;
    if (!/^\/video\/[a-z0-9-]+\/[a-z0-9-]+\.mp4$/.test(video?.src ?? '')) fail('video.src debe ser una ruta como /video/proyecto/spot.mp4');
    if (!images.some((image) => image.file === video.poster)) fail('video.poster debe ser una de las imágenes de la galería');
    if (!['en', 'es'].every(lang => typeof video.caption?.[lang] === 'string')) fail('video.caption debe contener texto en español e inglés');
    if (!/^\d+:\d+$/.test(video.aspect ?? '')) fail('video.aspect debe tener el formato 9:16');
  }
  return { ...data, cover, images };
}
