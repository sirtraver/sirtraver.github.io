// Launch waitlist: consented sign-ups stored in Workers KV (binding KV). No emails are sent from here.
import { PAGES } from '../content.js';
import { emptyResponse, jsonResponse } from '../lib/http.js';
import { allow } from '../lib/rate-limit.js';
import { runtime } from '../lib/runtime.js';
import { requestDoubleOptIn } from './brevo.js';
import { THANKS_PAGE } from '../views/journey.js';

const MAX_BODY_LENGTH = 2048;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_TEXT = 'Notify me when sirtraver resources launch';
const PRIVATE_HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Without JavaScript the form posts url-encoded data; reply with a redirect back to the page.
const formReply = (request, language, status) => {
  if (status === 'subscribed') return Response.redirect(new URL(`${THANKS_PAGE[language]}?notice=resources`, request.url).href, 303);
  const target = new URL(PAGES.resources[language], request.url);
  target.searchParams.set('subscription', status === 'confirm' ? 'confirm' : status === 'subscribed' ? 'ok' : 'error');
  return Response.redirect(target.href, 303);
};

async function readSubmission(request, isForm) {
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) return null;
  if (isForm) {
    const form = new URLSearchParams(text);
    return {
      email: form.get('email'),
      consent: form.get('consent') === 'on',
      website: form.get('website'),
      language: form.get('language'),
    };
  }
  const data = JSON.parse(text);
  return data && typeof data === 'object' ? data : null;
}

// With Brevo configured, the visitor also gets a confirmation email (double opt-in).
async function confirmByEmail(request, record) {
  const newsletter = runtime().newsletter;
  if (!newsletter) return false;
  const redirectUrl = new URL(PAGES.resources[record.language], request.url);
  redirectUrl.searchParams.set('subscription', 'confirmed');
  try {
    await requestDoubleOptIn(newsletter, { email: record.email, language: record.language, redirectUrl: redirectUrl.href });
    return true;
  } catch (error) {
    console.error('Newsletter confirmation failed:', error.message);
    return false;
  }
}

async function store(request, env, submission) {
  const email = String(submission.email || '').trim().toLowerCase();
  // Honeypot filled in: pretend success so bots learn nothing.
  if (submission.website) return [200, 'subscribed'];
  if (submission.consent !== true || email.length > 254 || !EMAIL_PATTERN.test(email)) return [400, 'invalid'];
  if (!env.KV) return [503, 'unavailable'];

  try {
    const key = `waitlist/${await sha256(email)}.json`;
    if (await env.KV.get(key)) return [200, 'subscribed'];
    const record = {
      email,
      language: submission.language === 'es' ? 'es' : 'en',
      subscribedAt: new Date().toISOString(),
      consent: CONSENT_TEXT,
      source: 'sirtraver.com/resources',
    };
    await env.KV.put(key, JSON.stringify(record));
    return [200, (await confirmByEmail(request, record)) ? 'confirm' : 'subscribed'];
  } catch {
    return [503, 'unavailable'];
  }
}

export async function subscribe(request, env) {
  if (request.method !== 'POST') return emptyResponse(405, { Allow: 'POST' });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return jsonResponse({ status: 'forbidden' }, { status: 403 });

  const contentType = request.headers.get('Content-Type') || '';
  const isForm = contentType.startsWith('application/x-www-form-urlencoded');
  if ((!isForm && !contentType.startsWith('application/json')) || Number(request.headers.get('Content-Length') || 0) > MAX_BODY_LENGTH) {
    return jsonResponse({ status: 'invalid' }, { status: 400 });
  }

  let submission;
  try {
    submission = await readSubmission(request, isForm);
  } catch {
    submission = null;
  }
  const [status, code] = !submission
    ? [400, 'invalid']
    : submission.website
      ? [200, 'subscribed']
      : allow('subscribe', request)
        ? await store(request, env, submission)
        : [429, 'limited'];
  const language = submission?.language === 'es' ? 'es' : 'en';
  return isForm ? formReply(request, language, code) : jsonResponse({ status: code }, { status });
}

async function isAuthorized(request, env) {
  if (!env.WAITLIST_ADMIN_TOKEN) return false;
  // Compare digests so the check does not leak the token through timing.
  const [given, expected] = await Promise.all([
    sha256(request.headers.get('Authorization') || ''),
    sha256(`Bearer ${env.WAITLIST_ADMIN_TOKEN}`),
  ]);
  return given === expected;
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/**
 * Private CSV export (GET; ?type=contact for contact messages) and storage self-check (POST).
 * Unauthorized calls get a plain 404.
 */
export async function waitlistAdmin(request, env) {
  if (!(await isAuthorized(request, env))) return new Response('Not found', { status: 404, headers: PRIVATE_HEADERS });
  if (!env.KV) return Response.json({ status: 'unavailable' }, { status: 503, headers: PRIVATE_HEADERS });

  if (request.method === 'POST') {
    const key = 'system/waitlist-storage-check.json';
    const check = { status: 'ready', checkedAt: new Date().toISOString() };
    await env.KV.put(key, JSON.stringify(check));
    const read = await env.KV.get(key, 'json');
    return Response.json({ status: read?.checkedAt === check.checkedAt ? 'ready' : 'unavailable' }, { headers: PRIVATE_HEADERS });
  }
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...PRIVATE_HEADERS, Allow: 'GET, POST' } });

  const exports = {
    waitlist: { prefix: 'waitlist/', file: 'sirtraver-launch-list.csv', columns: ['email', 'language', 'subscribedAt', 'consent'] },
    contact: { prefix: 'contact/', file: 'sirtraver-contact-messages.csv', columns: ['receivedAt', 'name', 'email', 'type', 'language', 'message'] },
  };
  const { prefix, file, columns } = exports[new URL(request.url).searchParams.get('type')] ?? exports.waitlist;

  const records = [];
  let cursor;
  do {
    const page = await env.KV.list({ prefix, cursor });
    for (const { name } of page.keys) {
      const record = await env.KV.get(name, 'json');
      if (record) records.push(record);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  const header = columns.map((c) => c.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)).join(',');
  const rows = records.map((r) => columns.map((c) => csvCell(r[c])).join(','));
  return new Response([header, ...rows].join('\r\n'), {
    headers: {
      ...PRIVATE_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${file}"`,
    },
  });
}
