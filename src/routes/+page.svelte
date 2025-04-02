<script lang="ts">
	import Extras from '$lib/components/content/Extras.svelte'
	import { fetchNoteTransclusion } from '$lib/notes'

	let { data } = $props()
	const pageTitle = $derived(data.note.alt_title ?? data.note.title)
	const headTitle = $derived(`${pageTitle} — ${data.settings.title}`)
</script>

<svelte:head>
	<title>{headTitle}</title>
</svelte:head>

<main id="note-content" class="mx-auto max-w-[800px] space-y-4 lg:grow lg:px-8">
	<h1 class="h1 text-center">{pageTitle}</h1>
	<hr class="hr" />
	{#each data.contents as chunk}
		{#if chunk.image_path}
			<img src="/api/v1/image?image_path={chunk.image_path}" alt="" />
		{:else if chunk.note_transclusion_path}
			<blockquote class="space-y-4 border-l-2 border-secondary-500 pl-4">
				{#await fetchNoteTransclusion(chunk.note_transclusion_path) then trChunks}
					{#each trChunks as trChunk}
						{@html trChunk.text}
					{/each}
				{/await}
			</blockquote>
		{:else}
			{@html chunk.text}
		{/if}
	{/each}
	<hr class="hr" />
</main>
<div class="hidden w-[360px] [@media(min-width:1400px)]:block">
	{#if data.sidebarImages.length > 0 || data.details.length > 0}
		<Extras sidebarImages={data.sidebarImages} details={data.details} />
	{/if}
</div>
