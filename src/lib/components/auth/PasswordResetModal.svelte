<script lang="ts">
	import { emailRules, sendPasswordResetEmail } from '$lib/auth'
	import type { Database } from '$lib/database.types'
	import { getModalStore } from '@skeletonlabs/skeleton'
	import { AuthError, type SupabaseClient } from '@supabase/supabase-js'

	const modalStore = getModalStore()
	const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase

	let email = ''

	let responseVisibility = false
	let responseMessage = 'Placeholder'
	let responseColor = 'warning'

	$: isEmailValid = emailRules.test(email)

	function checkCredentialValidity() {
		if (!isEmailValid) {
			responseMessage = 'Please write a valid.'
			responseColor = 'error'
			responseVisibility = true
			return false
		}
		return true
	}

	async function sendReset() {
		const areCredsValid = checkCredentialValidity()
		if (!areCredsValid) return

		const res = await sendPasswordResetEmail(supabase, email)
		if (res instanceof AuthError) {
			responseMessage = `Failed to send the reset email. ${res.message}`
			responseColor = 'error'
			responseVisibility = true
		} else {
			responseMessage = 'An email has been sent to your email address. Please follow the instructions in that email.'
			responseColor = 'success'
			responseVisibility = true
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card w-modal space-y-4 p-4 shadow-xl">
		<h1 class="text-3xl"><strong>Password Reset</strong></h1>
		<hr />
		<form class="space-y-4 px-4 rounded-container-token">
			{#if responseVisibility}
                <p class="variant-filled-{responseColor} text-center card p-2">
                    {responseMessage}
                </p>
            {/if}
			<label class="label">
				<span>Email</span>
				<input class="input" type="email" bind:value={email} placeholder="Enter email..." />
			</label>
		</form>
		<hr />
		<footer class="flex w-full justify-end gap-2">
			<button class="variant-filled-primary btn" on:click={sendReset}>Reset</button>
			<button class="variant-ghost-surface btn" on:click={() => modalStore.close()}>Cancel</button>
		</footer>
	</div>
{/if}
