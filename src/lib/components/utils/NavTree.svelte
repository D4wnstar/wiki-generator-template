<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import { getPathCombinations } from '$lib/notes'
	import {
		RecursiveTreeView,
		getDrawerStore,
		type TreeViewNode,
		popup,
		type AutocompleteOption,
		type PopupSettings,
		Autocomplete
	} from '@skeletonlabs/skeleton'
	import { createEventDispatcher } from 'svelte'

	interface Props {
		title: string;
		notesTreeView: TreeViewNode[];
		notesTitles: AutocompleteOption<string>[];
	}

	let { title, notesTreeView, notesTitles }: Props = $props();
        
    const drawerStore = getDrawerStore()
    
    let expandedNodes: string[] = $state([])

	beforeNavigate(() => {
		drawerStore.close()
	})

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom'
	}

	// Search bar
	const dispatch = createEventDispatcher()
	let searchQuery = $state('')

	function onAutocompleteSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		// @ts-expect-error
		const slug = event.detail.meta.slug
		dispatch('autocomplete', { slug })        
		searchQuery = ''
	}
	
	drawerStore.subscribe((drawer) => {
		if (drawer.open && $page.params.slug) {
			getPathCombinations($page.params.slug).forEach((path) => expandedNodes.push(path))
		}
	})

	afterNavigate(() => {
		if ($page.params.slug) {
			const nodes = Array.from(getPathCombinations($page.params.slug))
			expandedNodes = expandedNodes.concat(nodes)
		}
	})
</script>

<nav class="w-full grow overflow-auto rounded-none">
	<a href="/">
		<h2 class="h2 w-full py-4 text-center"><strong>{title}</strong></h2>
	</a>
	<hr />
	<div class="px-2 pt-4">
		<input
			class="input px-2 py-1"
			type="search"
			name="search-bar"
			bind:value={searchQuery}
			placeholder="Search..."
			use:popup={popupSettings}
		/>
	</div>
	<RecursiveTreeView
		class="py-2"
		padding="px-4 py-0.5"
		spacing=""
		nodes={notesTreeView}
		regionSummary="w-full-cascade [overflow-wrap:anywhere]"
		regionSymbol="min-w-[1rem] max-w-[1rem]"
		bind:expandedNodes
	/>
</nav>

<div class="card max-h-60 w-[15em] overflow-y-auto" tabindex="-1" data-popup="popupAutocomplete">
	<Autocomplete
		regionButton="text-left w-full"
		bind:input={searchQuery}
		options={notesTitles}
		on:selection={onAutocompleteSelection}
	/>
</div>
