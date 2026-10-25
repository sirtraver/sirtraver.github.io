// Projects come from content/projects/ (see content/README.md), processed at build time.
import { projects } from './generated/content.js';

/** All projects, newest first. */
export const allProjects = projects;
/** Projects shown on the home page. */
export const activeProjects = projects.filter((p) => !p.archived);
/** Older projects moved to /archive/ (their pages keep existing). */
export const archivedProjects = projects.filter((p) => p.archived);

/** Finds a project by slug, or by Behance ID for URLs of the previous site. */
export const findProject = (key) => projects.find((p) => p.slug === key) ?? projects.find((p) => p.id !== null && String(p.id) === key);
