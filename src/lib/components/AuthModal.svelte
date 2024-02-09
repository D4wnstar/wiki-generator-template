<script lang="ts">
	import { logIn, signUp } from '$lib/auth'
	import type { Database } from '$lib/database.types'
	import { Tab, TabGroup, getModalStore } from '@skeletonlabs/skeleton'
	import { AuthError, type SupabaseClient } from '@supabase/supabase-js'
	import { UserPlus, User } from 'lucide-svelte'

	const modalStore = getModalStore()
	const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase
	/**
	 * Username must be:
	 * 1. Alphanumeric with dots and underscores
	 * 2. At least two characters long
	 * 3. Can't have more than one dot in a row (e.g. no 'the..legend')
	 * 4. Can't start or end in a dot or underscore
	 */
	const usernameRules = /^(?=[a-zA-Z0-9._]{2,}$)(?!.*[.]{2})[^_.].*[^_.]$/
	/**
	 * RFC2822 standard email validation. From the .net helpfiles.
	 */
	const emailRules =
		/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	/**
	 * Password must be at least six characters long, with at least one
	 * upper- or lowercase letter. Password rules are intentionally very lenient.
	 */
	const passwordRules = /^(?=.*[a-zA-Z]).{6,}$/

	let signUpResultVisibility = 'hidden'
	let signUpResultMessage = 'Placeholder'
	let signUpResultColor = 'warning'
	let tabSet: number = 0

	// let loadingUsername = false
	// let loadingEmail = false

	// let isUsernameAvailable = false
	// let isEmailAvailable = false

	// let debounceTimer: NodeJS.Timeout
	let rulesDelayTimer: NodeJS.Timeout
	let usernameRulesVisible = false
	let emailRulesVisible = false
	let passwordRulesVisible = false

	// Auth Data
	let email = ''
	let username = ''
	let password = ''

	$: isUsernameEmpty = username.length === 0
	$: isUsernameValid = username.length > 2 && usernameRules.test(username)
	// $: isUsernameTaken = isUsernameValid && !isUsernameAvailable && !loadingUsername

	$: isEmailEmpty = email.length === 0
	$: isEmailValid = emailRules.test(email)
	// $: isEmailTaken = isEmailValid && !isEmailAvailable && !loadingEmail

	$: isPasswordEmpty = password.length === 0
	$: isPasswordValid = passwordRules.test(password)

	function clearData() {
		email = ''
		password = ''
		username = ''
	}

	// Due to RLS policy, availability checking can only be done on the server, so this needs to be moved
	// async function checkUsernameAvailability() {
	//     isUsernameAvailable = false
	//     clearTimeout(debounceTimer)
	//     loadingUsername = true

	//     debounceTimer = setTimeout(async () => {
	//         console.log(username)
	//         const { data: select, error: selectError } = await supabase
	//             .from("profiles")
	//             .select("username")
	//             // .eq("username", username)
	//             // .limit(1)
	//             // .maybeSingle()

	//         console.log(select)

	//         if (selectError) console.error(`Error when fetching usernames: ${selectError.message}`)
	//         isUsernameAvailable = (select || selectError) ? false : true
	//         loadingUsername = false
	//     }, 500)
	// }

	// async function checkEmailAvailability() {
	//     isEmailAvailable = false
	//     clearTimeout(debounceTimer)
	//     loadingEmail = true

	//     debounceTimer = setTimeout(async () => {
	//         const { data: select, error: selectError } = await supabase
	//             .from("profiles")
	//             .select("email")
	//             .eq("email", email)
	//             .limit(1)
	//             .maybeSingle()

	//         if (selectError) console.error(`Error when fetching user emails: ${selectError.message}`)
	//         isEmailAvailable = (select || selectError) ? false : true
	//         loadingEmail = false
	//     }, 500)
	// }

	async function signUpButton() {
		if (!email || !password || !username) {
			signUpResultMessage = 'Please fill in all the fields.'
			signUpResultColor = 'error'
			signUpResultVisibility = ''
			return
		}
        if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
            signUpResultMessage = 'Please make sure all fields are valid.'
			signUpResultColor = 'error'
			signUpResultVisibility = ''
			return
        }
		const res = await signUp(supabase, email, password, username)
		if (res instanceof AuthError) {
			signUpResultMessage = `Failed to sign up. ${res.message}`
			console.error(res.name, res.message, res.cause, res.status)
			signUpResultColor = 'error'
			signUpResultVisibility = ''
		} else {
			signUpResultMessage = 'Successfully signed up!'
			signUpResultColor = 'success'
			signUpResultVisibility = ''
            window.location.reload()
		}
	}

	async function logInButton() {
		if (!email || !password) {
			signUpResultMessage = 'Please fill in all the fields.'
			signUpResultColor = 'error'
			signUpResultVisibility = ''
			return
		}
        if (!isEmailValid || !isPasswordValid) {
            signUpResultMessage = 'Please make sure all fields are valid.'
			signUpResultColor = 'error'
			signUpResultVisibility = ''
			return
        }
		const res = await logIn(supabase, email, password)
		if (res instanceof AuthError) {
			signUpResultMessage = `Failed to log in. ${res.message}`
			signUpResultColor = 'error'
			signUpResultVisibility = ''
		} else {
			signUpResultMessage = 'Successfully logged in!'
			signUpResultColor = 'success'
			signUpResultVisibility = ''
			window.location.reload()
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card p-4 w-modal shadow-xl space-y-4">
		<TabGroup>
			<Tab bind:group={tabSet} name="signup" value={0} on:change={clearData}>
				<svelte:fragment slot="lead"><UserPlus class="inline" /></svelte:fragment>
				<span>Sign Up</span>
			</Tab>
			<Tab bind:group={tabSet} name="login" value={1} on:change={clearData}>
				<svelte:fragment slot="lead"><User class="inline" /></svelte:fragment>
				<span>Log In</span>
			</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<form class="px-4 space-y-4 rounded-container-token">
						<p
							class="{signUpResultVisibility} text-center card variant-filled-{signUpResultColor} py-2"
						>
							{signUpResultMessage}
						</p>
						<label class="label">
							<span>Email</span>
							<input
								class="input"
								class:input-error={!isEmailValid && !isEmailEmpty}
								type="text"
								bind:value={email}
								on:input={() => {
									clearTimeout(rulesDelayTimer)
									rulesDelayTimer = setTimeout(
										() => (emailRulesVisible = isEmailValid ? false : true),
										500
									)
								}}
								placeholder="Enter email..."
							/>
						</label>
						{#if !isEmailValid && !isEmailEmpty && emailRulesVisible}
							<p>Invalid email address</p>
						{/if}
						<label class="label">
							<span>Username</span>
							<input
								class="input"
								class:input-error={!isUsernameValid && !isUsernameEmpty}
								type="text"
								bind:value={username}
								on:input={() => {
									clearTimeout(rulesDelayTimer)
									rulesDelayTimer = setTimeout(
										() => (usernameRulesVisible = isUsernameValid ? false : true),
										500
									)
								}}
								placeholder="Enter username..."
							/>
						</label>
						{#if !isUsernameValid && !isUsernameEmpty && usernameRulesVisible}
							<p>Username must be:</p>
							<ol class="list-inside list-decimal">
								<li>Alphanumeric with dots and underscores</li>
								<li>At least two characters long</li>
								<li>Can't have more than one dot in a row (e.g. no 'the..legend')</li>
								<li>Can't start or end in a dot or underscore</li>
							</ol>
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
								Password must be at least six characters long and can contain special characters
							</p>
						{/if}
						<hr />
					</form>
				{:else if tabSet === 1}
					<form class="px-4 space-y-4 rounded-container-token">
						<p
							class="{signUpResultVisibility} text-center card variant-filled-{signUpResultColor} py-2"
						>
							{signUpResultMessage}
						</p>
						<label class="label">
							<span>Email</span>
							<input class="input" type="text" bind:value={email} placeholder="Enter email..." />
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
				{/if}

				<footer class="w-full flex justify-end gap-2 pt-4">
					{#if tabSet === 0}
						<button
							class="btn variant-filled-primary"
							disabled={!isEmailValid ||
								!isUsernameValid ||
								!isPasswordValid ||
								isUsernameEmpty ||
								isEmailEmpty ||
								isPasswordEmpty}
							on:click={signUpButton}>Sign Up</button
						>
					{:else if tabSet === 1}
						<button
                            class="btn variant-filled-primary"
                            disabled={isEmailEmpty || isPasswordEmpty}
                            on:click={logInButton}
                        >Log In</button>
					{/if}
					<button class="btn variant-filled-surface" on:click={() => modalStore.close()}
						>Cancel</button
					>
				</footer>
			</svelte:fragment>
		</TabGroup>
	</div>
{/if}
