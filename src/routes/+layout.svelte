<script lang="ts">
	import '../app.css'
	import '../prism-night-owl.css'
	// import '../prism-line-numbers.css'
	import '../rehype-callouts.css'
	import '../katex.css'
	import { AppBar } from '@skeletonlabs/skeleton-svelte'
	import { UserCircle } from 'lucide-svelte'
	import Lightswitch from '$lib/components/utils/Lightswitch.svelte'
	import TreeFolder from '$lib/components/navigation/TreeFolder.svelte'
	import TreeFile from '$lib/components/navigation/TreeFile.svelte'
	import Navigation from '$lib/components/navigation/Navigation.svelte'

	let { children, data } = $props()
</script>

<AppBar leadClasses="flex items-center" trailClasses="flex items-center">
	{#snippet lead()}
		<a href="/">
			<strong class="text-primary-950-50 type-scale-5">{data.settings.title}</strong>
		</a>
	{/snippet}
	{#snippet trail()}
		{#if data.settings.allow_logins}
			<UserCircle />
		{/if}
		<Lightswitch />
	{/snippet}
</AppBar>

<div class="p-8 lg:flex">
	<nav
		class="sticky top-4 mr-[60px] hidden max-h-[85vh] w-[240px] space-y-3 self-start overflow-auto pr-[20px] [@media(min-width:1200px)]:flex [@media(min-width:1200px)]:flex-col [@media(min-width:1200px)]:gap-1"
	>
		<Navigation topLevelContent={data.topLevelContent} />
	</nav>

	{@render children()}
	<div class="hidden w-[300px] [@media(min-width:1400px)]:block"></div>
</div>
