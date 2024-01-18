<script lang="ts">
	import '../app.postcss'
	import {
		AppBar,
		AppShell,
		Modal,
		type DrawerSettings,
		type ModalComponent
	} from '@skeletonlabs/skeleton'
	import { currentTheme } from '$lib/stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { afterNavigate, invalidate } from '$app/navigation'
	import 'highlight.js/styles/github-dark.css'

	export let data

	// Dynamic theme switcher
	$: if (browser) document.body.setAttribute('data-theme', $currentTheme)

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom'
	import { storePopup } from '@skeletonlabs/skeleton'
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	// Supabase authentication client updates
	let { supabase, session } = data
	$: ({ supabase, session } = data)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})

		return () => data.subscription.unsubscribe()
	})

	// Drawer initialization
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton'
	import type { AfterNavigate } from '@sveltejs/kit'
	initializeStores()
	const drawerStore = getDrawerStore()
	const drawerSettings: DrawerSettings = {
		id: 'navtree',
		width: 'w-3/4 md:w-1/3'
	}

	// Modal initialization
	import AuthModal from '$lib/components/AuthModal.svelte'
	import { Menu } from 'lucide-svelte'
	import NavigationSidebar from '$lib/components/NavigationSidebar.svelte'
	const modalRegistry: Record<string, ModalComponent> = {
		auth: { ref: AuthModal }
	}

	// Autoscroll to top of page on navigation
	afterNavigate((params: AfterNavigate) => {
		const isNewPage = params.from?.url.pathname !== params.to?.url.pathname
		const elemPage = document.querySelector('#page')
		if (isNewPage && elemPage !== null) elemPage.scrollTop = 0
	})
</script>

<Drawer>
	<div class="flex flex-col h-full">
		<NavigationSidebar
			notesTreeView={data.notesTreeView}
			notesTitles={data.noteTitles}
			title={data.settings.title}
			{supabase}
			{session}
		/>
	</div>
</Drawer>

<Modal components={modalRegistry} />

<AppShell
	slotSidebarLeft="hidden lg:flex lg:flex-col lg:w-[16em] h-screen variant-glass-surface border-r-[1px] border-surface-300-600-token"
>
	<svelte:fragment slot="header">
		<AppBar class="lg:hidden border-b-[1px] border-surface-300-600-token">
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button class="btn btn-sm mr-4" on:click={() => drawerStore.open(drawerSettings)}>
						<Menu />
					</button>
					<a href="/"><strong class="text-xl uppercase">{data.settings.title}</strong></a>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<NavigationSidebar
			notesTreeView={data.notesTreeView}
			notesTitles={data.noteTitles}
			title={data.settings.title}
			{supabase}
			{session}
		/>
	</svelte:fragment>

	<slot />
</AppShell>
