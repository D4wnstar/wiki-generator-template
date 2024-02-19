<script lang="ts">
    let oldPass = ""
    let newPass = ""
    let newPassConfirm = ""

    
</script>

<section class="flex flex-col space-y-4 w-full md:px-4">
    <form action="/?/updatePass" method="post" class="space-y-4">
        <label class="label">
            <div>Old Password</div>
            <input
                class="input w-3/4"
                type="password"
                name="old-password"
                placeholder="Enter old password"
                bind:value={oldPass}
            />
        </label>
        <label class="label">
            <div>New Password</div>
            <input
                class="input w-3/4"
                type="password"
                name="new-password"
                placeholder="Enter new password"
                bind:value={newPass}
            />
        </label>
        <label class="label">
            <div>Confirm New Password</div>
            <input
                class="input w-3/4"
                type="password"
                name="new-password-confirm"
                placeholder="Confirm new password"
                bind:value={newPassConfirm}
            />
        </label>
        <button class="btn variant-filled-surface"> Save Changes </button>
    </form>
</section>