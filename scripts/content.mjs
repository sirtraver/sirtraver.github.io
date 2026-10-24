// Reads and validates content/ (projects and about page) and merges in the processed media.
// Errors name the file and the field, so a typo in a project.json is easy to find.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectDefinition } from './project-files.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const CONTENT = path.join(ROOT, 'content');

const bilingual = (value) => ({ en: String(value?.en ?? ''), es: String(value?.es ?? '') });
const list = (value) => ({ en: Array.isArray(value?.en) ? value.en.map(String) : [], es: Array.isArray(value?.es) ? value.es.map(String) : [] });

async function readProject(slug, media, projectsDir) {
  const data = await readProjectDefinition(slug, projectsDir);

  return {
    slug,
    id: data.id ?? null, // Behance ID of imported projects (old /projects/<id>/ URLs redirect)
    name: String(data.name),
    nameEs: data.nameEs ? String(data.nameEs) : '',
    category: data.category,
    conceptual: data.conceptual === true,
    date: data.date,
    order: Number(data.order ?? 0), // tie-break for projects published on the same day (lower first)
    year: Number(data.date.slice(0, 4)),
    behance: data.behance ? String(data.behance) : '',
    client: String(data.client ?? ''),
    role: bilingual(data.role),
    deliverables: list(data.deliverables),
    intro: bilingual(data.intro),
    result: bilingual(data.result),
    featured: data.featured === true,
    archived: data.archived === true,
    cover: media.cover,
    images: data.images.map((image, index) => ({ ...media.images[index], caption: bilingual(image.caption) })),
  };
}

async function readAbout() {
  const file = path.join(CONTENT, 'about.json');
  const data = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{}'));
  return {
    clients: (data.clients ?? []).filter((c) => c?.name).map((c) => ({ name: String(c.name), url: String(c.url ?? '') })),
    testimonials: (data.testimonials ?? [])
      .filter((t) => t?.quote && t?.author)
      .map((t) => ({ quote: bilingual(t.quote), author: String(t.author), role: bilingual(t.role) })),
  };
}

/** @param {Record<string, {cover: object, images: object[]}>} media output of buildMedia() */
export async function loadContent(media, { projectsDir } = {}) {
  const slugs = Object.keys(media);
  const projects = await Promise.all(slugs.map((slug) => readProject(slug, media[slug], projectsDir)));
  projects.sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order || a.name.localeCompare(b.name));
  return { projects, about: await readAbout() };
}
