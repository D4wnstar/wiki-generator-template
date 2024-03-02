<script lang="ts">
    import PasswordChange from '$lib/components/auth/forms/PasswordChange.svelte'
    import type { PageData } from './$types';
	import { goto } from '$app/navigation'
    
    export let data: PageData;
    
    const supabase = data.supabase
</script>

<div class="flex flex-col mx-auto p-4 w-full space-y-4">
    <h1 class="text-2xl px-4"><strong>Password Reset</strong></h1>
    <hr class="w-3/4" />
    <PasswordChange {supabase} on:success={() => window.location.assign("/")} />
</div>