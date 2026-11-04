// Home motion: staggered lines rise in, the project sphere turns with scroll, and the closing clock shows Madrid time.
// Everything is decorative; without JavaScript or with reduced motion the page is static and complete.
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = document.querySelector('.bg-clock');
  if (clock && typeof Intl === 'object') {
    const parts = () => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Madrid' }).formatToParts(new Date()).map((p) => [p.type, p.value]));
    const tick = () => { const p = parts(); clock.querySelector('.bg-clock-h').textContent = p.hour; clock.querySelector('.bg-clock-m').textContent = p.minute; };
    tick();
    setInterval(tick, 15000);
  }
  if (still) return;
  document.documentElement.classList.add('bg-live');

  const lines = [...document.querySelectorAll('.bg-line, .bg-index-title > span')];
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    lines.forEach((line, i) => { line.style.transitionDelay = `${(i % 7) * 70}ms`; io.observe(line); });
  } else lines.forEach((line) => line.classList.add('is-in'));

  const wrap = document.querySelector('.bg-sphere-wrap');
  const rot = document.querySelector('.bg-sphere-rot');
  if (!wrap || !rot) return;
  let ticking = false;
  let spin = 0;
  let last = performance.now();
  const frame = (now) => {
    spin = (spin + (now - last) * 0.006) % 360;
    last = now;
    const box = wrap.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / innerHeight));
    rot.style.transform = `rotateX(${(-12 + p * 30).toFixed(2)}deg) rotateY(${(spin + p * 120).toFixed(2)}deg)`;
    if (box.bottom > -200 && box.top < innerHeight + 200) requestAnimationFrame(frame);
    else ticking = false;
  };
  const start = () => { if (!ticking) { ticking = true; last = performance.now(); requestAnimationFrame(frame); } };
  window.addEventListener('scroll', start, { passive: true });
  start();
})();
