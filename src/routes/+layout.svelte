<script lang="ts">
	import '../app.css'
	import '../prism-night-owl.css'
	// import '../prism-line-numbers.css'
	import '../rehype-callouts.css'
	import '../katex.css'
	import { AppBar, Modal } from '@skeletonlabs/skeleton-svelte'
	import { Menu, UserCircle, X } from 'lucide-svelte'
	import Lightswitch from '$lib/components/utils/Lightswitch.svelte'
	import Navigation from '$lib/components/navigation/Navigation.svelte'
	import { type NoteRow } from '$lib/schema'
	import { type Folder, type File, getNotesTree, sortFolderRecursively } from '$lib/notes'
	import { afterNavigate } from '$app/navigation'

	let { children, data } = $props()

	let drawerState = $state(false)
	let topLevelContent: (File | Folder)[] = $state([])

	const drawerOpen = () => (drawerState = true)
	const drawerClose = () => (drawerState = false)

	afterNavigate(async () => {
		// Navigation content is grabbed on the fly because it should not be prerendered
		const res = await fetch('/api/v1/auth/fetch-pages')
		if (!res.ok) return
		const pages = (await res.json()) as NoteRow[]
		const topFolder = getNotesTree(pages)
		sortFolderRecursively(topFolder)
		topLevelContent = topFolder.children
	})
</script>

<Modal
	bind:open={drawerState}
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	contentBase="h-screen shadow-xl w-screen bg-surface-100-900 overflow-auto"
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
>
	{#snippet content()}
		<div class="flex flex-col space-y-4 p-4">
			<button class="btn-icon-lg self-start" onclick={drawerClose}>
				<X />
			</button>
			<Navigation {topLevelContent} />
		</div>
	{/snippet}
</Modal>

<AppBar
	leadClasses="flex items-center"
	trailClasses="flex items-center"
	centerClasses="flex justify-center w-full"
>
	{#snippet lead()}
		<button class="btn-icon [@media(min-width:1200px)]:hidden" onclick={drawerOpen}>
			<Menu />
		</button>
		<a href="/">
			<strong class="text-primary-950-50 type-scale-5">{data.settings.title}</strong>
		</a>
	{/snippet}
	{#snippet trail()}
		{#if data.settings.allow_logins}
			<a href={data.user ? '/account' : '/login'}>
				<UserCircle />
			</a>
		{/if}
		<Lightswitch />
	{/snippet}
</AppBar>

<div class="p-8 lg:flex">
	<nav
		class="sticky top-4 hidden max-h-[85vh] w-[360px] space-y-3 self-start [@media(min-width:1200px)]:flex [@media(min-width:1200px)]:flex-col [@media(min-width:1200px)]:gap-1"
	>
		<Navigation {topLevelContent} />
	</nav>

	{@render children()}
</div>
