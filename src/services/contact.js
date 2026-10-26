// Contact form: messages are stored (KV binding) and, when configured, emailed through Brevo.
import { CONTACT_PAGE } from '../content.js';
import { jsonResponse } from '../lib/http.js';
import { allow } from '../lib/rate-limit.js';
import { runtime } from '../lib/runtime.js';
import { sendEmail } from './brevo.js';
import { THANKS_PAGE } from '../views/journey.js';

const MAX_BODY_LENGTH = 8192;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PROJECT_TYPES = ['identity', 'rebranding', 'campaigns', 'other'];

const clean = (value, max) => String(value ?? '').trim().slice(0, max);

async function readMessage(request, isForm) {
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) return null;
  const data = isForm ? Object.fromEntries(new URLSearchParams(text)) : JSON.parse(text);
  return data && typeof data === 'object' ? data : null;
}

function validate(data) {
  const message = {
    name: clean(data.name, 120),
    email: clean(data.email, 254).toLowerCase(),
    type: PROJECT_TYPES.includes(data.type) ? data.type : 'other',
    message: clean(data.message, 4000),
    language: data.language === 'es' ? 'es' : 'en',
  };
  const valid = message.name && EMAIL_PATTERN.test(message.email) && message.message.length >= 10;
  return valid ? message : null;
}

async function deliver(env, message, ctx) {
  const id = `${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}`;
  await env.KV.put(`contact/${id}`, JSON.stringify({ ...message, receivedAt: new Date().toISOString() }));
  const email = runtime().contactEmail;
  if (email) {
    const sending = sendEmail(email, {
      subject: `sirtraver.com · ${message.name} (${message.type})`,
      text: `${message.name} <${message.email}>\nType: ${message.type}\nLanguage: ${message.language}\n\n${message.message}`,
      replyTo: { email: message.email, name: message.name },
    }).catch((error) => console.error('Contact email failed:', error.message));
    if (ctx?.waitUntil) ctx.waitUntil(sending);
    else await sending;
  }
}

export async function contact(request, env, ctx) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return jsonResponse({ status: 'forbidden' }, { status: 403 });

  const contentType = request.headers.get('Content-Type') || '';
  const isForm = contentType.startsWith('application/x-www-form-urlencoded');
  let data = null;
  if (isForm || contentType.startsWith('application/json')) {
    try {
      data = await readMessage(request, isForm);
    } catch {
      data = null;
    }
  }

  let status = 'invalid';
  let code = 400;
  if (data?.website) [status, code] = ['sent', 200]; // honeypot: pretend success
  else if (!allow('contact', request, { limit: 5 })) [status, code] = ['limited', 429];
  else if (data) {
    const message = validate(data);
    if (message && !env.KV) [status, code] = ['unavailable', 503];
    else if (message) {
      try {
        await deliver(env, message, ctx);
        [status, code] = ['sent', 200];
      } catch {
        [status, code] = ['unavailable', 503];
      }
    }
  }

  if (isForm) {
    if (status === 'sent') return Response.redirect(new URL(THANKS_PAGE[data?.language === 'es' ? 'es' : 'en'], request.url).href, 303);
    const target = new URL(CONTACT_PAGE[data?.language === 'es' ? 'es' : 'en'], request.url);
    target.searchParams.set('sent', status === 'sent' ? 'ok' : 'error');
    return Response.redirect(target.href, 303);
  }
  return jsonResponse({ status }, { status: code });
}
