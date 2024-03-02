<script lang="ts">
	import { passwordRules, updateUserPassword } from "$lib/auth"
	import type { Database } from "$lib/database.types"
	import { AuthError, type SupabaseClient } from "@supabase/supabase-js"
	import { createEventDispatcher } from "svelte"

	export let supabase: SupabaseClient<Database>

    const dispatch = createEventDispatcher()

    let newPass = ""
    let newPassConfirm = ""

    let rulesDelayTimer: NodeJS.Timeout
    let rulesConfirmDelayTimer: NodeJS.Timeout
	let responseVisibility = false
	let responseMessage = 'Placeholder'
	let responseColor = 'warning'
	let passwordRulesVisible = false
	let passwordConfirmRulesVisible = false

    $: isNewPassValid = passwordRules.test(newPass)
    $: isNewPassConfirmValid = newPassConfirm === newPass

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

        const res = await updateUserPassword(supabase, newPass, newPassConfirm)
        if (res instanceof AuthError) {
            responseMessage = `Failed to update password. ${res.message}`
			responseColor = 'error'
			responseVisibility = true
        } else {
            responseMessage = 'Successfully updated password.'
			responseColor = 'success'
			responseVisibility = true
            dispatch('success')
        }
    }
</script>

<section class="flex flex-col space-y-4 w-full">
    <form class="space-y-4">
        {#if responseVisibility}
			<p class="variant-filled-{responseColor} text-center card p-2">
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
                on:input={() => {
                    clearTimeout(rulesDelayTimer)
                    rulesDelayTimer = setTimeout(
                        () => (passwordRulesVisible = isNewPassValid ? false : true),
                        500
                    )
                }}
            />
        </label>
        {#if !isNewPassValid && passwordRulesVisible}
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>
                    Password must be at least six characters long and can contain special characters.
                </p>
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
                on:input={() => {
                    clearTimeout(rulesConfirmDelayTimer)
                    rulesConfirmDelayTimer = setTimeout(
                        () => (passwordConfirmRulesVisible = isNewPassConfirmValid ? false : true),
                        500
                    )
                }}
            />
        </label>
        {#if !isNewPassConfirmValid && newPassConfirm.length > 0 && passwordConfirmRulesVisible}
			<div class="variant-ghost-warning p-2 w-3/4">
				<p>
                    Passwords don't match.
                </p>
			</div>
		{/if}
        <button
            class="btn variant-filled-surface"
            disabled={!isNewPassValid || !isNewPassConfirmValid}
            on:click|preventDefault={updatePassword}
        >Save Changes</button>
    </form>
</section>