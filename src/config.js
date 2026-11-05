// Site-wide constants. Changing the domain means reviewing ORIGIN and ALIAS_HOSTS.

export const ORIGIN = 'https://sirtraver.com';
export const CANONICAL_HOST = 'sirtraver.com';
export const ALIAS_HOSTS = ['www.sirtraver.com', 'sirtraver.sirtraver.chatgpt.site'];

export const PERSON_ID = `${ORIGIN}/#javier-traver`;
export const WEBSITE_ID = `${ORIGIN}/#website`;

export const SOCIAL = {
  threads: 'https://www.threads.com/@sirtraver',
  instagram: 'https://www.instagram.com/sirtraver/',
  linkedin: 'https://www.linkedin.com/in/javiertravervillanueva/',
  email: 'mailto:javier.traver.v@me.com',
  behance: 'https://www.behance.net/javiertraver',
  gumroad: 'https://sirtraver.gumroad.com/',
};

export const SITE_VERIFICATION = {
  google: 'h50TjR0Mi-KEnbFt8Qvtsz0dIloNvjxe96qSXdxZ4OE',
  bing: '1A002FAE7CDBA5C294D5741CA26ADD83',
};

export const SHARE_IMAGE = { path: '/assets/share-sirtraver.png', width: 1200, height: 630 };
export const PORTRAIT = { path: '/assets/cv-portrait.jpg', width: 600, height: 599 };

// Hosts allowed for remote images (Gumroad product thumbnails).
export const GUMROAD_IMAGE_HOSTS = ['public-files.gumroad.com', 'gumroad-public-storage.s3.amazonaws.com'];

// Website owner, shown in the legal notice. Empty fields are not displayed.
export const LEGAL = {
  holder: 'Javier Traver',
  taxId: '',
  address: '',
  email: 'javier.traver.v@me.com',
  updated: { en: '4 November 2026', es: '4 de noviembre de 2026' },
};
