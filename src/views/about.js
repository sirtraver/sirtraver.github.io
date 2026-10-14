import { ORIGIN, PERSON_ID, PORTRAIT } from '../config.js';
import { CONTENT, PAGES } from '../content.js';
import { assetUrl } from '../lib/assets.js';
import { about } from '../generated/content.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';

const PORTRAIT_ID = `${ORIGIN}${PAGES.about.en}#portrait`;

const numberedList = (items) =>
  html`<ol class="method-list">${items.map(
    ([title, text], index) => html`<li><span>${String(index + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${text}</p></li>`,
  )}</ol>`;

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
      caption: 'Javier Traver — Visual Designer & Marketing',
      width: PORTRAIT.width,
      height: PORTRAIT.height,
    },
  );
}

export function aboutPage(lang) {
  const t = CONTENT[lang].about;
  return layout({
    lang,
    page: 'about',
    title: t.title,
    description: t.description,
    schema: schema(lang),
    body: html`<article class="about-editorial">
  <div class="about-opening">
    <aside class="about-profile">
      <p class="overline">${t.overline}</p>
      <img class="editorial-portrait" src="${assetUrl(PORTRAIT.path)}" alt="${t.portraitAlt}" width="${PORTRAIT.width}" height="${PORTRAIT.height}" fetchpriority="high">
      <h1>Javier<br>Traver<span>.</span></h1>
      <p class="profile-role">${t.role}</p>
      <p class="profile-location">${t.location}</p>
    </aside>
    <section class="about-position">
      <h2>${t.positionTitle[0]}<br>${t.positionTitle[1]}</h2>
      <p class="position-lead">${t.lead}</p>
      <p class="position-bio">${t.bio}</p>
    </section>
  </div>
  <section class="about-method about-contribution">
    <div class="method-heading"><p class="section-kicker">${t.bring.kicker}</p><h2>${t.bring.title}</h2></div>
    ${numberedList(t.bring.items)}
  </section>
  <section class="about-method">
    <div class="method-heading"><p class="section-kicker">${t.method.kicker}</p><h2>${t.method.title}</h2></div>
    ${numberedList(t.method.items)}
  </section>
  <section class="about-tools">
    <p class="section-kicker">${t.tools.kicker}</p>
    <p>${t.tools.text}</p>
  </section>
  ${about.clients.length ? html`<section class="about-tools about-clients">
    <p class="section-kicker">${t.clients}</p>
    <ul class="client-list">${about.clients.map((c) => html`<li>${c.url ? html`<a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.name}</a>` : c.name}</li>`)}</ul>
  </section>` : ''}
  ${about.testimonials.length ? html`<section class="about-tools about-testimonials">
    <p class="section-kicker">${t.testimonials}</p>
    <div>${about.testimonials.map((q) => html`<figure class="testimonial"><blockquote>${q.quote[lang]}</blockquote><figcaption>${q.author}${q.role[lang] ? html` · ${q.role[lang]}` : ''}</figcaption></figure>`)}</div>
  </section>` : ''}
</article>`,
  });
}
