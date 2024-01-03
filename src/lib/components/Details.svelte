<script lang="ts">
	import { setupPopups } from "$lib/popups"
	import type { DetailsObject } from "$lib/shorthand.types"
	import type { PopupSettings } from "@skeletonlabs/skeleton"

    export let details: DetailsObject[]
    export let popupSettings: PopupSettings
    export let supabase

    setupPopups("details", popupSettings, supabase)
</script>

<div id="details" class="space-y-2">
    <h3 class="h3">Details</h3>
    {#each details as detail}
        <p><strong>{detail.detail_name}</strong>: {@html detail.detail_content}</p>
    {/each}
</div>