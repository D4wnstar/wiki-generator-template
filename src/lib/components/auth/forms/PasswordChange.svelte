<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { passwordRules } from '$lib/auth'

	let newPass = $state('')
	let newPassConfirm = $state('')

	let rulesDelayTimer: NodeJS.Timeout = $state()
	let rulesConfirmDelayTimer: NodeJS.Timeout = $state()
	let responseVisibility = $state(false)
	let responseMessage = $state('Placeholder')
	let responseColor = $state('warning')
	let passwordRulesVisible = $state(false)
	let passwordConfirmRulesVisible = $state(false)

	let isNewPassValid = $derived(passwordRules.test(newPass))
	let isNewPassConfirmValid = $derived(newPassConfirm === newPass)

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

		const res = await fetch('/api/v1/auth/update-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ newPass, newPassConfirm })
		})
		if (!res.ok) {
			const data = await res.json()
			responseMessage = `Failed to update password. ${data.message}`
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

<section class="flex w-full flex-col space-y-4">
	<form class="space-y-4">
		{#if responseVisibility}
			<p class="variant-filled-{responseColor} card p-2 text-center">
				{responseMessage}
			</p>
		{/if}
		<label class="label">
			<div>New Password</div>
			<input
				class="input w-3/4"
				class:input-error={!isNewPassValid && newPass.length > 0}
				type="password"
				name="new-password"
				placeholder="Enter new password"
				bind:value={newPass}
				oninput={() => {
					clearTimeout(rulesDelayTimer)
					rulesDelayTimer = setTimeout(
						() => (passwordRulesVisible = isNewPassValid ? false : true),
						500
					)
				}}
			/>
		</label>
		{#if !isNewPassValid && passwordRulesVisible}
			<div class="variant-ghost-warning w-3/4 p-2">
				<p>Password must be at least six characters long and can contain special characters.</p>
			</div>
		{/if}
		<label class="label">
			<div>Confirm New Password</div>
			<input
				class="input w-3/4"
				class:input-error={!isNewPassConfirmValid && newPassConfirm.length > 0}
				type="password"
				name="new-password-confirm"
				placeholder="Confirm new password"
				bind:value={newPassConfirm}
				oninput={() => {
					clearTimeout(rulesConfirmDelayTimer)
					rulesConfirmDelayTimer = setTimeout(
						() => (passwordConfirmRulesVisible = isNewPassConfirmValid ? false : true),
						500
					)
				}}
			/>
		</label>
		{#if !isNewPassConfirmValid && newPassConfirm.length > 0 && passwordConfirmRulesVisible}
			<div class="variant-ghost-warning w-3/4 p-2">
				<p>Passwords don't match.</p>
			</div>
		{/if}
		<button
			class="variant-filled-surface btn"
			disabled={!isNewPassValid || !isNewPassConfirmValid}
			onclick={preventDefault(updatePassword)}>Save Changes</button
		>
	</form>
</section>
