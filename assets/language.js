// Language preference on static hosting. The EN/ES links remember the visitor's choice, and
// the neutral entry page (/) sends Spanish-speaking visitors to /es/ unless they chose English.
// Mirrors the server negotiation in src/lib/language.js; explicit page URLs keep their language.
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
