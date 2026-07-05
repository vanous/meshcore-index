<script>
  // Data Changelog — every commit that touched the catalogue data, newest
  // first. Each commit's changes are grouped by collection and, within a
  // collection, by change type (added / updated / removed). Data is generated
  // from git history at build time (scripts/build-changelog.js).
  import { href } from '$lib/i18n.js';
  import { m } from '$lib/paraglide/messages.js';
  import Seo from '$lib/Seo.svelte';
  import PageHeader from '$lib/PageHeader.svelte';
  import Pagination from '$lib/Pagination.svelte';
  import Chip from '$lib/Chip.svelte';
  import { REPO_URL } from '$lib/seo.js';
  import { fmtDateTime, relativeTime } from '$lib/format.js';
  import { changeHref, groupCommitChanges } from '$lib/dataChangelog.js';
  import { collectionLabel } from '$lib/collections.js';

  let { data } = $props();

  const commitUrl = (hash) => `${REPO_URL}/commit/${hash}`;

  // The three change buckets, in display order, with their label + tone.
  // Each change type gets its own coloured label badge + border so the three
  // groups read as distinct; record names stay neutral (only the badge is
  // coloured), turning accent on hover.
  const STATUS_ROWS = [
    {
      key: 'added',
      badge: 'border-ok/40 bg-ok/10 text-ok',
      border: 'border-ok/40',
      label: () => m.data_changelog_status_added()
    },
    {
      key: 'updated',
      badge: 'border-accent2/40 bg-accent2/10 text-accent2',
      border: 'border-accent2/40',
      label: () => m.data_changelog_status_updated()
    },
    {
      key: 'removed',
      badge: 'border-warn/40 bg-warn/10 text-warn',
      border: 'border-warn/40',
      label: () => m.data_changelog_status_removed()
    }
  ];

  // Collection filter chips: "All" plus one per collection, with a count of how
  // many commits touched each (so empty collections are visibly zero).
  const COLLECTIONS = ['networks', 'devices', 'firmwares', 'software', 'vendors'];
  let collectionCounts = $derived.by(() => {
    const counts = Object.fromEntries(COLLECTIONS.map((c) => [c, 0]));
    for (const c of data.commits) {
      for (const col of new Set(c.changes.map((ch) => ch.collection))) {
        if (col in counts) counts[col]++;
      }
    }
    return counts;
  });

  const PER_PAGE = 40;
  let query = $state('');
  let collection = $state('all');
  let page = $state(1);

  // Filter over the selected collection plus commit subject, hash, author and
  // the ids/collections it touched.
  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return data.commits.filter((c) => {
      if (collection !== 'all' && !c.changes.some((ch) => ch.collection === collection)) return false;
      if (!q) return true;
      if (c.subject.toLowerCase().includes(q)) return true;
      if (c.shortHash.includes(q)) return true;
      if (c.author.toLowerCase().includes(q)) return true;
      if (c.changes.some((ch) => ch.id.includes(q) || ch.collection.includes(q))) return true;
      return c.other.some((o) => o.toLowerCase().includes(q));
    });
  });

  // When a single collection is selected, show only that collection's group in
  // each commit; otherwise show all of them.
  const visibleGroups = (c) =>
    groupCommitChanges(c).filter((g) => collection === 'all' || g.collection === collection);

  // Reset to the first page whenever the filters change the result set.
  $effect(() => {
    query;
    collection;
    page = 1;
  });

  let pageItems = $derived(filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE));
</script>

<Seo title={m.data_changelog_title()} description={m.data_changelog_seo_desc()} />

