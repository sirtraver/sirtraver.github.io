// A continuous, dark gallery. Image controls and project navigation are distinct.
// Native card/image links, shareable URLs, Back and focus return remain available.
(() => {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const script = document.currentScript;
  const main = document.querySelector('main');
  if (!main?.querySelector('.project-grid') || !script?.dataset.gallery || typeof HTMLDialogElement !== 'function') return;
  const text = lang === 'es' ? {
    project: 'Proyecto', close: 'Cerrar proyecto', closeText: 'Cerrar', previous: 'Proyecto anterior', next: 'Proyecto siguiente',
    previousImage: 'Imagen anterior', nextImage: 'Imagen siguiente', jump: 'Ir a la imagen', image: 'Imagen',
    info: 'Información', infoTitle: 'Información del proyecto', closeInfo: 'Cerrar información',
    conceptual: 'Proyecto conceptual', enlarge: 'Ampliar imagen', discipline: 'Disciplina', year: 'Año', deliverables: 'Entregables',
    tools: 'Herramientas', story: 'Concepto y aplicaciones', description: 'Descripción',
    fallback: category => `Una selección de piezas y aplicaciones de ${category.toLowerCase()}.`,
    hint: 'Desplázate para recorrer el proyecto. Pulsa una imagen para ampliarla.',
    error: 'No se ha podido cargar alguna imagen. Puedes reintentarlo o abrir su enlace original.', retry: 'Reintentar imagen',
    categories: { 'Visual identity': 'Identidad visual', 'Visual design': 'Diseño visual' },
  } : {
    project: 'Project', close: 'Close project', closeText: 'Close', previous: 'Previous project', next: 'Next project',
    previousImage: 'Previous image', nextImage: 'Next image', jump: 'Go to image', image: 'Image',
    info: 'Information', infoTitle: 'Project information', closeInfo: 'Close information',
    conceptual: 'Concept project', enlarge: 'Enlarge image', discipline: 'Discipline', year: 'Year', deliverables: 'Deliverables',
    tools: 'Tools', story: 'Concept and applications', description: 'Description',
    fallback: category => `A selection of ${category.toLowerCase()} pieces and applications.`,
    hint: 'Scroll to explore the project. Select an image to enlarge it.',
    error: 'An image could not be loaded. Retry it or open its original link.', retry: 'Retry image',
    categories: { 'Visual identity': 'Visual identity', 'Visual design': 'Visual design' },
  };
  const el = (tag, attributes = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    node.append(...children);
    return node;
  };
  const button = (label, content, className) => el('button', { type: 'button', 'aria-label': label, title: label, class: className }, content);
  const title = el('h2', { id: 'viewer-title' });
  const position = el('p', { class: 'viewer-position' });
  const kind = el('span', { class: 'viewer-kind', hidden: '' }, text.conceptual);
  const closeButton = button(text.close, '', 'viewer-close');
  closeButton.append(el('span', { class: 'viewer-close-label' }, text.closeText), el('span', { 'aria-hidden': 'true' }, '×'));
  const previousImage = button(text.previousImage, '↑', 'viewer-image-step');
  const nextImage = button(text.nextImage, '↓', 'viewer-image-step');
  const imageSelect = el('select', { class: 'viewer-image-select', 'aria-label': text.jump });
  const infoButton = button(text.info, text.info, 'viewer-info-button');
  infoButton.setAttribute('aria-expanded', 'false');
  infoButton.setAttribute('aria-controls', 'viewer-information');
  const closeInfo = button(text.closeInfo, '×', 'viewer-info-close');
  const infoBody = el('div', { class: 'viewer-info-body' });
  const infoPanel = el('aside', { class: 'viewer-info', id: 'viewer-information', hidden: '', 'aria-labelledby': 'viewer-info-title' },
    el('div', { class: 'viewer-info-heading' }, el('h3', { id: 'viewer-info-title' }, text.infoTitle), closeInfo), infoBody);
  const images = el('div', { class: 'viewer-images' });
  const error = el('p', { class: 'viewer-error', role: 'status', hidden: '' }, text.error);
  const previousProject = button(text.previous, '', 'viewer-project-link');
  const nextProject = button(text.next, '', 'viewer-project-link');
  const projectNav = el('nav', { class: 'viewer-project-nav', 'aria-label': text.project }, previousProject, nextProject);
  const scroller = el('div', { class: 'viewer-scroll', tabindex: '0', 'aria-label': text.hint }, images, error, projectNav);
  const dialog = el('dialog', { class: 'project-viewer viewer-refined viewer-with-card', 'aria-labelledby': 'viewer-title' },
    el('header', { class: 'viewer-bar' }, el('div', { class: 'viewer-heading' }, position, title, kind), closeButton),
    el('div', { class: 'viewer-toolbar' }, el('div', { class: 'viewer-image-nav' }, previousImage, imageSelect, nextImage),
      el('p', { class: 'viewer-guidance' }, text.hint), el('div', { class: 'viewer-actions' }, infoButton)),
    el('div', { class: 'viewer-layout' }, scroller, infoPanel));
  document.body.append(dialog);

  let galleries = null;
  const loaded = fetch(script.dataset.gallery).then(response => {
    if (!response.ok) throw Error('Gallery unavailable');
    return response.json();
  }).catch(() => ({})).then(data => (galleries = data));
  const CARD = 'a.project-card[data-project], a.featured-project[data-project]';
  const cards = () => [...main.querySelectorAll(CARD)].filter(card => galleries?.[card.dataset.project]);
  const name = card => card?.querySelector('h3')?.textContent ?? '';
  let current, opener, previousOverflow = '', pageTitle = '', active = false, closing = false;
  let anchors = [], currentImage = 0, frame = false;
  const narrow = () => window.matchMedia('(max-width: 900px)').matches;
  let mobileInfoOpen = false, wasNarrow = narrow();

  const safeSource = item => {
    if (item.src) {
      try { const u = new URL(item.src); return u.protocol === 'https:' && u.hostname === 'mir-s3-cdn-cf.behance.net' ? item.src : null; } catch { return null; }
    }
    if (!item.webp?.length || !item.avif?.length || ![...item.webp, ...item.avif].every(([url]) => typeof url === 'string' && url.startsWith('/media/'))) return null;
    return item.webp.at(-1)[0];
  };
  function imageNode(item, index) {
    const source = safeSource(item);
    if (!source) return null;
    const srcset = values => values.map(([url, width]) => `${url} ${width}w`).join(', ');
    const sizes = '(max-width: 900px) 100vw, calc(100vw - 388px)';
    const image = el('img', { alt: item.caption?.[lang] || `${title.textContent} · ${text.image} ${index + 1}`, width: item.width, height: item.height,
      loading: index === 0 ? 'eager' : 'lazy', decoding: 'async', ...(item.src ? {} : { srcset: srcset(item.webp), sizes }), src: source });
    image.style.backgroundColor = item.color;
    const retry = button(`${text.retry} ${index + 1}`, text.retry, 'viewer-retry');
    retry.hidden = true;
    image.addEventListener('error', () => { error.hidden = false; retry.hidden = false; });
    image.addEventListener('load', () => { retry.hidden = true; });
    retry.addEventListener('click', () => { image.removeAttribute('src'); image.src = source; });
    const content = item.src ? image : el('picture', {}, el('source', { type: 'image/avif', srcset: srcset(item.avif), sizes }), image);
    return el('figure', { class: 'viewer-image' }, el('a', { class: 'gallery-zoom', href: source, 'data-zoom-src': source,
      target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${text.enlarge} ${index + 1}: ${title.textContent}` }, content), retry);
  }
  function setImage(index) {
    currentImage = Math.max(0, Math.min(anchors.length - 1, index));
    imageSelect.value = String(currentImage);
    previousImage.disabled = currentImage <= 0;
    nextImage.disabled = currentImage >= anchors.length - 1;
  }
  function goToImage(index) {
    if (!anchors[index]) return;
    const top = anchors[index].getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    setImage(index);
  }
  function trackImage() {
    frame = false;
    if (!active || !anchors.length) return;
    const threshold = scroller.getBoundingClientRect().top + Math.min(160, scroller.clientHeight * .3);
    const atEnd = scroller.scrollTop > 1 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    let index = atEnd ? anchors.length - 1 : 0;
    if (!atEnd) anchors.forEach((anchor, i) => { if (anchor.getBoundingClientRect().top <= threshold) index = i; });
    if (index !== currentImage) setImage(index);
  }
  function toggleInfo(open) {
    mobileInfoOpen = open;
    infoPanel.hidden = narrow() && !open;
    infoButton.hidden = !narrow();
    closeInfo.hidden = !narrow();
    scroller.inert = open && narrow();
    dialog.classList.toggle('has-info', !infoPanel.hidden);
    infoButton.setAttribute('aria-expanded', String(!infoPanel.hidden));
  }
  function renderInfo(project) {
    const category = text.categories[project.category] ?? project.category;
    const cardTitle = el('h3', { class: 'viewer-card-title' }, title.textContent);
    const portrait = el('img', { src: '/assets/javier-traver.jpg', alt: '', width: '44', height: '44', class: 'viewer-author-photo' });
    const author = el('div', { class: 'viewer-card-author' }, portrait,
      el('div', {}, el('strong', {}, 'Javier Traver'), el('p', {}, 'Visual Designer & Marketing')));
    const heading = el('div', { class: 'viewer-card-heading' },
      el('p', { class: 'viewer-card-kicker' }, `${category} · ${project.year}`), cardTitle);
    if (project.conceptual) heading.append(el('span', { class: 'viewer-card-kind' }, text.conceptual));
    const description = el('section', { class: 'viewer-card-description' },
      el('h4', {}, text.description), el('p', {}, project.intro?.[lang] || text.fallback(category)));
    const facts = el('dl', { class: 'viewer-facts' });
    const fact = (label, value) => { if (value) facts.append(el('div', {}, el('dt', {}, label), el('dd', {}, String(value)))); };
    fact(text.deliverables, project.deliverables?.[lang]?.join(' · '));
    infoBody.replaceChildren(author, heading, description);
    if (project.tools?.length) infoBody.append(el('section', { class: 'viewer-card-tools' }, el('h4', {}, text.tools),
      el('ul', {}, ...project.tools.map(tool => el('li', {}, tool)))));
    if (project.deliverables?.[lang]?.length) infoBody.append(facts);
    if (project.caseStudy?.length) {
      const story = el('details', { class: 'viewer-card-story' }, el('summary', {}, text.story));
      for (const section of project.caseStudy) story.append(el('section', {}, el('h4', {}, section.title[lang]), el('p', {}, section.text[lang])));
      infoBody.append(story);
    }
    infoPanel.scrollTop = 0;
  }
  function show(card) {
    current = card;
    const project = galleries[card.dataset.project];
    title.textContent = name(card);
    kind.hidden = !project.conceptual;
    error.hidden = true;
    toggleInfo(false);
    renderInfo(project);
    images.replaceChildren(...project.images.map(imageNode).filter(Boolean));
    anchors = [...images.querySelectorAll('a[data-zoom-src]')];
    imageSelect.replaceChildren(...anchors.map((anchor, index) => el('option', { value: String(index) }, `${String(index + 1).padStart(2, '0')} / ${String(anchors.length).padStart(2, '0')}`)));
    imageSelect.disabled = !anchors.length;
    setImage(0);
    scroller.scrollTop = 0;
    document.title = `${title.textContent} — sirtraver`;
    const list = cards(), index = list.indexOf(card);
    position.textContent = `${text.project} ${String(index + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    for (const [control, target, label] of [[previousProject, list[index - 1], text.previous], [nextProject, list[index + 1], text.next]]) {
      control.hidden = !target;
      control.replaceChildren(el('span', {}, label), el('strong', {}, name(target)));
      control.setAttribute('aria-label', target ? `${label}: ${name(target)}` : label);
    }
  }
  function open(card) {
    closing = false; active = true; opener = card; pageTitle = document.title;
    previousOverflow = document.documentElement.style.overflow;
    show(card);
    history.pushState({ viewer: true }, '', card.getAttribute('href'));
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    closeButton.focus();
  }
  function step(offset) {
    const list = cards(), target = list[list.indexOf(current) + offset];
    if (!target) return;
    show(target);
    history.replaceState({ viewer: true }, '', target.getAttribute('href'));
    closeButton.focus();
  }
  function teardown() {
    if (!active) return;
    active = false;
    if (dialog.open) dialog.close();
    document.title = pageTitle;
    document.documentElement.style.overflow = previousOverflow;
    toggleInfo(false); images.replaceChildren(); anchors = [];
    opener?.focus({ preventScroll: true });
  }
  const close = () => { if (closing) return; closing = true; if (history.state?.viewer) history.back(); else teardown(); };
  window.addEventListener('popstate', () => { if (active) teardown(); else if (history.state?.viewer) location.reload(); });
  closeButton.addEventListener('click', close);
  previousProject.addEventListener('click', () => step(-1)); nextProject.addEventListener('click', () => step(1));
  previousImage.addEventListener('click', () => goToImage(currentImage - 1)); nextImage.addEventListener('click', () => goToImage(currentImage + 1));
  imageSelect.addEventListener('change', () => goToImage(Number(imageSelect.value)));
  infoButton.addEventListener('click', () => toggleInfo(infoPanel.hidden));
  closeInfo.addEventListener('click', () => { toggleInfo(false); infoButton.focus(); });
  scroller.addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(trackImage); } }, { passive: true });
  images.addEventListener('sirtraver:zoomchange', event => { const index = anchors.indexOf(event.target); if (index >= 0) goToImage(index); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (narrow() && !infoPanel.hidden) { toggleInfo(false); infoButton.focus(); } else close(); });
  dialog.addEventListener('keydown', event => {
    if (event.target.closest('input,select,textarea,[contenteditable="true"],.viewer-info') || (narrow() && !infoPanel.hidden)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); goToImage(currentImage + (event.key === 'ArrowLeft' ? -1 : 1)); }
  });
  dialog.addEventListener('close', () => { if (active && history.state?.viewer) close(); else teardown(); });
  window.addEventListener('resize', () => {
    const changed = wasNarrow !== narrow();
    const focus = document.activeElement;
    toggleInfo(mobileInfoOpen);
    if (active && changed) {
      goToImage(currentImage);
      if (infoPanel.hidden && focus?.closest('.viewer-info')) infoButton.focus();
      else if (infoButton.hidden && focus === infoButton) closeButton.focus();
    }
    wasNarrow = narrow();
  });
  main.addEventListener('click', event => {
    const card = event.target.closest(CARD);
    if (!card || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = card.dataset.project;
    if (galleries) { if (galleries[id]?.images?.some(safeSource)) { event.preventDefault(); open(card); } return; }
    event.preventDefault();
    loaded.then(() => galleries[id]?.images?.some(safeSource) ? open(card) : location.assign(card.href));
  });
})();
