<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import NodeDetail from './NodeDetail.svelte';

  let svg;
  let selectedNode = null;
  let isDetailOpen = false;

  // Your existing D3 code here...

  function handleNodeClick(event, d) {
    selectedNode = d;
    isDetailOpen = true;
  }

  onMount(() => {
    // Your existing D3 setup code...

    // Add click event to nodes
    svg.selectAll('.node')
      .on('click', handleNodeClick);
  });
</script>

<div class="chart-container">
  <svg bind:this={svg}></svg>
  <NodeDetail node={selectedNode} bind:isOpen={isDetailOpen} />
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>