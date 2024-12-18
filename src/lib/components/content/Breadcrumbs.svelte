<script lang="ts">
	interface Props {
		breadcrumbs: string[]
		classes?: string
	}

	let { breadcrumbs, classes = '' }: Props = $props()
</script>

<ol id="breadcrumbs" class="flex items-center gap-4 space-y-0 {classes}">
	{#each breadcrumbs.slice(0, -1) as crumb}
		<li class="opacity-40">{crumb}</li>
		<li class="opacity-30" aria-hidden={true}>&rsaquo;</li>
	{/each}

	<li class="opacity-40">{breadcrumbs[breadcrumbs.length - 1]}</li>
</ol>
