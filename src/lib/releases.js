/**
 * Group a firmware's flat release list by version, collapsing per-variant
 * releases (e.g. companion-/repeater-/room-server-v1.16.0) into one entry.
 * @returns {Array<{version: string, datetime: string|null, prerelease: boolean,
 *   notes: string|null, variants: Array<any>}>}
 */
export function groupReleases(releases = []) {
  const groups = new Map();
  for (const r of releases) {
    const tag = r.version ?? '';
    // Split an optional leading variant ("companion-") from the version token.
    const m = /^(?:(.*?)-)?v?(\d[\w.+-]*)$/.exec(tag);
    const variant = m && m[1] ? m[1] : null;
    const versionKey = m ? m[2] : tag;

    if (!groups.has(versionKey)) {
      groups.set(versionKey, {
        version: versionKey,
        datetime: null,
        prerelease: false,
        notes: null,
        notesHtml: null,
        variants: []
      });
    }
    const g = groups.get(versionKey);
    g.variants.push({ ...r, variant });
    const dt = r.datetime ?? r.date ?? '';
    if (dt > (g.datetime ?? '')) g.datetime = dt || g.datetime;
    if (r.notes && !g.notes) g.notes = r.notes;
    if (r.notesHtml && !g.notesHtml) g.notesHtml = r.notesHtml;
    if (r.prerelease) g.prerelease = true;
  }

  for (const g of groups.values()) {
    g.variants.sort((a, b) => (a.variant ?? '').localeCompare(b.variant ?? ''));
  }
  return [...groups.values()].sort((a, b) =>
    (b.datetime ?? '').localeCompare(a.datetime ?? '')
  );
}

/** Derive latest_version and released (YYYY-MM-DD) from a changelog release list. */
export function latestReleaseSummary(releases = []) {
  const [newest] = groupReleases(releases);
  if (!newest) return {};
  const dt = newest.datetime ?? newest.variants?.find((v) => v.datetime)?.datetime ?? '';
  const released =
    (dt && dt.slice(0, 10)) ||
    newest.variants?.find((v) => v.date)?.date ||
    null;
  return {
    latest_version: newest.version,
    ...(released ? { released } : {})
  };
}
