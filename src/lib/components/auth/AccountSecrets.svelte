<script lang="ts">
	import type { NoteContentsRow, NoteRow } from '$lib/schema'

	interface Props {
		secretNotes: NoteRow[]
		secretChunks: {
			note_contents: NoteContentsRow | null
			notes: NoteRow
		}[]
	}
	let { secretNotes, secretChunks }: Props = $props()
</script>

<div>
	<!-- <h3 class="text-xl">Secret Pages</h3> -->
	<div class="text-surface-600-300-token">
		These are all the secret pages and sections you have access to.
	</div>
	<ul class="ul variant-soft-secondary my-2 p-2">
		{#if secretNotes.length === 0 && secretChunks.length === 0}
			<div>There's nothing here...</div>
		{/if}
		{#if secretNotes.length > 0}
			<h3 class="h3 mb-2">Secret pages</h3>
			{#each secretNotes as note}
				<li class="list-inside list-disc pl-4">
					<a href={`/${note.slug}`} class="underline hover:underline lg:no-underline"
						>{note.alt_title ?? note.title}</a
					>
				</li>
			{/each}
		{/if}
		{#if secretChunks.length > 0}
			<h3 class="h3 mb-2 mt-2">Pages with secret sections</h3>
			{#each secretChunks as chunk}
				<li class="list-inside list-disc pl-4">
					<a href={`/${chunk.notes.slug}`} class="underline hover:underline lg:no-underline"
						>{chunk.notes.alt_title ?? chunk.notes.title}</a
					>
				</li>
			{/each}
		{/if}
	</ul>
</div>
