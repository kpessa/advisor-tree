<script>
	import TreeGraph from './TreeGraph.svelte';
	import { processData } from './data/app.js';
	import { onMount } from 'svelte';

	let treeData = null;

	onMount(async () => {
		treeData = await processData();
		console.log(treeData);
	});
</script>

<main>
	<h1>Advisor Box Tree</h1>
	{#if treeData}
		<TreeGraph {treeData} />
	{:else}
		<p>Loading data...</p>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
	}
</style>