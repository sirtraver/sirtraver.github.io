// Services: three ways to work together, without prices or packs (budgets are quoted from the brief).
import { CONTACT_PAGE, CONTENT, PAGES, projectName, projectPath } from '../content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { sectionIntro } from './section-intro.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';

/**
 * @param {'en'|'es'} lang
 * @param {object[]} projects  Active projects; examples link to those that exist.
 */
export function servicesPage(lang, projects) {
  const t = CONTENT[lang].services;
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return layout({
    lang,
    page: 'services',
    title: t.title,
    description: t.description,
    schema: graph(
      person(lang),
      website(),
      webPage({ type: 'WebPage', path: PAGES.services[lang], lang, name: t.title, description: t.description }),
      breadcrumbs(lang, [[t.heading, PAGES.services[lang]]]),
    ),
    body: html`${sectionIntro(lang, t.heading, t.lead)}
<section class="services">
  <ol class="service-offers">
    ${t.offers.map((offer, i) => {
      const examples = offer.examples.map((slug) => bySlug.get(slug)).filter(Boolean);
      return html`<li class="service-offer">
      <span class="method-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h2>${offer.name}</h2>
      <dl>
        <div><dt>${t.labels.who}</dt><dd>${offer.who}</dd></div>
        <div><dt>${t.labels.problem}</dt><dd>${offer.problem}</dd></div>
        <div><dt>${t.labels.deliverables}</dt><dd><ul>${offer.deliverables.map((item) => html`<li>${item}</li>`)}</ul></dd></div>
        ${examples.length ? html`<div><dt>${t.labels.examples}</dt><dd class="service-examples">${examples.map((p) => html`<a href="${projectPath(p, lang)}">${projectName(p, lang)}</a>`)}</dd></div>` : ''}
      </dl>
    </li>`;
    })}
  </ol>
  <section class="about-method service-process" aria-labelledby="service-process">
    <div class="about-method-intro"><h2 id="service-process">${t.processTitle}</h2><p>${t.ctaNote}</p></div>
    <ol class="method-steps">${t.process.map(([name, text], i) => html`<li><span class="method-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${name}</h3><p>${text}</p></li>`)}</ol>
  </section>
  <p class="service-cta"><a class="more-button" href="${CONTACT_PAGE[lang]}">${t.cta} <span aria-hidden="true">→</span></a></p>
</section>`,
  });
}
