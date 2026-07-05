// Builds the Data Changelog: one entry per git commit that touched anything
// under data/, with the changed files grouped into catalogue records
// (device/firmware/network/software/vendor) plus a bucket of "other" data files
// (globals, taxonomy, redirects, translations, compatibility, docs…).
//
// Consumed by the /data-changelog route. Written to its own generated JSON
// (not data.json, which is imported into every page and must stay lean).
import { execFileSync } from 'node:child_process';

// Collections whose changes render as links to the record page. Order here is
// the display order within a commit.
const RECORD_COLLECTIONS = ['networks', 'devices', 'firmwares', 'software', 'vendors'];
const RECORD_SET = new Set(RECORD_COLLECTIONS);

// Cap distinct record changes stored per commit so the initial bulk-import
// commit (1000+ files) can't bloat the bundle; the overflow is summarised.
const MAX_CHANGES_PER_COMMIT = 300;

// Only the most recent commits are shown, so stop parsing once we have this
// many (keeps the generated bundle small).
const MAX_COMMITS = 20;

// Field/record separators for the `git log` format (unlikely to appear in a
// subject line): a record-separator (RS) byte starts each commit, a
// unit-separator (US) byte splits the header fields.
const REC = '\x1e';
const SEP = '\x1f';

/** First letter of a git name-status code ("M", "A", "D", "R100" → "R"). */
function statusChar(code) {
  const c = (code ?? '').trim()[0];
  return c === 'A' || c === 'D' || c === 'R' ? c : 'M';
}

// Merge a record's status across several files in one commit: all-added → A,
// all-deleted → D, otherwise a plain modification.
function mergeStatus(prev, next) {
  if (!prev) return next;
  if (prev === next) return prev;
  return 'M';
}

// Classify one changed path (relative to repo root) into either a record
// change or an "other" bucket label. Returns null for non-data paths.
function classify(path) {
  if (!path.startsWith('data/')) return null;
  const segs = path.slice('data/'.length).split('/');
  if (segs.length >= 2 && RECORD_SET.has(segs[0])) {
    return { kind: 'record', collection: segs[0], id: segs[1] };
  }
  if (segs[0] === 'i18n') return { kind: 'other', label: 'translations' };
  if (segs[0] === 'compatibility') return { kind: 'other', label: 'compatibility' };
  // Top-level data file (globals.yaml, taxonomy.yaml, redirects.yaml,
  // contributors.json, RULES.md, …) — label it by its filename.
  return { kind: 'other', label: segs[segs.length - 1] };
}

/**
 * @param {string} root repo root
 * @returns {{ generatedAt: string, commits: Array<object> }}
 */
export function buildDataChangelog(root) {
  let out;
  try {
    out = execFileSync(
      'git',
      [
        '-C',
        root,
        'log',
        `--format=${REC}%H${SEP}%cI${SEP}%an${SEP}%s`,
        '--name-status',
        '--',
        'data'
      ],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
    );
  } catch {
    // No git / shallow clone with no history — ship an empty changelog.
    return { generatedAt: new Date().toISOString(), commits: [] };
  }

  const commits = [];
  for (const chunk of out.split(REC)) {
    if (!chunk.trim()) continue;
    const lines = chunk.split('\n');
    const [hash, date, author, subject] = lines[0].split(SEP);
    if (!hash) continue;

    /** @type {Map<string, { collection: string, id: string, status: string }>} */
    const records = new Map();
    const other = new Set();

    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;
      const tab = line.indexOf('\t');
      if (tab === -1) continue;
      const status = statusChar(line.slice(0, tab));
      // A rename row is "R100\told\tnew"; attribute it to the new path.
      const parts = line.slice(tab + 1).split('\t');
      const path = parts[parts.length - 1];
      const hit = classify(path);
      if (!hit) continue;
      if (hit.kind === 'other') {
        other.add(hit.label);
        continue;
      }
      const key = `${hit.collection}/${hit.id}`;
      const existing = records.get(key);
      records.set(key, {
        collection: hit.collection,
        id: hit.id,
        status: mergeStatus(existing?.status, status)
      });
    }

    // Skip commits that touched no data records or files (e.g. merge commits,
    // which git reports with no name-status body).
    if (!records.size && !other.size) continue;

    const changes = [...records.values()].sort(
      (a, b) =>
        RECORD_COLLECTIONS.indexOf(a.collection) - RECORD_COLLECTIONS.indexOf(b.collection) ||
        a.id.localeCompare(b.id)
    );
    const moreChanges = Math.max(0, changes.length - MAX_CHANGES_PER_COMMIT);

    commits.push({
      hash,
      shortHash: hash.slice(0, 8),
      date,
      author,
      subject,
      changes: changes.slice(0, MAX_CHANGES_PER_COMMIT),
      moreChanges,
      other: [...other].sort()
    });

    // git log is newest-first, so the first MAX_COMMITS non-empty commits are
    // the most recent ones — stop once we have enough.
    if (commits.length >= MAX_COMMITS) break;
  }

  return { generatedAt: new Date().toISOString(), commits };
}
