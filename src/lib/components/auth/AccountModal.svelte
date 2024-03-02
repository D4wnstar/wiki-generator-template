<script lang="ts">
	import type { Database } from '$lib/database.types'
	import { getModalStore, ListBox, ListBoxItem, type ModalSettings } from '@skeletonlabs/skeleton'
	import type { Session, SupabaseClient } from '@supabase/supabase-js'
	import { Info } from 'lucide-svelte'
	import InfoChange from './forms/InfoChange.svelte'
	import PasswordChange from './forms/PasswordChange.svelte'

	const modalStore = getModalStore()
	const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase
	const session: Session = $modalStore[0].meta.session

	const logOutModal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Log Out',
		body: 'Are you sure you want to log out?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: async (res: boolean) => {
			if (res) {
				const { error } = await supabase.auth.signOut()
				if (error) console.error(error)
				window.location.reload()
			}
		}
	}

	let currTab: string = 'info'
</script>

{#if $modalStore[0]}
	<div
		class="card flex h-[95vh] w-screen flex-col space-y-4 p-4 shadow-xl md:w-modal-wide md:h-[67vh]"
	>
		<h1 class="text-2xl"><strong>Account Settings</strong></h1>
		<hr />
		<div class="flex h-0 grow flex-col items-center gap-2 md:flex-row md:items-stretch">
			<ListBox class="w-32" active="variant-soft-primary">
				<ListBoxItem bind:group={currTab} name="tab" value="info">
					<svelte:fragment slot="lead"><Info /></svelte:fragment>
					Info
				</ListBoxItem>
			</ListBox>
			<div class="border-surface-300-600-token hidden border-r md:block" />
			<div class="flex w-full flex-col space-y-4 overflow-auto">
				<InfoChange {session} {supabase} />
				<hr />
				<PasswordChange {supabase} on:success={() => window.location.reload()} />
			</div>
		</div>
		<hr />
		<footer class="flex w-full justify-end gap-2">
			<button
				class="variant-ghost-surface btn"
				on:click={() => {
					modalStore.close()
				}}
			>
				Close
			</button>
			<button
				class="variant-filled-error btn"
				on:click={() => {
					modalStore.close()
					modalStore.trigger(logOutModal)
				}}
			>
				Log Out
			</button>
		</footer>
	</div>
{/if}
