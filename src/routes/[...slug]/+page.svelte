<script lang="ts">
	import Breadcrumbs from '$lib/components/content/Breadcrumbs.svelte'
	import Extras from '$lib/components/content/Extras.svelte'

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
		<!-- {#if chunk.transclusionType && chunk.transclusionType === 'image'}
			<img src={chunk.blob} alt="" />
		{:else} -->
		{@html chunk.text}
		<!-- {/if} -->
		<!-- <hr /> -->
	{/each}
	<hr class="hr" />
</main>
<div class="hidden w-[360px] [@media(min-width:1400px)]:block">
	{#if data.sidebarImages.length > 0 || data.details.length > 0}
		<Extras sidebarImages={data.sidebarImages} image={data.images} details={data.details} />
	{/if}
</div>
