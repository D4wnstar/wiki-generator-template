<script lang="ts">
	import type { NoteContentsRow, NoteRow } from '$lib/schema'

	interface Props {
		privateNotes: NoteRow[]
		privateChunks: {
			note_contents: NoteContentsRow | null
			notes: NoteRow
		}[]
	}
	let { privateNotes, privateChunks }: Props = $props()
</script>

<div>
	<!-- <h3 class="text-xl">Secret Pages</h3> -->
	<div class="text-surface-600-300-token">
		These are all the secret pages and sections you have access to.
	</div>
	<ul class="ul variant-soft-secondary my-2 p-2">
		{#if privateNotes.length === 0 && privateChunks.length === 0}
			<div>There's nothing here...</div>
		{/if}
		{#if privateNotes.length > 0}
			<h3 class="h3 mb-2">Secret pages</h3>
			{#each privateNotes as note}
				<li class="list-inside list-disc pl-4">
					<a href={`/${note.slug}`} class="underline hover:underline lg:no-underline"
						>{note.alt_title ?? note.title}</a
					>
				</li>
			{/each}
		{/if}
		{#if privateChunks.length > 0}
			<h3 class="h3 mb-2 mt-2">Pages with secret sections</h3>
			{#each privateChunks as chunk}
				<li class="list-inside list-disc pl-4">
					<a href={`/${chunk.notes.slug}`} class="underline hover:underline lg:no-underline"
						>{chunk.notes.alt_title ?? chunk.notes.title}</a
					>
				</li>
			{/each}
		{/if}
	</ul>
</div>
