<script lang="ts">
	import { usernameRules, emailRules, updateUserInfo } from "$lib/auth"
	import type { Database } from "$lib/database.types"
	import { AuthError, type Session, type SupabaseClient } from "@supabase/supabase-js"

	export let supabase: SupabaseClient<Database>
    export let session: Session

	let username = session.user.user_metadata.username
	let email = session.user.email ?? ""

	let debounceTimer: NodeJS.Timeout
	let rulesDelayTimer: NodeJS.Timeout
	let responseVisibility = false
	let responseMessage = 'Placeholder'
	let responseColor = 'warning'

	let loadingUsername = false
	let loadingEmail = false

	let isUsernameAvailable = true
	let isEmailAvailable = true

	let usernameRulesVisible = false
	let emailRulesVisible = false

	$: isUsernameValid = usernameRules.test(username)
	$: isUsernameTaken = isUsernameValid && !isUsernameAvailable && !loadingUsername

	$: isEmailValid = emailRules.test(email)
	$: isEmailTaken = isEmailValid && !isEmailAvailable && !loadingEmail

	async function checkUsernameAvailability() {
		isUsernameAvailable = false
		clearTimeout(debounceTimer)
		loadingUsername = true

		debounceTimer = setTimeout(async () => {
			if (username === session.user.user_metadata.username) {
				isUsernameAvailable = true
				return
			}

			const res = await fetch(`/api/v1/auth/user?username=${username}`)
			isUsernameAvailable = await res.json()
			loadingUsername = false
		}, 500)
	}

	async function checkEmailAvailability() {
		isEmailAvailable = false
		clearTimeout(debounceTimer)
		loadingEmail = true

		debounceTimer = setTimeout(async () => {
			if (email === session.user.email) {
				isEmailAvailable = true
				return
			}

			const res = await fetch(`/api/v1/auth/email?email=${email}`)
			isEmailAvailable = await res.json()
			loadingEmail = false
		}, 500)
	}

	function checkCredentialValidity() {
		if (!isEmailValid || !isUsernameValid) {
			responseMessage = 'Please make sure all fields are valid.'
			responseColor = 'error'
			responseVisibility = true
			return false
		}
		if (isEmailTaken) {
			responseMessage = 'Email already taken. Please use a different email.'
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

		const res = await updateUserInfo(supabase, email, username)
		if (res instanceof AuthError) {
			// console.error(res.name, res.message, res.cause, res.status)
			responseMessage = `Failed to update credentials. ${res.message}`
			responseColor = 'error'
			responseVisibility = true
		} else {
			responseMessage = 'Successfully updated credentials.'
			responseColor = 'success'
			responseVisibility = true
			window.location.reload()
		}
	}
</script>

<section class="flex flex-col space-y-4 w-full md:px-4">
	<h2 class="text-xl hidden md:block"><strong>Information</strong></h2>
	<hr />
	<form class="space-y-4">
		{#if responseVisibility}
			<p class="variant-filled-{responseColor} text-center card py-2">
				{responseMessage}
			</p>
		{/if}
		<label class="label">
			<div>Email</div>
			<input
				class="input w-3/4"
				class:input-error={!isEmailValid || isEmailTaken}
				type="email"
				name="email"
				placeholder="Email"
				bind:value={email}
				on:input={async () => {
					clearTimeout(rulesDelayTimer)
					rulesDelayTimer = setTimeout(() => (emailRulesVisible = isEmailValid ? false : true), 500)
					await checkEmailAvailability()
				}}
			/>
		</label>
		{#if !isEmailValid && emailRulesVisible}
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>Invalid email address.</p>
			</div>
		{:else if isEmailTaken}
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>The email is already taken.</p>
			</div>
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
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>Username must be:</p>
				<ol class="list-inside list-decimal">
					<li>Alphanumeric with dots and underscores</li>
					<li>At least three characters long</li>
					<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
					<li>Can't start or end in a dot or underscore</li>
				</ol>
			</div>
		{:else if isUsernameTaken}
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>The username is already taken.</p>
			</div>
		{/if}
		<small class="block text-sm text-surface-600-300-token pl-1 w-3/4"
			>Changing username will cause all of your permissions to be revoked!</small
		>
		<button
			class="btn variant-filled-surface"
			on:click={updateInfo}
		>
			Save Changes
		</button>
	</form>
</section>
