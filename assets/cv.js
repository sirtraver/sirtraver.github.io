// Adapt the on-screen preview while preserving the approved A4 print dimensions.
const page = document.querySelector('.page');
function fitCV() {
  if (!page) return;
  page.style.zoom = String(window.matchMedia('print').matches ? 1 : Math.min(1, Math.max(0.2, (window.innerWidth - 24) / 794)));
}
document.getElementById('cv-print')?.addEventListener('click', () => window.print());
window.addEventListener('resize', fitCV);
window.addEventListener('beforeprint', () => { if (page) page.style.zoom = '1'; });
window.addEventListener('afterprint', fitCV);
fitCV();
