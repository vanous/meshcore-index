// Size breakdown of the compiled JSON data bundle (src/lib/generated/data.json,
// also published at /data.json). Powers the /bundle overview page. Sizes are the
// UTF-8 byte length of each value's JSON serialization, so they sum close to —
// but slightly under — the whole-bundle size (object braces/keys add overhead).
import dataset from '$lib/generated/data.json';

const encoder = new TextEncoder();

/** UTF-8 byte length of a value's JSON serialization. */
export function jsonBytes(value) {
  return encoder.encode(JSON.stringify(value)).length;
}

/** Human-readable byte size, e.g. 230040 → "224.6 KB". */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

// Section key → entity route prefix, so a record id can deep-link to its page.
const RECORD_ROUTE = {
  devices: 'device',
  firmwares: 'firmware',
  vendors: 'vendor',
  networks: 'network',
  software: 'software'
};

function recordLabel(item, i) {
  if (item && typeof item === 'object') return item.id ?? item.name ?? item.key ?? `#${i}`;
  return `#${i}`;
}

function childrenOf(key, value) {
  if (Array.isArray(value)) {
    const route = RECORD_ROUTE[key];
    return value.map((item, i) => {
      const id = item && typeof item === 'object' ? item.id : null;
      return {
        label: recordLabel(item, i),
        name: item?.name ?? null,
        href: route && id ? `/${route}/${id}/` : null,
        bytes: jsonBytes(item),
        count: null
      };
    });
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([k, v]) => ({
      label: k,
      name: null,
      href: null,
      bytes: jsonBytes(v),
      count: Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : null
    }));
  }
  return [];
}

/**
 * Two-level size tree of the data bundle: top-level keys (collections) ranked by
 * size, each with its records/sub-keys (also ranked). Includes the whole-bundle
 * byte size for percentage bars.
 * @returns {{ totalBytes: number, sections: Array<{key, bytes, count, pct, children}> }}
 */
// Top-level keys that are bundle metadata rather than data collections; shown as
// part of the metadata/overhead remainder, not as their own rows.
const META_KEYS = new Set(['schemaVersion', 'generatedAt', 'counts']);

export function bundleSizeTree() {
  const totalBytes = jsonBytes(dataset);
  const sections = Object.entries(dataset)
    .filter(([key]) => !META_KEYS.has(key))
    .map(([key, value]) => {
      const isContainer = Array.isArray(value) || (value && typeof value === 'object');
      return {
        key,
        bytes: jsonBytes(value),
        count: Array.isArray(value)
          ? value.length
          : value && typeof value === 'object'
            ? Object.keys(value).length
            : null,
        children: isContainer ? childrenOf(key, value).sort((a, b) => b.bytes - a.bytes) : []
      };
    })
    .map((s) => ({ ...s, pct: s.bytes / totalBytes }))
    .sort((a, b) => b.bytes - a.bytes);
  return { totalBytes, sections };
}
