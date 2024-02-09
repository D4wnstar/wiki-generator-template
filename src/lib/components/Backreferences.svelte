<script lang="ts">
	import { destroyPopup, initializePopup } from '$lib/popups'
	import type { BackreferenceObject } from '$lib/shorthand.types'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { Link } from 'lucide-svelte'

	export let backRefs: BackreferenceObject[]
	export let popupSettings: PopupSettings
	export let supabase: SupabaseClient

	function popupAction(node: HTMLElement) {
		initializePopup(node, popupSettings, supabase)

		return {
			destroy() {
				destroyPopup(node)
			}
		}
	}
</script>

<div id="backreferences" class="space-y-2">
	<h3 class="h3"><Link class="inline" /> Backreferences</h3>
	<ul class="list-inside list-disc">
		{#each backRefs as ref}
			<li class="pl-2">
				<a href="/{ref.slug}" class="anchor" use:popupAction>{ref.display_name}</a>
			</li>
		{/each}
	</ul>
</div>
