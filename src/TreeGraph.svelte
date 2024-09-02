<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import treeStructure from './tree_structure.json';

  function transformData(data) {
    const result = {
      name: Object.keys(data)[0],
      children: []
    };
    
    function recurse(obj, current) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          const child = { name: key, children: [] };
          current.children.push(child);
          recurse(obj[key], child);
        }
      }
      if (current.children.length === 0) {
        delete current.children;
      }
    }
    
    recurse(data[result.name], result);
    return result;
  }

  let data = transformData(treeStructure);

  let root, tree, diagonal, svg, gLink, gNode;
  const width = 1200; // Increase the width
  const height = 800; // Set a fixed height
  const marginTop = 20;
  const marginRight = 120; // Increase right margin for labels
  const marginBottom = 20;
  const marginLeft = 120; // Increase left margin for labels

  let zoom;
  let g;

  function update(event, source) {
    const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
    const nodes = root.descendants().reverse();
    const links = root.links();

    // Compute the new tree layout.
    tree(root);

    // Normalize for fixed-depth.
    root.descendants().forEach((d) => {
      d.y = d.depth * 180; // Increase horizontal spacing between levels
    });

    // Compute the new tree layout.
    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const newHeight = right.x - left.x + marginTop + marginBottom;

    const transition = svg.transition()
        .duration(duration)
        .attr("height", newHeight)
        .attr("viewBox", [-marginLeft, left.x - marginTop, width, newHeight])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

    // Update the nodes…
    const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children;
          update(event, d);
        });

    nodeEnter.append("circle")
        .attr("r", 6) // Slightly larger circles
        .attr("fill", d => d._children ? "#555" : "#999")
        .attr("stroke-width", 10);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d._children ? -12 : 12) // Move text slightly further from node
        .attr("text-anchor", d => d._children ? "end" : "start")
        .text(d => d.data.name)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white")
        .attr("paint-order", "stroke")
        .style("font-size", "14px"); // Increase font size

    // Transition nodes to their new position.
    const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    // Update the links…
    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function zoomed(event) {
    g.attr('transform', event.transform);
  }

  onMount(() => {
    root = d3.hierarchy(data);
    
    tree = d3.tree().size([height - marginTop - marginBottom, width - marginRight - marginLeft]);
    diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    svg = d3.select("#tree-container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 14px sans-serif; user-select: none;")
      .style("border", "2px solid black"); // Add this line for the border

    // Add a background rectangle
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");

    // Add zoom behavior
    zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr('transform', event.transform);
        updateViewBox(event.transform);
      });

    svg.call(zoom);

    // Add a new group for the entire graph
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
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    update(null, root);

    // Center the graph
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);
  });

  // Add this new function to update the viewBox
  function updateViewBox(transform) {
    const { x, y, k } = transform;
    const newWidth = width / k;
    const newHeight = height / k;
    svg.attr("viewBox", `${-x / k} ${-y / k} ${newWidth} ${newHeight}`);
  }
</script>

<div id="tree-container"></div>

<style>
  #tree-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>