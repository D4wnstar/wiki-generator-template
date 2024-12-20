<script lang="ts">
	import type { ActionData, PageData } from './$types'
	import { passwordRules, usernameRules } from '$lib/auth'
	import { Tabs } from '@skeletonlabs/skeleton-svelte'
	import { UserPlus, User } from 'lucide-svelte'
	import { enhance } from '$app/forms'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let tabSet: string = $state(form?.type ?? 'login')

	let loadingUsername = $state(false)

	let isUsernameAvailable = $state(false)

	let debounceTimer: NodeJS.Timeout
	// @ts-ignore
	let rulesDelayTimer: NodeJS.Timeout = $state()
	let usernameRulesVisible = $state(false)
	let passwordRulesVisible = $state(false)

	// Auth Data
	let username = $state(form?.username?.toString() ?? '')
	let password = $state('')

	let isUsernameEmpty = $derived(username.length === 0)
	let isUsernameValid = $derived(usernameRules.test(username))
	let isUsernameTaken = $derived(isUsernameValid && !isUsernameAvailable && !loadingUsername)

	let isPasswordEmpty = $derived(password.length === 0)
	let isPasswordValid = $derived(passwordRules.test(password))

	const warningMsgClasses = 'm-2 p-2 preset-outlined-warning-500'

	function clearData() {
		password = ''
		username = ''
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

	async function handleSignupUsernameInput() {
		clearTimeout(rulesDelayTimer)
		rulesDelayTimer = setTimeout(() => (usernameRulesVisible = isUsernameValid ? false : true), 500)
		await checkUsernameAvailability()
	}

	async function handleSignupPasswordInput() {
		clearTimeout(rulesDelayTimer)
		rulesDelayTimer = setTimeout(() => (passwordRulesVisible = isPasswordValid ? false : true), 500)
	}
</script>

<svelte:head>
	<title>Login to {data.settings.title}</title>
</svelte:head>

<div class="mx-auto flex flex-col lg:ml-20 lg:mr-0 lg:w-[500px]">
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
				><form class="flex flex-col space-y-4 px-4" method="POST" action="?/login" use:enhance>
					{#if form && form.message && form.type === 'login'}
						<p class="card p-2 text-center preset-filled-{form.color}-500">
							{form.message}
						</p>
					{/if}
					<label class="label">
						<span>Username</span>
						<input
							class="input"
							name="username"
							bind:value={username}
							placeholder="Enter username..."
						/>
					</label>
					<label class="label">
						<span>Password</span>
						<input
							class="input"
							name="password"
							type="password"
							bind:value={password}
							placeholder="Enter password..."
						/>
					</label>
					<button
						class="btn w-min self-end preset-tonal-primary"
						disabled={isUsernameEmpty || isPasswordEmpty}
					>
						Log In
					</button>
				</form></Tabs.Panel
			>

			<!-- Signup form -->
			<Tabs.Panel value="signup"
				><form class="flex flex-col space-y-4 px-4" method="POST" action="?/signup" use:enhance>
					{#if form && form.message && form.type === 'signup'}
						<p class="card p-2 text-center preset-filled-{form.color}-500">
							{form.message}
						</p>
					{/if}
					<label class="label">
						<span>Username</span>
						<input
							class="input"
							name="username"
							type="text"
							bind:value={username}
							oninput={handleSignupUsernameInput}
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
							name="password"
							type="password"
							bind:value={password}
							oninput={handleSignupPasswordInput}
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
					<small class="block pl-1"
						>Passwords cannot be reset! If you lose your password, you lose your account.</small
					>
					<button
						class="btn w-min self-end preset-tonal-primary"
						disabled={!isUsernameValid ||
							isUsernameTaken ||
							isUsernameEmpty ||
							!isPasswordValid ||
							isPasswordEmpty}>Sign Up</button
					>
				</form></Tabs.Panel
			>
		{/snippet}
	</Tabs>
	<hr class="hr mt-4" />
</div>
