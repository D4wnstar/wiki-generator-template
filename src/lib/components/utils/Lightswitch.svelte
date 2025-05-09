<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte'
	import IconMoon from 'lucide-svelte/icons/moon'
	import IconSun from 'lucide-svelte/icons/sun'
	import { onMount } from 'svelte'

	let mode = $state(true)

	// Handle the change in state when toggled.
	function handleModeChange(newState: boolean) {
		document.documentElement.classList.toggle('dark', newState)
		localStorage.setItem('darkMode', String(newState))
	}

	onMount(() => {
		// Initialize from localStorage (need browser so in onMount it goes)
		mode = (localStorage.getItem('darkMode') ?? 'true') === 'true'
	})
</script>

<Switch
	name="mode"
	controlActive="bg-surface-500"
	controlInactive="bg-surface-200"
	checked={mode}
	onCheckedChange={(e) => handleModeChange(e.checked)}
>
	{#snippet activeChild()}<IconMoon size="14" />{/snippet}
	{#snippet inactiveChild()}<IconSun size="14" />{/snippet}
</Switch>
