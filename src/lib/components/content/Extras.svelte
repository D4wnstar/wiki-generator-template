<script lang="ts">
	import Details from './Details.svelte'
	import type { DetailsRow, ImageRow, SidebarImageRow } from '$lib/schema'
	import SidebarImage from './SidebarImage.svelte'

	interface Props {
		sidebarImages: SidebarImageRow[]
		image: ImageRow[]
		details: DetailsRow[]
	}

	let { sidebarImages, image, details }: Props = $props()
	const imageThings = sidebarImages.map((si, i) => {
		return { si: si, img: image[i] }
	})
</script>

{#if sidebarImages.length > 0}
	<div id="sidebar-images" class="space-y-6">
		{#each imageThings as thing}
			<SidebarImage sidebarImage={thing.si} image={thing.img} />
		{/each}
	</div>

	<hr class="mb-4 mt-6 border-surface-700-300" />
{/if}
{#if details.length > 0}
	<Details {details} />
	<hr class="mt-4 border-surface-700-300" />
{/if}
