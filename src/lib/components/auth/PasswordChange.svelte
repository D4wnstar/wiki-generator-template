<script lang="ts">
	import { preventDefault } from 'svelte/legacy'

	import { passwordRules } from '$lib/auth'

	let newPass = $state('')
	let newPassConfirm = $state('')

	//@ts-ignore
	let rulesDelayTimer: NodeJS.Timeout = $state()
	//@ts-ignore
	let rulesConfirmDelayTimer: NodeJS.Timeout = $state()
	let responseVisibility = $state(false)
	let responseMessage = $state('Placeholder')
	let responseColor = $state('warning')
	let passwordRulesVisible = $state(false)
	let passwordConfirmRulesVisible = $state(false)

	let isNewPassValid = $derived(passwordRules.test(newPass))
	let isNewPassConfirmValid = $derived(newPassConfirm === newPass)

	const warningMsgClasses = 'm-2 p-2 preset-outlined-warning-500'

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
			<p class="preset-filled-{responseColor}-200-800 p-2 text-center">
				{responseMessage}
			</p>
		{/if}
		<label class="label">
			<div>New Password</div>
			<input
				class="input"
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
			<div class={warningMsgClasses}>
				<p>Password must be at least six characters long and can contain special characters.</p>
			</div>
		{/if}
		<label class="label">
			<div>Confirm New Password</div>
			<input
				class="input"
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
			<div class={warningMsgClasses}>
				<p>Passwords don't match.</p>
			</div>
		{/if}
		<button
			class="btn preset-filled-surface-200-800"
			disabled={!isNewPassValid || !isNewPassConfirmValid}
			onclick={updatePassword}>Save Changes</button
		>
	</form>
</section>
