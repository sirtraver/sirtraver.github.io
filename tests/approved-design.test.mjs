import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { get, offline, withFetch } from './helpers.mjs';
const baseline = JSON.parse(await readFile(new URL('../docs/approved-design-v34.json', import.meta.url), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
// Only the explicitly requested hero/mobile CTA additions are excluded. The original
// page structure and content must still match the archived approved version.
const normalize = html => html.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/<!-- journey:(hero|mobile) -->[\s\S]*?<!-- \/journey:\1 -->\n?/g, '').replace(/(<form class="launch-form"[^>]*?) data-redirect="[^"]*"/, '$1').replace(/\?v=[a-zA-Z0-9-]+/g, '?v=VERSION').replace(/© \d{4}/g, '© YEAR');

test('approved pages stay intact apart from the requested home introduction and contact CTAs', async () => {
  await withFetch(offline, async () => {
    for (const [path, expected] of Object.entries(baseline.bodyHashes)) {
      const html = await (await get(path, { GUMROAD_ACCESS_TOKEN: 'approved-design' })).text();
      if (baseline.homeShellHashes[path]) {
        const shell = normalize(html).replace(/<section class="value-hero">[\s\S]*?<\/section>\n?/, '');
        assert.equal(hash(shell), baseline.homeShellHashes[path], path);
      } else assert.equal(hash(normalize(html)), expected, path);
    }
  });
});
test('the approved stylesheet is preserved before the isolated viewer styles', async () => {
  const css = await readFile(new URL('../public/assets/site.css', import.meta.url));
  assert.equal(hash(css.subarray(0, baseline.cssPrefixBytes)), baseline.cssPrefixHash);
});
