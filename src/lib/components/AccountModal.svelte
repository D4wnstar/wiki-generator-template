<script lang="ts">
	import { page } from "$app/stores"
	import type { Database } from "$lib/database.types"
	import { getModalStore, ListBox, ListBoxItem, type ModalSettings } from "@skeletonlabs/skeleton"
	import type { Session, SupabaseClient } from "@supabase/supabase-js"
	import { Info } from "lucide-svelte"

    const modalStore = getModalStore()
    const supabase: SupabaseClient<Database> = $modalStore[0].meta.supabase
    const session: Session = $modalStore[0].meta.session

    const logOutModal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Log Out',
		body: 'Are you sure you want to log out?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: async (res: boolean) => {
			if (res) {
				const { error } = await supabase.auth.signOut()
				if (error) console.log(error)
				window.location.assign("/")
			}
		}
	}

    let currTab: string = "info"
</script>

{#if $modalStore[0]}
    <div class="flex flex-col card p-4 w-screen h-[95vh] md:w-modal-wide md:h-[66vh] shadow-xl space-y-4">
        <h1 class="text-2xl"><strong>Account Settings</strong></h1>
        <hr />
        <div class="flex flex-col grow items-center md:items-stretch md:flex-row gap-2 overflow-auto">
            <ListBox class="w-32" active="variant-soft-primary">
                <ListBoxItem
                    bind:group={currTab}
                    name="tab"
                    value="info"
                >
                    <svelte:fragment slot="lead"><Info /></svelte:fragment>
                    Info
                </ListBoxItem>
            </ListBox>
            <div class="border-r border-surface-600 hidden md:block" />
            <section class="flex flex-col space-y-4 w-full md:px-4">
                <h2 class="text-xl hidden md:block"><strong>Information</strong></h2>
                <hr />
                <form action="/?/updateInfo" method="post" class="space-y-4">
                    {#if $page.form && $page.form?.missing}
                        <p class="variant-filled-error text-center card py-2">
                            Both fields are required.
                        </p>
                    {:else if $page.form && !$page.form?.missing && !$page.form?.success}
                        <p class="variant-filled-error text-center card py-2">
                            Something went wrong.
                        </p>
                    {/if}
                    <label class="label">
                        <div>Email</div>
                        <input
                            class="input w-3/4"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={$page.form?.email ?? session.user.email}
                        />
                    </label>
                    <label class="label">
                        <div>Username</div>
                        <input
                            class="input w-3/4"
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={$page.form?.username ?? session.user.user_metadata.username}
                        />
                    </label>
                    <small class="text-sm text-surface-600-300-token w-3/4">Changing username will cause all of your permissions to be revoked!</small>
                    <button class="btn variant-filled-surface">
                        Save Changes
                    </button>
                </form>
                <hr />
                <form action="/?/updatePass" method="post" class="space-y-4">
                    <label class="label">
                        <div>Old Password</div>
                        <input
                            class="input w-3/4"
                            type="password"
                            name="old-password"
                            placeholder="Enter old password"
                        />
                    </label>
                    <label class="label">
                        <div>New Password</div>
                        <input
                            class="input w-3/4"
                            type="password"
                            name="new-password"
                            placeholder="Enter new password"
                        />
                    </label>
                    <label class="label">
                        <div>Confirm New Password</div>
                        <input
                            class="input w-3/4"
                            type="password"
                            name="new-password-confirm"
                            placeholder="Confirm new password"
                        />
                    </label>
                    <button class="btn variant-filled-surface">
                        Save Changes
                    </button>
                </form>
            </section>
        </div>
        <hr />
        <footer class="w-full flex justify-end gap-2">
            <button
                class="btn variant-ghost-surface"
                on:click={() => {
                    modalStore.close()
                }}
            >
                Close
            </button>
            <button
                class="btn variant-filled-error"
                on:click={() => {
                    modalStore.close()
                    modalStore.trigger(logOutModal)
                }}
            >
                Log Out
            </button>
        </footer>
    </div>
{/if}