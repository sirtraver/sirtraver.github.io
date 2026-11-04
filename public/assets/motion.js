// Home motion: fanned hero covers and word-by-word statement.
// Everything is decorative; without JavaScript or with reduced motion the page is static and complete.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('mx-still');
    return;
  }
  const hero = document.querySelector('.mx-hero');
  const stack = [...document.querySelectorAll('.mx-stack-item')];
  const statement = document.querySelector('.mx-statement');
  const words = [...document.querySelectorAll('.mx-w')];
  document.documentElement.classList.add('mx-live');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let ticking = false;

  function frame() {
    ticking = false;
    const vh = window.innerHeight;
    const wide = window.innerWidth > 700;
    if (hero && stack.length) {
      const p = clamp(window.scrollY / (hero.offsetHeight * 0.9));
      const mid = (stack.length - 1) / 2;
      stack.forEach((img) => {
        const i = Number(img.style.getPropertyValue('--i'));
        const d = i - mid;
        const spread = wide ? 15 : 9;
        img.style.transform = `translate(calc(-50% + ${d * spread * p}vw), calc(-50% + ${-p * (wide ? 18 : 10) + Math.abs(d) * p * 3}vh)) rotate(${(d * 4) * (1 - p) + d * 6 * p}deg) scale(${1 - p * 0.18})`;
      });
    }
    if (statement && words.length) {
      const box = statement.getBoundingClientRect();
      const p = clamp((vh * 0.75 - box.top) / (box.height * 0.8));
      const lit = p * words.length;
      words.forEach((w, i) => { w.style.opacity = String(0.14 + 0.86 * clamp(lit - i)); });
    }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  frame();
})();
