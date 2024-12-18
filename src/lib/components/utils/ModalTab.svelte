<script lang="ts">
    interface Props {
        tabTitle: string;
        children?: import('svelte').Snippet;
    }

    let { tabTitle, children }: Props = $props();
</script>

<div class="flex w-full flex-col space-y-4 overflow-auto md:px-4">
    <h2 class="text-2xl hidden md:block"><strong>{tabTitle}</strong></h2>
    <hr />
    {@render children?.()}
</div>