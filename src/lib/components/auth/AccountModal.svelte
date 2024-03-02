<script lang="ts">
	import type { Database } from '$lib/database.types'
	import { getModalStore, ListBox, ListBoxItem, type ModalSettings } from '@skeletonlabs/skeleton'
	import type { Session, SupabaseClient } from '@supabase/supabase-js'
	import { Info, Lock } from 'lucide-svelte'
	import InfoChange from './forms/InfoChange.svelte'
	import PasswordChange from './forms/PasswordChange.svelte'
	import { onMount } from 'svelte'
	import ModalTab from '../ModalTab.svelte'
	import type { Note } from '$lib/shorthand.types'

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

	let currTab: string = 'private'
	let privateNotes: Note[] = []

	onMount(async () => {
		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.contains('allowed_users', [session.user.user_metadata.username])

		if (error) console.error("Could not fetch user's private pages:", error.message)
		if (data) {
			privateNotes = data
		} else {
			privateNotes = []
		}
	})
</script>

{#if $modalStore[0]}
	<div
		class="card flex h-[95vh] w-screen flex-col space-y-4 p-4 shadow-xl md:w-modal-wide md:h-[67vh]"
	>
		<h1 class="text-3xl"><strong>Account Settings</strong></h1>
		<hr />
		<div class="flex h-0 grow flex-col items-center gap-2 md:flex-row md:items-stretch">
			<ListBox class="w-32" active="variant-soft-primary">
				<ListBoxItem bind:group={currTab} name="info" value="info">
					<svelte:fragment slot="lead"><Info /></svelte:fragment>
					Info
				</ListBoxItem>
				<ListBoxItem bind:group={currTab} name="private" value="private">
					<svelte:fragment slot="lead"><Lock /></svelte:fragment>
					Private
				</ListBoxItem>
			</ListBox>
			<div class="border-surface-300-600-token hidden border-r md:block" />
			{#if currTab === 'info'}
				<ModalTab tabTitle="Information">
					<InfoChange {session} {supabase} />
					<hr />
					<PasswordChange {supabase} on:success={() => window.location.reload()} />
				</ModalTab>
			{:else if currTab === 'private'}
				<ModalTab tabTitle="Private">
					<div>
						<h3 class="text-xl">Secret Pages</h3>
						<div class="text-surface-600-300-token">
							These are all the private pages you have access to.
						</div>
						<ul class="ul card variant-soft-secondary p-2 my-2">
							{#if privateNotes.length === 0}
								<div>There's nothing here...</div>
							{:else}
								{#each privateNotes as note}
									<li class="list-inside list-disc pl-4">
										<a href={`/${note.slug}`} class="anchor">{note.path}</a>
									</li>
								{/each}
							{/if}
						</ul>
					</div>
				</ModalTab>
			{/if}
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
