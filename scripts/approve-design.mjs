// Records the current pages and visual files as the approved design.
// Run only after reviewing an intentional visual change in the browser.
import { writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { BASELINE, snapshot } from '../tests/approved-design-lib.mjs';

const commit = execSync('git rev-parse HEAD').toString().trim();
const data = { version: 41, approved: new Date().toISOString().slice(0, 10), basedOnCommit: commit, ...(await snapshot()) };
await writeFile(BASELINE, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Approved design written to ${BASELINE.pathname}`);
