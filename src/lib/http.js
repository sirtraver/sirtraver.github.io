import { GUMROAD_IMAGE_HOSTS } from '../config.js';
import { runtime } from './runtime.js';

const imageSources = ["'self'", 'data:', 'https://mir-s3-cdn-cf.behance.net', ...GUMROAD_IMAGE_HOSTS.map((host) => `https://${host}`)];
const FORM_ENDPOINT = 'https://api.web3forms.com';

/**
 * @param {object} [extra]  Additional sources for pages that embed a third party.
 * @param {string[]} [extra.script]
 * @param {string[]} [extra.frame]
 */
export function contentSecurityPolicy({ script = [], frame = [] } = {}) {
  const analytics = runtime().analytics?.origin;
  const scripts = ["'self'", ...script, ...(analytics ? [analytics] : [])];
  const connect = ["'self'", FORM_ENDPOINT, ...(analytics ? [analytics] : [])];
  return [
    "default-src 'self'",
    `script-src ${scripts.join(' ')}`,
    "style-src 'self'",
    // Inline style attributes only carry each image's placeholder colour.
    "style-src-attr 'unsafe-inline'",
    `img-src ${imageSources.join(' ')}`,
    `connect-src ${connect.join(' ')}`,
    ...(frame.length ? [`frame-src ${frame.join(' ')}`] : []),
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self' ${FORM_ENDPOINT}`,
    "frame-ancestors 'none'",
  ].join('; ');
}

export const SECURITY_HEADERS = {
  'Content-Security-Policy': contentSecurityPolicy(),
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const NO_INDEX = { 'X-Robots-Tag': 'noindex' };

export function htmlResponse(request, body, { status = 200, noindex = false, csp } = {}) {
  return new Response(request.method === 'HEAD' ? null : String(body), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': contentSecurityPolicy(csp),
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...(noindex ? NO_INDEX : {}),
    },
  });
}

export function jsonResponse(body, { status = 200, cache = 'no-store', headers = {} } = {}) {
  return Response.json(body, {
    status,
    headers: { ...SECURITY_HEADERS, ...NO_INDEX, 'Cache-Control': cache, ...headers },
  });
}

export const emptyResponse = (status, headers = {}) =>
  new Response(null, { status, headers: { ...SECURITY_HEADERS, ...NO_INDEX, 'Cache-Control': 'no-store', ...headers } });

export const redirect = (url, status = 301) => Response.redirect(url, status);
