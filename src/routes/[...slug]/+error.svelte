<script lang="ts">
	import { page } from '$app/state'
</script>

<main class="flex h-full w-full flex-col items-center">
	<h1 class="h1">:(</h1>
	<p>There was a {page.status} error loading this page. Sorry!</p>
	{#if page.status !== -1}
		<p>{page.error?.message}</p>
	{/if}
</main>
