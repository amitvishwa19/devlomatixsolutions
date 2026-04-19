'use client';

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    Panel,
    MiniMap
} from '@xyflow/react';
import { nodeTypes } from './Nodes';
import { PropertyPanel } from './PropertyPanel';
import { NodeSidebar } from './NodeSidebar';
import { Button } from '@/components/ui/button';
import { 
    Save, 
    Play, 
    LayoutTemplate, 
    ArrowLeft, 
    Settings, 
    Loader2, 
    Download,
    Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useAction } from "@/hooks/use-action";
import { getBotDetails } from "../../chatbot/_actions/get-bot-details";
import { saveBot } from "../../chatbot/_actions/save-bot";

import '@xyflow/react/dist/style.css';

const initialNodes = [
    {
        id: 'start_node',
        type: 'triggerNode',
        position: { x: 100, y: 100 },
        data: { label: 'Welcome Trigger', type: 'welcome', configured: true }
    }
];

let idCount = 1;
const getNextId = (type) => `${type}_${Date.now()}_${idCount++}`;

export const FlowCanvas = ({ flowId }) => {
    const { workspaceId } = useParams();
    const router = useRouter();
    
    const { screenToFlowPosition, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flowData, setFlowData] = useState(null);

    const [selectedNode, setSelectedNode] = useState(null);

    const { execute: executeGetDetails } = useAction(getBotDetails, {
        onSuccess: (data) => {
            setFlowData(data.bot);
            const savedNodes = data.bot.nodes;
            const savedEdges = data.bot.edges;
            setNodes(savedNodes && Array.isArray(savedNodes) && savedNodes.length > 0 ? savedNodes : initialNodes);
            setEdges(savedEdges || []);
            setTimeout(() => fitView({ padding: 0.2 }), 100);
            setIsLoading(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to load workflow data");
            setIsLoading(false);
        }
    });

    const { execute: executeSaveBot, isLoading: isSaving } = useAction(saveBot, {
        onSuccess: () => {
            toast.success("Workflow saved successfully");
        },
        onError: (err) => toast.error(err || "Save failed")
    });

    // Load Flow Data
    useEffect(() => {
        if (!flowId) {
            setNodes(initialNodes);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        executeGetDetails({ workspaceId, id: flowId });
    }, [flowId, workspaceId]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 }
        }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const nodeDataStr = event.dataTransfer.getData('application/reactflow');
            if (!nodeDataStr) return;

            const parsedNode = JSON.parse(nodeDataStr);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getNextId(parsedNode.type),
                type: parsedNode.type,
                position,
                data: {
                    label: parsedNode.label,
                    subType: parsedNode.subType || parsedNode.name,
                    configured: false,
                    ...parsedNode.properties?.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {})
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = (e, node) => {
        setSelectedNode(node);
    };

    const deleteNode = useCallback(
        (nodeId) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            setSelectedNode(null);
            toast.success("Node removed");
        },
        [setNodes, setEdges]
    );

    const updateNodeData = (nodeId, dataUpdate) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    const updatedNode = { ...node, data: { ...node.data, ...dataUpdate } };
                    if (selectedNode && selectedNode.id === nodeId) {
                        setSelectedNode(updatedNode);
                    }
                    return updatedNode;
                }
                return node;
            })
        );
    };

    const handleSave = () => {
        if (!flowId) return;
        executeSaveBot({ workspaceId, id: flowId, nodes, edges });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0f0f1a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading Canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full h-full flex bg-[#0f0f1a] relative overflow-hidden">
            <NodeSidebar />

            <div className="flex-1 relative h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={() => setSelectedNode(null)}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-dot-white/[0.05]"
                    minZoom={0.2}
                    maxZoom={1.5}
                >
                    <Background color="#10b981" gap={20} size={1} className="opacity-10" />
                    <Controls className="bg-[#1e1e2e] border-white/10 rounded-xl shadow-2xl [&>button]:border-white/5" />
                    <MiniMap 
                        className="bg-[#1e1e2e] border-white/10 rounded-xl shadow-2xl"
                        nodeColor={(n) => {
                            if (n.type === 'triggerNode') return '#f59e0b';
                            if (n.type === 'messageNode') return '#10b981';
                            return '#3b82f6';
                        }}
                        maskColor="rgba(0,0,0,0.5)"
                    />

                    {/* Top Panel Actions */}
                    <Panel position="top-right" className="flex items-center gap-4 m-6">
                        <div className="flex flex-col items-end mr-4">
                            <h1 className="text-sm font-black text-white leading-none capitalize">
                                {flowData?.name || 'New Workflow'}
                            </h1>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Interactive Canvas
                            </span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 h-10 px-6 rounded-xl font-bold transition-all active:scale-95"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={18} className="mr-2" />}
                            Sync Changes
                        </Button>
                    </Panel>

                    {/* Bottom Utility Panel */}
                    <Panel position="bottom-left" className="m-6 flex gap-2">
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/wa/chatbot`)}
                            className="bg-white/5 border-white/10 text-white rounded-xl h-10 px-4 font-bold text-[10px] uppercase hover:bg-white/10"
                        >
                            <ArrowLeft size={14} className="mr-2" /> Exit Builder
                        </Button>
                    </Panel>
                </ReactFlow>

                {selectedNode && (
                    <div className="absolute right-0 top-0 bottom-0 z-50">
                        <PropertyPanel 
                            selectedNode={selectedNode}
                            updateNodeData={updateNodeData}
                            deleteNode={deleteNode}
                            closePanel={() => setSelectedNode(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
