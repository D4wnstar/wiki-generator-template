<script lang="ts">
	import { beforeNavigate } from '$app/navigation'
    import { page } from '$app/stores';
	import { getPathCombinations } from '$lib/notes'
	import { RecursiveTreeView, getDrawerStore, type TreeViewNode } from '@skeletonlabs/skeleton'

    export let title: string
    export let notesTreeView: TreeViewNode[]

    const drawerStore = getDrawerStore()
    let expandedNodes: string[] = []
    
    beforeNavigate(() => {
        drawerStore.close()
    })

    $: if ($drawerStore.open && $page.params.slug) expandedNodes = getPathCombinations($page.params.slug)
</script>

<nav class="grow w-full rounded-none overflow-auto">
    <a href="/">
        <h2 class="h2 text-center w-full py-4"><b>{title}</b></h2>
    </a>
    <hr />
    <RecursiveTreeView
        class="py-2"
        padding="px-4"
        spacing=""
        nodes={notesTreeView}
        regionSummary="w-full-cascade [overflow-wrap:anywhere]"
        regionSymbol="min-w-[1rem] max-w-[1rem]"
        {expandedNodes}
    />
</nav>
