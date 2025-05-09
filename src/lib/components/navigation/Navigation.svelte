<script lang="ts">
	import type { File, Folder } from '$lib/notes'
	import { Popover } from '@skeletonlabs/skeleton-svelte'
	import TreeFile from './TreeFile.svelte'
	import TreeFolder from './TreeFolder.svelte'

	let { topLevelContent }: { topLevelContent: (File | Folder)[] } = $props()

	let searchQuery = $state('')
	let popoverState = $state(false)
	let autocompleteLinks: { title: string; slug: string }[] = $state([])

	function searchInTree(searchTerm: string, tree: Folder) {
		let namePathPairs: { title: string; slug: string }[] = []
		searchTerm = searchTerm.toLocaleLowerCase()
		for (const obj of tree.children) {
			if (
				obj.type === 'file' &&
				obj.search_terms.some((term) => term.toLocaleLowerCase().includes(searchTerm))
			) {
				namePathPairs.push({ title: obj.alt_title ?? obj.title, slug: obj.slug })
				continue
			}

			if (obj.type === 'folder') {
				const nestedPairs = searchInTree(searchTerm, obj)
				namePathPairs.push(...nestedPairs)
			}
		}

		return namePathPairs
	}

	function autocomplete() {
		if (searchQuery.length < 2) return

		autocompleteLinks = searchInTree(searchQuery, {
			type: 'folder',
			title: '',
			children: topLevelContent
		})

		popoverState = true
	}
</script>

<header class="text-center type-scale-5"><strong>Navigation</strong></header>
<hr class="border-surface-700-300" />

<Popover
	bind:open={popoverState}
	positioning={{ placement: 'bottom' }}
	contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px] z-10"
	triggerClasses="w-full"
	autoFocus={false}
	portalled={false}
>
	{#snippet trigger()}
		<input
			type="text"
			name="search"
			id="search"
			class="input"
			placeholder="Search..."
			bind:value={searchQuery}
			oninput={autocomplete}
		/>
	{/snippet}
	{#snippet content()}
		<div class="flex w-full flex-col items-start space-y-2">
			{#each autocompleteLinks as link}
				<a class="btn block w-full text-left hover:bg-surface-200-800" href={`/${link.slug}`}
					>{link.title}</a
				>
			{/each}
		</div>
	{/snippet}
</Popover>

<hr class="border-surface-700-300" />
<div class="space-y-3 overflow-auto">
	{#each topLevelContent as obj}
		{#if obj.type === 'folder'}
			<TreeFolder {...obj} expanded={false} />
		{:else}
			<TreeFile title={obj.alt_title ?? obj.title} slug={obj.slug} />
		{/if}
	{/each}
</div>
<hr class="border-surface-700-300" />
