<script lang="ts">
	import type { BackreferenceObject, DetailsObject, SidebarImageObject } from '$lib/shorthand.types'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import Backreferences from './Backreferences.svelte'
	import Details from './Details.svelte'
	import SidebarImage from './SidebarImage.svelte'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import type { DetailsRow, SidebarImageRow } from '$lib/schema'

	export let sidebarImages: SidebarImageRow[]
	export let details: DetailsRow[]
	// export let popupSettings: PopupSettings
</script>

{#if sidebarImages.length > 0}
	<SidebarImage {sidebarImages} />
	<hr />
{/if}
{#if details.length > 0}
	<Details {details} />
	<hr />
{/if}
