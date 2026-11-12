// Click events for Umami (cookieless). Only loaded when analytics is switched on.
// Explicit: any element with data-track="event-name" (and optional data-track-* properties).
// Inferred: email links, Gumroad links, CV downloads, project and resource cards, social icons.
(() => {
  const send = (name, data) => {
    try {
      window.umami?.track(name, { page: location.pathname, ...data });
    } catch {
      /* Statistics must never break the page. */
    }
  };

  const describe = (link) => {
    const href = link.getAttribute('href') || '';
    if (link.dataset.track) {
      const data = {};
      for (const [key, value] of Object.entries(link.dataset)) {
        if (key.startsWith('track') && key !== 'track') data[key.slice(5).toLowerCase()] = value;
      }
      return [link.dataset.track, data];
    }
    if (href.startsWith('mailto:')) return ['email-click', {}];
    if (/\.pdf($|\?)/i.test(href)) return ['cv-download', { file: href.split('/').pop().split('?')[0] }];
    if (/gumroad\.com/i.test(href)) return ['gumroad-click', { url: href }];
    if (link.matches('.project-card[data-project]')) {
      const slug = link.dataset.project;
      return slug.startsWith('resource-') ? ['resource-open', { resource: slug.slice(9) }] : ['project-open', { project: slug }];
    }
    const social = [...link.classList].find((name) => name.startsWith('social-'));
    if (social) return ['social-click', { network: social.slice(7) }];
    if (link.host && link.host !== location.host) return ['outbound-click', { host: link.host }];
    return null;
  };

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest?.('a[href], [data-track]:not(form)');
      if (!link) return;
      const result = describe(link);
      if (result) send(...result);
    },
    { capture: true },
  );

  // Forms with data-track report a successful submission (see forms.js).
  document.addEventListener('sirtraver:submitted', (event) => {
    const name = event.target?.dataset?.track;
    if (name) send(name, {});
  });
})();
