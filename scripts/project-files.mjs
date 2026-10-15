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
    if (!image || typeof image !== 'object') fail('cada imagen debe indicar file o src');
    if (image.file && image.src) fail('una imagen debe tener file o src, no ambos');
    if (image.file) projectFile(folder, image.file);
    else {
      let url;
      try { url = new URL(image.src); } catch { fail('src debe ser una URL de imagen válida'); }
      if (url.protocol !== 'https:' || url.hostname !== 'mir-s3-cdn-cf.behance.net') fail('las imágenes remotas deben proceder del CDN de Behance');
      if (!(image.width > 0 && image.height > 0)) fail('las imágenes remotas necesitan width y height');
    }
  }
  return { ...data, cover, images };
}
