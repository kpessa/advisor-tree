<script>
	import TreeGraph from './TreeGraph.svelte';
	export let treeData;
</script>

<main>
	<h1>Advisor Box Tree</h1>
	<TreeGraph {treeData} />
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