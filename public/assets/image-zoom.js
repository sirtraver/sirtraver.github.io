// Shared image detail view. Native originals and modifier clicks remain available.
(() => {
  if (typeof HTMLDialogElement !== 'function') return;
  const es = document.documentElement.lang === 'es';
  const t = es ? {
    close: 'Cerrar imagen', more: 'Ampliar', less: 'Reducir', fit: 'Encajar', width: 'Ancho', widthLabel: 'Ajustar al ancho',
    view: 'Detalle de imagen', previous: 'Imagen anterior', next: 'Imagen siguiente', original: 'Abrir original ↗',
    hint: 'Usa + y − para ampliar. Desplázate por la imagen para explorarla.', error: 'No se ha podido cargar la imagen. Puedes abrir el original.',
  } : {
    close: 'Close image', more: 'Zoom in', less: 'Zoom out', fit: 'Fit', width: 'Width', widthLabel: 'Fit to width',
    view: 'Image detail', previous: 'Previous image', next: 'Next image', original: 'Open original ↗',
    hint: 'Use + and − to zoom. Scroll the image to explore it.', error: 'The image could not be loaded. You can open the original.',
  };
  const node = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.append(...children);
    return element;
  };
  const button = (label, content) => node('button', { type: 'button', 'aria-label': label, title: label }, content);
  const less = button(t.less, '−'), more = button(t.more, '+'), fit = button(t.fit, t.fit), width = button(t.widthLabel, t.width);
  const close = button(t.close, '×'), previous = button(t.previous, '←'), next = button(t.next, '→');
  const level = node('output', { 'aria-live': 'polite' }, '100%');
  const count = node('output', { class: 'image-zoom-count', 'aria-live': 'polite' });
  const caption = node('p', { class: 'image-zoom-caption' }, t.view);
  const original = node('a', { class: 'image-zoom-original', target: '_blank', rel: 'noopener noreferrer' }, t.original);
  const error = node('p', { class: 'image-zoom-error', role: 'status', hidden: '' }, t.error);
  const picture = node('img', { alt: '', draggable: 'false' });
  const stage = node('div', { class: 'image-zoom-stage', tabindex: '0', 'aria-label': t.hint }, error, picture);
  const dialog = node('dialog', { class: 'image-zoom image-zoom-refined', 'aria-label': t.view },
    node('div', { class: 'image-zoom-bar' }, caption, node('div', {}, original, close)),
    node('div', { class: 'image-zoom-controls' }, node('div', { class: 'image-zoom-navigation' }, previous, count, next),
      node('div', { class: 'image-zoom-magnify' }, less, level, more, fit, width)), stage);
  document.body.append(dialog);
  let opener, active = false, savedOverflow = '', factor = 1, fittedWidth = 1, originalWidth = 1, originalHeight = 1;
  let mode = 'fit', group = [], index = 0;
  const allowed = anchor => {
    try {
      const url = new URL(anchor.dataset.zoomSrc, location.href);
      return (url.origin === location.origin && url.pathname.startsWith('/media/')) || (url.protocol === 'https:' && url.hostname === 'mir-s3-cdn-cf.behance.net');
    } catch { return false; }
  };
  const update = () => {
    picture.style.width = `${Math.round(fittedWidth * factor)}px`;
    picture.style.height = 'auto';
    level.textContent = `${Math.round(factor * 100)}%`;
    more.disabled = factor >= 4; less.disabled = factor <= 1;
    fit.setAttribute('aria-pressed', String(mode === 'fit'));
    width.setAttribute('aria-pressed', String(mode === 'width'));
  };
  const measure = () => {
    const area = stage.getBoundingClientRect();
    const available = Math.max(1, area.width - 32);
    fittedWidth = mode === 'width' ? Math.min(originalWidth, available) : Math.max(1, Math.min(originalWidth, available, (area.height - 32) * originalWidth / originalHeight));
    update();
  };
  const reset = selected => { mode = selected; factor = 1; measure(); stage.scrollTop = stage.scrollLeft = 0; };
  const change = delta => { factor = Math.max(1, Math.min(4, factor + delta)); update(); };
  function show(selected, notify = false) {
    const anchor = group[selected];
    if (!anchor) return;
    index = selected; opener = anchor;
    const image = anchor.querySelector('img');
    originalWidth = Number(image?.getAttribute('width')) || 1600;
    originalHeight = Number(image?.getAttribute('height')) || 1000;
    picture.alt = image?.alt || t.view;
    caption.textContent = picture.alt;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}`;
    previous.disabled = index <= 0; next.disabled = index >= group.length - 1;
    error.hidden = true;
    original.href = anchor.href;
    factor = 1; measure();
    picture.src = anchor.dataset.zoomSrc;
    stage.scrollTop = stage.scrollLeft = 0;
    if (notify) anchor.dispatchEvent(new CustomEvent('sirtraver:zoomchange', { bubbles: true }));
  }
  const teardown = () => {
    if (!active) return;
    active = false;
    document.documentElement.style.overflow = savedOverflow;
    picture.removeAttribute('src'); group = [];
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  };
  const hide = () => { if (dialog.open) dialog.close(); teardown(); };
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-zoom-src]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !allowed(anchor)) return;
    const gallery = anchor.closest('.viewer-images, .project-gallery');
    group = gallery ? [...gallery.querySelectorAll('a[data-zoom-src]')].filter(allowed) : [anchor];
    const selected = group.indexOf(anchor);
    if (selected < 0) return;
    event.preventDefault(); active = true; mode = 'fit';
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal(); show(selected); close.focus();
  });
  picture.addEventListener('load', () => { if (!active) return; originalWidth = picture.naturalWidth; originalHeight = picture.naturalHeight; measure(); });
  picture.addEventListener('error', () => { if (active) error.hidden = false; });
  picture.addEventListener('dblclick', () => { factor = factor > 1 ? 1 : 2; update(); });
  previous.addEventListener('click', () => show(index - 1, true)); next.addEventListener('click', () => show(index + 1, true));
  more.addEventListener('click', () => change(.5)); less.addEventListener('click', () => change(-.5));
  fit.addEventListener('click', () => reset('fit')); width.addEventListener('click', () => reset('width'));
  close.addEventListener('click', hide);
  dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); hide(); });
  dialog.addEventListener('close', teardown);
  dialog.addEventListener('keydown', event => {
    if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      if (event.key === '0') reset('fit');
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') show(index + (event.key === 'ArrowLeft' ? -1 : 1), true);
      else change(event.key === '-' ? -.5 : .5);
    }
  });
  window.addEventListener('resize', () => { if (dialog.open) measure(); });
  window.addEventListener('popstate', hide);
})();
