<script lang="ts">
	import { popupNote, wikiTitle } from '$lib/stores'
	import { setupPopups } from '$lib/popups'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import Extras from '$lib/components/Extras.svelte'
	import { hideUnauthorizedLinks } from '$lib/auth.js'

	export let data

	const popupSettings: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top',
		middleware: { autoPlacement: { allowedPlacements: ['top', 'bottom'] } }
	}

	hideUnauthorizedLinks('note-content', data.refNotes.map((r) => r.slug))
	setupPopups('note-content', popupSettings, data.supabase)
	$: page_title = `${data.alt_title ?? data.title} - ${$wikiTitle}`
</script>

<svelte:head>
	<title>{page_title}</title>
</svelte:head>

<div class="h-full w-full flex flex-col md:flex-row">
	<div class="flex flex-col w-full items-center md:pb-8 pt-10 px-8">
		<h1 id="note-title" class="h1 pb-4 text-center">{data.alt_title ?? data.title}</h1>
		<div id="note-content" class="flex flex-col md:max-w-3xl w-full space-y-4">
			<hr />
			{@html data.content}
			<hr />
		</div>
	</div>

	{#if data.sidebar_images.length > 0 || data.details.length > 0 || data.backreferences.length > 0}
		<div
			id="extras-sidebar"
			class="hidden md:flex md:flex-col md:w-[24em] lg:w-[36em] p-4 space-y-2 rounded-none variant-glass-surface border-l-[1px] border-surface-300-600-token"
		>
			<Extras
				sidebar_images={data.sidebar_images}
				details={data.details}
				backreferences={data.backreferences}
				{popupSettings}
				supabase={data.supabase}
			/>
		</div>
		<div class="md:hidden px-8 pt-4 pb-8 space-y-4">
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

<div class="card p-4 variant-outline-secondary w-80 h-80 overflow-hidden" data-popup="popupHover">
	<div class="text-center pb-2 text-2xl"><strong>{$popupNote.title}</strong></div>
	<hr />
	<div class="text-sm py-2 space-y-2">{@html $popupNote.content}</div>
</div>
