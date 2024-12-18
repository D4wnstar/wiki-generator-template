<script lang="ts">
	import type { PageData } from './$types'
	import { passwordRules, usernameRules } from '$lib/auth'
	import { Tabs } from '@skeletonlabs/skeleton-svelte'
	import { UserPlus, User } from 'lucide-svelte'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	let { data }: { data: PageData } = $props()
	if (browser && data.user) {
		goto('/')
	}

	let resultVisibile = $state(false)
	let resultMessage = $state('')
	let resultColor = $state('warning')
	let tabSet: string = $state('login')

	let loadingUsername = $state(false)

	let isUsernameAvailable = $state(false)

	let debounceTimer: NodeJS.Timeout
	let rulesDelayTimer: NodeJS.Timeout = $state()
	let usernameRulesVisible = $state(false)
	let passwordRulesVisible = $state(false)

	// Auth Data
	let username = $state('')
	let password = $state('')

	let logInButtonRef = $state()

	let isUsernameEmpty = $derived(username.length === 0)
	let isUsernameValid = $derived(usernameRules.test(username))
	let isUsernameTaken = $derived(isUsernameValid && !isUsernameAvailable && !loadingUsername)

	let isPasswordEmpty = $derived(password.length === 0)
	let isPasswordValid = $derived(passwordRules.test(password))

	const warningMsgClasses = 'm-2 p-2 preset-outlined-warning-500'

	function clearData() {
		password = ''
		username = ''
		resultVisibile = false
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

	function checkCredentialValiditySignUp() {
		if (isPasswordEmpty || isUsernameEmpty) {
			resultMessage = 'Please fill in all the fields.'
			resultColor = 'error'
			resultVisibile = true
			return false
		}
		if (!isPasswordValid || !isUsernameValid) {
			resultMessage = 'Please make sure all fields are valid.'
			resultColor = 'error'
			resultVisibile = true
			return false
		}
		if (isUsernameTaken) {
			resultMessage = 'Username already taken. Please use a different username.'
			resultColor = 'error'
			resultVisibile = true
			return false
		}

		return true
	}

	function checkCredentialValidityLogIn() {
		if (isUsernameEmpty || isPasswordEmpty) {
			resultMessage = 'Please fill in all the fields.'
			resultColor = 'error'
			resultVisibile = true
			return false
		}

		return true
	}

	async function signUpButton() {
		const areCredsValid = checkCredentialValiditySignUp()
		if (!areCredsValid) return

		const res = await fetch('/api/v1/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
		if (!res.ok) {
			// console.error(res.name, res.message, res.cause, res.status)
			const data = await res.json()
			resultMessage = `Failed to sign up. ${data.message}`
			resultColor = 'error'
			resultVisibile = true
		} else {
			resultMessage = 'Successfully signed up!'
			resultColor = 'success'
			resultVisibile = true
			window.location.pathname = '/'
		}

		// Login immediately after registering
		await fetch('/api/v1/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
		window.location.reload()
	}

	async function logInButton() {
		const areCredsValid = checkCredentialValidityLogIn()
		if (!areCredsValid) return

		const res = await fetch('/api/v1/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
		if (!res.ok) {
			// console.error(res.name, res.message, res.cause, res.status)
			const data = await res.json()
			resultMessage = `Failed to log in. ${data.message}.`
			resultColor = 'error'
			resultVisibile = true
		} else {
			resultMessage = 'Successfully logged in!'
			resultColor = 'success'
			resultVisibile = true
			window.location.href = '/'
		}
	}
</script>

<svelte:head>
	<title>Login to {data.settings.title}</title>
</svelte:head>

<div class="mx-auto flex flex-col lg:w-[500px]">
	<h1 class="mb-4 type-scale-7">Sign in</h1>
	<Tabs bind:value={tabSet} onFocusChange={clearData}>
		{#snippet list()}
			<Tabs.Control value="login">
				{#snippet lead()}
					<User class="inline" />
				{/snippet}
				Login
			</Tabs.Control>

			<Tabs.Control value="signup">
				{#snippet lead()}
					<UserPlus class="inline" />
				{/snippet}
				Signup
			</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<!-- Login form -->
			<Tabs.Panel value="login"
				><form class="space-y-4 px-4">
					{#if resultVisibile}
						<p class="card p-2 text-center preset-filled-{resultColor}-500">
							{resultMessage}
						</p>
					{/if}
					<label class="label">
						<span>Username</span>
						<input class="input" bind:value={username} placeholder="Enter username..." />
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
				</form></Tabs.Panel
			>

			<!-- Signup form -->
			<Tabs.Panel value="signup"
				><form class="space-y-4 px-4">
					{#if resultVisibile}
						<p class="card p-2 text-center preset-filled-{resultColor}-500">
							{resultMessage}
						</p>
					{/if}
					<label class="label">
						<span>Username</span>
						<input
							class="input"
							class:input-error={(!isUsernameValid || isUsernameTaken) && !isUsernameEmpty}
							type="text"
							bind:value={username}
							oninput={async () => {
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
						<div class={warningMsgClasses}>
							<p>Username must be:</p>
							<ol class="list-inside list-decimal">
								<li>Alphanumeric with dots, dashes and underscores</li>
								<li>Between 3 and 20 characters long</li>
								<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
								<li>Can't start or end in a dot, dash or underscore</li>
							</ol>
						</div>
					{:else if isUsernameTaken}
						<div class={warningMsgClasses}>
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
							oninput={() => {
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
						<div class={warningMsgClasses}>
							<p>
								Password must be at least six characters long and can contain special characters.
							</p>
						</div>
					{/if}
					<small class="block pl-1">Passwords cannot be reset!</small>
				</form></Tabs.Panel
			>
		{/snippet}
	</Tabs>
	<hr class="hr mt-4" />

	<footer class="flex w-full justify-end gap-2 pt-4">
		{#if tabSet === 'login'}
			<button
				class="btn preset-tonal-primary"
				disabled={isUsernameEmpty || isPasswordEmpty}
				onclick={logInButton}
				bind:this={logInButtonRef}
			>
				Log In
			</button>
		{:else if tabSet === 'signup'}
			<button
				class="btn preset-tonal-primary"
				disabled={!isUsernameValid ||
					isUsernameTaken ||
					isUsernameEmpty ||
					!isPasswordValid ||
					isPasswordEmpty}
				onclick={signUpButton}>Sign Up</button
			>
		{/if}
	</footer>
</div>
