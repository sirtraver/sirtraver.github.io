import worker from '../src/worker.js';
import { resetRateLimits } from '../src/lib/rate-limit.js';
import { configure } from '../src/lib/runtime.js';
import { clearCatalogCache } from '../src/services/catalog.js';

export const ORIGIN = 'https://sirtraver.com';

export function resetCaches() {
  clearCatalogCache();
  resetRateLimits();
  configure(OFF);
}

// Tests start with the optional integrations of config.js switched off; a test turns one on
// by passing its value in env.
export const OFF = { ANALYTICS_WEBSITE_ID: '', NEWSLETTER_FORM_URL: '' };

export const get = (path, env = {}, ctx = {}, init = {}) => worker.fetch(new Request(ORIGIN + path, init), { ...OFF, ...env }, ctx);

/** Replaces global fetch for the duration of fn (pages call Behance/Gumroad through it). */
export async function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}

export const offline = async (input) => {
  const { hostname } = new URL(typeof input === 'string' ? input : input.url);
  if (hostname === 'api.gumroad.com') return Response.json({ success: true, products: [] });
  return new Response('unavailable', { status: 503 });
};

/** In-memory Workers KV with the subset of the API the site uses. */
export function memoryKv() {
  const store = new Map();
  return {
    store,
    get: async (key, type) => (store.has(key) ? (type === 'json' ? JSON.parse(store.get(key)) : store.get(key)) : null),
    put: async (key, value) => void store.set(key, value),
    list: async ({ prefix = '' } = {}) => ({
      keys: [...store.keys()].filter((name) => name.startsWith(prefix)).map((name) => ({ name })),
      list_complete: true,
    }),
  };
}

export const gumroadProduct = (overrides = {}) => ({
  id: 'live',
  name: 'Live product',
  published: true,
  price: 1200,
  formatted_price: '€12',
  custom_summary: 'Imported summary',
  short_url: 'https://sirtraver.gumroad.com/l/live',
  thumbnail_url: 'https://public-files.gumroad.com/cover',
  file_info: { private: 'secret' },
  ...overrides,
});
