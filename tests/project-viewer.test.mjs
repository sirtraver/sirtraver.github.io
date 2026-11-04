import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const code = await readFile(new URL('../public/assets/project-viewer.js', import.meta.url), 'utf8');

// Event contracts for the shipped script; visual layout is checked in the browser.
async function harness({ failed = false, compact = false } = {}) {
  let document;
  const jobs = [];
  class Element {
    constructor(tag = '') { this.tagName = tag; this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {}; this.style = {}; this.scrollTop = 0; this.clientHeight = 600; }
    setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'class') this.className = value; if (name === 'hidden') this.hidden = true; if (name.startsWith('data-')) this.dataset[name.slice(5)] = value; if (name === 'href') this.href = value; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    append(...children) { for (const child of children) { if (typeof child === 'object') child.parentElement = this; this.children.push(child); } }
    replaceChildren(...children) { this.children.forEach(child => { if (typeof child === 'object') child.parentElement = null; }); this.children = []; this.append(...children); }
    get textContent() { return this.children.map(child => typeof child === 'object' ? child.textContent : String(child)).join(''); }
    set textContent(value) { this.replaceChildren(String(value)); }
    get classList() { return { toggle: (name, enabled) => { const set = new Set((this.className || '').split(' ')); if (enabled) set.add(name); else set.delete(name); this.className = [...set].join(' '); } }; }
    matches(selector) { return selector.split(',').some(part => { part = part.trim(); const tag = part.match(/^\w+/)?.[0]; const cls = part.match(/\.([\w-]+)/)?.[1]; const attr = part.match(/\[([\w-]+)(?:="([^"]+)")?\]/); return (!tag || tag === this.tagName) && (!cls || (this.className || '').split(' ').includes(cls)) && (!attr || (attr[2] ? this.attributes[attr[1]] === attr[2] : attr[1] in this.attributes)); }); }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
    querySelectorAll(selector) { return this.children.flatMap(child => typeof child === 'object' ? [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)] : []); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); }
    fire(type, properties = {}) { const event = { target: this, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties }; (this.listeners[type] ?? []).forEach(callback => callback(event)); return event; }
    getBoundingClientRect() { return { top: this.top ?? 0, width: 1000, height: 600 }; }
    scrollTo({ top }) { this.scrollTop = top; this.fire('scroll'); }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; jobs.push(() => this.fire('close')); }
    get isConnected() { return !!this.parentElement; }
  }
  const create = (tag, attrs = {}, ...children) => { const node = new Element(tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); node.append(...children); return node; };
  const cards = ['one', 'two'].map((slug, i) => create('a', { class: 'project-card', href: `/es/projects/${slug}/`, 'data-project': slug }, create('h3', {}, `Project ${i + 1}`)));
  const grid = create('section', { class: 'project-grid' }, ...cards), main = create('main', {}, grid), body = create('body', {}, main);
  document = { documentElement: { lang: 'es', style: { overflow: '' } }, body, currentScript: { dataset: { gallery: '/galleries.json?v=2' } }, querySelector: selector => selector === 'main' ? main : body.querySelector(selector), createElement: tag => create(tag) };
  const window = new Element(); window.matchMedia = () => ({ matches: compact });
  const history = { state: null, pushes: [], replaces: [], backs: 0, pushState(state, unused, path) { this.state = state; this.pushes.push(path); }, replaceState(state, unused, path) { this.state = state; this.replaces.push(path); }, back() { this.backs++; } };
  const location = { assignments: [], assign(path) { this.assignments.push(path); }, reload() {} };
  const image = { width: 800, height: 450, avif: [['/media/test.avif', 800]], webp: [['/media/test.webp', 800]] };
  const galleries = Object.fromEntries(['one', 'two'].map(slug => [slug, { category: 'Visual identity', year: 2026, tools: ['Affinity', 'ChatGPT'], intro: { es: 'Confirmed introduction' }, images: [image, image, image] }]));
  vm.runInNewContext(code, { document, window, history, location, URL, HTMLDialogElement: function () {}, fetch: async () => { if (failed) throw Error('offline'); return { ok: true, json: async () => galleries }; }, requestAnimationFrame: fn => jobs.push(fn) });
  await new Promise(resolve => setImmediate(resolve));
  const dialog = body.querySelector('.project-viewer');
  const find = selector => dialog.querySelector(selector);
  const open = (card = cards[0], properties = {}) => main.fire('click', { target: card, ...properties });
  const flush = () => { let remaining = 100; while (jobs.length && remaining--) jobs.shift()(); };
  const pop = () => { history.state = null; window.fire('popstate'); flush(); };
  const setCompact = value => { compact = value; window.fire('resize'); flush(); };
  return { cards, document, dialog, history, location, find, open, pop, flush, setCompact };
}

