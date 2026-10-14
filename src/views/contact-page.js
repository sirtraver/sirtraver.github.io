import { SOCIAL } from '../config.js';
import { CONTACT_PAGE, CONTENT } from '../content.js';
import { html } from '../lib/html.js';
import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { PROJECT_TYPES } from '../services/contact.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';

/** @param {string|null} sent  Result of a no-JavaScript submission ('ok' | 'error'). */
export function contactPage(lang, sent = null) {
  const t = CONTENT[lang].contactPage;
  const email = SOCIAL.email.replace('mailto:', '');
  const status = sent === 'ok' ? t.success : sent === 'error' ? t.error : '';
  return layout({
    lang,
    page: null,
    alternates: CONTACT_PAGE,
    title: t.title,
    description: t.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'ContactPage', path: CONTACT_PAGE[lang], lang, name: t.title, description: t.description }),
      breadcrumbs(lang, [[t.heading, CONTACT_PAGE[lang]]]),
    ),
    scripts: [{ src: '/assets/forms.js' }],
    body: html`<section class="contact-page">
  <h1>${t.heading}</h1>
  <p class="contact-lead">${t.lead}</p>
  <form class="contact-form" method="post" action="/api/contact" data-enhance data-sending="${t.sending}" data-success="${t.success}" data-error="${t.error}" data-limited="${t.limited}">
    <input type="hidden" name="language" value="${lang}">
    <div class="field-row">
      <label>${t.name}<input name="name" autocomplete="name" required maxlength="120"></label>
      <label>${t.email}<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
    </div>
    <label>${t.type}<select name="type">${PROJECT_TYPES.map((type) => html`<option value="${type}">${t.types[type]}</option>`)}</select></label>
    <label>${t.message}<textarea name="message" rows="7" required minlength="10" maxlength="4000" placeholder="${t.messageHint}"></textarea></label>
    <div class="form-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="form-footer">
      <button type="submit">${t.submit}</button>
      <p class="form-privacy">${t.privacy} <a href="${LEGAL_PAGES.privacy[lang]}">${LEGAL_CONTENT[lang].privacy.heading}</a>.</p>
    </div>
    <p role="status" aria-live="polite">${status}</p>
  </form>
  <p class="contact-alt">${t.altEmail} <a href="${SOCIAL.email}">${email}</a>.</p>
</section>`,
  });
}
