<script lang="ts">
	import { sortFiles, type File, type Folder } from '$lib/notes'
	import { ChevronDown } from 'lucide-svelte'
	import TreeFile from './TreeFile.svelte'
	import TreeFolder from './TreeFolder.svelte'
	import { slide } from 'svelte/transition'

	interface Props {
		expanded: boolean
		title: string
		children: (File | Folder)[]
	}
	let { expanded = $bindable(false), title, children }: Props = $props()

	function toggle() {
		expanded = !expanded
	}
</script>

<button class="flex flex-row items-center gap-2 {expanded ? 'mb-3' : ''}" onclick={toggle}>
	<ChevronDown class="w-8" />
	<span class="text-left">{title}</span>
</button>

{#if expanded}
	<ul transition:slide={{ duration: 300 }} class="space-y-3 pl-1">
		{#each children.sort(sortFiles) as child, i}
			<li class="pl-1">
				{#if child.type === 'folder'}
					<TreeFolder {...child} expanded={false} />
				{:else}
					<TreeFile {...child} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
