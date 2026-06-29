<script>
  import { bandLabel, bandColor } from '$lib/data.js';

  let { band, class: className = '' } = $props();

  let key = $derived(band != null ? String(band) : null);
  let label = $derived(key ? (bandLabel(key) ?? key) : null);
  let color = $derived(key ? (bandColor(key) ?? '#8b949e') : null);
</script>

{#if label && color}
  <span
    class="inline-block rounded-[5px] border px-1.5 py-px text-[0.72rem] font-bold leading-tight {className}"
    style:color
    style:background-color="color-mix(in srgb, {color} 18%, transparent)"
    style:border-color="color-mix(in srgb, {color} 42%, transparent)"
  >{label}</span>
{/if}
