import { allPrints, printTypesInUse } from '$lib/data.js';

export function load() {
  return { prints: allPrints(), types: printTypesInUse() };
}
