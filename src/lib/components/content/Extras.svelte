<script lang="ts">
	import Details from './Details.svelte'
	import type { DetailsRow } from '$lib/schema'
	import ImageWithModal from './ImageWithModal.svelte'
	import type { LoadedImage } from '$lib/types'

	interface Props {
		sidebarImages: LoadedImage[]
		details: DetailsRow[]
	}

	let { sidebarImages, details }: Props = $props()
</script>

{#if sidebarImages.length > 0}
	<div id="sidebar-images" class="space-y-6">
		{#each sidebarImages as img}
			<ImageWithModal svg={img.svg} url={img.url} caption={img.caption} />
		{/each}
	</div>

	<hr class="mb-4 mt-6 border-surface-700-300" />
{/if}
{#if details.length > 0}
	<Details {details} />
	<hr class="mt-4 border-surface-700-300" />
{/if}
