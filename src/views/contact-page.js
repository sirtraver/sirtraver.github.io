import { SOCIAL } from '../config.js';
import { CONTACT_PAGE, CONTENT } from '../content.js';
import { html } from '../lib/html.js';
import { LEGAL_CONTENT, LEGAL_PAGES } from '../legal.js';
import { PROJECT_TYPES } from '../services/contact.js';
import { layout } from './layout.js';
import { briefBuilder } from './brief.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';
import { JOURNEY, THANKS_PAGE, contactFaq, visibleBreadcrumbs } from './journey.js';
import { runtime } from '../lib/runtime.js';

/** @param {string|null} sent  Result of a no-JavaScript submission ('ok' | 'error'). */
export function contactPage(lang, sent = null) {
  const t = CONTENT[lang].contactPage;
  const email = SOCIAL.email.replace('mailto:', '');
  const status = sent === 'ok' ? t.success : sent === 'error' ? t.error : '';
  const formEnabled = Boolean(runtime().contactEmail);
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
    scripts: formEnabled ? [{ src: '/assets/forms.js' }] : [{ src: '/assets/brief.js' }],
    styles: formEnabled ? [] : ['/assets/brief.css'],
    body: html`<section class="contact-page">
  ${visibleBreadcrumbs(lang, t.heading)}
  <h1>${t.heading}</h1>
  <p class="contact-lead">${t.lead}</p>
  <p class="response-time">${JOURNEY[lang].response}</p>
  ${formEnabled ? html`<p class="contact-brief">${JOURNEY[lang].brief}</p>` : ''}
  ${formEnabled ? html`<form class="contact-form" method="post" action="/api/contact" data-enhance data-redirect="${THANKS_PAGE[lang]}" data-sending="${t.sending}" data-success="${t.success}" data-error="${t.error}" data-limited="${t.limited}">
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
      <p class="form-privacy">${JOURNEY[lang].privacy} <a href="${LEGAL_PAGES.privacy[lang]}">${LEGAL_CONTENT[lang].privacy.heading}</a>.</p>
    </div>
    <p role="status" aria-live="polite">${status}</p>
  </form>` : briefBuilder(lang)}
  ${formEnabled ? html`<p class="contact-alt">${t.altEmail} <a href="${SOCIAL.email}">${email}</a>.</p>` : ''}
  ${contactFaq(lang)}
</section>`,
  });
}
