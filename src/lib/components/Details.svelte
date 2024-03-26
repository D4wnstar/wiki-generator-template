<script lang="ts">
	import { setupPopups } from "$lib/popups"
	import type { DetailsObject } from "$lib/shorthand.types"
	import type { PopupSettings } from "@skeletonlabs/skeleton"
	import { Library } from "lucide-svelte"

    export let details: DetailsObject[]
    export let popupSettings: PopupSettings
    export let supabase

    setupPopups("details", popupSettings, supabase)
</script>

<div id="details" class="space-y-2">
    <h3 class="h3"><Library class="inline" /> Details</h3>
    <table class="w-full">
        <tbody>
            {#each details as detail}
                {#if detail.detail_content !== ""}
                    <tr>
                        <td class="align-text-top px-1 lg:min-w-[6em]">{@html detail.detail_name}</td>
                        <td class="px-1">{@html detail.detail_content.replaceAll(/; */g, "<br />")}</td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="2" class="text-center">{@html detail.detail_name}</td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
</div>