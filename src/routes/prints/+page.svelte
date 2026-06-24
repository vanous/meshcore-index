<script>
  import Seo from '$lib/Seo.svelte';
  import PrintList from '$lib/PrintList.svelte';
  let { data } = $props();
</script>

<Seo
  title="3D Prints"
  description="Community and vendor 3D-printable models for MeshCore hardware — enclosures, cases and accessories across every device, newest first."
/>

<PrintList prints={data.prints} types={data.types} />
