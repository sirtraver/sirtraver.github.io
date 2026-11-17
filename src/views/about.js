import { ORIGIN, PERSON_ID, PORTRAIT } from '../config.js';
import { CONTENT, PAGES, ROLE } from '../content.js';
import { assetUrl } from '../lib/assets.js';
import { html } from '../lib/html.js';
import { layout } from './layout.js';
import { breadcrumbs, graph, person, webPage, website } from './schema.js';
import { socialIcons } from './social.js';

const PORTRAIT_ID = `${ORIGIN}${PAGES.about.en}#portrait`;

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
      name: 'Javier Traver (sirtraver)',
      caption: t.portraitAlt,
      width: PORTRAIT.width,
      height: PORTRAIT.height,
      representativeOfPage: true,
      about: { '@id': PERSON_ID },
      creator: { '@id': PERSON_ID },
      creditText: 'Javier Traver',
      copyrightNotice: '© Javier Traver',
    },
  );
}

export function aboutPage(lang) {
  const t = CONTENT[lang].about;
  return layout({
    lang,
    page: 'about',
    styles: ['/assets/about-cv.css'],
    title: t.title,
    description: t.description,
    shareImage: { url: ORIGIN + PORTRAIT.path, width: PORTRAIT.width, height: PORTRAIT.height, alt: t.portraitAlt },
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
        <img class="editorial-portrait" src="${assetUrl(PORTRAIT.small)}" srcset="${assetUrl(PORTRAIT.small)} ${PORTRAIT.smallWidth}w, ${assetUrl(PORTRAIT.path)} ${PORTRAIT.width}w" sizes="(max-width: 700px) 112px, 300px" alt="${t.portraitAlt}" width="${PORTRAIT.width}" height="${PORTRAIT.height}" fetchpriority="high">
        <figcaption><strong>Javier Traver</strong><p class="profile-role">${t.role}</p><span class="profile-location">${t.location}</span></figcaption>
      </figure>
    </header>
  <section class="about-method" aria-labelledby="about-method">
    <div class="about-method-intro"><div><h2 id="about-method">${t.method.heading}</h2><p>${t.method.lead}</p></div><a class="method-link" href="${PAGES.services[lang]}">${t.method.link} <span aria-hidden="true">→</span></a></div>
    <ol class="method-steps">${t.method.steps.map(([name, text], i) => html`<li><span class="method-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${name}</h3><p>${text}</p></li>`)}</ol>
  </section>
</article>`,
  });
}
