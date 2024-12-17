<script lang="ts">
	import {
		getModalStore,
		type AutocompleteOption,
		type ModalSettings,
		type TreeViewNode
	} from '@skeletonlabs/skeleton'
	import NavTree from './NavTree.svelte'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	import { goto } from '$app/navigation'
	import { Settings, User } from 'lucide-svelte'
	import type { LoggedUser } from '$lib/types'

	export let title: string
	export let notesTreeView: TreeViewNode[]
	export let notesTitles: AutocompleteOption<string>[]
	export let allowLogins: boolean
	export let user: LoggedUser | null

	const modalStore = getModalStore()
	const authModal: ModalSettings = {
		type: 'component',
		component: 'auth'
	}
	const accountModal: ModalSettings = {
		type: 'component',
		component: 'account',
		meta: { user }
	}

	function autocompleteRedirect(e: CustomEvent) {
		goto(`/${e.detail.slug}`)
	}
</script>

<NavTree {title} {notesTreeView} {notesTitles} on:autocomplete={autocompleteRedirect} />
<hr />
{#if allowLogins}
	{#if user}
		<div class="flex gap-2">
			<button
				class="variant-filled-surface btn mx-6 mt-4 w-full"
				on:click={() => modalStore.trigger(accountModal)}
			>
				<div class="flex gap-2">
					<Settings />
					Account
				</div>
			</button>
		</div>
	{:else}
		<button
			class="variant-filled-surface btn mx-6 mt-4"
			on:click={() => modalStore.trigger(authModal)}
		>
			<div class="flex gap-2">
				<User />
				Log In
			</div>
		</button>
	{/if}
{/if}
<ThemeSwitcher />
