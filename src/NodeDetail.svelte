<script>
    import { fly } from 'svelte/transition';
    import Prism from 'prismjs';
    import 'prismjs/components/prism-json';
    import 'prismjs/themes/prism-tomorrow.css'; // You can choose a different theme if you prefer
    
    export let node = null;
    export let isOpen = false;

    function getNodeProperties(node) {
        if (!node || !node.data) return [];
        return Object.entries(node.data)
            .filter(([key, value]) => key !== 'children' && typeof value !== 'object')
            .map(([key, value]) => ({ key, value: value?.toString() || '' }));
    }

    function prettyPrintJSON(obj) {
        const replacer = (key, value) => {
            if (key === 'children') {
                return '[...]';
            }
            if (key === 'SUB' && Array.isArray(value)) {
                return value.map(item => {
                    const { SUB, ...rest } = item;
                    return { ...rest, SUB: SUB ? '[...]' : undefined };
                });
            }
            return value;
        };
        return JSON.stringify(obj, replacer, 2);
    }

    $: nodeJSON = node ? prettyPrintJSON(node.data) : '';
    $: nodeProperties = node ? getNodeProperties(node) : [];
    $: highlightedJSON = node ? Prism.highlight(nodeJSON, Prism.languages.json, 'json') : '';
</script>

{#if isOpen && node}
    <div class="node-detail" transition:fly={{ x: 300, duration: 300 }}>
        <h2>{node.data.OBJECTKEY || node.data.DISPLAY || 'Node Details'}</h2>
        <table>
            <thead>
                <tr>
                    <th>Field</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {#each nodeProperties as { key, value }}
                    <tr>
                        <td class="field-name">{key}</td>
                        <td>{value}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <button on:click={() => isOpen = false}>Close</button>
        <h3>Node JSON:</h3>
        <pre><code class="language-json">{@html highlightedJSON}</code></pre>
    </div>
{/if}

<style>
    .node-detail {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100%;
        background: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        padding: 20px;
        overflow-y: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        vertical-align: top; /* Align cell content to the top */
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }

    .field-name {
        font-weight: bold;
        font-size: 0.9em; /* Smaller font size */
        text-align: right; /* Align text to the right */
    }

    button {
        display: block;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    pre {
        background-color: #2d2d2d; /* Dark background for better contrast */
        padding: 10px;
        border-radius: 5px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.5;
        text-align: left; /* Align JSON text to the left */
    }

    code {
        font-family: 'Courier New', Courier, monospace;
        display: block; /* Ensure the code block takes full width */
        text-align: left; /* Explicitly set left alignment for the code */
    }
</style>