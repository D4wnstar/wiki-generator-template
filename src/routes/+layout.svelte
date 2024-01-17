<script lang="ts">
	import '../app.postcss'
	import {
		AppBar,
		AppShell,
		Modal,
		type DrawerSettings,
		getModalStore,
		type ModalSettings,
		type ModalComponent
	} from '@skeletonlabs/skeleton'
	import { currentTheme } from '$lib/stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { afterNavigate, goto, invalidate } from '$app/navigation'
	import 'highlight.js/styles/github-dark.css'

	export let data

	// Dynamic theme switcher
	$: if (browser) document.body.setAttribute('data-theme', $currentTheme)

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom'
	import { storePopup } from '@skeletonlabs/skeleton'
	import NavTree from '$lib/components/NavTree.svelte'
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte'
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	// Supabase authentication client updates
	let { supabase, session } = data
	$: ({ supabase, session } = data)

	let loggedIn = false

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}

			if (event === 'SIGNED_IN') {
				loggedIn = true
			} else if (event === 'SIGNED_OUT') {
				loggedIn = false
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
	const modalStore = getModalStore()
	const modalRegistry: Record<string, ModalComponent> = {
		auth: { ref: AuthModal }
	}
	const componentModal: ModalSettings = {
		type: 'component',
		component: 'auth',
		meta: { supabase: supabase }
	}
	const logOutModal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Log Out',
		body: 'Are you sure you want to log out?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: async (r: boolean) => {
			if (r) {
				const { error } = await supabase.auth.signOut()
				console.log(error)
			}
		}
	}

	// Autoscroll to top of page on navigation
	afterNavigate((params: AfterNavigate) => {
		const isNewPage = params.from?.url.pathname !== params.to?.url.pathname
		const elemPage = document.querySelector('#page')
		if (isNewPage && elemPage !== null) elemPage.scrollTop = 0
	})

	function autocompleteRedirect(e: CustomEvent) {
		goto(`/${e.detail.slug}`)
	}
</script>

<Drawer>
	<div class="flex flex-col h-full">
		<NavTree
			title={data.settings.title}
			notesTreeView={data.notesTreeView}
			noteTitles={data.noteTitles}
			on:autocomplete={autocompleteRedirect}
		/>
		<hr />
		<ThemeSwitcher />
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
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="10" />
								<rect y="30" width="100" height="10" />
								<rect y="60" width="100" height="10" />
							</svg>
						</span>
					</button>
					<a href="/"><strong class="text-xl uppercase">{data.settings.title}</strong></a>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<NavTree
			title={data.settings.title}
			notesTreeView={data.notesTreeView}
			noteTitles={data.noteTitles}
			on:autocomplete={autocompleteRedirect}
		/>
		<hr />
		{#if !loggedIn}
			<button
				class="btn variant-filled-surface mt-4 mx-6"
				on:click={() => modalStore.trigger(componentModal)}>Log In</button
			>
		{:else}
			<button
				class="btn variant-filled-surface mt-4 mx-6"
				on:click={() => modalStore.trigger(logOutModal)}>Log Out</button
			>
		{/if}
		<ThemeSwitcher />
	</svelte:fragment>

	<slot />
</AppShell>
