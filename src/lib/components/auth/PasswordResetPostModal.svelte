<script lang="ts">
	import { passwordRules, updateUserPassword } from '$lib/auth'
	import type { Database } from '$lib/database.types'
	import { getModalStore } from '@skeletonlabs/skeleton'
	import { type SupabaseClient, AuthError } from '@supabase/supabase-js'

	const modalStore = getModalStore()
	const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase

	let newPass = ''
	let newPassConfirm = ''

	let rulesDelayTimer: NodeJS.Timeout
	let rulesConfirmDelayTimer: NodeJS.Timeout
	let responseVisibility = false
	let responseMessage = 'Placeholder'
	let responseColor = 'warning'
	let passwordRulesVisible = false
	let passwordConfirmRulesVisible = false

	$: isNewPassValid = passwordRules.test(newPass)
	$: isNewPassConfirmValid = newPassConfirm === newPass

	function checkCredentialValidity() {
		if (!isNewPassValid || !isNewPassConfirmValid) {
			responseMessage = 'Please make sure all fields are valid.'
			responseColor = 'error'
			responseVisibility = true
			return false
		}
		return true
	}

	async function updatePassword() {
		const areCredsValid = checkCredentialValidity()
		if (!areCredsValid) return

		const res = await updateUserPassword(supabase, newPass, newPassConfirm)
		if (res instanceof AuthError) {
			responseMessage = `Failed to update password. ${res.message}`
			responseColor = 'error'
			responseVisibility = true
		} else {
			responseMessage = 'Successfully updated password.'
			responseColor = 'success'
			responseVisibility = true
			window.location.reload()
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card w-modal space-y-4 p-4 shadow-xl">
		<h1 class="text-2xl"><strong>Password Reset</strong></h1>
		<hr />
		<form class="space-y-4 px-4 rounded-container-token">
            {#if responseVisibility}
                <p class="variant-filled-{responseColor} text-center card p-2">
                    {responseMessage}
                </p>
            {/if}
			<label class="label">
				<span>New Password</span>
				<input
					class="input"
                    class:input-error={!isNewPassValid && newPass.length > 0}
					type="password"
					bind:value={newPass}
					placeholder="Enter new password..."
                    on:input={() => {
                        clearTimeout(rulesDelayTimer)
                        rulesDelayTimer = setTimeout(
                            () => (passwordRulesVisible = isNewPassValid ? false : true),
                            500
                        )
                    }}
				/>
			</label>
            {#if !isNewPassValid && passwordRulesVisible}
                <div class="variant-ghost-warning p-2">
                    <p>
                        Password must be at least six characters long and can contain special characters.
                    </p>
                </div>
            {/if}
			<label class="label">
				<span>Confirm New Password</span>
				<input
					class="input"
                    class:input-error={!isNewPassConfirmValid && newPassConfirm.length > 0}
					type="password"
					bind:value={newPassConfirm}
					placeholder="Confirm new password..."
                    on:input={() => {
                        clearTimeout(rulesConfirmDelayTimer)
                        rulesConfirmDelayTimer = setTimeout(
                            () => (passwordConfirmRulesVisible = isNewPassConfirmValid ? false : true),
                            500
                        )
                    }}
				/>
			</label>
            {#if !isNewPassConfirmValid && newPassConfirm.length > 0 && passwordConfirmRulesVisible}
                <div class="variant-ghost-warning p-2">
                    <p>
                        Passwords don't match.
                    </p>
                </div>
            {/if}
		</form>
		<hr />
		<footer class="flex w-full justify-end gap-2">
			<button
                class="variant-filled-primary btn"
                on:click|preventDefault={updatePassword}
                disabled={!isNewPassValid || !isNewPassConfirmValid}
            >Update Password</button>
			<button class="variant-ghost-surface btn" on:click={() => modalStore.close()}>Cancel</button>
		</footer>
	</div>
{/if}
