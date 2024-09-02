<script>
    import { createEventDispatcher } from 'svelte';
  
    export let zoomLevel = 100; // Default zoom level (100%)
    
    const dispatch = createEventDispatcher();
  
    function decreaseZoom() {
      dispatch('zoom', { direction: 'out' });
    }
  
    function increaseZoom() {
      dispatch('zoom', { direction: 'in' });
    }
  
    function handleSliderChange(event) {
      const newZoom = parseInt(event.target.value);
      dispatch('zoom', { level: newZoom });
    }
  </script>
  
  <div class="zoom-control">
    <button on:click={decreaseZoom}>-</button>
    <input 
      type="range" 
      min="10" 
      max="200" 
      bind:value={zoomLevel} 
      on:input={handleSliderChange}
    />
    <button on:click={increaseZoom}>+</button>
    <span>{zoomLevel}%</span>
  </div>
  
  <style>
    .zoom-control {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 5px 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    button {
      width: 30px;
      height: 30px;
      font-size: 18px;
      cursor: pointer;
      border: none;
      background-color: #f0f0f0;
      border-radius: 50%;
    }
    input[type="range"] {
      width: 150px;
    }
    span {
      font-size: 14px;
      min-width: 45px;
      text-align: right;
    }
  </style>