<PageHeader title={m.data_changelog_title()} icon="history">
  {#snippet children()}
    {m.data_changelog_subtitle()}
  {/snippet}
</PageHeader>

<div class="mt-4 mb-3 flex flex-wrap items-center gap-3">
  <input
    type="search"
    placeholder={m.data_changelog_search_placeholder()}
    bind:value={query}
    class="min-w-[200px] flex-1 rounded-lg border border-edge bg-bg px-3 py-2 text-[0.9rem] outline-none focus:border-transparent focus:ring-2 focus:ring-accent"
  />
  <span class="text-[0.85rem] text-dim">{m.data_changelog_commits({ count: filtered.length })}</span>
</div>

<div class="mb-4 flex flex-wrap gap-1.5">
  <Chip pressed={collection === 'all'} onPressedChange={() => (collection = 'all')} class="px-3 py-1.5 text-[0.85rem]">
    {m.data_changelog_all()}
  </Chip>
  {#each COLLECTIONS as col (col)}
    <Chip pressed={collection === col} onPressedChange={() => (collection = col)} class="px-3 py-1.5 text-[0.85rem]">
      {collectionLabel(col)} <span class="opacity-60">{collectionCounts[col]}</span>
    </Chip>
  {/each}
</div>

{#if !data.commits.length}
  <p class="rounded-xl border border-edge bg-elev p-8 text-center text-dim">
    {m.data_changelog_unavailable()}
  </p>
{:else if !pageItems.length}
  <p class="rounded-xl border border-edge bg-elev p-8 text-center text-dim">{m.data_changelog_empty()}</p>
{:else}
  <ol class="flex flex-col gap-3">
    {#each pageItems as c (c.hash)}
      <li class="rounded-xl border border-edge bg-elev1 p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 class="min-w-0 font-semibold text-ink">{c.subject}</h2>
          <a
            class="shrink-0 font-mono text-[0.8rem] text-accent2 hover:underline"
            href={commitUrl(c.hash)}
            target="_blank"
            rel="noreferrer"
            title={m.data_changelog_view_commit()}
          >
            {c.shortHash} ↗
          </a>
        </div>
        <div class="mt-0.5 text-[0.8rem] text-dim">
          <time datetime={c.date} title={fmtDateTime(c.date)}>{relativeTime(c.date)}</time>
          <span class="text-edge">·</span>
          <span>{c.author}</span>
        </div>

        {#each visibleGroups(c) as g (g.collection)}
          <div class="mt-3">
            <div class="text-[0.82rem] font-semibold text-ink">{collectionLabel(g.collection)}</div>
            <div class="mt-1.5 flex flex-col gap-2">
              {#each STATUS_ROWS as row (row.key)}
                {#if g[row.key].length}
                  <div class="border-l-2 pl-2.5 {row.border}">
                    <span
                      class="inline-block rounded border px-1.5 py-0.5 text-[0.66rem] font-semibold tracking-wide uppercase {row.badge}"
                    >
                      {row.label()} <span class="opacity-70">{g[row.key].length}</span>
                    </span>
                    <div
                      class="mt-1.5 grid gap-x-4 gap-y-0.5 text-[0.85rem] [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))]"
                    >
                      {#each g[row.key] as id (id)}
                        <a
                          href={href(changeHref({ collection: g.collection, id }))}
                          class="truncate text-ink hover:text-accent2 hover:underline"
                          title={id}>{id}</a
                        >
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}

        {#if collection === 'all' && (c.moreChanges || c.other.length)}
          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            {#if c.moreChanges}
              <span class="rounded-full border border-edge px-2.5 py-0.5 text-[0.78rem] text-dim">
                {m.data_changelog_more_changes({ count: c.moreChanges })}
              </span>
            {/if}
            {#if c.other.length}
              <span class="text-[0.72rem] font-semibold tracking-wide text-dim uppercase">{m.data_changelog_other()}</span>
              {#each c.other as o (o)}
                <span class="rounded-full border border-edge bg-elev2 px-2.5 py-0.5 text-[0.78rem] text-dim">{o}</span>
              {/each}
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ol>

  <div class="mt-6">
    <Pagination count={filtered.length} perPage={PER_PAGE} bind:page />
  </div>
{/if}
