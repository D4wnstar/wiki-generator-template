<script lang="ts">
	import type { SidebarImageRow } from '$lib/schema'
	import { Modal } from '@skeletonlabs/skeleton-svelte'

	interface Props {
		sidebarImage: SidebarImageRow
	}

	let { sidebarImage }: Props = $props()
	let modalState = $state(false)
</script>

<figure class="text-center">
	<Modal bind:open={modalState}>
		{#snippet trigger()}
			<img
				src={`data:image/webp;base64,${sidebarImage.base64}`}
				alt={sidebarImage.caption}
				class="mx-auto max-h-80"
			/>
		{/snippet}
		{#snippet content()}
			<div class="max-w-[80vh] rounded p-4 bg-surface-100-900">
				<figure>
					<img
						src={`data:image/webp;base64,${sidebarImage.base64}`}
						alt={sidebarImage.caption}
						class="mx-auto max-h-[80vh]"
					/>
					<hr class="hr my-4 border-surface-700-300" />
					<figcaption class="text-center type-scale-5">
						{@html sidebarImage.caption}
					</figcaption>
				</figure>
			</div>
		{/snippet}
	</Modal>
	{#if sidebarImage.caption}
		<figcaption
			class="mt-4 rounded border-2 border-secondary-900 border-opacity-50 px-4 py-2 preset-tonal-surface"
		>
			{@html sidebarImage.caption}
		</figcaption>
	{/if}
</figure>
