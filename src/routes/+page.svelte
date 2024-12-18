<script lang="ts">
	import { popupNote, wikiTitle } from '$lib/stores'
	import Extras from '$lib/components/content/Extras.svelte'

	let { data } = $props()
</script>

<!-- <svelte:head>
	<title>{pageTitle}</title>
</svelte:head> -->

<main id="note-content" class="mx-auto max-w-[800px] space-y-4 lg:grow">
	<h1 class="h1 text-center">{data.note.alt_title ?? data.note.title}</h1>
	<hr />
	{@html data.pageContent}
	<hr />
</main>

<!-- <div
	class="variant-outline-secondary card max-h-80 w-80 overflow-hidden p-4"
	data-popup="popupHover"
>
	<h1 class="pb-2 text-center text-2xl"><strong>{$popupNote.title}</strong></h1>
	<hr />
	<article class="space-y-2 py-2 text-sm">{@html $popupNote.content}</article>
</div> -->
