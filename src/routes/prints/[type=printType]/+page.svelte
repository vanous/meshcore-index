<script>
  import Seo from '$lib/Seo.svelte';
  import PrintList from '$lib/PrintList.svelte';
  import { PRINT_TYPE_META, printType } from '$lib/data.js';
  let { data } = $props();

  let meta = $derived(PRINT_TYPE_META[data.type]);
  let count = $derived(data.prints.filter((p) => printType(p) === data.type).length);
</script>

<Seo
  title="3D-printed {meta?.label ?? 'prints'}"
  description={`${count} 3D-printable ${meta?.label ?? 'print'} for MeshCore hardware — ${meta?.blurb ?? ''}, across every device.`}
/>

<PrintList prints={data.prints} types={data.types} activeType={data.type} />
