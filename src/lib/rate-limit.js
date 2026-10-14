// Small in-memory limiter against form spam: N submissions per client per window.
// Per process/isolate only — enough for one server; a shared store would be needed at scale.
const hits = new Map();

export const clientId = (request) =>
  request.headers.get('CF-Connecting-IP') || (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim() || 'unknown';

/** @returns {boolean} true when the request is allowed */
export function allow(bucket, request, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const key = `${bucket}:${clientId(request)}`;
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10000) hits.clear(); // never grow without bound
  return true;
}

export const resetRateLimits = () => hits.clear();
