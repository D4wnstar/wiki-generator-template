<script lang="ts">
	import Extras from '$lib/components/content/Extras.svelte'
	import ImageWithModal from '$lib/components/content/ImageWithModal.svelte'
	import { fetchNoteTransclusion } from '$lib/notes'
	import { EyeOff } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'

	let { data } = $props()
	const pageTitle = $derived(data.note.alt_title ?? data.note.title)
	const headTitle = $derived(`${pageTitle} - ${data.settings.title}`)

	let images: Map<number, { type: 'svg'; svg: string } | { type: 'raster'; blob: Blob }> =
		new SvelteMap()

	onMount(async () => {
		// Images are grabbed onMount to avoid long loading times and because we can't run
		// fetch with a relative path when server-side rendering
		for (const chunk of data.contents) {
			if (chunk.image_path) {
				const res = await fetch(`/api/v1/image?image_path=${chunk.image_path}`)
				if (res.headers.get('content-type') === 'image/svg+xml') {
					images.set(chunk.chunk_id, { type: 'svg', svg: await res.text() })
				} else {
					images.set(chunk.chunk_id, { type: 'raster', blob: await res.blob() })
				}
			}
		}
	})
</script>

<svelte:head>
	<title>{headTitle}</title>
</svelte:head>

<main id="note-content" class="mx-auto flex max-w-3xl flex-col space-y-4 lg:grow lg:px-8">
	<h1 class="h1 text-center">{pageTitle}</h1>
	<hr class="hr" />
	{#each data.contents as chunk}
		{#if chunk.image_path}
			{@const image = data.images.get(chunk.chunk_id)}
			{#if image}
				<ImageWithModal
					url={image.url}
					svg={image.svg}
					caption={image.caption ?? ''}
					baseClasses="w-1/3 self-center"
				/>
			{/if}
		{:else if chunk.note_transclusion_path}
			<blockquote class="space-y-4 border-l-2 border-secondary-500 pl-4">
				{#await fetchNoteTransclusion(chunk.note_transclusion_path) then trChunks}
					{#each trChunks as trChunk}
						{@html trChunk.text}
					{/each}
				{/await}
			</blockquote>
		{:else if chunk.allowed_users}
			<section class="space-y-2 rounded !bg-opacity-50 px-4 py-2 bg-surface-300-700">
				<header class="flex gap-3">
					<EyeOff />
					<span><strong>Secret</strong></span>
				</header>
				{@html chunk.text}
			</section>
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
