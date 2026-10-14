// schema.org JSON-LD builders shared by every page.
import { ORIGIN, PERSON_ID, PORTRAIT, SOCIAL, WEBSITE_ID } from '../config.js';
import { CONTENT, PAGES } from '../content.js';

const portraitUrl = ORIGIN + PORTRAIT.path;

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

export const person = (lang) => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Javier Traver',
  alternateName: ['SIRTRAVER', 'sirtraver'],
  url: `${ORIGIN}/`,
  image: {
    '@type': 'ImageObject',
    contentUrl: portraitUrl,
    url: portraitUrl,
    width: PORTRAIT.width,
    height: PORTRAIT.height,
    caption: CONTENT[lang].personCaption,
  },
  jobTitle: 'Visual Designer & Marketing',
  description: 'Visual Designer & Marketing · Madrid, Spain. Visual identity, marketing, advertising and practical AI for creative work.',
  homeLocation: { '@type': 'Place', name: 'Madrid, Spain' },
  knowsAbout: ['Graphic design', 'Visual identity', 'Branding', 'Typography', 'Marketing', 'Advertising', 'Digital resources', 'Artificial intelligence'],
  sameAs: [SOCIAL.behance, SOCIAL.threads, SOCIAL.instagram, SOCIAL.gumroad, SOCIAL.linkedin],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${ORIGIN}/`,
  name: 'sirtraver',
  alternateName: ['Javier Traver'],
  inLanguage: ['en', 'es'],
  publisher: { '@id': PERSON_ID },
});

export const webPage = ({ type, path, lang, name, description, ...extra }) => ({
  '@type': type,
  '@id': `${ORIGIN}${path}#page`,
  url: ORIGIN + path,
  name,
  description,
  inLanguage: lang,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': PERSON_ID },
  ...extra,
});

/** @param {Array<[name: string, path: string]>} trail */
export const breadcrumbs = (lang, trail = []) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['SIRTRAVER', PAGES.home[lang]], ...trail].map(([name, path], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: ORIGIN + path,
  })),
});

export const itemList = (name, items) => ({
  '@type': 'ItemList',
  name,
  itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, item })),
});
