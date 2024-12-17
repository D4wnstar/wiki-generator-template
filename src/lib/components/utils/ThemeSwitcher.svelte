<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton'
    import { currentTheme } from '$lib/stores';
</script>

<div class="p-4 flex items-center justify-around">
    <LightSwitch />
    <select
        class="select w-2/3"
        bind:value={$currentTheme}
    >
        <option value="cosmos">✨ Cosmos</option>
        <option value="skeleton">💀 Skeleton</option>
        <option value="wintry">❄️ Wintry</option>
        <option value="modern">🤖 Modern</option>
        <option value="rocket">🚀 Rocket</option>
        <option value="seafoam">🧜‍♀️ Seafoam</option>
        <option value="vintage">🎙️ Vintage</option>
        <option value="sahara">🌵 Sahara</option>
        <option value="hamlindigo">⚖️ Hamlindigo</option>
        <option value="gold-nouveau">⚜️ Gold Nouveau</option>
        <option value="crimson">🩸 Crimson</option>
    </select>
</div>