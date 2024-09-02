<script>
    import { fly } from 'svelte/transition';
    
    export let node = null;
    export let isOpen = false;
  </script>
  
  {#if isOpen && node}
    <div class="node-detail" transition:fly={{ x: 300, duration: 300 }}>
      <h2>{node.data.name}</h2>
      <h1>Hello World</h1>
      <button on:click={() => isOpen = false}>Close</button>
    </div>
  {/if}
  
  <style>
    .node-detail {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: white;
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
      padding: 20px;
      overflow-y: auto;
    }
  </style>