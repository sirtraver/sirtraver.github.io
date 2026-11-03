import { ORIGIN, PORTRAIT } from '../config.js';
import { ARCHIVE_PAGE, LANGUAGES, PAGES, projectPath } from '../content.js';
import { absoluteUrl } from '../lib/assets.js';
import { escape } from '../lib/html.js';
import { largestUrl } from '../lib/picture.js';

/**
 * @param {object[]} projects  Active projects (covers listed on the home pages).
 * @param {object[]} archived  Archived projects (their pages and the archive page are listed too).
 * @param {string} lastModified  ISO date (YYYY-MM-DD) of the build.
 */
export function sitemap(projects, archived, lastModified) {
  const images = {
    home: projects.map((p) => absoluteUrl(largestUrl(p.cover))),
    resources: [],
    about: [ORIGIN + PORTRAIT.path],
  };

  const entry = (paths, lang, pictures) => {
    const alternates = [...LANGUAGES.map((code) => [code, paths[code]]), ['x-default', paths.en]]
      .map(([code, path]) => `<xhtml:link rel="alternate" hreflang="${code}" href="${ORIGIN + path}"/>`)
      .join('');
    const imageTags = pictures.map((src) => `<image:image><image:loc>${escape(src)}</image:loc></image:image>`).join('');
    return `<url><loc>${ORIGIN + paths[lang]}</loc><lastmod>${lastModified}</lastmod>${alternates}${imageTags}</url>`;
  };

  const urls = LANGUAGES.flatMap((lang) => [
    ...Object.keys(PAGES).map((page) => entry(PAGES[page], lang, images[page])),
    ...[...projects, ...archived].map((project) =>
      entry(
        { en: projectPath(project, 'en'), es: projectPath(project, 'es') },
        lang,
        [...new Set([absoluteUrl(largestUrl(project.cover)), ...project.images.map((image) => absoluteUrl(largestUrl(image)))])],
      ),
    ),
    ...(archived.length ? [entry(ARCHIVE_PAGE, lang, [])] : []),
  ]);

  urls.push(...LANGUAGES.map(lang => entry({ en: '/resume/', es: '/cv/' }, lang, [])));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

// A focused image sitemap makes each cover discoverable alongside its own project,
// instead of identifying all covers only with the portfolio landing page.
export function coverSitemap(projects, lastModified) {
  const entries = projects.map(project => {
    const alternates = LANGUAGES.map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${ORIGIN + projectPath(project, lang)}"/>`).join('');
    return `<url><loc>${ORIGIN + projectPath(project, 'es')}</loc><lastmod>${lastModified}</lastmod>${alternates}<image:image><image:loc>${escape(absoluteUrl(largestUrl(project.cover)))}</image:loc></image:image></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>\n`;
}
