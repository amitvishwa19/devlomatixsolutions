'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    useReactFlow,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CategoryFlowNode } from './CategoryFlowNode';
import { buildCategoryGraph } from '../_lib/layoutCategoryGraph';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Maximize2,
    ArrowRightLeft,
    Layers,
    FolderPlus,
    ChevronsDown,
    ChevronsRight,
    Sparkles,
    RefreshCw
} from 'lucide-react';

const nodeTypes = {
    categoryNode: CategoryFlowNode
};

function FlowCanvasContent({
    categories = [],
    stores = [],
    searchQuery = '',
    onAddCategory,
    onAddSubcategory,
    onEditCategory,
    onDeleteCategory
}) {
    const { fitView } = useReactFlow();
    const [direction, setDirection] = useState('LR'); // 'LR' | 'TB'
    const [collapsedNodes, setCollapsedNodes] = useState(() => new Set());
    const isFirstLayout = useRef(true);

    const toggleNodeCollapse = useCallback((nodeId) => {
        setCollapsedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        setCollapsedNodes(new Set());
    }, []);

    const collapseAll = useCallback(() => {
        const toCollapse = new Set();
        // Collapse stores and categories that have children
        stores.forEach(s => toCollapse.add(`store-${s.id}`));
        categories.forEach(c => toCollapse.add(`category-${c.id}`));
        setCollapsedNodes(toCollapse);
    }, [stores, categories]);

    // Build DAG with dagre layout
    const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
        return buildCategoryGraph({
            categories,
            stores,
            direction,
            collapsedNodes,
            searchQuery,
            onAddSubcategory: (target) => {
                // target can be a category object or { storeId }
                if (target?.id) {
                    onAddSubcategory?.(target);
                } else if (target?.storeId) {
                    onAddCategory?.(target.storeId);
                } else {
                    onAddCategory?.();
                }
            },
            onEditCategory,
            onDeleteCategory,
            onToggleCollapse: toggleNodeCollapse
        });
    }, [
        categories,
        stores,
        direction,
        collapsedNodes,
        searchQuery,
        onAddSubcategory,
        onAddCategory,
        onEditCategory,
        onDeleteCategory,
        toggleNodeCollapse
    ]);

    const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

    // Sync computed elements into React Flow state
    useEffect(() => {
        setNodes(computedNodes);
        setEdges(computedEdges);

        if (isFirstLayout.current && computedNodes.length > 0) {
            isFirstLayout.current = false;
            const timer = setTimeout(() => {
                fitView({ padding: 0.25, duration: 800 });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [computedNodes, computedEdges, fitView, setNodes, setEdges]);

    const handleFitView = () => {
        fitView({ padding: 0.25, duration: 600 });
    };

    const toggleDirection = () => {
        setDirection(d => (d === 'LR' ? 'TB' : 'LR'));
        setTimeout(() => {
            fitView({ padding: 0.25, duration: 600 });
        }, 150);
    };

    const totalProducts = useMemo(() => {
        return categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    }, [categories]);

    return (
        <div className="relative w-full h-[720px] rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
            {/* Top Toolbar Panel */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                {/* Left: Hierarchy Stats Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-background/80 backdrop-blur-md shadow-md pointer-events-auto">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Hierarchy Canvas</span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                        {categories.length} Categories
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                        {stores.length} Stores
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                        {totalProducts} Total Items
                    </Badge>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={toggleDirection}
                        className="h-8 text-xs font-semibold bg-background/80 backdrop-blur-md border-border/50 gap-1.5 shadow-sm hover:bg-muted/80"
                        title={direction === 'LR' ? 'Switch to Vertical Tree (Top-to-Bottom)' : 'Switch to Horizontal Tree (Left-to-Right)'}
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                        {direction === 'LR' ? 'Horizontal (L-R)' : 'Vertical (T-B)'}
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={expandAll}
                        className="h-8 text-xs font-semibold bg-background/80 backdrop-blur-md border-border/50 gap-1.5 shadow-sm hover:bg-muted/80"
                        title="Expand all branches"
                    >
                        <ChevronsDown className="w-3.5 h-3.5 text-emerald-500" />
                        Expand All
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={collapseAll}
                        className="h-8 text-xs font-semibold bg-background/80 backdrop-blur-md border-border/50 gap-1.5 shadow-sm hover:bg-muted/80"
                        title="Collapse all branches"
                    >
                        <ChevronsRight className="w-3.5 h-3.5 text-muted-foreground" />
                        Collapse All
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleFitView}
                        className="h-8 text-xs font-semibold bg-background/80 backdrop-blur-md border-border/50 gap-1.5 shadow-sm hover:bg-muted/80"
                        title="Fit complete tree in screen"
                    >
                        <Maximize2 className="w-3.5 h-3.5 text-primary" />
                        Fit Canvas
                    </Button>
                </div>
            </div>

            {/* React Flow Canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                minZoom={0.2}
                maxZoom={1.75}
                className="bg-dot-pattern"
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    color="currentColor"
                    gap={20}
                    size={1}
                    className="text-border/30 opacity-40"
                />
                <Controls
                    showInteractive={false}
                    className="!bg-background/90 !border-border/40 !backdrop-blur-md !rounded-lg !shadow-lg"
                />
                <MiniMap
                    nodeColor={(n) => n.data?.color || '#3b82f6'}
                    nodeStrokeWidth={2}
                    maskColor="rgba(0, 0, 0, 0.4)"
                    className="!bg-background/80 !border-border/40 !backdrop-blur-md !rounded-lg !shadow-lg"
                    zoomable
                    pannable
                />
            </ReactFlow>
        </div>
    );
}

export function CategoryFlowCanvas(props) {
    return (
        <ReactFlowProvider>
            <FlowCanvasContent {...props} />
        </ReactFlowProvider>
    );
}
