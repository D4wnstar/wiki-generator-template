<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton'

	const modalStore = getModalStore()
	const base64 = $modalStore[0].meta.base64
	const imageCaption = $modalStore[0].meta.imageCaption
</script>

{#if $modalStore[0]}
	<div class="card p-4">
		<img src={`data:image/webp;base64,${base64}`} alt={imageCaption} class="max-h-[90vh]" />
	</div>
{/if}
