<script lang="ts">
    export let tabTitle: string
</script>

<div class="flex w-full flex-col space-y-4 overflow-auto md:px-4">
    <h2 class="text-2xl hidden md:block"><strong>{tabTitle}</strong></h2>
    <hr />
    <slot />
</div>