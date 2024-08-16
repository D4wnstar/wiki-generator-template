<script lang="ts">
	import { setupPopups } from '$lib/popups'
	import type { SidebarImageObject } from '$lib/shorthand.types'
	import { getModalStore, type ModalSettings, type PopupSettings } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'

	const modalStore = getModalStore()

	export let sidebarImages: SidebarImageObject[]
	export let popupSettings: PopupSettings
	export let supabase: SupabaseClient

	setupPopups('sidebar-images', popupSettings, supabase)
</script>

<div id="sidebar-images" class="space-y-6">
	{#each sidebarImages as image}
		<figure class="text-center">
			<button
				on:click={() =>
					modalStore.trigger({
						type: 'component',
						component: 'image',
						meta: { imageUrl: image.url, imageCaption: image.caption }
					})}
			>
				<img src={image.url} alt={image.caption} class="mx-auto max-h-80" />
			</button>
			{#if image.caption}
				<figcaption class="card variant-outline-surface text-surface-700-200-token mt-4 px-4 py-2">
					{@html image.caption}
				</figcaption>
			{/if}
		</figure>
	{/each}
</div>
