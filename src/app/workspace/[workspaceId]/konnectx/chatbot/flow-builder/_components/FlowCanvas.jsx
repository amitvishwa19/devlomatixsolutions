'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Save,
    ArrowLeft,
    Loader2,
    Send,
    Edit2,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useAction } from "@/hooks/use-action";
import { getBotDetails } from "../../_actions/get-bot-details";
import { saveBot } from "../../_actions/save-bot";
import { Skeleton } from "@/components/ui/skeleton";

import '@xyflow/react/dist/style.css';

const initialNodes = [
    {
        id: 'start_node',
        type: 'triggerNode',
        position: { x: 100, y: 100 },
        data: {
            label: 'Keyword Trigger',
            subType: 'keyword',
            type: 'keyword',
            keywords: 'hello, hi, start',
            configured: true
        }
    },
    {
        id: 'welcome_reply',
        type: 'messageNode',
        position: { x: 430, y: 100 },
        data: {
            label: 'Auto Reply',
            subType: 'textMessage',
            text: 'Hello! Thanks for messaging us. How can we help you today?',
            configured: true
        }
    }
];

const initialEdges = [
    {
        id: 'start_node-welcome_reply',
        source: 'start_node',
        target: 'welcome_reply',
        type: 'step',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
    }
];

let idCount = 1;
const getNextId = (type) => `${type}_${Date.now()}_${idCount++}`;

export const FlowCanvas = ({ flowId, standalone = false }) => {
    const params = useParams();
    const router = useRouter();
    const wsId = standalone ? params?.workspaceId : params?.workspaceId;

    const { screenToFlowPosition, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flowData, setFlowData] = useState(null);

    const [selectedNode, setSelectedNode] = useState(null);
    const [testMessage, setTestMessage] = useState('hello');
    const [testPreview, setTestPreview] = useState('');
    const [contextMenu, setContextMenu] = useState(null);

    const { execute: executeGetDetails } = useAction(getBotDetails, {
        onSuccess: (data) => {
            setFlowData(data.bot);
            const savedNodes = data.bot.nodes;
            const savedEdges = data.bot.edges;
            setNodes(savedNodes && Array.isArray(savedNodes) && savedNodes.length > 0 ? savedNodes : initialNodes);
            setEdges(savedEdges && Array.isArray(savedEdges) && savedEdges.length > 0 ? savedEdges : initialEdges);
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

    useEffect(() => {
        if (!flowId) {
            setNodes(initialNodes);
            setEdges(initialEdges);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        executeGetDetails({ workspaceId: wsId, id: flowId });
    }, [flowId, wsId]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            type: 'step',
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
        executeSaveBot({ workspaceId: wsId, id: flowId, nodes, edges });
    };

    const interpolatePreview = (text) => {
        return String(text || '')
            .replace(/\{\{\s*message\s*\}\}/g, testMessage)
            .replace(/\{\{\s*from\s*\}\}/g, '919999999999');
    };

    const runPreview = () => {
        const lower = testMessage.toLowerCase();
        const trigger = nodes.find((node) => {
            if (node.type !== 'triggerNode') return false;
            const keywords = String(node.data?.keywords || '')
                .split(',')
                .map((keyword) => keyword.trim().toLowerCase())
                .filter(Boolean);
            return keywords.some((keyword) => lower === keyword || lower.includes(keyword));
        });
        const fallback = nodes.find((node) => node.data?.isFallback && node.data?.text);
        let current = trigger || fallback;
        const replies = [];
        const visited = new Set();

        while (current && !visited.has(current.id) && visited.size < 15) {
            visited.add(current.id);
            if (current.type === 'messageNode') {
                if (current.data?.text) replies.push(interpolatePreview(current.data.text));
                if (current.data?.imageUrl) replies.push(`[Image] ${current.data.imageUrl}`);
                if (current.data?.templateName) replies.push(`[Template] ${current.data.templateName}`);
            }
            const edge = edges.find((item) => item.source === current.id);
            current = edge ? nodes.find((node) => node.id === edge.target) : null;
        }

        setTestPreview(replies.length > 0 ? replies.join('\n\n') : 'No reply matched this test message.');
    };

    if (isLoading) {
        return (
            <div className="flex-1 w-full h-full flex bg-background">
                <div className="w-80 border-r border-white/10 bg-background p-6 space-y-8">
                    <Skeleton className="h-8 w-32 bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5" />
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-24 bg-white/5" />
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full bg-white/5" />
                            <Skeleton className="h-16 w-full bg-white/5" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-20 bg-white/5" />
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full bg-white/5" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-6">
                        <Skeleton className="h-64 w-64 rounded-xl bg-white/5" />
                        <Skeleton className="h-4 w-48 bg-white/5" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full h-full flex bg-background relative overflow-hidden">
            <NodeSidebar />

            <div className="flex-1 relative h-full">
                <ReactFlow
                    nodes={nodes.map(n => ({ ...n, data: { ...n.data, setNodes, setEdges, onContextMenu: (e, id) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id }); } } }))}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={(e, node) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }); }}
                    onPaneClick={() => { setSelectedNode(null); setContextMenu(null); }}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-dot-white/[0.05]"
                    minZoom={0.2}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                        type: 'step',
                        style: { stroke: '#10b981', strokeWidth: 1 },
                        animated: true
                    }}
                >
                    <Background gap={14} size={1.5} className="opacity-[0.2]" />
                    <Controls className=" border rounded-md shadow-md " />
                    {/* <MiniMap
                        className="border rounded-md"
                        nodeColor={(n) => {
                            if (n.type === 'triggerNode') return '#f59e0b';
                            if (n.type === 'messageNode') return '#10b981';
                            return '#3b82f6';
                        }}
                        maskColor="rgba(0,0,0,0.5)"
                    /> */}

                    <Panel position="top-right" className="flex items-center gap-4 m-6">
                        <div className="flex flex-col items-end mr-4">
                            <h1 className="text-sm font-black text-white leading-none capitalize">
                                {flowData?.name || 'New Workflow'}
                            </h1>
                            <span className="text-xs font-bold text-emerald-500 text-xs text-xs flex items-center gap-1.5 pt-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Interactive Canvas
                            </span>
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}

                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={18} className="mr-2" />}
                            Sync Changes
                        </Button>
                    </Panel>



                    <Panel position="bottom-right" className="m-6 w-80">
                        <div className="rounded-xl border border-white/10 bg-card dark:bg-[#1e1e2e]/90 shadow-2xl backdrop-blur-md p-4 space-y-3">
                            <div>
                                <h3 className="text-xs font-black text-white text-xs text-xs">Test Auto Reply</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">Preview the reply without sending a WhatsApp message.</p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    className="h-9 bg-white/5 border-white/10 text-xs rounded-xl"
                                    placeholder="Incoming message"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={runPreview}
                                    className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90"
                                >
                                    <Send size={14} />
                                </Button>
                            </div>
                            {testPreview && (
                                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white whitespace-pre-wrap">
                                    {testPreview}
                                </div>
                            )}
                        </div>
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

                {contextMenu && (
                    <div
                        className="fixed z-50 bg-background border border-white/10 rounded shadow-lg py-1 min-w-[120px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <button
                            onClick={() => {
                                const node = nodes.find(n => n.id === contextMenu.nodeId);
                                if (node) setSelectedNode(node);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2"
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                deleteNode(contextMenu.nodeId);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2 text-rose-500"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};