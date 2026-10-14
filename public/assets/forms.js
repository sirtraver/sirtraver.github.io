// Enhances forms marked with data-enhance: submits with fetch and reports the result in the
// form's live region using the messages in its data-* attributes. Without JavaScript the
// same forms post normally and the server redirects back with the result.
(() => {
  const MESSAGES = { subscribed: 'success', sent: 'success', confirm: 'confirm', limited: 'limited' };

  for (const form of document.querySelectorAll('form[data-enhance]')) {
    const status = form.querySelector('[role="status"]');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      status.textContent = form.dataset.sending;

      const data = {};
      for (const field of form.elements) {
        if (!field.name) continue;
        data[field.name] = field.type === 'checkbox' ? field.checked : field.value;
      }

      let result = 'error';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const body = await response.json();
        result = MESSAGES[body.status] ?? 'error';
      } catch {
        result = 'error';
      }

      status.textContent = form.dataset[result] || form.dataset.error;
      if (result === 'success' || result === 'confirm') form.reset();
      button.disabled = false;
    });
  }
})();
