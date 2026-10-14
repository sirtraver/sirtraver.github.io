// Responsive <picture>: AVIF with WebP fallback at several widths (see scripts/images.mjs).
import { html } from './html.js';

const srcset = (versions) => versions.map(([url, width]) => `${url} ${width}w`).join(', ');

/** Largest WebP version up to maxWidth: the plain <img src> fallback and the URL for metadata. */
export const imageUrl = (image, maxWidth = 1600) =>
  image.src ?? (image.webp.filter(([, w]) => w <= maxWidth).at(-1) ?? image.webp[0])[0];

/** Largest available version, for structured data and sitemaps. */
export const largestUrl = (image) => image.src ?? image.webp.at(-1)[0];

/**
 * @param {object} image  Media entry: { width, height, color, avif, webp }.
 * @param {object} options
 * @param {string} options.alt
 * @param {string} options.sizes  Rendered width per breakpoint.
 * @param {boolean} [options.priority]  Above-the-fold image: load eagerly with high priority.
 */
export function picture(image, { alt, sizes, priority = false }) {
  const loading = priority ? html`fetchpriority="high"` : html`loading="lazy"`;
  if (image.src) return html`<img src="${image.src}" alt="${alt}" width="${image.width}" height="${image.height}" ${loading} decoding="async" style="background-color:${image.color}">`;
  return html`<picture><source type="image/avif" srcset="${srcset(image.avif)}" sizes="${sizes}"><img src="${imageUrl(image)}" srcset="${srcset(image.webp)}" sizes="${sizes}" alt="${alt}" width="${image.width}" height="${image.height}" ${loading} decoding="async" style="background-color:${image.color}"></picture>`;
}
