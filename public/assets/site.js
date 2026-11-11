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

// Own cursor on mouse-driven screens: an arrow with a chip that names what is under it and takes
// the colour of the project it is over. Decorative: hidden from assistive technology, never shown on
// touch screens, and the native cursor returns inside dialogs and form fields.
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const spanish = document.documentElement.lang === 'es';
  const words = spanish ? { you: 'Tú', open: 'Abrir', zoom: 'Ampliar' } : { you: 'You', open: 'Open', zoom: 'Zoom' };
  const cardLabel = document.querySelector('.project-grid[data-cursor-label]')?.dataset.cursorLabel ?? words.open;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cursor = document.createElement('div');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="site-cursor-body"><svg viewBox="0 0 26 28"><path class="site-cursor-arrow" d="M3 3l6.2 20.5 3.6-8.3 8.6-2.7z"/></svg><span class="site-cursor-chip"><span></span><i></i></span></div>';
  document.body.append(cursor);
  const body = cursor.firstChild;
  const [label, mark] = cursor.querySelector('.site-cursor-chip').children;

  // Dark or light chip text, whichever reads on the project colour.
  const inkOn = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1a1a19' : '#fff';
  };
  const describe = (target) => {
    const card = target.closest?.('.project-card');
    if (card) return { text: cardLabel, mark: '→', accent: card.style.getPropertyValue('--accent') };
    const pager = target.closest?.('.project-pager a');
    if (pager) return { text: words.open, mark: '→', accent: pager.style.getPropertyValue('--accent') };
    if (target.closest?.('.gallery-zoom')) return { text: words.zoom, mark: '+' };
    if (target.closest?.('a, button, summary, label, [role="button"]')) return { text: words.open, mark: '↗' };
    return { text: words.you, mark: '' };
  };

  let x = 0;
  let lastX = 0;
  let tilt = 0;
  let frame = 0;
  let state = '';
  const settle = () => {
    frame = 0;
    const lean = Math.max(-10, Math.min(10, (x - lastX) * 0.6));
    lastX = x;
    tilt += (lean - tilt) * 0.2;
    body.style.setProperty('--tilt', `${still.matches ? 0 : tilt.toFixed(2)}deg`);
    if (Math.abs(tilt) > 0.05) frame = requestAnimationFrame(settle);
  };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    document.documentElement.classList.add('has-cursor');
    cursor.classList.add('is-on');
    x = event.clientX;
    cursor.style.transform = `translate3d(${event.clientX - 3}px, ${event.clientY - 3}px, 0)`;
    const next = describe(event.target);
    const key = `${next.text}|${next.mark}|${next.accent ?? ''}`;
    if (key !== state) {
      state = key;
      label.textContent = next.text;
      mark.textContent = next.mark;
      if (next.accent) {
        cursor.style.setProperty('--chip', next.accent);
        cursor.style.setProperty('--chip-ink', inkOn(next.accent));
      } else {
        cursor.style.removeProperty('--chip');
        cursor.style.removeProperty('--chip-ink');
      }
    }
    if (!frame) frame = requestAnimationFrame(settle);
  }, { passive: true });
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  window.addEventListener('blur', () => cursor.classList.remove('is-on'));
  window.addEventListener('pagehide', () => cursor.classList.remove('is-on', 'is-down'));
})();

// Display type scrambles under the pointer: letters near it turn into coloured symbols for a moment
// and settle back. The heading keeps its text as an accessible name; letters are split only when a
// mouse first reaches it, so touch screens and search engines see plain text.
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const headings = document.querySelectorAll('.value-hero h1, .project-header h1, .about-copy h1, .project-enquiry h2, .project-result p, .project-pager a span');
  const GLYPHS = '<>*!&%$#@^+=/';
  // Colours of the work itself: the palette on a case study, the project accents on the home page.
  const colours = [...new Set([
    ...[...document.querySelectorAll('.project-palette li')].map((item) => item.style.getPropertyValue('--swatch')),
    ...[...document.querySelectorAll('.project-card[style], .project-pager a[style]')].map((item) => item.style.getPropertyValue('--accent')),
  ].filter(Boolean))];
  if (!colours.length) colours.push('#1F4FFF', '#FF5A2A', '#FFC21F', '#C61F2E');

  const split = (heading) => {
    const size = parseFloat(getComputedStyle(heading).fontSize);
    const text = heading.textContent;
    if (!heading.hasAttribute('aria-label') && /^H\d$/.test(heading.tagName)) heading.setAttribute('aria-label', text.trim());
    const letters = [];
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 1) { walk(child); continue; }
        if (child.nodeType !== 3) continue;
        const fragment = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { fragment.append(part); continue; }
          const word = document.createElement('span');
          word.className = 'scramble-word';
          for (const char of part) {
            const letter = document.createElement('span');
            letter.className = 'scramble-ch';
            letter.setAttribute('aria-hidden', 'true');
            letter.textContent = char;
            word.append(letter);
            letters.push({ node: letter, char, until: 0 });
          }
          fragment.append(word);
        }
        child.replaceWith(fragment);
      }
    };
    walk(heading);
    // Freeze each letter's width (in em, so it follows the fluid type size) before any glyph changes.
    const widths = letters.map((letter) => letter.node.getBoundingClientRect().width);
    letters.forEach((letter, index) => { letter.node.style.width = `${(widths[index] / size).toFixed(4)}em`; });
    return letters;
  };

  for (const heading of headings) {
    let letters = null;
    let pointer = null;
    let timer = 0;
    const tick = () => {
      const now = performance.now();
      const reach = parseFloat(getComputedStyle(heading).fontSize) * 1.5;
      let busy = false;
      for (const letter of letters) {
        if (pointer) {
          const box = letter.node.getBoundingClientRect();
          const distance = Math.hypot(box.left + box.width / 2 - pointer.x, box.top + box.height / 2 - pointer.y);
          if (distance < reach) letter.until = now + 160 + Math.random() * 260;
        }
        if (letter.until > now) {
          busy = true;
          letter.node.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          letter.node.style.color = colours[Math.floor(Math.random() * colours.length)];
        } else if (letter.node.textContent !== letter.char || letter.node.style.color) {
          letter.node.textContent = letter.char;
          letter.node.style.color = '';
        }
      }
      if (!busy && !pointer) { clearInterval(timer); timer = 0; }
    };
    heading.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      letters ??= split(heading);
      pointer = { x: event.clientX, y: event.clientY };
      if (!timer) timer = setInterval(tick, 55);
    });
    heading.addEventListener('pointerleave', () => { pointer = null; });
  }
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
