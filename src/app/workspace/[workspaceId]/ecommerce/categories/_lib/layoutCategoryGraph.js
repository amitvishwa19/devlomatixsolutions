import dagre from '@dagrejs/dagre';
import { Position } from '@xyflow/react';

/**
 * Transforms raw categories & stores into a DAG with auto-calculated coordinates.
 * Supports horizontal (LR) and vertical (TB) auto-layout, plus branch collapse.
 */
export function buildCategoryGraph({
    categories = [],
    stores = [],
    direction = 'LR',
    collapsedNodes = new Set(),
    searchQuery = '',
    onAddSubcategory,
    onEditCategory,
    onDeleteCategory,
    onToggleCollapse
}) {
    const isHorizontal = direction === 'LR';
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Map parent -> children to know child counts and collapse descendants
    const childrenMap = new Map();
    categories.forEach(cat => {
        const parentKey = cat.parentId ? `category-${cat.parentId}` : (cat.storeId ? `store-${cat.storeId}` : 'root-ecommerce');
        if (!childrenMap.has(parentKey)) {
            childrenMap.set(parentKey, []);
        }
        childrenMap.get(parentKey).push(cat);
    });

    // Helper to find all hidden descendant IDs if an ancestor is collapsed
    const hiddenNodeIds = new Set();
    function markDescendantsHidden(parentKey) {
        const children = childrenMap.get(parentKey) || [];
        children.forEach(child => {
            const childKey = `category-${child.id}`;
            hiddenNodeIds.add(childKey);
            markDescendantsHidden(childKey);
        });
    }

    collapsedNodes.forEach(collapsedId => {
        markDescendantsHidden(collapsedId);
    });

    const rawNodes = [];
    const rawEdges = [];

    // 1. Root Ecommerce Node
    const rootId = 'root-ecommerce';
    rawNodes.push({
        id: rootId,
        type: 'categoryNode',
        data: {
            isRoot: true,
            label: 'Ecommerce Catalog',
            subtitle: 'Central Workspace Hub',
            color: '#6366f1',
            type: 'ROOT',
            productCount: categories.reduce((sum, c) => sum + (c.productCount || 0), 0),
            hasChildren: stores.length > 0 || categories.length > 0,
            childCount: stores.length,
            isCollapsed: collapsedNodes.has(rootId),
            direction,
            targetPosition,
            sourcePosition,
            onToggleCollapse: () => onToggleCollapse(rootId)
        }
    });

    // 2. Store Nodes
    const storesWithCats = stores.length > 0 ? stores : [{ id: 'default-store', name: 'Main Store' }];
    storesWithCats.forEach(store => {
        const storeKey = `store-${store.id}`;
        if (hiddenNodeIds.has(storeKey)) return;

        const storeCats = categories.filter(c => c.storeId === store.id && !c.parentId);
        const storeTotalProducts = categories
            .filter(c => c.storeId === store.id)
            .reduce((acc, c) => acc + (c.productCount || 0), 0);

        rawNodes.push({
            id: storeKey,
            type: 'categoryNode',
            data: {
                isStore: true,
                store,
                label: store.name,
                subtitle: 'Store Channel',
                color: '#8b5cf6',
                type: 'STORE',
                productCount: storeTotalProducts,
                hasChildren: storeCats.length > 0,
                childCount: storeCats.length,
                isCollapsed: collapsedNodes.has(storeKey),
                direction,
                targetPosition,
                sourcePosition,
                onToggleCollapse: () => onToggleCollapse(storeKey),
                onAddSubcategory: () => onAddSubcategory?.({ storeId: store.id })
            }
        });

        // Edge: Root -> Store
        rawEdges.push({
            id: `edge-${rootId}-${storeKey}`,
            source: rootId,
            target: storeKey,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2, opacity: 0.75 }
        });
    });

    // 3. Category Nodes
    const catMap = new Map(categories.map(c => [c.id, c]));

    categories.forEach(cat => {
        const nodeKey = `category-${cat.id}`;
        if (hiddenNodeIds.has(nodeKey)) return;

        const directChildren = childrenMap.get(nodeKey) || [];
        const isMatched = searchQuery
            ? (cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               cat.slug.toLowerCase().includes(searchQuery.toLowerCase()))
            : null;

        rawNodes.push({
            id: nodeKey,
            type: 'categoryNode',
            data: {
                category: cat,
                label: cat.name,
                slug: cat.slug,
                description: cat.description,
                color: cat.color || '#3b82f6',
                type: cat.type || 'GENERAL',
                productCount: cat.productCount || 0,
                hasChildren: directChildren.length > 0,
                childCount: directChildren.length,
                isCollapsed: collapsedNodes.has(nodeKey),
                isSearchMatched: isMatched,
                direction,
                targetPosition,
                sourcePosition,
                onToggleCollapse: () => onToggleCollapse(nodeKey),
                onAddSubcategory: () => onAddSubcategory?.(cat),
                onEdit: () => onEditCategory?.(cat),
                onDelete: () => onDeleteCategory?.(cat)
            }
        });

        // Determine edge source
        let sourceKey = 'root-ecommerce';
        if (cat.parentId && catMap.has(cat.parentId)) {
            sourceKey = `category-${cat.parentId}`;
        } else if (cat.storeId) {
            sourceKey = `store-${cat.storeId}`;
        }

        if (!hiddenNodeIds.has(sourceKey)) {
            rawEdges.push({
                id: `edge-${sourceKey}-${nodeKey}`,
                source: sourceKey,
                target: nodeKey,
                type: 'smoothstep',
                animated: false,
                style: {
                    stroke: cat.color || '#3b82f6',
                    strokeWidth: 2,
                    opacity: 0.65
                }
            });
        }
    });

    // 4. Run Dagre Layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: isHorizontal ? 100 : 70,
        nodesep: isHorizontal ? 40 : 50
    });

    rawNodes.forEach(node => {
        const isRoot = node.data?.isRoot;
        const isStore = node.data?.isStore;
        const width = isRoot ? 220 : isStore ? 240 : 260;
        const height = isRoot ? 85 : isStore ? 95 : 125;
        dagreGraph.setNode(node.id, { width, height });
    });

    rawEdges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = rawNodes.map(node => {
        const nodeWithPos = dagreGraph.node(node.id);
        const isRoot = node.data?.isRoot;
        const isStore = node.data?.isStore;
        const width = isRoot ? 220 : isStore ? 240 : 260;
        const height = isRoot ? 85 : isStore ? 95 : 125;

        return {
            ...node,
            position: {
                x: nodeWithPos ? nodeWithPos.x - width / 2 : 0,
                y: nodeWithPos ? nodeWithPos.y - height / 2 : 0
            }
        };
    });

    return { nodes: layoutedNodes, edges: rawEdges };
}
