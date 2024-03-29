<script lang="ts">
	import { getModalStore } from "@skeletonlabs/skeleton"

    const modalStore = getModalStore()
    const imageUrl = $modalStore[0].meta.imageUrl
    const imageCaption = $modalStore[0].meta.imageCaption
</script>

{#if $modalStore[0]}
    <div class="card p-4">
        <img src={imageUrl} alt={imageCaption} class="max-h-[90vh]" />
    </div>
{/if}