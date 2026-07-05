// The data changelog is produced by `npm run build:data`
// (scripts/build-changelog.js) from the git history over data/. It powers the
// /data-changelog route and is also published at /data-changelog.json.
import bundle from '$lib/generated/data-changelog.json';

// Record collection → route segment, for linking a change chip to its page.
const COLLECTION_ROUTE = {
  networks: 'network',
  devices: 'device',
  firmwares: 'firmware',
  software: 'software',
  vendors: 'vendor'
};

// Display order for collection sections within a commit.
const COLLECTION_ORDER = ['networks', 'devices', 'firmwares', 'software', 'vendors'];

/**
 * Group a commit's flat change list into per-collection buckets, each split by
 * change type (added / updated / removed). Returns only non-empty collections,
 * in display order; ids within each bucket keep their (already sorted) order.
 * @param {{ changes: Array<{ collection: string, id: string, status: string }> }} commit
 */
export function groupCommitChanges(commit) {
  const byCollection = new Map();
  for (const ch of commit.changes ?? []) {
    let bucket = byCollection.get(ch.collection);
    if (!bucket) {
      bucket = { collection: ch.collection, added: [], updated: [], removed: [] };
      byCollection.set(ch.collection, bucket);
    }
    const list = ch.status === 'A' ? bucket.added : ch.status === 'D' ? bucket.removed : bucket.updated;
    list.push(ch.id);
  }
  return COLLECTION_ORDER.filter((c) => byCollection.has(c)).map((c) => byCollection.get(c));
}

/** Every commit that touched data/, newest first. */
export function dataChangelog() {
  return bundle.commits ?? [];
}

/** Root-relative route for a change's record page (before locale/base). */
export function changeHref(change) {
  const segment = COLLECTION_ROUTE[change.collection];
  return segment ? `/${segment}/${change.id}/` : null;
}
