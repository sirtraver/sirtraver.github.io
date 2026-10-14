// Static files are embedded at build time (see scripts/build.mjs) and served from memory.
import { assets } from '../generated/assets.js';
import { ORIGIN } from '../config.js';

const cache = new Map();

const decode = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

export function getAsset(path) {
  const entry = assets[path];
  if (!entry) return null;
  if (!cache.has(path)) cache.set(path, { type: entry.type, hash: entry.hash, bytes: decode(entry.base64) });
  return cache.get(path);
}

export const readJsonAsset = (path) => JSON.parse(new TextDecoder().decode(getAsset(path).bytes));

// Content-hashed URL, safe to cache forever.
export const assetUrl = (path) => (assets[path] ? `${path}?v=${assets[path].hash}` : path);

export const absoluteUrl = (path) => (/^https?:\/\//.test(path) ? path : ORIGIN + path);
