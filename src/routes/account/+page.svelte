<script lang="ts">
	import type { PageData } from './$types'
	import { Segment } from '@skeletonlabs/skeleton-svelte'
	import InfoChange from '$lib/components/auth/InfoChange.svelte'
	import PasswordChange from '$lib/components/auth/PasswordChange.svelte'
	import AccountSecrets from '$lib/components/auth/AccountSecrets.svelte'
	import { enhance } from '$app/forms'

	const { data }: { data: PageData } = $props()
	let currTab: string = $state('info')
</script>

<svelte:head>
	<title>Account — {data.settings.title}</title>
</svelte:head>

<div class="mx-auto flex flex-col">
	<h1 class="text-center type-scale-7 lg:text-left"><strong>Account</strong></h1>
	<hr class="hr my-4" />
	<div class="flex flex-col gap-4 lg:min-w-[800px] lg:flex-row lg:gap-0">
		<nav class="self-center pr-4 lg:self-start">
			<Segment
				name="tab"
				bind:value={currTab}
				orientation="vertical"
				width="w-[200px] lg:w-auto"
				indicatorBg="bg-primary-200-800"
				indicatorText="text-surface-950-50"
			>
				<Segment.Item value="info">Info</Segment.Item>
				<Segment.Item value="secrets">Secrets</Segment.Item>
			</Segment>
		</nav>
		<div
			class="space-y-4 border-t-[1px] px-4 pt-4 border-surface-200-800 lg:border-l-[1px] lg:border-t-0 lg:pt-0"
		>
			{#if currTab === 'info'}
				<InfoChange user={data.user} />
				<hr class="hr" />
				<PasswordChange />
			{:else if currTab === 'secrets'}
				<AccountSecrets secretNotes={data.secretPages} secretChunks={data.secretChunks} />
			{/if}
		</div>
	</div>
	<hr class="hr my-4" />
	<footer class="flex w-full justify-end gap-2">
		<form method="POST" action="?/logout" use:enhance>
			<button class="btn preset-filled-error-200-800"> Log Out </button>
		</form>
	</footer>
</div>
