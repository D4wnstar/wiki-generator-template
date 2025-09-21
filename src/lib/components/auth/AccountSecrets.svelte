<script lang="ts">
	import type { NoteMeta } from '$lib/notes'

	interface Props {
		secretNotes: NoteMeta[]
	}
	let { secretNotes }: Props = $props()
</script>

<div>
	<!-- <h3 class="text-xl">Secret Pages</h3> -->
	<div class="text-surface-600-300-token">
		These are all the secret pages and sections you have access to.
	</div>
	<ul class="ul variant-soft-secondary my-2 p-2">
		{#if secretNotes.length === 0}
			<div>There's nothing here...</div>
		{/if}
		{#if secretNotes.length > 0}
			<h3 class="h3 mb-2">Secret pages</h3>
			{#each secretNotes as note}
				<li class="list-inside list-disc pl-4">
					<a href={`/wiki/${note.route}`} class="underline hover:underline lg:no-underline"
						>{note.title}</a
					>
				</li>
			{/each}
		{/if}
	</ul>
</div>
