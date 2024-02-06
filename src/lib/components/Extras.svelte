<script lang="ts">
	import type { BackreferenceObject, DetailsObject, SidebarImageObject } from "$lib/shorthand.types"
	import type { AuthSession, SupabaseClient } from "@supabase/supabase-js"
	import Backreferences from "./Backreferences.svelte"
	import Details from "./Details.svelte"
	import SidebarImage from "./SidebarImage.svelte"
	import type { PopupSettings } from "@skeletonlabs/skeleton"

    export let sidebar_images: SidebarImageObject[]
    export let details: DetailsObject[]
    export let backreferences: BackreferenceObject[]
    export let popupSettings: PopupSettings
    export let supabase: SupabaseClient
</script>

{#if sidebar_images.length > 0}
    <SidebarImage
        sidebarImages={sidebar_images}
        {popupSettings}
        supabase={supabase}
    />
<hr />
{/if}
{#if details.length > 0}
    <Details
        details={details}
        {popupSettings}
        supabase={supabase}
    />
<hr />
{/if}
{#if backreferences.length > 0}
    <Backreferences
        backRefs={backreferences}
        {popupSettings}
        supabase={supabase}
    />
    <hr />
{/if}