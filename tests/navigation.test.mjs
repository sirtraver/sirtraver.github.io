import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const script = await readFile(new URL('../public/assets/navigation.js', import.meta.url), 'utf8');

// Run the shipped browser script against controlled link geometry. These are event
// contract tests, not a second implementation of the drag calculations.
function harness({ reduced = false, storageBlocked = false, pointers = true, current = 0 } = {}) {
  const classes = () => {
    const names = new Set();
    return { add: (...items) => items.forEach(item => names.add(item)), remove: (...items) => items.forEach(item => names.delete(item)),
      contains: name => names.has(name), toggle: (name, enabled) => enabled ? names.add(name) : names.delete(name) };
  };
  const target = () => {
    const listeners = new Map();
    return { classList: classes(),
      addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
      fire(type, props = {}) {
        const event = { isPrimary: true, button: 0, pointerId: 1, clientX: 150, clientY: 44, detail: 1,
          defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...props };
        for (const fn of listeners.get(type) ?? []) fn(event);
        return event;
      },
    };
  };
  const document = {};
  const links = ['/', '/resources/', '/about/'].map((path, index) => ({
    href: 'https://sirtraver.com' + path,
    classList: classes(),
    hasAttribute: name => name === 'aria-current' && index === current,
    closest: () => links[index],
    getBoundingClientRect: () => ({ left: 105 + 100 * index, top: 25, width: 90, height: 38 }),
    focus() { document.activeElement = this; },
  }));
  const captures = new Set();
  const styles = new Map();
  const nav = { ...target(), clientLeft: 1, clientTop: 1,
    querySelectorAll: () => links,
    getBoundingClientRect: () => ({ left: 100, top: 20, right: 400, bottom: 68, width: 300, height: 48 }),
    style: { setProperty: (name, value) => styles.set(name, value) },
    prepend(node) { this.thumb = node; },
    setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id),
  };
  Object.assign(document, { activeElement: links[current], querySelector: () => nav,
    createElement: () => ({ setAttribute() {}, getBoundingClientRect: () => ({ width: 90 }) }) });
  const window = { ...target(), matchMedia: () => ({ matches: reduced }) };
  const storage = new Map();
  const sessionStorage = {
    getItem(key) { if (storageBlocked) throw Error('blocked'); return storage.get(key) ?? null; },
    setItem(key, value) { if (storageBlocked) throw Error('blocked'); storage.set(key, value); },
    removeItem: key => storage.delete(key),
  };
  const navigations = [];
  const jobs = new Map();
  let timer = 0;
  const location = { pathname: ['/', '/resources/', '/about/'][current], assign: url => navigations.push(url) };
  vm.runInNewContext(script, { document, window, location, sessionStorage, URL, Date,
    PointerEvent: pointers ? function PointerEvent() {} : undefined,
    requestAnimationFrame: fn => fn(),
    setTimeout(fn, delay) { jobs.set(++timer, { fn, delay }); return timer; }, clearTimeout: id => jobs.delete(id),
  });
  const fire = (type, props = {}) => nav.fire(type, { target: links[current], ...props });
  const flush = () => { const pending = [...jobs.values()]; jobs.clear(); pending.forEach(({ fn }) => fn()); };
  return { nav, links, document, window, storage, styles, captures, navigations, jobs, fire, flush };
}

for (const pointerType of ['mouse', 'touch']) {
  test(`${pointerType}: dragging previews options and navigates only after release`, () => {
    const h = harness();
    h.fire('pointerdown', { pointerType });
    h.fire('pointermove', { pointerType, clientX: 250 });
    assert.equal(h.nav.classList.contains('is-dragging'), true);
    assert.equal(h.links[1].classList.contains('is-previewed'), true);
    assert.deepEqual(h.navigations, []);
    assert.equal(h.captures.has(1), true);
    h.fire('pointerup', { pointerType, clientX: 250 });
    assert.equal(h.captures.size, 0);
    assert.equal(h.nav.classList.contains('is-dragging'), false);
    assert.equal(h.fire('click').defaultPrevented, true, 'the compatibility click cannot navigate back to the opener');
    h.flush();
    assert.deepEqual(h.navigations, ['https://sirtraver.com/resources/']);
  });
}

test('vertical touch gestures leave scrolling to the browser', () => {
  const h = harness();
  h.fire('pointerdown', { pointerType: 'touch' });
  const move = h.fire('pointermove', { pointerType: 'touch', clientX: 153, clientY: 100 });
  assert.equal(move.defaultPrevented, false);
  assert.equal(h.nav.classList.contains('is-dragging'), false);
  h.fire('pointerup', { clientY: 100 });
  h.flush();
  assert.deepEqual(h.navigations, []);
});

test('outside release, pointer cancellation and Escape restore the active page', () => {
  for (const ending of ['outside', 'pointercancel', 'lostpointercapture', 'Escape']) {
    const h = harness();
    h.fire('pointerdown');
    h.fire('pointermove', { clientX: 350 });
    if (ending === 'outside') h.fire('pointerup', { clientX: 350, clientY: 200 });
    else if (ending === 'Escape') h.fire('keydown', { key: 'Escape' });
    else h.fire(ending);
    h.flush();
    assert.deepEqual(h.navigations, [], ending);
    assert.equal(h.links[0].classList.contains('is-previewed'), true, ending);
    assert.equal(h.nav.classList.contains('is-dragging'), false, ending);
  }
});

test('clicks, modifier-clicks and keyboard activation remain native links', () => {
  const h = harness();
  assert.equal(h.fire('click', { target: h.links[1] }).defaultPrevented, false);
  assert.equal(h.fire('click', { target: h.links[2], metaKey: true }).defaultPrevented, false);
  assert.deepEqual(h.navigations, []);
  assert.equal(h.fire('keydown', { key: 'ArrowRight' }).defaultPrevented, true);
  assert.equal(h.document.activeElement, h.links[1]);
  assert.equal(h.fire('keydown', { key: 'Enter', detail: 0 }).defaultPrevented, false);
});

test('returning to the same option does not reload and reduced motion removes the navigation delay', () => {
  const same = harness();
  same.fire('pointerdown'); same.fire('pointermove', { clientX: 158 }); same.fire('pointerup', { clientX: 158 }); same.flush();
  assert.deepEqual(same.navigations, []);
  const reduced = harness({ reduced: true });
  reduced.fire('pointerdown'); reduced.fire('pointermove', { clientX: 250 }); reduced.fire('pointerup', { clientX: 250 });
  assert.equal([...reduced.jobs.values()][0].delay, 0);
  reduced.flush();
  assert.deepEqual(reduced.navigations, ['https://sirtraver.com/resources/']);
});

test('storage restrictions do not break dragging, and no Pointer Events keeps the static navigation', () => {
  const h = harness({ storageBlocked: true });
  h.fire('pointerdown'); h.fire('pointermove', { clientX: 350 }); h.fire('pointerup', { clientX: 350 }); h.flush();
  assert.deepEqual(h.navigations, ['https://sirtraver.com/about/']);
  const fallback = harness({ pointers: false });
  assert.equal(fallback.nav.thumb, undefined);
  assert.equal(fallback.fire('click', { target: fallback.links[1] }).defaultPrevented, false);
});
