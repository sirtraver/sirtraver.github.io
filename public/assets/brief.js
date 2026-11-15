// Contact brief builder: turns the chosen answers into a ready-to-send email.
// Without JavaScript the send link stays a plain mailto (see src/views/brief.js).
(() => {
  const root = document.querySelector('[data-brief]');
  if (!root) return;
  let config;
  try { config = JSON.parse(root.dataset.brief); } catch { return; }

  const body = root.querySelector('.brief-body');
  const subject = root.querySelector('.brief-subject');
  const send = root.querySelector('.brief-send');
  const copy = root.querySelector('.brief-copy');
  const status = root.querySelector('.brief-status');
  const bar = root.querySelector('.brief-progress-bar i');
  const label = root.querySelector('.brief-progress-label');
  const steps = [...root.querySelectorAll('.brief-step[data-key]')];
  const fields = [...root.querySelectorAll('[data-key="brand"], [data-key="about"]')];

  // Funnel events for Umami (only present when analytics is on; see track.js for clicks).
  const track = (name, data = {}) => {
    try { window.umami?.track(name, { page: location.pathname, ...data }); } catch { /* never break the brief */ }
  };
  let started = false;
  let completed = false;
  send.dataset.track = 'brief-send';
  copy.dataset.track = 'brief-copy';

  root.classList.add('is-enhanced');
  if (navigator.clipboard) copy.hidden = false;

  const answers = () => {
    const out = {};
    for (const step of steps) {
      const picked = [...step.querySelectorAll('input:checked')].map((input) => input.value);
      step.classList.toggle('is-answered', picked.length > 0);
      if (picked.length) out[step.dataset.key] = picked.join(', ');
    }
    for (const field of fields) {
      const value = field.value.trim();
      if (value) out[field.dataset.key] = value;
    }
    return out;
  };

  const compose = (data) => {
    const order = ['brand', 'needs', 'stage', 'timing', 'budget'];
    const lines = order.filter((key) => data[key]).map((key) => `• ${config.lines[key]}: ${data[key]}`);
    if (data.about) lines.push('', `${config.lines.about}:`, data.about);
    return [config.greeting, '', ...lines, '', config.closing].join('\n');
  };

  const update = (event) => {
    const data = answers();
    const count = Object.keys(data).length;
    bar.style.width = `${Math.round((count / config.total) * 100)}%`;
    label.textContent = `${count}/${config.total} ${config.progress}`;
    root.classList.toggle('has-answers', count > 0);
    send.dataset.trackAnswers = String(count);
    copy.dataset.trackAnswers = String(count);
    if (count && !started && event) { started = true; track('brief-started'); }
    if (count >= config.total && !completed && event) { completed = true; track('brief-completed'); }
    const title = [config.subjectBase, data.brand].filter(Boolean).join(' · ');
    subject.textContent = title;
    if (!count) {
      body.textContent = config.empty;
      send.href = `mailto:${config.email}`;
      return;
    }
    const text = compose(data);
    body.textContent = text;
    send.href = `mailto:${config.email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
    status.textContent = '';
  };

  root.addEventListener('input', update);
  root.addEventListener('change', update);

  // A second tap on a selected radio clears it, so every question stays optional.
  root.addEventListener('click', (event) => {
    const input = event.target.closest('.brief-chip')?.querySelector('input[type="radio"]');
    if (!input || event.target !== input) return;
    if (input.dataset.was === 'on') { input.checked = false; update(event); }
    for (const other of root.querySelectorAll(`input[name="${input.name}"]`)) other.dataset.was = other.checked ? 'on' : '';
  });

  copy.addEventListener('click', async () => {
    const data = answers();
    const text = Object.keys(data).length ? compose(data) : config.greeting;
    try {
      await navigator.clipboard.writeText(`${subject.textContent}\n\n${text}`);
      status.textContent = `${config.copied} ${config.email}`;
    } catch {
      status.textContent = '';
    }
  });

  update();
})();
