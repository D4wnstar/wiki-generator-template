<script lang="ts">
	import type { File, Folder } from '$lib/notes'
	import TreeFile from './TreeFile.svelte'
	import TreeFolder from './TreeFolder.svelte'

	let { topLevelContent }: { topLevelContent: (File | Folder)[] } = $props()
</script>

<header class="text-center type-scale-4"><strong>Navigation</strong></header>
<hr class="border-surface-700-300" />
{#each topLevelContent as fileOrFolder}
	{#if fileOrFolder.type === 'folder'}
		<TreeFolder {...fileOrFolder} expanded={false} />
	{:else}
		<TreeFile {...fileOrFolder} />
	{/if}
{/each}
