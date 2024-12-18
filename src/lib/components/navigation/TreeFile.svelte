<script lang="ts">
	import { Minus } from 'lucide-svelte'

	let { title, slug }: { title: string; slug: string } = $props()
</script>

<button class="mt-2 flex w-full flex-row items-center gap-2">
	<Minus size="18" class="min-w-8" color="grey" />
	<a href={`/${slug}`} class="grow text-left">{title}</a>
</button>
