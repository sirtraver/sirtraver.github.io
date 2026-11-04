// Shared by the approved-design test and scripts/approve-design.mjs (no tests registered here).
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { get, offline, withFetch } from './helpers.mjs';

export const BASELINE = new URL('../docs/approved-design-v41.json', import.meta.url);
export const PAGES = ['/', '/es/', '/about/', '/es/about/', '/resources/', '/es/resources/'];
export const VISUAL_FILES = ['public/assets/site.css', 'public/assets/project-viewer.js', 'public/assets/image-zoom.js', 'public/assets/navigation.js', 'public/assets/site.js'];
export const hash = value => createHash('sha256').update(value).digest('hex');
// Copyright year and asset versions change on their own; everything else in <body> is frozen.
export const normalize = html => html.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/\?v=[a-zA-Z0-9-]+/g, '?v=VERSION').replace(/© \d{4}/g, '© YEAR');

export async function snapshot() {
  const pages = {};
  await withFetch(offline, async () => {
    for (const path of PAGES) pages[path] = hash(normalize(await (await get(path, { GUMROAD_ACCESS_TOKEN: 'approved-design' })).text()));
  });
  const files = {};
  for (const file of VISUAL_FILES) files[file] = hash(await readFile(new URL(`../${file}`, import.meta.url)));
  return { pages, files };
}