test('modified card links and unavailable galleries keep their native destination', async () => {
  const h = await harness();
  for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) assert.equal(h.open(h.cards[0], { [modifier]: true }).defaultPrevented, false);
  assert.equal(h.history.pushes.length, 0);
  const offline = await harness({ failed: true });
  assert.equal(offline.open().defaultPrevented, false);
  assert.equal(offline.dialog.open, undefined);
});

test('closing events request only one history Back and restore the original opener', async () => {
  const h = await harness();
  assert.equal(h.open().defaultPrevented, true);
  assert.equal(h.dialog.open, true);
  assert.equal(h.document.documentElement.style.overflow, 'hidden');
  h.dialog.fire('cancel'); h.dialog.fire('cancel'); h.dialog.fire('close');
  assert.equal(h.history.backs, 1);
  h.pop();
  assert.equal(h.dialog.open, false);
  assert.equal(h.document.documentElement.style.overflow, '');
  assert.equal(h.document.activeElement, h.cards[0]);
});

test('image navigation does not change project history; project navigation resets the image', async () => {
  const h = await harness(); h.open();
  h.find('.viewer-image-nav').querySelectorAll('button')[1].fire('click');
  assert.equal(h.find('.viewer-image-select').value, '1');
  assert.equal(h.history.replaces.length, 0);
  h.find('.viewer-image-select').value = '2'; h.find('.viewer-image-select').fire('change');
  assert.equal(h.find('.viewer-image-nav').querySelectorAll('button')[1].disabled, true);
  h.find('.viewer-project-nav').querySelectorAll('button')[1].fire('click');
  assert.deepEqual(h.history.replaces, ['/es/projects/two/']);
  assert.equal(h.find('.viewer-image-select').value, '0');
  assert.equal(h.history.pushes.length, 1);
  h.dialog.fire('cancel'); h.pop();
  assert.equal(h.document.activeElement, h.cards[0], 'close returns to the card that originally opened the viewer');
});

test('Escape dismisses project information before closing the gallery', async () => {
  const h = await harness({ compact: true }); h.open();
  assert.equal(h.find('.viewer-info').hidden, true);
  h.find('.viewer-info-button').fire('click');
  assert.equal(h.find('.viewer-info').hidden, false);
  assert.equal(h.find('.viewer-info-button').getAttribute('aria-expanded'), 'true');
  assert.equal(h.find('.viewer-scroll').inert, true);
  h.dialog.fire('cancel');
  assert.equal(h.find('.viewer-info').hidden, true);
  assert.equal(h.find('.viewer-scroll').inert, false);
  assert.equal(h.history.backs, 0);
  h.dialog.fire('cancel');
  assert.equal(h.history.backs, 1);
});

test('desktop shows the project card and tools without duplicate or external project links', async () => {
  const h = await harness(); h.open();
  assert.equal(h.find('.viewer-info').hidden, false);
  assert.equal(h.find('.viewer-info-button').hidden, true);
  assert.ok(h.find('.viewer-card-tools').textContent.includes('AffinityChatGPT'));
  assert.equal(h.find('.viewer-info').querySelectorAll('a').length, 0);
  assert.equal(h.find('.viewer-original'), null);
  h.dialog.fire('keydown', { key: 'ArrowRight', target: h.find('.viewer-scroll') });
  assert.equal(h.find('.viewer-image-select').value, '1');
  h.dialog.fire('cancel');
  assert.equal(h.history.backs, 1, 'the desktop information card does not consume Escape');
});

test('crossing the layout breakpoint preserves image navigation and restores the card on desktop', async () => {
  const h = await harness(); h.open();
  // Geometry represents the second image at the top of the gallery viewport.
  h.find('.viewer-images').querySelectorAll('a').forEach((anchor, i) => { anchor.top = (i - 1) * 600; });
  h.find('.viewer-image-select').value = '1'; h.find('.viewer-image-select').fire('change');
  h.setCompact(true);
  assert.equal(h.find('.viewer-info').hidden, true);
  assert.equal(h.find('.viewer-info-button').hidden, false);
  assert.equal(h.find('.viewer-image-select').value, '1');
  h.find('.viewer-info-button').fire('click');
  assert.equal(h.find('.viewer-scroll').inert, true);
  h.setCompact(false);
  assert.equal(h.find('.viewer-info').hidden, false);
  assert.equal(h.find('.viewer-scroll').inert, false);
  assert.equal(h.find('.viewer-info-button').hidden, true);
});


test('the counter reaches the last image when the viewport cannot align it at the top', async () => {
  const h = await harness(); h.open();
  const anchors = h.find('.viewer-images').querySelectorAll('a');
  anchors[0].top = -600; anchors[1].top = 0; anchors[2].top = 250;
  const scroller = h.find('.viewer-scroll');
  scroller.scrollTop = 900; scroller.clientHeight = 600; scroller.scrollHeight = 1500;
  scroller.fire('scroll'); h.flush();
  assert.equal(h.find('.viewer-image-select').value, '2');
  assert.equal(h.find('.viewer-image-nav').querySelectorAll('button')[1].disabled, true);
});
