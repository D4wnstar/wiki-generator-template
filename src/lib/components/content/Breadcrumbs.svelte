<script lang="ts">
    interface Props {
        breadcrumbs: string[];
    }

    let { breadcrumbs }: Props = $props();
</script>

<div class="flex card variant-ghost-surface p-3 my-2 items-center">
    <ol class="breadcrumb">
        {#each breadcrumbs as crumb, i}
            {#if i < breadcrumbs.length - 1}
                <li class="crumb">{crumb}</li>
                <li class="crumb-separator" aria-hidden>&rsaquo;</li>
            {:else}
                <li class="crumb">{crumb}</li>
            {/if}
        {/each}
    </ol>
</div>