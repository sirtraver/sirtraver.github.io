// Copies the whole project (content originals, code and git history) to iCloud Drive.
// Generated files (node_modules, dist, processed media) are skipped: the build recreates them.
//
//   npm run backup            (BACKUP_DIR overrides the destination)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const ICLOUD = path.join(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs');
const DESTINATION = process.env.BACKUP_DIR || path.join(ICLOUD, 'sirtraver-backup');

if (!process.env.BACKUP_DIR && !existsSync(ICLOUD)) {
  console.error('iCloud Drive is not available on this Mac. Set BACKUP_DIR to back up somewhere else.');
  process.exit(1);
}
mkdirSync(DESTINATION, { recursive: true });

// Paths are relative to the project folder; the code lives in recovered-sites/.
const EXCLUDE = ['node_modules/', '/recovered-sites/_site/', '/recovered-sites/dist/', '/recovered-sites/public/media/', '/recovered-sites/src/generated/', 'capturas/', '.DS_Store', '.env'];
execFileSync('rsync', ['-a', '--delete', ...EXCLUDE.flatMap((p) => ['--exclude', p]), `${PROJECT}/`, `${DESTINATION}/`], { stdio: 'inherit' });

const size = execFileSync('du', ['-sh', DESTINATION]).toString().split('\t')[0];
console.log(`Backup OK: ${DESTINATION} (${size})`);
