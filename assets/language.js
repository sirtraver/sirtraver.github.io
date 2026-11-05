// Language preference on static hosting. The EN/ES links remember the visitor's choice, and
// the neutral entry page (/) sends Spanish-speaking visitors to /es/ unless they chose English.
// Mirrors the server negotiation in src/lib/language.js; explicit page URLs keep their language.
document.documentElement.classList.add('js'); // Lets CSS enhance only when scripts run (menu, reveal).

(() => {
  const KEY = 'sirtraver_lang';
  const LANGUAGES = ['en', 'es'];

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('.language-links a[hreflang]');
    if (!link) return;
    try {
      localStorage.setItem(KEY, link.hreflang);
    } catch {}
  });

  // Static hosting has a single (English) 404.html: under /es/ it is replaced by the Spanish one, keeping the URL.
  if (document.documentElement.lang === 'en' && /^\/es(\/|$)/.test(location.pathname)) {
    document.addEventListener('DOMContentLoaded', () => {
      if (!document.querySelector('main.not-found')) return;
      fetch('/es/404.html').then((response) => (response.ok ? response.text() : Promise.reject())).then((page) => {
        document.open();
        document.write(page);
        document.close();
      }).catch(() => {});
    });
    return;
  }

  if (location.pathname !== '/') return;
  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {}
  const browser = (navigator.languages?.length ? navigator.languages : [navigator.language])
    .map((tag) => String(tag).toLowerCase().split('-')[0])
    .find((code) => LANGUAGES.includes(code));
  const preferred = LANGUAGES.includes(saved) ? saved : browser ?? 'en';
  if (preferred === 'es') location.replace(`/es/${location.search}${location.hash}`);
})();
