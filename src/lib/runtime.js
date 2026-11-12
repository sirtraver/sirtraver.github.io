// Optional integrations, switched on by environment variables (see .env.example) or by the
// public identifiers in config.js. The worker calls configure(env) on every request; views
// read the result.
import { ANALYTICS, NEWSLETTER_FORM } from '../config.js';

let settings = { analytics: null, newsletter: null, newsletterForm: null, contactEmail: null, waitlistForm: null };

const origin = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.origin : null;
  } catch {
    return null;
  }
};

// Umami Cloud loads the tracker from cloud.umami.is and sends events to its API gateway.
const UMAMI_CLOUD_API = 'https://api-gateway.umami.dev';

/** Brevo form actions live on <account>.sibforms.com; anything else is ignored. */
function brevoForm(url) {
  const formOrigin = origin(url);
  if (!formOrigin || !new URL(formOrigin).hostname.endsWith('.sibforms.com')) return null;
  return { action: url, origin: formOrigin };
}

export function configure(env = {}) {
  // An env value, even an empty one, overrides config.js (empty switches it off).
  const analyticsSrc = env.ANALYTICS_SRC || ANALYTICS.src;
  const analyticsId = env.ANALYTICS_WEBSITE_ID ?? ANALYTICS.websiteId;
  const analyticsOrigin = origin(analyticsSrc);
  const newsletterForm = brevoForm(env.NEWSLETTER_FORM_URL ?? NEWSLETTER_FORM);
  settings = {
    // Umami (or compatible) cookieless analytics.
    analytics: analyticsOrigin && analyticsId
      ? {
          src: analyticsSrc,
          origin: analyticsOrigin,
          websiteId: String(analyticsId),
          connect: analyticsOrigin === 'https://cloud.umami.is' ? [analyticsOrigin, UMAMI_CLOUD_API] : [analyticsOrigin],
        }
      : null,
    // Brevo double opt-in list for the launch newsletter (server hosting only).
    newsletter: env.BREVO_API_KEY && env.BREVO_LIST_ID && env.BREVO_DOI_TEMPLATE_ID
      ? { apiKey: env.BREVO_API_KEY, listId: Number(env.BREVO_LIST_ID), templateId: Number(env.BREVO_DOI_TEMPLATE_ID) }
      : null,
    // Static hosting: Brevo's own subscription form (double opt-in is handled by Brevo).
    newsletterForm,
    // Contact form notifications, sent through Brevo's transactional email API.
    contactEmail: env.BREVO_API_KEY && env.CONTACT_TO ? { apiKey: env.BREVO_API_KEY, to: env.CONTACT_TO, from: env.CONTACT_FROM || env.CONTACT_TO } : null,
    // Static hosting fallback: the launch notice form posts to Web3Forms, which emails each sign-up.
    waitlistForm: !newsletterForm && env.WEB3FORMS_ACCESS_KEY ? { action: 'https://api.web3forms.com/submit', accessKey: String(env.WEB3FORMS_ACCESS_KEY) } : null,
  };
}

export const runtime = () => settings;
