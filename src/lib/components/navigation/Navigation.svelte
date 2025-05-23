<script lang="ts">
	import { getNotesTree, sortFolderRecursively, type Folder, type Tree } from '$lib/notes'
	import { Popover } from '@skeletonlabs/skeleton-svelte'
	import TreeFile from './TreeFile.svelte'
	import TreeFolder from './TreeFolder.svelte'
	import { onMount } from 'svelte'
	import type { NoteRow } from '$lib/schema'
	import { slide } from 'svelte/transition'

	let { animate = true }: { animate?: boolean } = $props()

	let root: Tree = $state([])
	let searchQuery = $state('')
	let popoverState = $state(false)
	let autocompleteLinks: { title: string; slug: string }[] = $state([])

	function saveExpandedStates() {
		const states: Record<string, boolean> = {}
		const collectStates = (items: Tree) => {
			for (const item of items) {
				// Save only open folders, everything else is default closed anyway
				if (item.type === 'folder' && item.expanded) {
					states[item.path] = item.expanded
					collectStates(item.children)
				}
			}
		}
		collectStates(root)
		localStorage.setItem('navOpenFolders', JSON.stringify(states))
	}

	function loadExpandedStates(content: Tree) {
		const saved = localStorage.getItem('navOpenFolders')
		if (!saved) return

		const states: Record<string, boolean> = JSON.parse(saved)
		const applyStates = (items: Tree) => {
			for (const item of items) {
				if (item.type === 'folder') {
					if (states[item.path] !== undefined) {
						item.expanded = states[item.path]
					}
					applyStates(item.children)
				}
			}
		}
		applyStates(content)
	}

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
			path: '',
			children: root,
			expanded: true
		})

		popoverState = true
	}

	onMount(async () => {
		// Navigation content is grabbed on the fly because it should not be prerendered
		const res = await fetch('/api/v1/auth/fetch-pages')
		if (!res.ok) return
		const pages = (await res.json()) as NoteRow[]
		const tree = getNotesTree(pages)
		sortFolderRecursively(tree)
		root = tree.children
		console.log($state.snapshot(tree))

		loadExpandedStates(root)
	})
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
<div class="overflow-auto">
	{#each root as _, idx}
		<div transition:slide={{ duration: animate ? 500 : 0, axis: 'y' }}>
			{#if root[idx].type === 'folder'}
				<TreeFolder bind:folder={root[idx]} {saveExpandedStates} />
			{:else}
				<TreeFile title={root[idx].alt_title ?? root[idx].title} slug={root[idx].slug} />
			{/if}
		</div>
	{/each}
</div>
<hr class="border-surface-700-300" />
