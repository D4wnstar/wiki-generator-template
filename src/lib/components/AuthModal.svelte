<script lang="ts">
	import { logIn, signUp } from '$lib/auth'
	import { Tab, TabGroup, getModalStore } from '@skeletonlabs/skeleton'
	import { AuthError } from '@supabase/supabase-js'
    import { UserPlus, User } from 'lucide-svelte';

	const modalStore = getModalStore()
	let signUpResultVisibility = 'hidden'
	let signUpResultMessage = 'Placeholder'
    let signUpResultColor = "warning"
    let tabSet: number = 0

	// Auth Data
	const authData = {
		email: '',
		username: '',
		password: ''
	}

    function clearData() {
        authData.email = ""
        authData.password = ""
        authData.username = ""
    }

    async function signUpButton() {
        if (!authData.email || !authData.password || !authData.username) {
            signUpResultMessage = "Please fill in all the fields."
            signUpResultColor = "error"
            signUpResultVisibility = ""
            return
        }
        const res = await signUp($modalStore[0].meta.supabase, authData.email, authData.password, authData.username)
        if (res instanceof AuthError) {
            signUpResultMessage = `Failed to sign up. ${res.message}`
            console.error(res.name, res.message, res.cause, res.status)
            signUpResultColor = "error"
            signUpResultVisibility = ""
        } else {
            signUpResultMessage = "Successfully signed up!"
            signUpResultColor = "success"
            signUpResultVisibility = ""
            setTimeout(() => {
                modalStore.close()
            }, 1000)
        }
    }

    async function logInButton() {
        if (!authData.email || !authData.password) {
            signUpResultMessage = "Please fill in all the fields."
            signUpResultColor = "error"
            signUpResultVisibility = ""
            return
        }
        const res = await logIn($modalStore[0].meta.supabase, authData.email, authData.password)
        if (res instanceof AuthError) {
            signUpResultMessage = `Failed to log in. ${res.message}`
            signUpResultColor = "error"
            signUpResultVisibility = ""
        } else {
            signUpResultMessage = "Successfully logged in!"
            signUpResultColor = "success"
            signUpResultVisibility = ""
            setTimeout(() => {
                modalStore.close()
            }, 1000)
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
                {#if tabSet === 0 }
                    <form class="px-4 space-y-4 rounded-container-token">
                        <p class="{signUpResultVisibility} text-center card variant-filled-{signUpResultColor} py-2">
                            {signUpResultMessage}
                        </p>
                        <label class="label">
                            <span>Email</span>
                            <input class="input" type="text" bind:value={authData.email} placeholder="Enter email..." />
                        </label>
                        <label class="label">
                            <span>Username</span>
                            <input
                                class="input"
                                type="text"
                                bind:value={authData.username}
                                placeholder="Enter username..."
                            />
                        </label>
                        <label class="label">
                            <span>Password</span>
                            <input
                                class="input"
                                type="password"
                                bind:value={authData.password}
                                placeholder="Enter password..."
                            />
                        </label>
                        <hr />
                    </form>
                {:else if tabSet === 1}
                    <form class="px-4 space-y-4 rounded-container-token">
                        <p class="{signUpResultVisibility} text-center card variant-filled-{signUpResultColor} py-2">
                            {signUpResultMessage}
                        </p>
                        <label class="label">
                            <span>Email</span>
                            <input class="input" type="text" bind:value={authData.email} placeholder="Enter email..." />
                        </label>
                        <label class="label">
                            <span>Password</span>
                            <input
                                class="input"
                                type="password"
                                bind:value={authData.password}
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
                            on:click={signUpButton}>Sign Up</button
                        >
                    {:else if tabSet === 1}
                        <button
                            class="btn variant-filled-primary"
                            on:click={logInButton}>Log In</button
                        >
                    {/if}
                    <button class="btn variant-filled-surface" on:click={() => modalStore.close()}>Cancel</button>
                </footer>
            </svelte:fragment>
        </TabGroup>
	</div>
{/if}
