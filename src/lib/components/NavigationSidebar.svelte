<script lang="ts">
	import { getModalStore, type AutocompleteOption, type ModalSettings, type TreeViewNode } from "@skeletonlabs/skeleton"
	import NavTree from "./NavTree.svelte"
	import ThemeSwitcher from "./ThemeSwitcher.svelte"
	import type { Session, SupabaseClient } from "@supabase/supabase-js"
	import type { Database } from "$lib/database.types"
	import { goto } from "$app/navigation"

    export let title: string
    export let notesTreeView: TreeViewNode[]
    export let notesTitles: AutocompleteOption<string>[]
    export let supabase: SupabaseClient<Database>
    export let session: Session | null

	const modalStore = getModalStore()
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

    function autocompleteRedirect(e: CustomEvent) {
		goto(`/${e.detail.slug}`)
	}
</script>

<NavTree
    {title}
    {notesTreeView}
    {notesTitles}
    on:autocomplete={autocompleteRedirect}
/>
<hr />
{#if session}
    <button
        class="btn variant-filled-surface mt-4 mx-6"
        on:click={() => modalStore.trigger(logOutModal)}>Log Out</button
    >		
{:else}
    <button
        class="btn variant-filled-surface mt-4 mx-6"
        on:click={() => modalStore.trigger(componentModal)}>Log In</button
    >
{/if}
<ThemeSwitcher />