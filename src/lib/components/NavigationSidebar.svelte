<script lang="ts">
	import {
		getModalStore,
		type AutocompleteOption,
		type ModalSettings,
		type TreeViewNode
	} from '@skeletonlabs/skeleton'
	import NavTree from './NavTree.svelte'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	import type { Session, SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '$lib/database.types'
	import { goto } from '$app/navigation'
	import { Settings, User } from 'lucide-svelte'

	export let title: string
	export let notesTreeView: TreeViewNode[]
	export let notesTitles: AutocompleteOption<string>[]
	export let supabase: SupabaseClient<Database>
	export let session: Session | null

	const modalStore = getModalStore()
	const authModal: ModalSettings = {
		type: 'component',
		component: 'auth',
		meta: { supabase: supabase }
	}
	const accountModal: ModalSettings = {
		type: 'component',
		component: 'account',
		meta: { supabase: supabase, session: session }
	}

	function autocompleteRedirect(e: CustomEvent) {
		goto(`/${e.detail.slug}`)
	}
</script>

<NavTree {title} {notesTreeView} {notesTitles} on:autocomplete={autocompleteRedirect} />
<hr />
{#if session}
	<div class="flex gap-2">
		<button
			class="btn variant-filled-surface mt-4 mx-6 w-full"
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
		class="btn variant-filled-surface mt-4 mx-6 w-full"
		on:click={() => modalStore.trigger(authModal)}
	>
		<div class="flex gap-2">
			<User />
			Log In
		</div>
	</button>
{/if}
<ThemeSwitcher />
