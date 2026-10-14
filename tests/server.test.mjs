import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { allProjects } from '../src/projects.js';

const PORT = 4300 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
let server;
let dataDir;

before(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'sirtraver-test-'));
  server = spawn(process.execPath, ['server/node.mjs', '--offline'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir },
    stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(BASE);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('server did not start');
});

after(async () => {
  server.kill('SIGTERM');
  await new Promise((resolve) => server.on('exit', resolve));
  await rm(dataDir, { recursive: true, force: true });
});

test('pages are served compressed with the security headers', async () => {
  const response = await fetch(`${BASE}/`, { headers: { 'Accept-Encoding': 'br' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-encoding'), 'br');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.ok((await response.text()).includes('Selected work'));
});

test('media files are served from disk and cached forever', async () => {
  const [url] = allProjects[0].cover.avif[0];
  const response = await fetch(BASE + url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/avif');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
});

test('paths outside the media folder are not exposed', async () => {
  for (const url of ['/media/../package.json', '/media/%2e%2e/package.json', '/media/kudake/missing.webp']) {
    assert.equal((await fetch(BASE + url)).status, 404, url);
  }
});

test('contact messages persist in the data file', async () => {
  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { Origin: BASE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@example.com', type: 'other', message: 'Testing the file store.' }),
  });
  assert.equal(response.status, 200);
  await new Promise((resolve) => setTimeout(resolve, 200));
  const data = JSON.parse(await readFile(path.join(dataDir, 'data.json'), 'utf8'));
  const key = Object.keys(data).find((k) => k.startsWith('contact/'));
  assert.ok(key);
  assert.equal(JSON.parse(data[key]).email, 'test@example.com');
});
