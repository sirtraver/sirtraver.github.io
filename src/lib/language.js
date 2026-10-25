// Negotiate only the neutral entry URL. Explicit page URLs keep their language.
import { LANGUAGES, languageOf } from '../content.js';
import { SECURITY_HEADERS } from './http.js';

const COOKIE = 'sirtraver_lang';

export function browserLanguage(header = '') {
  const candidates = header.split(',').map((part, index) => {
    const [tag, ...params] = part.trim().toLowerCase().split(';');
    const weight = params.find(value => value.trim().startsWith('q='));
    return { code: tag.split('-')[0], quality: weight === undefined ? 1 : Number(weight.trim().slice(2)), index };
  }).filter(item => LANGUAGES.includes(item.code) && item.quality > 0 && item.quality <= 1);
  candidates.sort((a, b) => b.quality - a.quality || a.index - b.index);
  return candidates[0]?.code ?? 'en';
}

function temporaryRedirect(url, cookie) {
  return new Response(null, {
    status: 302,
    headers: {
      ...SECURITY_HEADERS,
      Location: url.href,
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie, Accept-Language',
      ...(cookie ? { 'Set-Cookie': cookie } : {}),
    },
  });
}

export function languagePreferenceResponse(request, url) {
  // A language choice is a normal link, including without JavaScript. Clean the
  // query immediately so shared URLs and canonical metadata stay unchanged.
  const selected = url.searchParams.get('lang');
  const page = !/^\/(api|assets|media)(\/|$)/.test(url.pathname) && !/\.[^/]+$/.test(url.pathname);
  if (page && LANGUAGES.includes(selected) && (selected === languageOf(url.pathname) || url.pathname === '/')) {
    const target = new URL(url);
    target.searchParams.delete('lang');
    if (url.pathname === '/' && selected === 'es') target.pathname = '/es/';
    const cookie = `${COOKIE}=${selected}; Path=/; Max-Age=15552000; SameSite=Lax; HttpOnly${url.protocol === 'https:' ? '; Secure' : ''}`;
    return temporaryRedirect(target, cookie);
  }

  if (url.pathname !== '/') return null;
  const saved = request.headers.get('Cookie')?.match(/(?:^|;\s*)sirtraver_lang=(en|es)(?:;|$)/)?.[1];
  const preferred = saved ?? browserLanguage(request.headers.get('Accept-Language') ?? '');
  if (preferred === 'en') return null;
  const target = new URL(url);
  target.pathname = '/es/';
  return temporaryRedirect(target);
}
