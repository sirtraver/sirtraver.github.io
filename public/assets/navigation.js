// A draggable selection for the existing navigation links. Anchors remain native:
// click, modifier-click, keyboard activation and the no-JavaScript fallback still work.
(() => {
  const nav = document.querySelector('.site-header nav');
  if (!nav || typeof PointerEvent !== 'function') return;
  const links = [...nav.querySelectorAll('a')];
  const current = links.findIndex((link) => link.hasAttribute('aria-current'));
  if (current < 0 || links.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'sirtraver-nav-transition';
  const thumb = document.createElement('span');
  thumb.className = 'nav-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  nav.prepend(thumb);
  nav.classList.add('nav-ready', 'nav-starting');

  let items = [];
  let bounds;
  let gesture = null;
  let position = 0;
  let suppressClickUntil = 0;
  let navigationTimer;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function measure() {
    bounds = nav.getBoundingClientRect();
    items = links.map((link) => {
      const box = link.getBoundingClientRect();
      const left = box.left - bounds.left - nav.clientLeft;
      return { left, width: box.width, height: box.height, top: box.top - bounds.top - nav.clientTop, center: left + box.width / 2 };
    });
  }

  function highlight(index) {
    links.forEach((link, i) => link.classList.toggle('is-previewed', i === index));
  }

  // Interpolate width as well as position: labels need not all have equal lengths.
  function place(center, index) {
    const first = items[0];
    const last = items.at(-1);
    center = clamp(center, first.center, last.center);
    const right = items.findIndex((item) => item.center >= center);
    const upper = items[Math.max(0, right)];
    const lower = items[Math.max(0, right - 1)];
    const progress = upper === lower ? 0 : (center - lower.center) / (upper.center - lower.center);
    const width = lower.width + (upper.width - lower.width) * progress;
    nav.style.setProperty('--nav-x', `${center - width / 2}px`);
    nav.style.setProperty('--nav-width', `${width}px`);
    nav.style.setProperty('--nav-height', `${first.height}px`);
    nav.style.setProperty('--nav-top', `${first.top}px`);
    position = (center - first.center) / (last.center - first.center);
    highlight(index);
  }

  const settle = (index) => place(items[index].center, index);
  const nearest = (center) => items.reduce((best, item, i) => Math.abs(item.center - center) < Math.abs(items[best].center - center) ? i : best, 0);

  function remember(link) {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ position, to: new URL(link.href).pathname, time: Date.now() })); } catch { /* Storage is optional. */ }
  }

  function resetGesture() {
    if (!gesture) return;
    const { id, dragging } = gesture;
    gesture = null;
    if (dragging) suppressClickUntil = Date.now() + 450;
    nav.classList.remove('is-dragging');
    if (nav.hasPointerCapture(id)) nav.releasePointerCapture(id);
    settle(current);
  }

  measure();
  let previous;
  try {
    previous = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
  } catch { /* Storage is optional. */ }
  const continuing = previous?.to === location.pathname && Date.now() - previous.time < 5000 && Number.isFinite(previous.position) && !reducedMotion.matches;
  if (continuing) {
    const center = items[0].center + clamp(previous.position, 0, 1) * (items.at(-1).center - items[0].center);
    place(center, nearest(center));
  } else settle(current);
  // Commit the starting frame before enabling the spring on the destination page.
  thumb.getBoundingClientRect();
  requestAnimationFrame(() => {
    nav.classList.remove('nav-starting');
    settle(current);
  });

  // In the phone menu the links are a vertical list: plain taps, no draggable thumb.
  const phoneMenu = window.matchMedia?.('(max-width: 700px)');
  nav.addEventListener('pointerdown', (event) => {
    if (phoneMenu?.matches && document.documentElement?.classList?.contains('js')) return;
    if (!event.isPrimary || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest('a');
    if (!links.includes(link)) return;
    clearTimeout(navigationTimer);
    measure();
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, index: current,
      offset: link === links[current] ? event.clientX - bounds.left - nav.clientLeft - items[current].center : 0 };
  });

  nav.addEventListener('pointermove', (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      // Leave vertical touch scrolling to the browser; only claim a horizontal drag.
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { resetGesture(); return; }
      if (Math.abs(dx) < 6) return;
      gesture.dragging = true;
      nav.setPointerCapture(event.pointerId);
      nav.classList.add('is-dragging');
    }
    event.preventDefault();
    const center = event.clientX - bounds.left - nav.clientLeft - gesture.offset;
    gesture.index = nearest(center);
    place(center, gesture.index);
  });

  nav.addEventListener('pointerup', (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (!gesture.dragging) { gesture = null; return; }
    const index = gesture.index;
    const outside = event.clientX < bounds.left - 16 || event.clientX > bounds.right + 16 || event.clientY < bounds.top - 24 || event.clientY > bounds.bottom + 24;
    event.preventDefault();
    if (outside) { resetGesture(); return; }
    remember(links[index]);
    gesture = null;
    suppressClickUntil = Date.now() + 450;
    nav.classList.remove('is-dragging');
    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);
    measure();
    settle(index);
    if (index !== current) {
      navigationTimer = setTimeout(() => location.assign(links[index].href), reducedMotion.matches ? 0 : 100);
    }
  });

  nav.addEventListener('pointercancel', resetGesture);
  nav.addEventListener('lostpointercapture', resetGesture);
  window.addEventListener('blur', resetGesture);
  nav.addEventListener('dragstart', (event) => event.preventDefault());

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!links.includes(link)) return;
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.detail > 0 && !modified && Date.now() < suppressClickUntil) { event.preventDefault(); return; }
    if (event.defaultPrevented || event.button !== 0 || modified) return;
    clearTimeout(navigationTimer);
    remember(link);
    settle(links.indexOf(link));
  }, true);

  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearTimeout(navigationTimer);
      resetGesture();
      settle(current);
      return;
    }
    const index = links.indexOf(document.activeElement);
    if (index < 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.key === 'ArrowRight' ? (index + 1) % links.length
      : event.key === 'ArrowLeft' ? (index + links.length - 1) % links.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : null;
    if (target !== null) { event.preventDefault(); links[target].focus(); }
  });

  const sync = () => { resetGesture(); measure(); settle(current); };
  window.addEventListener('resize', sync);
  window.addEventListener('pageshow', (event) => { if (event.persisted) { clearTimeout(navigationTimer); sync(); } });
  document.fonts?.ready.then(() => requestAnimationFrame(() => { if (!gesture) sync(); }));
})();
