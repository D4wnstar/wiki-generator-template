<script lang="ts">
	import { setupPopups } from "$lib/popups"
	import type { SidebarImageObject } from "$lib/shorthand.types"
	import type { PopupSettings } from "@skeletonlabs/skeleton"
	import type { SupabaseClient } from "@supabase/supabase-js"

    export let sidebarImages: SidebarImageObject[]
    export let popupSettings: PopupSettings
    export let supabase: SupabaseClient

    setupPopups('sidebar-images', popupSettings, supabase)
</script>

<div id="sidebar-images" class="space-y-2">
    {#each sidebarImages as image}
        <figure class="text-center">
            <img src={image.url} alt={image.caption} class="max-h-80 mx-auto" />
            <figcaption class="text-surface-700-200-token mt-2 py-2 px-4 card variant-outline-surface">
                {image.caption}
            </figcaption>
        </figure>
    {/each}
</div>
