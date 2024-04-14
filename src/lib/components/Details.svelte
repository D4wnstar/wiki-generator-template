<script lang="ts">
	import { setupPopups } from '$lib/popups'
	import type { DetailsObject } from '$lib/shorthand.types'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import { Library } from 'lucide-svelte'

	export let details: DetailsObject[]
	export let popupSettings: PopupSettings
	export let supabase

	setupPopups('details', popupSettings, supabase)
</script>

<div id="details" class="space-y-2">
	<h3 class="h3"><Library class="inline" /> Details</h3>
	<table class="w-full">
		<tbody>
			{#each details as detail}
				<tr>
					{#if detail.detail_content !== ''}
						<td class="px-1 align-text-top lg:min-w-[6em]">{@html detail.detail_name}</td>
						<td class="px-1">{@html detail.detail_content.replaceAll(/; */g, '<br />')}</td>
						<!-- {:else if detail.detail_name === "-"}
                    <td colspan="2" class="text-center"><hr /></td> -->
					{:else}
						<td colspan="2" class="pt-2 text-center">
							<h3 class="text-lg">{@html detail.detail_name}</h3>
							<hr class="pb-2" />
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
