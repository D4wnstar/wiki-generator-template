<script lang="ts">
	import { Minus } from 'lucide-svelte'

	let { title, slug }: { title: string; slug: string } = $props()
</script>

<button class="my-1 flex w-full flex-row items-center gap-2">
	<Minus size="18" class="mx-1 min-w-8" color="grey" />
	<a href={`/${slug}`} class="block grow text-left">{title}</a>
</button>
