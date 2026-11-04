import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { BASELINE, snapshot } from './approved-design-lib.mjs';

// Guards the approved design (v41, Fase 1 of the November 2026 audit) against accidental changes.
// After an intentional visual change, review it in the browser and run: node scripts/approve-design.mjs
const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));

test('approved pages and visual files match the approved design', async () => {
  const current = await snapshot();
  for (const [path, expected] of Object.entries(baseline.pages)) assert.equal(current.pages[path], expected, path);
  for (const [file, expected] of Object.entries(baseline.files)) assert.equal(current.files[file], expected, file);
});
