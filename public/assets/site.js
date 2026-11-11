// Phones: the two-row header slides away while scrolling down and returns on scroll up.
(() => {
  const header = document.querySelector('.site-header');
  const phone = window.matchMedia('(max-width: 700px)');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!phone.matches || y < 140 || goingUp || header.classList.contains('is-open')) header.classList.remove('is-hidden');
    else if (goingDown && !header.contains(document.activeElement)) header.classList.add('is-hidden');
    if (goingDown || goingUp) lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true },
  );
  // Keyboard users tabbing into the header always see it.
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
})();

// The mobile contact shortcut takes over once the main CTA leaves the screen.
// Native links and a visible fixed fallback remain available without this API.
(() => {
  const fixed = document.querySelector('.mobile-enquiry');
  const targets = [...document.querySelectorAll('.hero-enquiry, .project-enquiry, .about-actions')];
  if (!fixed || !targets.length || typeof IntersectionObserver !== 'function') return;
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
    fixed.classList.toggle('is-redundant', visible.size > 0);
  });
  targets.forEach((target) => observer.observe(target));
})();

// Phone menu: one button opens the navigation, languages and contact as a full-screen panel.
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  const setOpen = (open, { focus = false } = {}) => {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? toggle.dataset.close : toggle.dataset.open;
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    else if (focus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) setOpen(false, { focus: true });
  });
  // Leaving the phone layout closes the panel so the desktop header is never covered.
  window.matchMedia('(max-width: 700px)').addEventListener?.('change', (event) => { if (!event.matches) setOpen(false); });
  window.addEventListener('pageshow', () => setOpen(false));
})();

// Scroll reveals: content below the fold fades up once as it enters the viewport.
// Anything already on screen stays as rendered, so there is no flash on load.
(() => {
  if (typeof IntersectionObserver !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...document.querySelectorAll('.project-grid > .project-card, .project-story > div, .project-palette, .project-gallery > figure, .gallery-pair > figure, .project-result, .project-enquiry, .resume-section')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px' });
  for (const item of items) {
    if (item.getBoundingClientRect().top < window.innerHeight) continue;
    // Siblings that enter together are staggered slightly (pairs, story columns).
    const index = [...item.parentElement.children].indexOf(item);
    item.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 80}ms`);
    item.classList.add('reveal');
    observer.observe(item);
  }
})();

// Home cards: a small "View project" label follows a mouse pointer. Decorative, so hidden from
// assistive technology; touch screens and keyboards never see it.
(() => {
  const grid = document.querySelector('.project-grid[data-cursor-label]');
  if (!grid || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const label = document.createElement('span');
  label.className = 'cursor-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = grid.dataset.cursorLabel;
  document.body.append(label);
  let card = null;
  const hide = () => { card = null; label.classList.remove('is-on'); };
  grid.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const current = event.target.closest('.project-card');
    if (current !== card) {
      card = current;
      label.classList.toggle('is-on', Boolean(card));
      if (card) label.style.setProperty('--accent', card.style.getPropertyValue('--accent') || 'transparent');
    }
    label.style.translate = `${event.clientX + 16}px ${event.clientY + 18}px`;
  });
  grid.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('pagehide', hide);
})();

// Home: the page background takes a tint of the project under the pointer; without a pointer
// (touch) or while scrolling, of the card nearest the middle of the screen.
(() => {
  const grid = document.querySelector('.project-grid[data-cursor-label]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.project-card')];
  const accentOf = (card) => card?.style.getPropertyValue('--accent') || '';
  const paint = (card) => {
    const accent = accentOf(card);
    if (accent) document.body.style.setProperty('--page-tint', accent);
    else document.body.style.removeProperty('--page-tint');
  };
  let hovered = null;
  let ticking = false;
  const nearest = () => {
    const middle = window.innerHeight / 2;
    let best = null;
    let bestDistance = Infinity;
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) continue;
      const distance = Math.abs((box.top + box.bottom) / 2 - middle);
      if (distance < bestDistance) [best, bestDistance] = [card, distance];
    }
    return window.scrollY < 80 ? null : best; // the top of the page stays neutral
  };
  const update = () => { ticking = false; paint(hovered ?? nearest()); };
  window.addEventListener('scroll', () => { if (!ticking) requestAnimationFrame(update); ticking = true; }, { passive: true });
  grid.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = event.target.closest('.project-card');
    update();
  });
  grid.addEventListener('pointerleave', () => { hovered = null; update(); });
  window.addEventListener('pagehide', () => document.body.style.removeProperty('--page-tint'));
})();
