import { firmwares } from '$lib/data.js';

// Prerender one filtered list per firmware type.
export function entries() {
  return [{ type: 'reference' }, { type: 'fork' }, { type: 'custom' }];
}

export function load({ params }) {
  return { firmwares, type: params.type };
}
