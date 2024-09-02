import htgData from './htg.json';

export async function processData() {
    // Check if tree_structure exists in localStorage
    const storedTreeStructure = localStorage.getItem('tree_structure');
    if (storedTreeStructure) {
        console.log('Using existing tree_structure from localStorage');
        return JSON.parse(storedTreeStructure);
    }

    console.log('Creating new tree_structure');

    // Create an object to store all nodes and their children
    const allNodes = {};

    const htgObjects = htgData.RCONFIG.OBJECT;

    // Process the OBJECT section of htg.json
    htgObjects.forEach(obj => {
        const key = obj.OBJECTKEY;
        const children = obj.SUB ? obj.SUB.map(sub => sub.OBJECTKEY) : [];
        allNodes[key] = children;
    });

    console.log(`Number of top-level nodes: ${Object.keys(allNodes).length}`);

    // Count total nodes including children
    const totalNodes = Object.entries(allNodes).reduce((total, [node, children]) => total + 1 + children.length, 0);
    console.log(`Total number of nodes including children: ${totalNodes}`);

    // The tree building function
    function buildTree(key) {
        if (key in allNodes) {
            return Object.fromEntries(allNodes[key].map(child => [child, buildTree(child)]));
        }
        return {};
    }

    // Create the tree structure with 'userarea' as the root
    const treeStructure = {
        "userarea": buildTree("userarea")
    };

    // Save the tree structure to localStorage
    localStorage.setItem('tree_structure', JSON.stringify(treeStructure));

    return treeStructure;
}