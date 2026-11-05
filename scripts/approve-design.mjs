// Records the current pages, styles and scripts as the approved design (docs/approved-design-v34.json
// and docs/plantilla-definitiva-v38.json keep their historic names; the "version" field says which).
// Run only after a design change has been reviewed: `node scripts/approve-design.mjs v43 "<note>"`.
// tests/approved-design.test.mjs then fails on any unreviewed change to these files or page bodies.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { get, offline, withFetch } from '../tests/helpers.mjs';

const [version = 'unversioned', note = ''] = process.argv.slice(2);
const hash = (value) => createHash('sha256').update(value).digest('hex');
// Same normalisation as tests/approved-design.test.mjs.
const normalize = (html) => html.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/<!-- journey:(hero|mobile) -->[\s\S]*?<!-- \/journey:\1 -->\n?/g, '').replace(/^[ \t]*<!-- curriculum:access -->[\s\S]*?<!-- \/curriculum:access -->\n?/gm, '').replace(/(<form class="launch-form"[^>]*?) data-redirect="[^"]*"/, '$1').replace(/(<a href="[^"?]*)(" lang="(en|es)" hreflang="\3")/g, '$1?lang=$3$2').replace(/\?v=[a-zA-Z0-9-]+/g, '?v=VERSION').replace(/© \d{4}/g, '© YEAR');

const baselineFile = new URL('../docs/approved-design-v34.json', import.meta.url);
const templateFile = new URL('../docs/plantilla-definitiva-v38.json', import.meta.url);
const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));
const template = JSON.parse(await readFile(templateFile, 'utf8'));

await withFetch(offline, async () => {
  for (const path of Object.keys(baseline.bodyHashes)) {
    const html = await (await get(path, { GUMROAD_ACCESS_TOKEN: 'approved-design' })).text();
    baseline.bodyHashes[path] = hash(normalize(html));
    if (baseline.homeShellHashes[path]) baseline.homeShellHashes[path] = hash(normalize(html).replace(/<section class="value-hero">[\s\S]*?<\/section>\n?/, ''));
    if (baseline.resourcesShellHashes[path]) {
      baseline.resourcesShellHashes[path] = hash(normalize(html).replace(/<main id="main">[\s\S]*?<\/main>/, ''));
      baseline.resourcesFormHashes[path] = hash(html.match(/<form class="launch-form"[\s\S]*?<\/form>/)[0]);
    }
  }
});
const css = await readFile(new URL('../public/assets/site.css', import.meta.url));
baseline.cssPrefixBytes = css.length;
baseline.cssPrefixHash = hash(css);
for (const file of Object.keys(template.visualFiles)) template.visualFiles[file] = hash(await readFile(new URL(`../${file}`, import.meta.url)));
for (const data of [baseline, template]) Object.assign(data, { version: `${version}${note ? ` — ${note}` : ''}`, commit: 'see git log' });
await writeFile(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
await writeFile(templateFile, JSON.stringify(template, null, 2) + '\n');
console.log(`Approved design recorded as ${baseline.version}`);
