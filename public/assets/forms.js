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
      // Brevo's hosted form does not allow reading its answer from another site, so the
      // request is sent as a plain form post and the visitor is asked to confirm by email.
      if (form.dataset.format === 'brevo') {
        try {
          await fetch(form.action, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(new FormData(form)) });
          result = 'confirm';
          form.dispatchEvent(new CustomEvent('sirtraver:submitted', { bubbles: true }));
        } catch {
          result = 'error';
        }
        status.textContent = form.dataset[result] || form.dataset.error;
        if (result === 'confirm') form.reset();
        button.disabled = false;
        return;
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const body = await response.json();
        // Own API: {status}; Web3Forms: {success: true}.
        result = response.ok ? (body.success === true ? 'success' : MESSAGES[body.status]) ?? 'error' : 'error';
        if (result === 'success' && form.dataset.redirect?.startsWith('/') && !form.dataset.redirect.startsWith('//')) {
          location.assign(form.dataset.redirect);
          return;
        }
      } catch {
        result = 'error';
      }

      status.textContent = form.dataset[result] || form.dataset.error;
      if (result === 'success' || result === 'confirm') form.reset();
      button.disabled = false;
    });
  }
})();
