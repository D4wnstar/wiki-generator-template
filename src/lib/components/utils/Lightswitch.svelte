<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte'
	import IconMoon from 'lucide-svelte/icons/moon'
	import IconSun from 'lucide-svelte/icons/sun'

	// Bind to the checked state
	let mode = $state(false)

	// Handle the change in state when toggled.
	function handleModeChange() {
		// NOTE: implementation may differ per Tailwind config and framework:
		// https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
		document.documentElement.classList.toggle('dark')
	}
</script>

<Switch
	name="mode"
	controlActive="bg-surface-200"
	bind:checked={mode}
	onCheckedChange={handleModeChange}
>
	{#snippet inactiveChild()}<IconMoon size="14" />{/snippet}
	{#snippet activeChild()}<IconSun size="14" />{/snippet}
</Switch>
