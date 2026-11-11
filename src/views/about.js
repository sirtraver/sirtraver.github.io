import { ORIGIN, PERSON_ID, PORTRAIT } from '../config.js';
import { CONTENT, PAGES, ROLE } from '../content.js';
import { assetUrl } from '../lib/assets.js';
import { about } from '../generated/content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';
import { socialIcons } from './social.js';

const PORTRAIT_ID = `${ORIGIN}${PAGES.about.en}#portrait`;

const experienceList = (items, lang) => html`<ol class="resume-experience">${items.map(item => html`<li>
  <p class="resume-period">${item.period[lang]}</p>
  <h3>${item.role[lang]}<span> · ${item.organization}</span></h3>
  <p class="resume-description">${item.description[lang]}</p>
</li>`)}</ol>`;

function schema(lang) {
  const t = CONTENT[lang].about;
  return graph(
    person(lang),
    website(),
    webPage({
      type: 'ProfilePage',
      path: PAGES.about[lang],
      lang,
      name: t.title,
      description: t.description,
      primaryImageOfPage: { '@id': PORTRAIT_ID },
      mainEntity: { '@id': PERSON_ID },
    }),
    breadcrumbs(lang, [[t.breadcrumb, PAGES.about[lang]]]),
    {
      '@type': 'ImageObject',
      '@id': PORTRAIT_ID,
      contentUrl: ORIGIN + PORTRAIT.path,
      url: ORIGIN + PORTRAIT.path,
      name: 'Javier Traver',
      caption: `Javier Traver — ${ROLE}`,
      width: PORTRAIT.width,
      height: PORTRAIT.height,
    },
  );
}

export function aboutPage(lang) {
  const t = CONTENT[lang].about;
  const resume = about.resume;
  return layout({
    lang,
    page: 'about',
    styles: ['/assets/about-cv.css'],
    title: t.title,
    description: t.description,
    schema: schema(lang),
    body: html`<article class="about-editorial about-resume">
    <header class="about-profile">
      <div class="about-copy">
        <p class="overline">${t.overline}</p>
        <h1>${t.positionTitle[0]}<br>${t.positionTitle[1]}</h1>
        <p class="position-lead">${t.lead}</p>
        <p class="position-bio">${t.bio}</p>
        <div class="about-actions">
          ${socialIcons(lang, 'profile-social')}
          <!-- curriculum:access --><a class="profile-cv-link" href="${lang === 'es' ? '/cv/' : '/resume/'}">${t.cvLink}<span aria-hidden="true">↗</span></a><!-- /curriculum:access -->
        </div>
      </div>
      <figure class="about-portrait">
        <img class="editorial-portrait" src="${assetUrl(PORTRAIT.path)}" alt="${t.portraitAlt}" width="${PORTRAIT.width}" height="${PORTRAIT.height}" fetchpriority="high">
        <figcaption><strong>Javier Traver</strong><p class="profile-role">${t.role}</p><span class="profile-location">${t.location}</span></figcaption>
      </figure>
    </header>
  <div class="resume-main">
    <section class="resume-section" aria-labelledby="resume-experience">
      <h2 id="resume-experience">${t.experience}</h2>
      ${experienceList(resume.experience, lang)}
    </section>
    <section class="resume-section" aria-labelledby="resume-education">
      <h2 id="resume-education">${t.education}</h2>
      <ol class="resume-education">${resume.education.map(item => html`<li${item.current ? html` class="is-current"` : ''}>
        <span class="resume-period">${item.period[lang]}</span>
        <div><h3>${item.title[lang]}</h3>${item.institution ? html`<p>${item.institution}</p>` : ''}</div>
      </li>`)}</ol>
    </section>
    <div class="resume-capabilities">
      <section class="resume-section" aria-labelledby="resume-skills">
        <h2 id="resume-skills">${t.skills}</h2>
        <ul class="resume-list">${resume.skills[lang].map(skill => html`<li>${skill}</li>`)}</ul>
      </section>
      <section class="resume-section" aria-labelledby="resume-tools">
        <h2 id="resume-tools">${t.tools}</h2>
        <ul class="resume-list">${resume.tools.map(tool => html`<li>${tool}</li>`)}</ul>
      </section>
    </div>
    <section class="resume-section resume-languages" aria-labelledby="resume-languages">
      <h2 id="resume-languages">${t.languages}</h2>
      ${resume.languages.map(item => html`<p><strong>${item.name[lang]} · ${item.level}</strong><span>${item.institution} · ${item.year}</span></p>`)}
    </section>
  ${about.clients.length ? html`<section class="resume-section about-clients">
    <h2>${t.clients}</h2>
    <ul class="client-list">${about.clients.map((c) => html`<li>${c.url ? html`<a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.name}</a>` : c.name}</li>`)}</ul>
  </section>` : ''}
  ${about.testimonials.length ? html`<section class="resume-section about-testimonials">
    <h2>${t.testimonials}</h2>
    <div>${about.testimonials.map((q) => html`<figure class="testimonial"><blockquote>${q.quote[lang]}</blockquote><figcaption>${q.author}${q.role[lang] ? html` · ${q.role[lang]}` : ''}</figcaption></figure>`)}</div>
  </section>` : ''}
  </div>
</article>`,
  });
}
