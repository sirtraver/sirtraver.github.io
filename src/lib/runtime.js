// Optional integrations, switched on by environment variables (see .env.example).
// The worker calls configure(env) on every request; views read the result.

let settings = { analytics: null, newsletter: null, contactEmail: null };

const origin = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.origin : null;
  } catch {
    return null;
  }
};

export function configure(env = {}) {
  const analyticsOrigin = origin(env.ANALYTICS_SRC);
  settings = {
    // Umami (or compatible) cookieless analytics.
    analytics: analyticsOrigin && env.ANALYTICS_WEBSITE_ID ? { src: env.ANALYTICS_SRC, origin: analyticsOrigin, websiteId: String(env.ANALYTICS_WEBSITE_ID) } : null,
    // Brevo double opt-in list for the launch newsletter.
    newsletter: env.BREVO_API_KEY && env.BREVO_LIST_ID && env.BREVO_DOI_TEMPLATE_ID
      ? { apiKey: env.BREVO_API_KEY, listId: Number(env.BREVO_LIST_ID), templateId: Number(env.BREVO_DOI_TEMPLATE_ID) }
      : null,
    // Contact form notifications, sent through Brevo's transactional email API.
    contactEmail: env.BREVO_API_KEY && env.CONTACT_TO ? { apiKey: env.BREVO_API_KEY, to: env.CONTACT_TO, from: env.CONTACT_FROM || env.CONTACT_TO } : null,
  };
}

export const runtime = () => settings;
