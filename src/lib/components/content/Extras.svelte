<script lang="ts">
	import Details from './Details.svelte'
	import type { DetailsRow, SidebarImageRow } from '$lib/schema'
	import SidebarImage from './SidebarImage.svelte'

	export let sidebarImages: SidebarImageRow[]
	export let details: DetailsRow[]
	// export let popupSettings: PopupSettings
</script>

{#if sidebarImages.length > 0}
	<SidebarImage {sidebarImages} />
	<hr />
{/if}
{#if details.length > 0}
	<Details {details} />
	<hr />
{/if}
