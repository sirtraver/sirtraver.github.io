// Production server for running sirtraver on your own machine or VPS (Node ≥ 22).
// It serves /media/* from disk, runs every other request through the Worker bundle
// (dist/server/index.js) and stores data (waitlist, contact messages) in a JSON file.
// Put it behind Caddy or nginx for HTTPS (see deploy/).
//
// Environment:
//   PORT            default 4173
//   HOST            default 127.0.0.1 (use 0.0.0.0 inside Docker)
//   PUBLIC_ORIGIN   public URL, e.g. https://sirtraver.com (default http://HOST:PORT)
//   DATA_DIR        where data.json is kept (default ./data)
//   + the variables in .env.example
// Flags (development): --offline (simulated Behance/Gumroad), --memory (no data file).
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { createFileStore, createMemoryStore } from './store.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const MEDIA_DIR = path.join(ROOT, 'public/media');
const args = new Set(process.argv.slice(2));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const origin = (process.env.PUBLIC_ORIGIN || `http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`).replace(/\/$/, '');

if (args.has('--offline')) {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = async (input, options) => {
    const { hostname } = new URL(typeof input === 'string' ? input : input.url);
    if (hostname === 'api.gumroad.com') return Response.json({ success: true, products: [] });
    if (hostname === 'www.behance.net') return new Response('Offline fixture', { status: 503 });
    return nativeFetch(input, options);
  };
}

const source = await fs.readFile(path.join(ROOT, 'dist/server/index.js'), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const store = args.has('--memory') ? createMemoryStore() : await createFileStore(path.join(process.env.DATA_DIR || path.join(ROOT, 'data'), 'data.json'));
const env = {
  GUMROAD_ACCESS_TOKEN: args.has('--offline') ? 'offline-fixture' : process.env.GUMROAD_ACCESS_TOKEN,
  GUMROAD_HIDDEN_PRODUCT_ID: process.env.GUMROAD_HIDDEN_PRODUCT_ID,
  WAITLIST_ADMIN_TOKEN: process.env.WAITLIST_ADMIN_TOKEN,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_LIST_ID: process.env.BREVO_LIST_ID,
  BREVO_DOI_TEMPLATE_ID: process.env.BREVO_DOI_TEMPLATE_ID,
  CONTACT_TO: process.env.CONTACT_TO,
  ANALYTICS_SRC: process.env.ANALYTICS_SRC,
  ANALYTICS_WEBSITE_ID: process.env.ANALYTICS_WEBSITE_ID,
  KV: store,
};

const pending = new Set();
const ctx = {
  waitUntil(promise) {
    const tracked = Promise.resolve(promise).catch(() => {}).finally(() => pending.delete(tracked));
    pending.add(tracked);
  },
};

const MEDIA_TYPES = { '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const COMPRESSIBLE = /^(text\/|application\/(json|xml|javascript))|image\/svg/;

async function serveMedia(req, res, pathname) {
  const file = path.join(MEDIA_DIR, path.normalize(pathname.slice('/media/'.length)));
  const type = MEDIA_TYPES[path.extname(file)];
  if (!file.startsWith(MEDIA_DIR + path.sep) || !type) return false;
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) return false;
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    // File names carry a content hash (scripts/images.mjs): safe to cache forever.
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
  return true;
}

function send(req, res, response, body) {
  const headers = Object.fromEntries(response.headers);
  const accepts = req.headers['accept-encoding'] || '';
  if (body.length > 1024 && COMPRESSIBLE.test(headers['content-type'] || '') && /\b(br|gzip)\b/.test(accepts)) {
    const brotli = /\bbr\b/.test(accepts);
    body = brotli ? zlib.brotliCompressSync(body) : zlib.gzipSync(body);
    headers['content-encoding'] = brotli ? 'br' : 'gzip';
    headers.vary = 'Accept-Encoding';
  }
  headers['content-length'] = body.length;
  res.writeHead(response.status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/media/') && (await serveMedia(req, res, url.pathname))) return;

    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 65536) return void res.writeHead(413).end();
      chunks.push(chunk);
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    const request = new Request(url, {
      method: req.method,
      headers,
      ...(req.method === 'GET' || req.method === 'HEAD' ? {} : { body: Buffer.concat(chunks) }),
    });
    const response = await worker.fetch(request, env, ctx);
    send(req, res, response, Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});

server.listen(port, host, () => {
  console.log(`sirtraver running at ${origin}/ (listening on ${host}:${port})`);
  if (args.has('--offline')) console.log('Offline mode: simulated empty Gumroad catalog.');
  console.log(args.has('--memory') ? 'Storage: in memory (cleared on exit).' : 'Storage: data file.');
});

async function shutdown() {
  server.close();
  await Promise.allSettled(pending);
  await store.flush?.();
  process.exit(0);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, shutdown);
