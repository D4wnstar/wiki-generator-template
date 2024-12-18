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
	<hr class="hr" />
	{@html data.pageContent}
	<hr class="hr" />
</main>

<!-- <div class="h-screen-no-header flex w-full flex-col md:flex-row">
	<div class="flex w-full flex-col items-center overflow-auto px-16 md:pb-8 lg:max-h-screen">
		<h1 id="note-title" class="h1 pb-4 pt-4 text-center md:max-w-3xl">
			{data.note.alt_title ?? data.note.title}
		</h1>
		<article id="note-content" class="flex w-full flex-col space-y-4 md:max-w-3xl">
			<hr />
			{@html data.pageContent}
			<hr />
		</article>
	</div>

	{#if data.sidebarImages.length > 0 || data.details.length > 0}
		<div
			id="extras-sidebar"
			class="variant-glass-surface border-surface-300-600-token hidden max-h-[93vh] space-y-2 overflow-auto rounded-none border-l-[1px] p-4 md:flex md:w-[24em] md:flex-col lg:max-h-screen lg:w-[36em]"
		>
			<Extras sidebarImages={data.sidebarImages} details={data.details} />
		</div>
		<div class="space-y-4 px-8 pb-8 pt-4 md:hidden">
			<Extras sidebarImages={data.sidebarImages} details={data.details} />
		</div>
	{/if}
</div> -->
