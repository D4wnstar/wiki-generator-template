<script lang="ts">
	import { setupPopups } from '$lib/popups'
	import type { SidebarImageRow } from '$lib/schema'
	import { getModalStore, type ModalSettings, type PopupSettings } from '@skeletonlabs/skeleton'

	const modalStore = getModalStore()

	export let sidebarImages: SidebarImageRow[]
	// export let popupSettings: PopupSettings

	// setupPopups('sidebar-images', popupSettings, supabase)
</script>

<div id="sidebar-images" class="space-y-6">
	{#each sidebarImages as image}
		<figure class="text-center">
			<button
				on:click={() =>
					modalStore.trigger({
						type: 'component',
						component: 'image',
						meta: { base64: image.base64, imageCaption: image.caption }
					})}
			>
				<img
					src={`data:image/webp;base64,${image.base64}`}
					alt={image.caption}
					class="mx-auto max-h-80"
				/>
			</button>
			{#if image.caption}
				<figcaption class="card variant-outline-surface text-surface-700-200-token mt-4 px-4 py-2">
					{@html image.caption}
				</figcaption>
			{/if}
		</figure>
	{/each}
</div>
