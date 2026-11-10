// Brief builder for the contact page on static hosting (no form backend).
// Visitors answer a few tap-to-choose questions; public/assets/brief.js turns the answers
// into a structured email (mailto) and a copyable brief. Without JavaScript the send link
// is a plain mailto, so the page still works.
import { SOCIAL } from '../config.js';
import { html } from '../lib/html.js';

export const BRIEF = {
  es: {
    title: 'Prepara tu brief en 1 minuto',
    intro: 'Elige lo que encaje y te preparo el email. Nada se envía hasta que tú lo decidas.',
    progress: 'respondidas',
    steps: [
      { key: 'needs', multi: true, label: '¿Qué necesitas?', hint: 'Puedes elegir varias.', options: ['Imágenes de producto', 'Visuales de campaña', 'Spot con IA', 'Identidad visual', 'Otra cosa'] },
      { key: 'stage', label: '¿En qué punto está tu marca?', options: ['Es una marca nueva', 'Existe y quiero renovarla', 'Existe y necesito piezas nuevas'] },
      { key: 'timing', label: '¿Para cuándo lo necesitas?', options: ['Lo antes posible', 'En 1–2 meses', 'En 3 meses o más', 'Sin fecha fija'] },
      { key: 'budget', label: 'Presupuesto orientativo', hint: 'Solo para orientar la propuesta.', options: ['Menos de 500 €', '500 – 1.500 €', '1.500 – 3.000 €', 'Más de 3.000 €', 'Aún no lo sé'] },
    ],
    brand: 'Nombre de la marca',
    brandHint: 'Ej.: KUDAKE! Japan Burgers',
    about: 'Cuéntamelo en una frase',
    aboutHint: 'A qué se dedica, a quién se dirige y qué te gustaría conseguir.',
    preview: 'Tu brief',
    to: 'Para',
    subject: 'Asunto',
    subjectBase: 'Nuevo proyecto',
    greeting: 'Hola, Javier:',
    lines: { needs: 'Necesito', stage: 'Situación', timing: 'Plazo', budget: 'Presupuesto', brand: 'Marca', about: 'Sobre el proyecto' },
    empty: 'Elige una opción arriba y tu brief aparecerá aquí.',
    closing: 'Un saludo,',
    send: 'Enviar por email',
    copy: 'Copiar brief',
    copied: 'Brief copiado. Pégalo en un email a',
    fallback: 'O escríbeme directamente a',
  },
  en: {
    title: 'Build your brief in 1 minute',
    intro: 'Pick what fits and I’ll draft the email for you. Nothing is sent until you choose to.',
    progress: 'answered',
    steps: [
      { key: 'needs', multi: true, label: 'What do you need?', hint: 'Choose as many as apply.', options: ['Product images', 'Campaign visuals', 'AI spot', 'Visual identity', 'Something else'] },
      { key: 'stage', label: 'Where is your brand today?', options: ['It’s a new brand', 'It exists and needs a refresh', 'It exists and needs new pieces'] },
      { key: 'timing', label: 'When do you need it?', options: ['As soon as possible', 'In 1–2 months', 'In 3+ months', 'No fixed date'] },
      { key: 'budget', label: 'Indicative budget', hint: 'Only to shape the proposal.', options: ['Under €500', '€500 – 1,500', '€1,500 – 3,000', 'Over €3,000', 'Not sure yet'] },
    ],
    brand: 'Brand name',
    brandHint: 'e.g. KUDAKE! Japan Burgers',
    about: 'Tell me in one sentence',
    aboutHint: 'What it does, who it’s for and what you’d like to achieve.',
    preview: 'Your brief',
    to: 'To',
    subject: 'Subject',
    subjectBase: 'New project',
    greeting: 'Hi Javier,',
    lines: { needs: 'I need', stage: 'Stage', timing: 'Timeline', budget: 'Budget', brand: 'Brand', about: 'About the project' },
    empty: 'Pick an option above and your brief will appear here.',
    closing: 'Best,',
    send: 'Send by email',
    copy: 'Copy brief',
    copied: 'Brief copied. Paste it into an email to',
    fallback: 'Or email me directly at',
  },
};

export function briefBuilder(lang) {
  const t = BRIEF[lang];
  const email = SOCIAL.email.replace('mailto:', '');
  const total = t.steps.length + 2;
  const config = JSON.stringify({ email, subjectBase: t.subjectBase, greeting: t.greeting, closing: t.closing, lines: t.lines, empty: t.empty, copied: t.copied, progress: t.progress, total });
  return html`<section class="brief" aria-labelledby="brief-title" data-brief="${config}">
  <header class="brief-head">
    <h2 id="brief-title">${t.title}</h2>
    <p>${t.intro}</p>
    <div class="brief-progress" aria-hidden="true"><span class="brief-progress-bar"><i></i></span><span class="brief-progress-label">0/${total} ${t.progress}</span></div>
  </header>
  <ol class="brief-steps">
    ${t.steps.map((step, index) => html`<li><fieldset class="brief-step" data-key="${step.key}">
      <legend><span class="brief-num">${String(index + 1).padStart(2, '0')}</span>${step.label}${step.hint ? html` <small>${step.hint}</small>` : ''}</legend>
      <div class="brief-chips">${step.options.map((option) => html`<label class="brief-chip"><input type="${step.multi ? 'checkbox' : 'radio'}" name="brief-${step.key}" value="${option}"><span>${option}</span></label>`)}</div>
    </fieldset></li>`)}
    <li><fieldset class="brief-step brief-step-text">
      <legend><span class="brief-num">${String(t.steps.length + 1).padStart(2, '0')}</span>${lang === 'es' ? 'Tu marca' : 'Your brand'}</legend>
      <label class="brief-field">${t.brand}<input name="brief-brand" data-key="brand" maxlength="80" autocomplete="organization" placeholder="${t.brandHint}"></label>
      <label class="brief-field">${t.about}<textarea name="brief-about" data-key="about" rows="3" maxlength="600" placeholder="${t.aboutHint}"></textarea></label>
    </fieldset></li>
  </ol>
  <div class="brief-output">
    <div class="brief-mail" aria-live="polite">
      <p class="brief-mail-title">${t.preview}</p>
      <dl><div><dt>${t.to}</dt><dd>${email}</dd></div><div><dt>${t.subject}</dt><dd class="brief-subject">${t.subjectBase}</dd></div></dl>
      <pre class="brief-body">${t.empty}</pre>
    </div>
    <div class="brief-actions contact-email-primary">
      <a class="enquiry-button brief-send" href="${SOCIAL.email}">${t.send} <span aria-hidden="true">↗</span></a>
      <button type="button" class="brief-copy" hidden>${t.copy}</button>
    </div>
    <p class="brief-status" role="status"></p>
    <p class="brief-fallback">${t.fallback} <a href="${SOCIAL.email}">${email}</a></p>
  </div>
</section>`;
}
