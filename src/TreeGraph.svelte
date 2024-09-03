<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import ZoomControl from './ZoomControl.svelte';
  import NodeDetail from './NodeDetail.svelte';

  export let treeData;

  let root, tree, diagonal, svg, gLink, gNode;
  const width = 1200;
  const height = 800;
  const marginTop = 20;
  const marginRight = 120;
  const marginBottom = 20;
  const marginLeft = 120;

  let zoom;
  let g;

  let zoomLevel = 100;

  let selectedNode = null;
  let isDetailOpen = false;

  let i = 0; // Add this line to define i

  function handleNodeClick(event, d) {
    selectedNode = d;
    isDetailOpen = true;
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(event, d);
  }

  function handleZoom(event) {
    if (event.detail.direction === 'in') {
      zoom.scaleBy(svg.transition().duration(750), 1.2);
    } else if (event.detail.direction === 'out') {
      zoom.scaleBy(svg.transition().duration(750), 1 / 1.2);
    } else if (event.detail.level) {
      const scale = event.detail.level / 100;
      zoom.scaleTo(svg.transition().duration(750), scale);
    }
  }

  function updateZoomLevel() {
    zoomLevel = Math.round(d3.zoomTransform(svg.node()).k * 100);
  }

  function update(event, source) {
    const duration = event?.altKey ? 2500 : 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    root.eachBefore(d => {
      d.y = d.depth * 180;
    });

    const node = gNode.selectAll("g")
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append("g")
      .attr("transform", d => `translate(${source.y0},${source.x0})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", handleNodeClick);

    nodeEnter.append("circle")
      .attr("r", 6)
      .attr("fill", d => d._children ? "#555" : "#999")
      .attr("stroke-width", 10);

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d._children ? -12 : 12)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d => d.data.OBJECTKEY || d.data.DISPLAY) // Prefer OBJECTKEY
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .attr("stroke", "white")
      .attr("paint-order", "stroke")
      .style("font-size", "14px");

    nodeEnter.filter(d => d.data.CONDITIONAL)
      .append("circle")
      .attr("r", 4)
      .attr("cx", d => d._children ? -20 : 20)
      .attr("fill", "red")
      .on("click", toggleConditional);

    nodeEnter.filter(d => d.showConditional)
      .append("text")
      .attr("dy", "1.31em")
      .attr("x", d => d._children ? -12 : 12)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d => d.data.CONDITIONAL)
      .attr("fill", "red")
      .style("font-size", "12px");

    const nodeUpdate = node.merge(nodeEnter).transition().duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    const nodeExit = node.exit().transition().duration(duration).remove()
      .attr("transform", d => `translate(${source.y},${source.x})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0);

    const link = gLink.selectAll("path")
      .data(links, d => d.target.id); // Change this line

    const linkEnter = link.enter().append("path")
      .attr("d", d => {
        const o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .attr("stroke", d => d.target.data.CONDITIONAL ? "red" : "#555") // Change this line
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    link.merge(linkEnter).transition().duration(duration)
      .attr("d", diagonal)
      .attr("stroke", d => d.target.data.CONDITIONAL ? "red" : "#555"); // Change this line

    link.exit().transition().duration(duration).remove()
      .attr("d", d => {
        const o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      });

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function toggleConditional(event, d) {
    event.stopPropagation();
    d.showConditional = !d.showConditional;
    update(event, d);
  }

  function zoomed(event) {
    g.attr('transform', event.transform);
  }

  onMount(() => {
    console.log(treeData);
    root = d3.hierarchy(treeData);
    
    tree = d3.tree().size([height - marginTop - marginBottom, width - marginRight - marginLeft]);
    diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    svg = d3.select("#tree-container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 14px sans-serif; user-select: none;");

    zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        zoomed(event);
        updateZoomLevel();
      });

    svg.call(zoom);

    g = svg.append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    gLink = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    gNode = g.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    root.x0 = height / 2;
    root.y0 = 0;
    i = 0; // Reset i before assigning ids
    root.descendants().forEach((d, index) => {
      d.id = index;
      d._children = d.children;
      if (d.depth && d.data.OBJECTKEY !== 'userarea') d.children = null;
    });

    update(null, root);

    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);
  });
</script>

<div id="tree-container">
  <div class="zoom-control-container">
    <ZoomControl {zoomLevel} on:zoom={handleZoom} />
  </div>
  <NodeDetail bind:node={selectedNode} bind:isOpen={isDetailOpen} />
</div>

<style>
  #tree-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  :global(svg) {
    border: 1px solid black;
  }

  .zoom-control-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
</style>