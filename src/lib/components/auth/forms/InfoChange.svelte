<script lang="ts">
	import { usernameRules } from '$lib/auth'
	import type { LoggedUser } from '$lib/types'

	export let user: LoggedUser

	let username = user.username

	let debounceTimer: NodeJS.Timeout
	let rulesDelayTimer: NodeJS.Timeout
	let responseVisibility = false
	let responseMessage = 'Placeholder'
	let responseColor = 'warning'

	let loadingUsername = false
	let isUsernameAvailable = true
	let usernameRulesVisible = false

	$: isUsernameValid = usernameRules.test(username)
	$: isUsernameTaken = isUsernameValid && !isUsernameAvailable && !loadingUsername

	async function checkUsernameAvailability() {
		isUsernameAvailable = false
		clearTimeout(debounceTimer)
		loadingUsername = true

		debounceTimer = setTimeout(async () => {
			if (username === user.username) {
				isUsernameAvailable = true
				return
			}

			const res = await fetch(`/api/v1/auth/user?username=${username}`)
			isUsernameAvailable = await res.json()
			loadingUsername = false
		}, 500)
	}

	function checkCredentialValidity() {
		if (!isUsernameValid) {
			responseMessage = 'Please make sure all fields are valid.'
			responseColor = 'error'
			responseVisibility = true
			return false
		}
		if (isUsernameTaken) {
			responseMessage = 'Username already taken. Please use a different username.'
			responseColor = 'error'
			responseVisibility = true
			return false
		}

		return true
	}

	async function updateInfo() {
		const areCredsValid = checkCredentialValidity()
		if (!areCredsValid) return

		const res = await fetch('/api/v1/auth/update-username', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username })
		})
		if (!res.ok) {
			// console.error(res.name, res.message, res.cause, res.status)
			const data = await res.json()
			responseMessage = `Failed to update username. ${data.message}`
			responseColor = 'error'
			responseVisibility = true
		} else {
			responseMessage = 'Successfully updated username.'
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
			<div>Username</div>
			<input
				class="input w-3/4"
				class:input-error={!isUsernameValid || isUsernameTaken}
				type="text"
				name="username"
				placeholder="Username"
				bind:value={username}
				on:input={async () => {
					clearTimeout(rulesDelayTimer)
					rulesDelayTimer = setTimeout(
						() => (usernameRulesVisible = isUsernameValid ? false : true),
						500
					)
					await checkUsernameAvailability()
				}}
			/>
		</label>
		{#if !isUsernameValid && usernameRulesVisible}
			<div class="variant-ghost-warning w-3/4 p-2">
				<p>Username must be:</p>
				<ol class="list-inside list-decimal">
					<li>Alphanumeric with dots, dashes and underscores</li>
					<li>Between 3 and 20 characters long</li>
					<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
					<li>Can't start or end in a dot, dash or underscore</li>
				</ol>
			</div>
		{:else if isUsernameTaken}
			<div class="variant-ghost-warning w-3/4 p-2">
				<p>The username is already taken.</p>
			</div>
		{/if}
		<small class="text-surface-600-300-token block w-3/4 pl-1 text-sm"
			>Changing username will cause all of your permissions to be revoked!</small
		>
		<button class="variant-filled-surface btn" disabled={!isUsernameValid} on:click={updateInfo}>
			Save Changes
		</button>
	</form>
</section>
