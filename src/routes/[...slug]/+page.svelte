<script lang="ts">
	import { popupNote, wikiTitle } from '$lib/stores'
	import { setupPopups } from '$lib/popups'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import Extras from '$lib/components/Extras.svelte'
	import { hideUnauthorizedLinks } from '$lib/auth.js'
	import { onMount } from 'svelte'
	import { afterNavigate } from '$app/navigation'

	export let data

	const popupSettings: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top',
		middleware: { autoPlacement: { allowedPlacements: ['top', 'bottom'] } }
	}

	// Setup can only run once on a full reload as the supabase client does not change on navigation
	setupPopups('note-content', popupSettings, data.supabase)
	// Hiding needs to be done on every navigation as the refNotes changes on every page
	afterNavigate(() => {
		hideUnauthorizedLinks(
			'note-content',
			data.refNotes.map((ref) => ref.slug)
		)
	})
	$: pageTitle = `${data.alt_title ?? data.title} - ${$wikiTitle}`
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="flex h-full w-full flex-col md:flex-row">
	<div
		class="flex max-h-[93vh] w-full flex-col items-center overflow-auto px-16 md:pb-8 lg:max-h-screen"
	>
		<h1 id="note-title" class="h1 pb-4 pt-4 text-center md:max-w-3xl">
			{data.alt_title ?? data.title}
		</h1>
		<article id="note-content" class="flex w-full flex-col space-y-4 md:max-w-3xl">
			<hr />
			{@html data.pageContent}
			<hr />
		</article>
	</div>

	{#if data.sidebar_images.length > 0 || data.details.length > 0 || data.backreferences.length > 0}
		<div
			id="extras-sidebar"
			class="variant-glass-surface border-surface-300-600-token hidden max-h-[93vh] space-y-2 overflow-auto rounded-none border-l-[1px] p-4 md:flex md:w-[24em] md:flex-col lg:max-h-screen lg:w-[36em]"
		>
			<Extras
				sidebar_images={data.sidebar_images}
				details={data.details}
				backreferences={data.backreferences}
				{popupSettings}
				supabase={data.supabase}
			/>
		</div>
		<div class="space-y-4 px-8 pb-8 pt-4 md:hidden">
			<Extras
				sidebar_images={data.sidebar_images}
				details={data.details}
				backreferences={data.backreferences}
				{popupSettings}
				supabase={data.supabase}
			/>
		</div>
	{/if}
</div>

<div
	class="card variant-outline-secondary max-h-80 w-80 overflow-hidden p-4"
	data-popup="popupHover"
>
	<h1 class="pb-2 text-center text-2xl"><strong>{$popupNote.title}</strong></h1>
	<hr />
	<article class="space-y-2 py-2 text-sm">{@html $popupNote.content}</article>
</div>
