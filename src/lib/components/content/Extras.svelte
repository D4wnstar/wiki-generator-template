<script lang="ts">
	import Details from './Details.svelte'
	import type { DetailsRow, SidebarImageRow } from '$lib/schema'
	import ImageWithModal from './ImageWithModal.svelte'
	import type { LoadedImage } from '$lib/types'

	interface Props {
		sidebarImages: SidebarImageRow[]
		details: DetailsRow[]
	}

	let { sidebarImages, details }: Props = $props()
</script>

{#if sidebarImages.length > 0}
	<div id="sidebar-images" class="space-y-6">
		{#each sidebarImages as img}
			<ImageWithModal
				url="/api/v1/image/{encodeURIComponent(img.image_path)}"
				caption={img.caption}
			/>
		{/each}
	</div>

	<hr class="mb-4 mt-6 border-surface-700-300" />
{/if}
{#if details.length > 0}
	<Details {details} />
	<hr class="mt-4 border-surface-700-300" />
{/if}
