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
    if (!phone.matches || y < 140 || goingUp) header.classList.remove('is-hidden');
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
  const hero = document.querySelector('.hero-enquiry');
  if (!fixed || !hero || typeof IntersectionObserver !== 'function') return;
  const observer = new IntersectionObserver(([entry]) => {
    fixed.classList.toggle('is-redundant', entry.isIntersecting);
  });
  observer.observe(hero);
})();

// Footer clock: local time in Madrid, like a studio signature.
(() => {
  const clock = document.querySelector('.mx-clock');
  if (!clock || typeof Intl !== 'object') return;
  const city = clock.textContent;
  const format = new Intl.DateTimeFormat(document.documentElement.lang, { hour: '2-digit', minute: '2-digit', timeZone: clock.dataset.tz });
  const tick = () => { clock.textContent = `${city} ${format.format(new Date())}`; };
  tick();
  setInterval(tick, 30000);
})();

