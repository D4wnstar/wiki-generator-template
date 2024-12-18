<script lang="ts">
	import { passwordRules, usernameRules } from '$lib/auth'
	import { Tab, TabGroup, getModalStore } from '@skeletonlabs/skeleton'
	import { UserPlus, User } from 'lucide-svelte'

	const modalStore = getModalStore()

	let signUpResultVisibility = $state(false)
	let signUpResultMessage = $state('Placeholder')
	let signUpResultColor = $state('warning')
	let tabSet: number = $state(0)

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

	function clearData() {
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

	function checkCredentialValiditySignUp() {
		if (isPasswordEmpty || isUsernameEmpty) {
			signUpResultMessage = 'Please fill in all the fields.'
			signUpResultColor = 'error'
			signUpResultVisibility = true
			return false
		}
		if (!isPasswordValid || !isUsernameValid) {
			signUpResultMessage = 'Please make sure all fields are valid.'
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
		if (isUsernameEmpty || isPasswordEmpty) {
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
			signUpResultMessage = `Failed to sign up. ${data.message}`
			signUpResultColor = 'error'
			signUpResultVisibility = true
		} else {
			signUpResultMessage = 'Sign up successful'
			signUpResultColor = 'success'
			signUpResultVisibility = true
			// window.location.reload()
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
			signUpResultMessage = `Failed to log in. ${data.message}.`
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
				{#snippet lead()}
								<User class="inline" />
							{/snippet}
				<span>Log In</span>
			</Tab>
			<Tab bind:group={tabSet} name="signup" value={1} on:change={clearData}>
				{#snippet lead()}
								<UserPlus class="inline" />
							{/snippet}
				<span>Sign Up</span>
			</Tab>
			{#snippet panel()}
					
					{#if tabSet === 0}
						<form class="space-y-4 px-4 rounded-container-token">
							{#if signUpResultVisibility}
								<p class="card text-center variant-filled-{signUpResultColor} p-2">
									{signUpResultMessage}
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
							<hr />
						</form>
					{:else if tabSet === 1}
						<form class="space-y-4 px-4 rounded-container-token">
							{#if signUpResultVisibility}
								<p class="card text-center variant-filled-{signUpResultColor} py-2">
									{signUpResultMessage}
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
								<div class="variant-ghost-warning m-2 p-2">
									<p>Username must be:</p>
									<ol class="list-inside list-decimal">
										<li>Alphanumeric with dots, dashes and underscores</li>
										<li>Between 3 and 20 characters long</li>
										<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
										<li>Can't start or end in a dot, dash or underscore</li>
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
								<p>
									Password must be at least six characters long and can contain special characters.
								</p>
							{/if}
							<small class="small block pl-1">Passwords cannot be reset!</small>
							<hr />
						</form>
					{/if}

					<footer class="flex w-full justify-end gap-2 pt-4">
						{#if tabSet === 0}
							<button
								class="variant-filled-primary btn"
								disabled={isUsernameEmpty || isPasswordEmpty}
								onclick={logInButton}
								bind:this={logInButtonRef}
							>
								Log In
							</button>
						{:else if tabSet === 1}
							<button
								class="variant-filled-primary btn"
								disabled={!isUsernameValid ||
									isUsernameTaken ||
									isUsernameEmpty ||
									!isPasswordValid ||
									isPasswordEmpty}
								onclick={signUpButton}>Sign Up</button
							>
						{/if}
						<button class="variant-ghost-surface btn" onclick={() => modalStore.close()}
							>Cancel</button
						>
					</footer>
				
					{/snippet}
		</TabGroup>
	</div>
{/if}
