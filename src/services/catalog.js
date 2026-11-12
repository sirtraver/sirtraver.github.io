// Gumroad catalog, read server-side with a private token. Only public product fields leave the server.
import { GUMROAD_IMAGE_HOSTS } from '../config.js';
import { jsonResponse } from '../lib/http.js';

const API = 'https://api.gumroad.com/v2/products';
const SELLER_HOST = 'sirtraver.gumroad.com';
const DEFAULT_HIDDEN_PRODUCT_ID = 'Moy9nnuULBf1HQdRh3v_HA==';
const FRESH_MS = 60 * 1000;
const STALE_IF_ERROR_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10000;

let memo = null;

export function clearCatalogCache() {
  memo = null;
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GUMROAD_IMAGE_HOSTS.includes(url.hostname) ? url.href : '';
  } catch {
    return '';
  }
}

export function publicProducts(items, hiddenId = '') {
  if (!Array.isArray(items)) throw new Error('Invalid catalog');

  return items
    .filter((p) => p && !p.deleted && p.published === true && p.id !== hiddenId)
    .flatMap((p) => {
      let url;
      try {
        url = new URL(p.short_url);
      } catch {
        return [];
      }
      if (url.protocol !== 'https:' || url.hostname !== SELLER_HOST || !url.pathname.startsWith('/l/')) return [];
      return [
        {
          id: p.id,
          title: String(p.name || 'Resource').slice(0, 180),
          summary: String(p.custom_summary || '').slice(0, 260),
          url: url.href,
          image: safeImageUrl(p.thumbnail_url),
          // Wide product cover, used by the resource cards (the thumbnail is square).
          cover: safeImageUrl(p.preview_url),
          free: p.price === 0,
          price: p.price === 0 ? 'Free · €0' : String(p.formatted_price || ''),
        },
      ];
    });
}

/** @returns {Promise<{status: 'ok' | 'unavailable', products: object[]}>} */
export async function getCatalog(env, fetcher = fetch) {
  const token = env.GUMROAD_ACCESS_TOKEN;
  if (!token) return { status: 'unavailable', products: [] };

  const hiddenId = env.GUMROAD_HIDDEN_PRODUCT_ID || DEFAULT_HIDDEN_PRODUCT_ID;
  const identity = `${token}|${hiddenId}`;
  const sameConfig = memo?.identity === identity;
  if (sameConfig && memo.fetchedAt + FRESH_MS > Date.now()) return { status: 'ok', products: memo.products };

  try {
    const response = await fetcher(API, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error('Upstream error');
    const data = await response.json();
    if (data.success !== true) throw new Error('Upstream error');
    const products = publicProducts(data.products, hiddenId);
    memo = { identity, products, fetchedAt: Date.now() };
    return { status: 'ok', products };
  } catch {
    // A short Gumroad outage keeps showing the last good catalog instead of an error.
    if (sameConfig && memo.fetchedAt + STALE_IF_ERROR_MS > Date.now()) return { status: 'ok', products: memo.products };
    return { status: 'unavailable', products: [] };
  }
}

export async function catalogApi(env, fetcher = fetch) {
  const catalog = await getCatalog(env, fetcher);
  return catalog.status === 'ok'
    ? jsonResponse(catalog, { cache: 'public, max-age=30, s-maxage=60' })
    : jsonResponse(catalog, { status: 503 });
}

export const productSlug = (product) => new URL(product.url).pathname.split('/').at(-1);
