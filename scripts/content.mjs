// Reads and validates content/ (projects and about page) and merges in the processed media.
// Errors name the file and the field, so a typo in a project.json is easy to find.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectDefinition } from './project-files.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const CONTENT = path.join(ROOT, 'content');

/** Duration in seconds, read from the MP4 movie header (mvhd box). */
export async function videoDuration(file) {
  const bytes = await fs.readFile(file);
  const at = bytes.indexOf('mvhd');
  if (at < 0) throw new Error(`${file}: no MP4 movie header`);
  const version = bytes[at + 4];
  const timescale = version === 1 ? bytes.readUInt32BE(at + 24) : bytes.readUInt32BE(at + 16);
  const duration = version === 1 ? Number(bytes.readBigUInt64BE(at + 28)) : bytes.readUInt32BE(at + 20);
  return duration / timescale;
}

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
    portfolioOrder: data.portfolioOrder ?? null,
    year: Number(data.date.slice(0, 4)),
    behance: data.behance ? String(data.behance) : '',
    client: String(data.client ?? ''),
    role: bilingual(data.role),
    deliverables: list(data.deliverables),
    tools: (data.tools ?? []).map(String),
    intro: bilingual(data.intro),
    result: bilingual(data.result),
    caseStudy: (data.caseStudy ?? []).map(section => ({ title: bilingual(section.title), text: bilingual(section.text) })),
    designDetails: (data.designDetails ?? []).map(section => ({ title: bilingual(section.title), text: bilingual(section.text) })),
    paletteNote: bilingual(data.paletteNote),
    // Brand colours shown as HTML swatches; share is the usage proportion (%), when documented.
    palette: (data.palette ?? []).map(swatch => ({ name: bilingual(swatch.name), hex: String(swatch.hex).toUpperCase(), share: Number(swatch.share) || 0 })),
    // Second image that fades in when hovering the portfolio card (a gallery file).
    hover: data.hover ? media.images[data.images.findIndex(image => image.file === data.hover)] ?? null : null,
    // Optional spot shown before the gallery (MP4 from public/video/, poster from the gallery).
    videos: await Promise.all((data.video === undefined ? [] : [data.video].flat()).map(async (video) => ({
      src: video.src,
      date: video.date,
      duration: Math.round(await videoDuration(path.join(ROOT, 'public', video.src))),
      aspect: video.aspect,
      caption: bilingual(video.caption),
      title: video.title ? bilingual(video.title) : null,
      poster: media.images[data.images.findIndex(image => image.file === video.poster)],
    }))),
    coverPosition: data.coverPosition ? String(data.coverPosition) : '',
    featured: data.featured === true,
    archived: data.archived === true,
    cover: media.cover,
    images: data.images.map((image, index) => ({ ...media.images[index], caption: bilingual(image.caption), layout: image.layout ?? '' })),
  };
}

async function readAbout() {
  const file = path.join(CONTENT, 'about.json');
  const data = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{}'));
  const resume = data.resume ?? {};
  const experience = items => (items ?? []).map(item => ({ period: bilingual(item.period), role: bilingual(item.role), organization: String(item.organization ?? ''), description: bilingual(item.description) }));
  return {
    resume: {
      experience: experience(resume.experience),
      education: (resume.education ?? []).map(item => ({ period: bilingual(item.period), title: bilingual(item.title), institution: String(item.institution ?? ''), current: item.current === true })),
      skills: list(resume.skills),
      tools: (resume.tools ?? []).map(String),
      languages: (resume.languages ?? []).map(item => ({ name: bilingual(item.name), level: String(item.level ?? ''), institution: String(item.institution ?? ''), year: String(item.year ?? '') })),
    },
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
