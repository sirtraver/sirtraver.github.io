// Dark project viewer: a primary click on a portfolio card opens its gallery in a
// full-screen <dialog>.
// - The address bar shows the project page URL, so it can be shared; Back closes the viewer.
// - Previous/next buttons and the arrow keys move between projects in grid order.
// Modified clicks, projects without a gallery and failures fall back to the regular link:
// the project page on this site.
(() => {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const script = document.currentScript;
  const grid = document.querySelector('.project-grid');
  if (!grid || !script?.dataset.gallery || typeof HTMLDialogElement !== 'function') return;

  const text =
    document.documentElement.lang === 'es'
      ? {
          original: 'Ver en Behance',
          conceptual: 'Proyecto conceptual',
          close: 'Cerrar proyecto',
          previous: 'Proyecto anterior',
          next: 'Proyecto siguiente',
          end: 'Descripción, comentarios y valoraciones en Behance',
          error: 'Alguna imagen no se ha podido cargar. Inténtalo de nuevo en unos instantes.',
          story: 'Concepto y aplicaciones',
          zoom: 'Pulsa una imagen para explorar los detalles.',
          enlarge: 'Ampliar imagen',
        }
      : {
          original: 'View on Behance',
          conceptual: 'Concept project',
          close: 'Close project',
          previous: 'Previous project',
          next: 'Next project',
          end: 'Description, comments & appreciations on Behance',
          error: 'An image could not be loaded. Please try again in a moment.',
          story: 'Concept & applications',
          zoom: 'Select an image to explore the details.',
          enlarge: 'Enlarge image',
        };

  const el = (tag, attributes = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    node.append(...children);
    return node;
  };

  // Galleries are small (one JSON file); load them up front so a click can open instantly.
  let galleries = null;
  const loaded = fetch(script.dataset.gallery)
    .then((response) => {
      if (!response.ok) throw new Error('Gallery data unavailable');
      return response.json();
    })
    .catch(() => ({}))
    .then((data) => (galleries = data));

  const title = el('h2', { id: 'viewer-title' });
  const projectKind = el('span', { class: 'viewer-kind', hidden: '' }, text.conceptual);
  const original = el('a', { class: 'viewer-original', target: '_blank', rel: 'noopener noreferrer' }, `${text.original} ↗`);
  const previousButton = el('button', { class: 'viewer-step', type: 'button', 'aria-label': text.previous }, '←');
  const nextButton = el('button', { class: 'viewer-step', type: 'button', 'aria-label': text.next }, '→');
  const closeButton = el('button', { class: 'viewer-close', type: 'button', 'aria-label': text.close }, '×');
  const images = el('div', { class: 'viewer-images' });
  const overview = el('div', { class: 'viewer-overview', hidden: '' });
  const hint = el('p', { class: 'viewer-hint' }, text.zoom);
  const error = el('p', { class: 'viewer-error', hidden: '' });
  const end = el('a', { class: 'viewer-end', target: '_blank', rel: 'noopener noreferrer' }, `${text.end} ↗`);
  const scroller = el('div', { class: 'viewer-scroll' }, overview, hint, images, error, end);
  const dialog = el(
    'dialog',
    { class: 'project-viewer', 'aria-labelledby': 'viewer-title' },
    el(
      'header',
      { class: 'viewer-bar' },
      el('div', {}, el('span', { class: 'viewer-brand' }, 'sirtraver'), el('div', { class: 'viewer-heading' }, title, projectKind)),
      el('div', {}, original, previousButton, nextButton, closeButton),
    ),
    scroller,
  );
  document.body.append(dialog);

  const main = document.querySelector('main');
  const CARD = 'a.project-card[data-project], a.featured-project[data-project]';
  const cards = () => [...main.querySelectorAll(CARD)].filter((card) => galleries?.[card.dataset.project]);

  let current = null; // card being shown
  let opener = null; // card focused again when the viewer closes
  let previousOverflow = '';
  let pageTitle = document.title;
  let closing = false;
  let active = false; // viewer state applied to the page (title, scroll lock)

  const showError = () => {
    error.textContent = text.error;
    error.hidden = false;
  };

  function galleryImage(item, index) {
    const local = !item.src;
    if (local) {
      if (!item.avif?.length || !item.webp?.length) return [];
      if (![...item.avif, ...item.webp].every(([url]) => typeof url === 'string' && url.startsWith('/media/'))) return [];
    } else {
      let remote;
      try { remote = new URL(item.src); } catch { return []; }
      if (remote.protocol !== 'https:' || remote.hostname !== 'mir-s3-cdn-cf.behance.net') return [];
    }
    const sizes = '(max-width: 700px) 100vw, min(1120px, calc(100vw - 96px))';
    const srcset = (sources) => sources.map(([url, width]) => `${url} ${width}w`).join(', ');
    // src goes last so the loading attributes apply to the very first request.
    const image = el('img', {
      alt: `${title.textContent} · ${index + 1}`,
      width: item.width,
      height: item.height,
      loading: index === 0 ? 'eager' : 'lazy',
      decoding: 'async',
      ...(local ? { srcset: srcset(item.webp), sizes } : {}),
      src: local ? item.webp.at(-1)[0] : item.src,
    });
    image.style.backgroundColor = item.color;
    image.addEventListener('error', showError, { once: true });
    const source = local ? item.webp.at(-1)[0] : item.src;
    const anchor = el('a', { class: 'gallery-zoom', href: source, 'data-zoom-src': source, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${text.enlarge} ${index + 1}: ${title.textContent}` }, local ? el('picture', {}, el('source', { type: 'image/avif', srcset: srcset(item.avif), sizes }), image) : image);
    return [anchor];
  }

  function show(card) {
    const project = galleries[card.dataset.project];
    current = card;
    title.textContent = card.querySelector('h3')?.textContent ?? '';
    projectKind.hidden = !project.conceptual;
    original.hidden = end.hidden = !project.behance;
    original.href = end.href = project.behance || '#';
    error.hidden = true;
    overview.replaceChildren();
    const intro = project.intro?.[lang];
    if (intro) overview.append(el('p', { class: 'viewer-intro' }, intro));
    if (project.caseStudy?.length) {
      const sections = project.caseStudy.map(section => el('div', {}, el('h3', {}, section.title[lang]), el('p', {}, section.text[lang])));
      overview.append(el('details', { class: 'viewer-story' }, el('summary', {}, text.story), el('div', { class: 'viewer-story-body' }, ...sections)));
    }
    overview.hidden = !overview.childElementCount;
    images.replaceChildren(...project.images.flatMap(galleryImage));
    scroller.scrollTop = 0;
    document.title = `${title.textContent} — sirtraver`;

    const list = cards();
    const index = list.indexOf(card);
    previousButton.disabled = index <= 0;
    nextButton.disabled = index === -1 || index >= list.length - 1;
  }

  function open(card) {
    closing = false;
    active = true;
    opener = card;
    pageTitle = document.title;
    show(card);
    history.pushState({ viewer: true }, '', card.getAttribute('href'));
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    closeButton.focus();
  }

  function step(offset) {
    const list = cards();
    const target = list[list.indexOf(current) + offset];
    if (!target) return;
    show(target);
    opener = target;
    history.replaceState({ viewer: true }, '', target.getAttribute('href'));
  }

  // Restores the page. Runs synchronously (the dialog's own close event can be delayed in
  // background tabs) and only once per opening.
  function teardown() {
    if (!active) return;
    active = false;
    if (dialog.open) dialog.close();
    document.title = pageTitle;
    document.documentElement.style.overflow = previousOverflow;
    images.replaceChildren();
    opener?.focus({ preventScroll: true });
  }

  // Closing goes back in history, so the home URL is restored and Back/Forward stay consistent.
  const close = () => {
    if (closing) return;
    closing = true;
    if (history.state?.viewer) history.back();
    else teardown();
  };

  window.addEventListener('popstate', () => {
    if (active) teardown();
    // Forward into a closed viewer entry: show that URL's real page (the project page).
    else if (history.state?.viewer) window.location.reload();
  });

  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === scroller) close();
  });
  dialog.addEventListener('cancel', (event) => {
    // Escape: close through history like the other paths.
    event.preventDefault();
    close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  dialog.addEventListener('close', () => {
    // A close the page did not start (forced Escape) still leaves the history entry: drop it.
    if (active && history.state?.viewer) history.back();
    else teardown();
  });

  main.addEventListener('click', (event) => {
    const card = event.target.closest(CARD);
    if (!card || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = card.dataset.project;

    if (galleries) {
      if (galleries[id]) {
        event.preventDefault();
        open(card);
      }
      return;
    }
    // Data still loading (rare): wait for it, then open the viewer or the project page.
    event.preventDefault();
    loaded.then(() => (galleries[id] ? open(card) : window.location.assign(card.href)));
  });
})();
