<script lang="ts">
	import { emailRules, logIn, passwordRules, signUp, usernameRules } from '$lib/auth'
	import type { Database } from '$lib/database.types'
	import { Tab, TabGroup, getModalStore, type ModalSettings } from '@skeletonlabs/skeleton'
	import { AuthError, type SupabaseClient } from '@supabase/supabase-js'
	import { UserPlus, User } from 'lucide-svelte'

	const modalStore = getModalStore()
	const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase

	const pwresetModal: ModalSettings = {
		type: 'component',
		component: 'pwreset',
		meta: { supabase: supabase }
	}

	let signUpResultVisibility = false
	let signUpResultMessage = 'Placeholder'
	let signUpResultColor = 'warning'
	let tabSet: number = 0

	let loadingUsername = false
	let loadingEmail = false

	let isUsernameAvailable = false
	let isEmailAvailable = false

	let debounceTimer: NodeJS.Timeout
	let rulesDelayTimer: NodeJS.Timeout
	let usernameRulesVisible = false
	let emailRulesVisible = false
	let passwordRulesVisible = false

	// Auth Data
	let email = ''
	let username = ''
	let password = ''

	$: isUsernameEmpty = username.length === 0
	$: isUsernameValid = usernameRules.test(username)
	$: isUsernameTaken = isUsernameValid && !isUsernameAvailable && !loadingUsername

	$: isEmailEmpty = email.length === 0
	$: isEmailValid = emailRules.test(email)
	$: isEmailTaken = isEmailValid && !isEmailAvailable && !loadingEmail

	$: isPasswordEmpty = password.length === 0
	$: isPasswordValid = passwordRules.test(password)

	function clearData() {
		email = ''
		password = ''
		username = ''
		signUpResultVisibility = false
	}

	async function checkUsernameAvailability() {
		isUsernameAvailable = false
		clearTimeout(debounceTimer)
		loadingUsername = true

		debounceTimer = setTimeout(async () => {
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
			const res = await fetch(`/api/v1/auth/email?email=${email}`)
			isEmailAvailable = await res.json()
			loadingEmail = false
		}, 500)
	}

	function checkCredentialValiditySignUp() {
		if (isEmailEmpty || isPasswordEmpty || isUsernameEmpty) {
			signUpResultMessage = 'Please fill in all the fields.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}
		if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
			signUpResultMessage = 'Please make sure all fields are valid.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}
		if (isEmailTaken) {
			signUpResultMessage = 'Email already taken. Please use a different email.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}
		if (isUsernameTaken) {
			signUpResultMessage = 'Username already taken. Please use a different username.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}

		return true
	}

	function checkCredentialValidityLogIn() {
		if (isEmailEmpty || isPasswordEmpty) {
			signUpResultMessage = 'Please fill in all the fields.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}

		return true
	}

	async function signUpButton() {
		const areCredsValid = checkCredentialValiditySignUp()
		if (!areCredsValid) return

		const res = await signUp(supabase, email, password, username)
		if (res instanceof AuthError) {
			// console.error(res.name, res.message, res.cause, res.status)
			signUpResultMessage = `Failed to sign up. ${res.message}`
			signUpResultColor = 'error'
			signUpResultVisibility = true
		} else {
			signUpResultMessage = 'Successfully signed up!'
			signUpResultColor = 'success'
			signUpResultVisibility = true
			window.location.reload()
		}
	}

	async function logInButton() {
		const areCredsValid = checkCredentialValidityLogIn()
		if (!areCredsValid) return

		const res = await logIn(supabase, email, password)
		if (res instanceof AuthError) {
			// console.error(res.name, res.message, res.cause, res.status)
			signUpResultMessage = `Failed to log in. ${res.message}.`
			signUpResultColor = 'error'
			signUpResultVisibility = true
		} else {
			signUpResultMessage = 'Successfully logged in!'
			signUpResultColor = 'success'
			signUpResultVisibility = true
			window.location.reload()
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card w-modal space-y-4 p-4 shadow-xl">
		<TabGroup>
			<Tab bind:group={tabSet} name="login" value={0} on:change={clearData}>
				<svelte:fragment slot="lead"><User class="inline" /></svelte:fragment>
				<span>Log In</span>
			</Tab>
			<Tab bind:group={tabSet} name="signup" value={1} on:change={clearData}>
				<svelte:fragment slot="lead"><UserPlus class="inline" /></svelte:fragment>
				<span>Sign Up</span>
			</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<form class="space-y-4 px-4 rounded-container-token">
						{#if signUpResultVisibility}
							<p
								class="card text-center variant-filled-{signUpResultColor} p-2"
							>
								{signUpResultMessage}
							</p>
						{/if}
						<label class="label">
							<span>Email</span>
							<input class="input" type="email" bind:value={email} placeholder="Enter email..." />
						</label>
						<label class="label">
							<span>Password</span>
							<input
								class="input"
								type="password"
								bind:value={password}
								placeholder="Enter password..."
							/>
						</label>
						<button
							class="variant-ghost-surface btn btn-sm"
							on:click={() => {
								modalStore.clear()
								modalStore.trigger(pwresetModal)
							}}
						>
							<small class="small block">Forgot your password?</small>
						</button>
						<hr />
					</form>
				{:else if tabSet === 1}
					<form class="space-y-4 px-4 rounded-container-token">
						{#if signUpResultVisibility}
							<p
								class="card text-center variant-filled-{signUpResultColor} py-2"
							>
								{signUpResultMessage}
							</p>
						{/if}
						<label class="label">
							<span>Email</span>
							<input
								class="input"
								class:input-error={(!isEmailValid || isEmailTaken) && !isEmailEmpty}
								type="email"
								bind:value={email}
								on:input={async () => {
									clearTimeout(rulesDelayTimer)
									rulesDelayTimer = setTimeout(
										() => (emailRulesVisible = isEmailValid ? false : true),
										500
									)
									await checkEmailAvailability()
								}}
								placeholder="Enter email..."
							/>
						</label>
						{#if !isEmailValid && !isEmailEmpty && emailRulesVisible}
							<div class="variant-ghost-warning m-2 p-2">
								<p>Invalid email address.</p>
							</div>
						{:else if isEmailTaken}
							<div class="variant-ghost-warning m-2 p-2">
								<p>The email is already taken.</p>
							</div>
						{/if}
						<label class="label">
							<span>Username</span>
							<input
								class="input"
								class:input-error={(!isUsernameValid || isUsernameTaken) && !isUsernameEmpty}
								type="text"
								bind:value={username}
								on:input={async () => {
									clearTimeout(rulesDelayTimer)
									rulesDelayTimer = setTimeout(
										() => (usernameRulesVisible = isUsernameValid ? false : true),
										500
									)
									await checkUsernameAvailability()
								}}
								placeholder="Enter username..."
							/>
						</label>
						{#if !isUsernameValid && !isUsernameEmpty && usernameRulesVisible}
							<div class="variant-ghost-warning m-2 p-2">
								<p>Username must be:</p>
								<ol class="list-inside list-decimal">
									<li>Alphanumeric with dots and underscores</li>
									<li>At least three characters long</li>
									<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
									<li>Can't start or end in a dot or underscore</li>
								</ol>
							</div>
						{:else if isUsernameTaken}
							<div class="variant-ghost-warning m-2 p-2">
								<p>The username is already taken.</p>
							</div>
						{/if}
						<label class="label">
							<span>Password</span>
							<input
								class="input"
								class:input-error={!isPasswordValid && !isPasswordEmpty}
								type="password"
								bind:value={password}
								on:input={() => {
									clearTimeout(rulesDelayTimer)
									rulesDelayTimer = setTimeout(
										() => (passwordRulesVisible = isPasswordValid ? false : true),
										500
									)
								}}
								placeholder="Enter password..."
							/>
						</label>
						{#if !isPasswordValid && !isPasswordEmpty && passwordRulesVisible}
							<p>
								Password must be at least six characters long and can contain special characters.
							</p>
						{/if}
						<hr />
					</form>
				{/if}

				<footer class="flex w-full justify-end gap-2 pt-4">
					{#if tabSet === 0}
						<button
							class="variant-filled-primary btn"
							disabled={isEmailEmpty || isPasswordEmpty}
							on:click={logInButton}>Log In</button
						>
					{:else if tabSet === 1}
						<button
							class="variant-filled-primary btn"
							disabled={!isEmailValid ||
								isEmailTaken ||
								isEmailEmpty ||
								!isUsernameValid ||
								isUsernameTaken ||
								isUsernameEmpty ||
								!isPasswordValid ||
								isPasswordEmpty}
							on:click={signUpButton}>Sign Up</button
						>
					{/if}
					<button class="variant-ghost-surface btn" on:click={() => modalStore.close()}
						>Cancel</button
					>
				</footer>
			</svelte:fragment>
		</TabGroup>
	</div>
{/if}
