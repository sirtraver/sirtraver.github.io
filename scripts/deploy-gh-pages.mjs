// Publishes _site/ to the gh-pages branch (GitHub Pages "Deploy from a branch").
// Use: npm run deploy   (needs WEB3FORMS_ACCESS_KEY in .env or the environment).
// Each deploy is one commit on gh-pages named after the source commit of main.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE = path.join(ROOT, '_site');
const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

if (git(['status', '--porcelain', '--untracked-files=no'])) throw new Error('Commit your changes before deploying.');
const source = git(['rev-parse', '--short', 'HEAD']);
const remote = git(['remote', 'get-url', 'origin']);

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sirtraver-pages-'));
try {
  git(['init', '-q', '-b', 'gh-pages'], dir);
  try {
    git(['fetch', '-q', '--depth=1', remote, 'gh-pages'], dir);
    git(['reset', '-q', '--soft', 'FETCH_HEAD'], dir);
  } catch {
    console.log('Creating the gh-pages branch.');
  }
  await fs.cp(SITE, dir, { recursive: true });
  git(['add', '-A'], dir);
  git(['-c', `user.name=${git(['config', 'user.name'])}`, '-c', `user.email=${git(['config', 'user.email'])}`, 'commit', '-q', '--allow-empty', '-m', `Deploy ${source} from main`], dir);
  git(['push', '-q', remote, 'HEAD:gh-pages'], dir);
  console.log(`Deployed ${source} to gh-pages.`);
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
