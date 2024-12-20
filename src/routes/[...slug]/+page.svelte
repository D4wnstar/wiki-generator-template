<script lang="ts">
	import Breadcrumbs from '$lib/components/content/Breadcrumbs.svelte'
	import Extras from '$lib/components/content/Extras.svelte'
	import { fetchNoteTransclusion } from '$lib/notes'

	let { data } = $props()
	const pageTitle = $derived(data.note.alt_title ?? data.note.title)
	const headTitle = $derived(`${pageTitle} — ${data.settings.title}`)

	// Get breadcrumbs while respecting alt titles
	let breadcrumbs = $derived.by(() => {
		const crumbs = data.note.path.split('/')
		const lastElem = data.note.alt_title ?? crumbs[crumbs.length - 1]
		crumbs[crumbs.length - 1] = lastElem
		return crumbs
	})
</script>

<svelte:head>
	<title>{headTitle}</title>
</svelte:head>

<main id="note-content" class="mx-auto flex max-w-[800px] flex-col space-y-4 lg:grow lg:px-8">
	<div class="hidden w-full overflow-scroll lg:block">
		<Breadcrumbs {breadcrumbs} />
	</div>
	<h1 class="h1 text-center">{pageTitle}</h1>
	<hr class="hr" />
	{#each data.contents as chunk}
		{#if chunk.image_id}
			<img src="/api/v1/image?image_id={chunk.image_id}" alt="" />
		{:else if chunk.note_transclusion_id}
			<blockquote class="space-y-4 border-l-2 border-secondary-500 pl-4">
				{#await fetchNoteTransclusion(chunk.note_transclusion_id) then trChunks}
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
