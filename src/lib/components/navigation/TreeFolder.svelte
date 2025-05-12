<script lang="ts">
	import { type Folder } from '$lib/notes'
	import { ChevronDown } from 'lucide-svelte'
	import TreeFile from './TreeFile.svelte'
	import TreeFolder from './TreeFolder.svelte'
	import { slide } from 'svelte/transition'

	interface Props {
		folder: Folder
		saveExpandedStates: () => void
	}
	let { folder = $bindable(), saveExpandedStates }: Props = $props()

	function toggle() {
		folder.expanded = !folder.expanded
		saveExpandedStates()
	}
</script>

<button class="flex flex-row items-center gap-2 {folder.expanded ? 'mb-3' : ''}" onclick={toggle}>
	<ChevronDown class="min-w-8" />
	<span class="grow text-left">{folder.title}</span>
</button>

{#if folder.expanded}
	<ul transition:slide={{ duration: 300 }} class="space-y-3 pl-1">
		{#each folder.children as child}
			<li class="pl-1">
				{#if child.type === 'folder'}
					<TreeFolder folder={child} {saveExpandedStates} />
				{:else}
					<TreeFile title={child.alt_title ?? child.title} slug={child.slug} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
