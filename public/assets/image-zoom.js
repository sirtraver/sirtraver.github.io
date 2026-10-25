// A shared, keyboard-accessible image detail view. The original anchors remain
// useful without JavaScript and with modifier clicks. Works inside the project
// dialog and on directly opened project pages.
(() => {
  if (typeof HTMLDialogElement !== 'function') return;
  const es = document.documentElement.lang === 'es';
  const text = es
    ? { close: 'Cerrar imagen', more: 'Ampliar', less: 'Reducir', fit: 'Ajustar', view: 'Detalle de imagen', hint: 'Usa + y − para ampliar. Desplázate por la imagen para explorarla.' }
    : { close: 'Close image', more: 'Zoom in', less: 'Zoom out', fit: 'Fit', view: 'Image detail', hint: 'Use + and − to zoom. Scroll the image to explore it.' };
  const node = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.append(...children);
    return element;
  };
  const button = (label, content) => node('button', { type: 'button', 'aria-label': label }, content);
  const less = button(text.less, '−');
  const more = button(text.more, '+');
  const fit = button(text.fit, text.fit);
  const close = button(text.close, '×');
  const level = node('output', { 'aria-live': 'polite' }, '100%');
  const picture = node('img', { alt: '', draggable: 'false' });
  const stage = node('div', { class: 'image-zoom-stage', tabindex: '0', 'aria-label': text.hint }, picture);
  const dialog = node('dialog', { class: 'image-zoom', 'aria-label': text.view },
    node('div', { class: 'image-zoom-bar' }, node('span', {}, text.view), node('div', {}, less, level, more, fit, close)), stage);
  document.body.append(dialog);
  let opener;
  let active = false;
  let savedOverflow = '';
  let factor = 1;
  let fittedWidth = 1;
  let originalWidth = 1;
  let originalHeight = 1;

  const update = () => {
    picture.style.width = `${Math.round(fittedWidth * factor)}px`;
    picture.style.height = 'auto';
    level.textContent = `${Math.round(factor * 100)}%`;
    more.disabled = factor >= 4;
    less.disabled = factor <= 1;
  };
  const measure = () => {
    const area = stage.getBoundingClientRect();
    fittedWidth = Math.max(1, Math.min(originalWidth, area.width - 32, (area.height - 32) * originalWidth / originalHeight));
    update();
  };
  const reset = () => { factor = 1; measure(); stage.scrollTop = stage.scrollLeft = 0; };
  const change = delta => { factor = Math.max(1, Math.min(4, factor + delta)); update(); };
  const teardown = () => {
    if (!active) return;
    active = false;
    document.documentElement.style.overflow = savedOverflow;
    picture.removeAttribute('src');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  };
  const hide = () => {
    if (dialog.open) dialog.close();
    // Restore synchronously before a parent viewer handles the same Back event.
    teardown();
  };

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-zoom-src]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    let url;
    try { url = new URL(anchor.dataset.zoomSrc, location.href); } catch { return; }
    const local = url.origin === location.origin && url.pathname.startsWith('/media/');
    const remote = url.protocol === 'https:' && url.hostname === 'mir-s3-cdn-cf.behance.net';
    if (!local && !remote) return;
    event.preventDefault();
    active = true;
    opener = anchor;
    const image = anchor.querySelector('img');
    originalWidth = Number(image?.getAttribute('width')) || 1600;
    originalHeight = Number(image?.getAttribute('height')) || 1000;
    picture.alt = image?.alt || text.view;
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    factor = 1;
    measure();
    picture.src = url.href;
    stage.scrollTop = stage.scrollLeft = 0;
    close.focus();
  });
  picture.addEventListener('load', () => { originalWidth = picture.naturalWidth; originalHeight = picture.naturalHeight; measure(); });
  picture.addEventListener('dblclick', () => { factor = factor > 1 ? 1 : 2; update(); });
  more.addEventListener('click', () => change(0.5));
  less.addEventListener('click', () => change(-0.5));
  fit.addEventListener('click', reset);
  close.addEventListener('click', hide);
  dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); hide(); });
  dialog.addEventListener('close', teardown);
  dialog.addEventListener('keydown', event => {
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0') reset();
      else change(event.key === '-' ? -0.5 : 0.5);
    }
  });
  window.addEventListener('resize', () => { if (dialog.open) measure(); });
  window.addEventListener('popstate', hide);
})();
