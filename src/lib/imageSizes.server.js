// Server-only: scans the on-disk image assets that live alongside each catalogue
// item (data/<collection>/<id>/*.{svg,png,…}) and totals their sizes. These are
// the source images Vite hashes and serves — separate from the data.json bundle.
// Powers the "Image assets" section of the /bundle page.
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import dataset from '$lib/generated/data.json';

const IMG = /\.(svg|png|jpe?g|webp|avif|gif)$/i;
const ROOT = process.cwd();

// Catalogue dir → entity route, for deep-linking each item.
const COLLECTIONS = [
  { key: 'devices', route: 'device' },
  { key: 'vendors', route: 'vendor' },
  { key: 'software', route: 'software' }
];

function nameMap(records) {
  return new Map((records ?? []).map((r) => [r.id, r.name]));
}

/**
 * Per-item image footprint across the catalogue, ranked by total bytes.
 * @returns {{ items: Array<{collection, id, name, href, bytes, files: {name, bytes}[]}>, total: number, fileCount: number }}
 */
export function imageSizes() {
  const names = {
    devices: nameMap(dataset.devices),
    vendors: nameMap(dataset.vendors),
    software: nameMap(dataset.software)
  };

  const items = [];
  let total = 0;
  let fileCount = 0;

  for (const { key, route } of COLLECTIONS) {
    const base = join(ROOT, 'data', key);
    if (!existsSync(base)) continue;
    for (const id of readdirSync(base)) {
      const dir = join(base, id);
      let entries;
      try {
        entries = readdirSync(dir);
      } catch {
        continue; // not a directory
      }
      const files = entries
        .filter((f) => IMG.test(f))
        .map((f) => ({ name: f, bytes: statSync(join(dir, f)).size }))
        .sort((a, b) => b.bytes - a.bytes);
      if (!files.length) continue;
      const bytes = files.reduce((sum, f) => sum + f.bytes, 0);
      total += bytes;
      fileCount += files.length;
      items.push({ collection: key, id, name: names[key].get(id) ?? id, href: `/${route}/${id}/`, bytes, files });
    }
  }

  items.sort((a, b) => b.bytes - a.bytes);
  return { items, total, fileCount };
}
