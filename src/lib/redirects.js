// Old-slug → current-slug redirects for renamed catalogue records, authored in
// data/redirects.yaml and compiled into data.json (build-data.js). Each old
// slug is prerendered by the static adapter as a 301 redirect to the record's
// current page, so bookmarked/linked old URLs keep working on GitHub Pages.
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import dataset from '$lib/generated/data.json';

// Collection key (as used in redirects.yaml / data.json) → route path segment.
export const REDIRECT_ROUTES = {
  firmwares: 'firmware',
  devices: 'device',
  networks: 'network',
  software: 'software',
  vendors: 'vendor'
};

const redirects = dataset.redirects ?? {};

// Route segment (singular, as used in wikilinks and URLs) → collection key.
const ROUTE_TO_COLLECTION = Object.fromEntries(
  Object.entries(REDIRECT_ROUTES).map(([collection, route]) => [route, collection])
);

/**
 * Resolve a retired slug for a route segment (e.g. `software`, `firmware`) to
 * the record's current slug, or `null` if it isn't a redirect. Lets old
 * wikilinks/links to renamed records keep resolving to the live page.
 * @param {string} routeSegment
 * @param {string} id
 * @returns {string | null}
 */
export function redirectTarget(routeSegment, id) {
  const collection = ROUTE_TO_COLLECTION[routeSegment];
  return (collection && redirects[collection]?.[id]) || null;
}

/**
 * Prerender entries for a collection's `[id]` route: one per retired slug so the
 * static adapter emits a redirect page for each. Spread alongside the live ids.
 * @param {keyof typeof REDIRECT_ROUTES} collection
 */
export function redirectEntries(collection) {
  return Object.keys(redirects[collection] ?? {}).map((id) => ({ id }));
}

/**
 * If `id` is a retired slug for `collection`, throw a 301 redirect to the
 * record's current page. No-op otherwise, so callers proceed to their 404 check.
 * @param {keyof typeof REDIRECT_ROUTES} collection
 * @param {string} id
 */
export function maybeRedirect(collection, id) {
  const to = redirects[collection]?.[id];
  if (to) throw redirect(301, `${base}/${REDIRECT_ROUTES[collection]}/${to}/`);
}
