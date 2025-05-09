<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte'

	interface Props {
		url?: string
		svg?: string
		caption: string | null
		baseClassesRaster?: string
		baseClassesSvg?: string
	}

	let { url, svg, caption, baseClassesRaster, baseClassesSvg }: Props = $props()
	let modalState = $state(false)
</script>

<figure class={['text-center', url && baseClassesRaster, svg && baseClassesSvg]}>
	<Modal bind:open={modalState}>
		{#snippet trigger()}
			{#if url}
				<img src={url} alt={caption} />
			{:else if svg}
				<div>{@html svg}</div>
			{/if}
		{/snippet}
		{#snippet content()}
			<figure
				class="flex max-h-[90vh] max-w-[80vw] flex-col items-center justify-center rounded p-4 bg-surface-100-900"
			>
				{#if url}
					<img src={url} alt={caption} class="max-h-[80vh] max-w-[80vw] object-contain" />
				{:else if svg}
					<div class="max-h-[80vh] max-w-[70vw] overflow-auto">{@html svg}</div>
				{/if}
				{#if caption}
					<hr class="hr my-4 border-surface-700-300" />
					<figcaption class="text-center type-scale-3">
						{@html caption}
					</figcaption>
				{/if}
			</figure>
		{/snippet}
	</Modal>
	{#if caption}
		<figcaption class="mt-4 rounded border-2 border-secondary-900 px-4 py-1">
			{@html caption}
		</figcaption>
	{/if}
</figure>
