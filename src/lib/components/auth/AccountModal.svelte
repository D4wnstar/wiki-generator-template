<script lang="ts">
	import { getModalStore, ListBox, ListBoxItem, type ModalSettings } from '@skeletonlabs/skeleton'
	import { EyeOff, Info } from 'lucide-svelte'
	import InfoChange from './forms/InfoChange.svelte'
	import PasswordChange from './forms/PasswordChange.svelte'
	import { onMount } from 'svelte'
	import ModalTab from '../utils/ModalTab.svelte'
	import type { LoggedUser } from '$lib/types'
	import { error } from '@sveltejs/kit'
	import type { NoteContentsRow, NoteRow } from '$lib/schema'

	const modalStore = getModalStore()
	const user: LoggedUser = $modalStore[0].meta.user
	if (!user) {
		error(401, 'Not logged in')
	}

	const logOutModal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Log Out',
		body: 'Are you sure you want to log out?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: async (res: boolean) => {
			if (res) {
				try {
					await fetch('/api/v1/auth/logout')
				} catch (error) {
					console.error(error)
				}
				window.location.reload()
			}
		}
	}

	let currTab: string = $state('info')
	let privateNotes: NoteRow[] = $state([])
	let privateChunks: { note_contents: NoteContentsRow | null; notes: NoteRow }[] = $state([])

	onMount(async () => {
		const res = await fetch('/api/v1/auth/fetch-secrets')
		const data = await res.json()
		privateNotes = res.ok ? data.pages : []
		privateChunks = res.ok ? data.chunks : []
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
					{#snippet lead()}
										<Info />
									{/snippet}
					Info
				</ListBoxItem>
				<ListBoxItem bind:group={currTab} name="secrets" value="secrets">
					{#snippet lead()}
										<EyeOff />
									{/snippet}
					Secrets
				</ListBoxItem>
			</ListBox>
			<div class="border-surface-300-600-token hidden border-r md:block"></div>
			{#if currTab === 'info'}
				<ModalTab tabTitle="Information">
					<InfoChange {user} />
					<hr />
					<PasswordChange />
				</ModalTab>
			{:else if currTab === 'secrets'}
				<ModalTab tabTitle="Secrets">
					<div>
						<!-- <h3 class="text-xl">Secret Pages</h3> -->
						<div class="text-surface-600-300-token">
							These are all the secret pages and sections you have access to.
						</div>
						<ul class="ul card variant-soft-secondary my-2 p-2">
							{#if privateNotes.length === 0 && privateChunks.length === 0}
								<div>There's nothing here...</div>
							{/if}
							{#if privateNotes.length > 0}
								<h3 class="h3 mb-2">Secret pages</h3>
								{#each privateNotes as note}
									<li class="list-inside list-disc pl-4">
										<a href={`/${note.slug}`} class="hover:underline"
											>{note.alt_title ?? note.title}</a
										>
									</li>
								{/each}
							{/if}
							{#if privateChunks.length > 0}
								<h3 class="h3 mb-2 mt-2">Pages with secret sections</h3>
								{#each privateChunks as chunk}
									<li class="list-inside list-disc pl-4">
										<a href={`/${chunk.notes.slug}`} class="hover:underline"
											>{chunk.notes.alt_title ?? chunk.notes.title}</a
										>
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
				onclick={() => {
					modalStore.close()
				}}
			>
				Close
			</button>
			<button
				class="variant-filled-error btn"
				onclick={() => {
					modalStore.close()
					modalStore.trigger(logOutModal)
				}}
			>
				Log Out
			</button>
		</footer>
	</div>
{/if}
