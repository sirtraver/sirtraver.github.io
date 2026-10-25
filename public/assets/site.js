// Phones: the two-row header slides away while scrolling down and returns on scroll up.
(() => {
  const header = document.querySelector('.site-header');
  const phone = window.matchMedia('(max-width: 700px)');
  if (!header) return;
  const socials = header.querySelector('.social-menu');
  if (socials) {
    document.addEventListener('click', event => { if (!socials.contains(event.target)) socials.open = false; });
    socials.addEventListener('keydown', event => {
      if (event.key === 'Escape' && socials.open) {
        event.preventDefault();
        socials.open = false;
        socials.querySelector('summary').focus({ preventScroll: true });
      }
    });
  }

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!phone.matches || y < 140 || goingUp) header.classList.remove('is-hidden');
    else if (goingDown && !socials?.open && !header.contains(document.activeElement)) header.classList.add('is-hidden');
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
