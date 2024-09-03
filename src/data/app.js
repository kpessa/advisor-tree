import htgData from './htg.json';

export async function processData() {
    console.log('Creating new tree_structure');

    const htgObjects = htgData.RCONFIG.OBJECT;

    // Find the userarea object
    const userarea = htgObjects.find(obj => obj.OBJECTKEY === 'userarea');

    if (!userarea) {
        console.error('userarea not found');
        return null;
    }

    // Recursive function to build the complete tree
    function buildTree(obj) {
        const children = obj.SUB ? obj.SUB.map(sub => {
            const childObj = htgObjects.find(o => o.OBJECTKEY === sub.OBJECTKEY);
            return childObj ? buildTree(childObj) : null;
        }).filter(Boolean) : [];

        return {
            ...obj,
            children: children.length > 0 ? children : undefined
        };
    }

    // Create the tree structure with 'userarea' as the root
    const treeStructure = buildTree(userarea);

    console.log(`Tree structure size: ${JSON.stringify(treeStructure).length} characters`);

    // Log the first few levels of the tree structure for debugging
    console.log(JSON.stringify(treeStructure, null, 2).substring(0, 1000) + '...');

    return treeStructure;
}