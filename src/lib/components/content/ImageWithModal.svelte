<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte'

	interface Props {
		url: string
		caption: string | null
		baseClasses?: string
	}

	let { url, caption, baseClasses }: Props = $props()
	let modalState = $state(false)
</script>

<figure class={['text-center', url && baseClasses]}>
	<Modal bind:open={modalState}>
		{#snippet trigger()}
			<img src={url} alt={caption} />
		{/snippet}
		{#snippet content()}
			<figure
				class="flex max-h-[90vh] max-w-[80vw] flex-col items-center justify-center rounded p-4 bg-surface-100-900"
			>
				<img src={url} alt={caption} class="max-h-[80vh] max-w-[80vw] object-contain" />
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
		<figcaption class="mt-4 rounded border-2 border-secondary-900 px-4 py-1 text-center">
			{@html caption}
		</figcaption>
	{/if}
</figure>
