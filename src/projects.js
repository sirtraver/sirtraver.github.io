// Projects come from content/projects/ (see content/README.md), processed at build time.
import { projects } from './generated/content.js';

/** All projects, newest first. */
export const allProjects = projects;
/** Projects shown on the home page. */
export const activeProjects = projects.filter((p) => !p.archived).sort((a, b) => (a.portfolioOrder ?? Number.MAX_SAFE_INTEGER) - (b.portfolioOrder ?? Number.MAX_SAFE_INTEGER) || b.date.localeCompare(a.date));
/** Older projects moved to /archive/ (their pages keep existing). */
export const archivedProjects = projects.filter((p) => p.archived);
// The home grid is two columns: it shows an even number of projects so no card is left alone.
// An odd one out moves to the "more projects" page with the archive.
export const homeProjects = activeProjects.slice(0, activeProjects.length - (activeProjects.length % 2));
export const moreProjects = [...activeProjects.slice(homeProjects.length), ...archivedProjects];

/** Finds a project by slug, or by Behance ID for URLs of the previous site. */
export const findProject = (key) => projects.find((p) => p.slug === key) ?? projects.find((p) => p.id !== null && String(p.id) === key);
