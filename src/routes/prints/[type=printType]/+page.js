import { allPrints, printTypesInUse } from '$lib/data.js';

// Prerender one filtered list per print type present in the catalogue.
export function entries() {
  return printTypesInUse().map((type) => ({ type }));
}

export function load({ params }) {
  return { prints: allPrints(), types: printTypesInUse(), type: params.type };
}
