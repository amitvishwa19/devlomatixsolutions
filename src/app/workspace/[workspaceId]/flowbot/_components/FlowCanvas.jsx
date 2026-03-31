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
    Panel
} from '@xyflow/react';
import { TriggerNode, ActionNode } from './Nodes';
import { PropertyPanel } from './PropertyPanel';
import { ChatPreview } from './ChatPreview';
import { Button } from '@/components/ui/button';
import { Save, Play, RefreshCw, LayoutTemplate, ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { useParams, useRouter } from 'next/navigation';

import '@xyflow/react/dist/style.css';

const initialNodes = [
    {
        id: 'node_0',
        type: 'triggerNode',
        position: { x: 250, y: 150 },
        data: { label: 'Catch Webhook', subType: 'webhook', status: 'active', configured: true }
    }
];

let idCount = 1;
const getNextId = () => `node_${Date.now()}_${idCount++}`;

export const FlowCanvas = () => {
    const { workspaceId, flowbotId } = useParams();
    const router = useRouter();
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [workflowData, setWorkflowData] = useState(null);

    // Panel State
    const [selectedNode, setSelectedNode] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        const fetchFlow = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`/api/workspace/${workspaceId}/flowbot/${flowbotId}`);
                if (res.data?.success && res.data.data) {
                    const data = res.data.data;
                    setWorkflowData(data);

                    // If nodes exist in DB, use them; otherwise fallback to initialNodes
                    setNodes(data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0 ? data.nodes : initialNodes);
                    setEdges(data.edges || []);

                    // Fit view after a small delay to ensure nodes are rendered
                    setTimeout(() => fitView({ padding: 0.2 }), 100);
                }
            } catch (err) {
                toast.error("Failed to load flowbot data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFlow();
    }, [workspaceId, flowbotId, setNodes, setEdges, fitView]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            type: 'step',
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
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

            let parsedNode;
            try {
                parsedNode = JSON.parse(nodeDataStr);
            } catch (e) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getNextId(),
                type: parsedNode.type,
                position,
                data: {
                    label: `New ${parsedNode.label}`,
                    subType: parsedNode.subType,
                    description: parsedNode.description,
                    configured: false
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = (e, node) => {
        // Prevent opening side modal on right-click context menu triggers
        if (e.type === 'contextmenu' || e.button === 2) return;
        setSelectedNode(node);
    };

    const onNodesDelete = useCallback(
        (deleted) => {
            const deletedIds = deleted.map((n) => n.id);
            if (selectedNode && deletedIds.includes(selectedNode.id)) {
                setSelectedNode(null);
            }
        },
        [selectedNode]
    );

    const deleteNode = useCallback(
        (nodeId) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            setSelectedNode(null);
            toast.success("Node deleted");
        },
        [setNodes, setEdges]
    );

    // Node Types Injection to pass delete function
    const nodeTypes = useMemo(() => ({
        triggerNode: (props) => <TriggerNode {...props} data={{ ...props.data, onDelete: deleteNode }} />,
        actionNode: (props) => <ActionNode {...props} data={{ ...props.data, onDelete: deleteNode }} />,
    }), [deleteNode]);

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

    const handleSave = async () => {
        const toastId = toast.loading("Saving changes...");
        try {
            await axios.put(`/api/workspace/${workspaceId}/flowbot/${flowbotId}`, {
                nodes,
                edges
            });
            toast.success("Workflow saved successfully", { id: toastId });
        } catch (e) {
            toast.error("Failed to save workflow", { id: toastId });
        }
    };

    const handleTest = async () => {
        setIsExecuting(true);
        const toastId = toast.loading("Saving and Executing Workflow...");

        try {
            // 1. Auto-save current canvas state before execution
            await axios.put(`/api/workspace/${workspaceId}/flowbot/${flowbotId}`, {
                nodes,
                edges
            });

            // 2. Prepare payload and execute
            const payload = {
                nodes,
                edges,
                payload: {
                    user: "System Test",
                    timestamp: new Date().toISOString(),
                    action: "Canvas Direct Test"
                }
            };
            const res = await axios.post(`/api/workspace/${workspaceId}/flowbot/${flowbotId}/execute`, payload);

            if (res.data.success) {
                toast.success("Execution Complete - Check console for logs!", { id: toastId });
                console.log("[FLOWBOT_EXECUTION_LOGS]", res.data.logs);
            } else {
                toast.error(res.data.message || "Execution Failed", { id: toastId });
            }
        } catch (e) {
            toast.error("Workflow Test Failed - Error Saving or Executing", { id: toastId });
        } finally {
            setIsExecuting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Hydrating Canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full h-full flex bg-muted/5 relative overflow-hidden " ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onNodesDelete={onNodesDelete}
                onPaneClick={() => setSelectedNode(null)}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{ type: 'step' }}
                fitView
                className="bg-grid-white/[0.02]"
                minZoom={0.1}
                maxZoom={1.5}
            >
                <Background color="hsl(var(--primary))" gap={16} size={1} className="opacity-20" />
                <Controls className="bg-card border-border/50 shadow-lg rounded-xl overflow-hidden [&>button]:border-b-border/40 [&>button:hover]:bg-primary/10" />

                <Panel position="top-left" className="m-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/workspace/${workspaceId}/flowbot`)}
                        className="bg-card/80 backdrop-blur-md rounded-xl border-border/50 font-bold text-[10px] text-muted-foreground shadow-xl hover:text-primary transition-all active:scale-95 px-4"
                    >
                        <ArrowLeft size={14} className="mr-2" /> Back to Dashboard
                    </Button>
                </Panel>

                <Panel position="top-right" className="flex items-center gap-3 m-6">
                    <div className="flex flex-col items-end mr-4">
                        <h1 className="text-xs font-black text-foreground leading-none">{workflowData?.name}</h1>
                        <span className="text-[9px] font-bold text-primary opacity-60 uppercase tracking-widest">Editing Live</span>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => fitView({ padding: 0.2, duration: 800 })} className="bg-card rounded-lg border-border/50 font-bold text-[10px] text-muted-foreground shadow-sm hover:text-primary h-9">
                        <LayoutTemplate size={14} className="mr-2" /> Format
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button variant="default" size="sm" onClick={handleSave} className="rounded-lg font-bold text-[10px] shadow-sm bg-primary/20 text-primary hover:bg-primary/30 h-9 px-4">
                        <Save size={14} className="mr-2" /> Save Draft
                    </Button>
                    <Button variant="default" size="sm" onClick={handleTest} disabled={isExecuting} className="rounded-lg font-bold text-[10px] shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px] h-9 px-6 transition-all active:scale-95">
                        {isExecuting ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />}
                        {isExecuting ? "Executing..." : "Test Run"}
                    </Button>
                </Panel>
            </ReactFlow>

            {selectedNode && (
                <PropertyPanel
                    selectedNode={selectedNode}
                    updateNodeData={updateNodeData}
                    deleteNode={deleteNode}
                    closePanel={() => setSelectedNode(null)}
                />
            )}

            {nodes.find(n => n.data.subType === 'chat') && (
                <ChatPreview
                    flowbotId={flowbotId}
                    workspaceId={workspaceId}
                    chatNode={nodes.find(n => n.data.subType === 'chat')}
                    nodes={nodes}
                    edges={edges}
                />
            )}
        </div>
    );
};
