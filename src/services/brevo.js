// Brevo (https://www.brevo.com) API calls: double opt-in newsletter and transactional email.
// Only used when the corresponding variables are set (see src/lib/runtime.js).
const API = 'https://api.brevo.com/v3';

async function call(apiKey, endpoint, body, fetcher) {
  const response = await fetcher(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Brevo ${endpoint} ${response.status}`);
}

/** Sends the confirmation email; the contact joins the list after clicking it. */
export const requestDoubleOptIn = ({ apiKey, listId, templateId }, { email, language, redirectUrl }, fetcher = fetch) =>
  call(apiKey, '/contacts/doubleOptinConfirmation', {
    email,
    includeListIds: [listId],
    templateId,
    redirectionUrl: redirectUrl,
    attributes: { LANGUAGE: language },
  }, fetcher);

export const sendEmail = ({ apiKey, to, from }, { subject, text, replyTo }, fetcher = fetch) =>
  call(apiKey, '/smtp/email', {
    sender: { email: from, name: 'sirtraver.com' },
    to: [{ email: to }],
    ...(replyTo ? { replyTo } : {}),
    subject,
    textContent: text,
  }, fetcher);
