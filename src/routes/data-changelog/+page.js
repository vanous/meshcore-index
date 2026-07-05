import { dataChangelog } from '$lib/dataChangelog.js';

export function load() {
  return { commits: dataChangelog() };
}
