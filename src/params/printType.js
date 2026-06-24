// Route matcher: only these print-type slugs resolve to the filtered prints list
// at /prints/<type>/. Invalid types 404 instead of rendering an empty list.
const TYPES = new Set(['enclosure', 'case', 'accessory']);

/** @param {string} param */
export function match(param) {
  return TYPES.has(param);
}
