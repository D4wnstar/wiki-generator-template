<script lang="ts">
	import { beforeNavigate } from '$app/navigation'
    import { page } from '$app/stores';
	import { getPathCombinations } from '$lib/notes'
	import { RecursiveTreeView, getDrawerStore, type TreeViewNode, popup, type AutocompleteOption, type PopupSettings, Autocomplete } from '@skeletonlabs/skeleton'
	import { createEventDispatcher } from 'svelte'

    export let title: string
    export let notesTreeView: TreeViewNode[]
    export let notesTitles: AutocompleteOption<string>[]

    const drawerStore = getDrawerStore()
    let expandedNodes: string[] = []
    
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
	let searchQuery = ''

	function onAutocompleteSelection(event: CustomEvent<AutocompleteOption<string>>): void {
        // @ts-expect-error
        dispatch('autocomplete', { slug: event.detail.meta.slug })
        searchQuery = ""
	}

    $: if ($drawerStore.open && $page.params.slug) expandedNodes = getPathCombinations($page.params.slug)
</script>

<nav class="grow w-full rounded-none overflow-auto">
    <a href="/">
        <h2 class="h2 text-center w-full py-4"><b>{title}</b></h2>
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
        {expandedNodes}
    />
</nav>

<div
	class="card w-[15em] max-h-48 overflow-y-auto"
	tabindex="-1"
	data-popup="popupAutocomplete"
>
	<Autocomplete
        regionButton="text-left w-full"
		bind:input={searchQuery}
		options={notesTitles}
		on:selection={onAutocompleteSelection}
	/>
</div>
