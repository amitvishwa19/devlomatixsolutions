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
    Panel
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { nodeTypes } from './Nodes';
import { PropertyPanel } from './PropertyPanel';
import { NodeSidebar } from './NodeSidebar';
import { DeletableEdge } from './DeletableEdge';
import { WhatsAppSimulator } from './WhatsAppSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Save,
    Loader2,
    Send,
    Edit2,
    Trash2,
    Smartphone,
    Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useAction } from "@/hooks/use-action";
import { getBotDetails } from "../../_actions/get-bot-details";
import { saveBot } from "../../_actions/save-bot";
import { Skeleton } from "@/components/ui/skeleton";

import '@xyflow/react/dist/style.css';

const edgeTypes = {
    step: DeletableEdge,
};

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction, ranksep: 90, nodesep: 45 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 230, height: 130 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 115,
                y: nodeWithPosition.y - 65,
            },
        };
    });

    return { nodes: newNodes, edges };
};

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
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [testMessage, setTestMessage] = useState('hello');
    const [testPreview, setTestPreview] = useState('');
    const [contextMenu, setContextMenu] = useState(null);

    const handleHighlightNode = useCallback((nodeId) => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === nodeId
                }
            }))
        );
    }, [setNodes]);

    const handleAutoLayout = useCallback((direction = 'LR') => {
        const layouted = getLayoutedElements(nodes, edges, direction);
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);
        setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 50);
        toast.success("Graph neatly organized!");
    }, [nodes, edges, setNodes, setEdges, fitView]);

    const { execute: executeGetDetails } = useAction(getBotDetails, {
        onSuccess: (data) => {
            setFlowData(data.bot);
            const savedNodes = data.bot.nodes;
            const savedEdges = data.bot.edges;
            setNodes(savedNodes && Array.isArray(savedNodes) && savedNodes.length > 0 ? savedNodes : initialNodes);
            setEdges(savedEdges && Array.isArray(savedEdges) && savedEdges.length > 0 ? savedEdges : initialEdges);
            setTimeout(() => fitView({ padding: 0.25, maxZoom: 0.95 }), 100);
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

    const BRANCH_COLORS = [
        '#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316'
    ];

    const onConnect = useCallback(
        (params) => {
            const sourceNode = nodes.find(n => n.id === params.source);
            let edgeLabel = undefined;
            let strokeColor = '#10b981';

            if (sourceNode) {
                const subType = sourceNode.data?.subType || sourceNode.data?.type || sourceNode.type;
                const isCondition = subType === 'condition' || subType === 'conditionNode' || sourceNode.type === 'condition';
                const isTrigger = sourceNode.type === 'triggerNode' || subType === 'keyword' || subType === 'keywordTrigger' || subType === 'welcome';
                const isKeywordTrigger = isTrigger && subType !== 'welcome';

                if (isCondition) {
                    const conditions = sourceNode.data?.conditions;
                    if (Array.isArray(conditions) && conditions.length > 0) {
                        const condIndex = conditions.findIndex((c, i) => (c.id || `cond_${i}`) === params.sourceHandle);
                        if (condIndex !== -1) {
                            edgeLabel = conditions[condIndex].label || `Result ${condIndex + 1}`;
                            strokeColor = BRANCH_COLORS[condIndex % BRANCH_COLORS.length];
                        } else if (params.sourceHandle === 'else' || params.sourceHandle === 'false' || params.sourceHandle === 'default') {
                            edgeLabel = sourceNode.data?.elseLabel || 'Else / Fallback';
                            strokeColor = '#f43f5e';
                        }
                    } else {
                        if (params.sourceHandle === 'true') {
                            edgeLabel = 'True';
                            strokeColor = '#10b981';
                        } else if (params.sourceHandle === 'false') {
                            edgeLabel = 'False';
                            strokeColor = '#f43f5e';
                        }
                    }
                } else if (isKeywordTrigger) {
                    const keywordList = Array.isArray(sourceNode.data?.keywordList) && sourceNode.data.keywordList.length > 0
                        ? sourceNode.data.keywordList
                        : String(sourceNode.data?.keywords || sourceNode.data?.keyword || '')
                            .split(',')
                            .map(k => k.trim())
                            .filter(Boolean);

                    if (keywordList.length > 0) {
                        let kwIdx = -1;
                        if (params.sourceHandle?.startsWith('kw_')) {
                            kwIdx = parseInt(params.sourceHandle.replace('kw_', ''), 10);
                        } else if (params.sourceHandle) {
                            kwIdx = keywordList.findIndex(k => k.toLowerCase() === params.sourceHandle.toLowerCase());
                        }

                        if (kwIdx !== -1 && keywordList[kwIdx]) {
                            edgeLabel = keywordList[kwIdx];
                            strokeColor = BRANCH_COLORS[kwIdx % BRANCH_COLORS.length];
                        } else if (keywordList.length === 1) {
                            edgeLabel = keywordList[0];
                            strokeColor = '#f59e0b';
                        }
                    }
                } else if (sourceNode.type === 'messageNode' || sourceNode.type === 'message') {
                    const targetNode = nodes.find(n => n.id === params.target);
                    if (targetNode && (targetNode.type === 'messageNode' || targetNode.type === 'message')) {
                        edgeLabel = 'On Reply';
                        strokeColor = '#38bdf8';
                    }
                }
            }

            setEdges((eds) => addEdge({
                ...params,
                type: 'step',
                animated: true,
                label: edgeLabel,
                data: { label: edgeLabel },
                style: { stroke: strokeColor, strokeWidth: 2 }
            }, eds));
        },
        [nodes, setEdges],
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

            const defaultProps = parsedNode.properties?.reduce((acc, p) => ({ 
                ...acc, 
                [p.name]: typeof p.default === 'object' && p.default !== null ? JSON.parse(JSON.stringify(p.default)) : p.default 
            }), {}) || {};

            const isCondition = parsedNode.subType === 'condition' || parsedNode.name === 'condition';
            if (isCondition && !defaultProps.conditions) {
                defaultProps.conditions = [
                    { id: 'cond_1', label: 'Result 1 (Option A)', variable: 'last_response', operation: 'contains', value: '1' },
                    { id: 'cond_2', label: 'Result 2 (Option B)', variable: 'last_response', operation: 'contains', value: '2' }
                ];
                defaultProps.elseLabel = 'Else / Fallback';
            }

            const newNode = {
                id: getNextId(parsedNode.type),
                type: parsedNode.type,
                position,
                data: {
                    label: parsedNode.label,
                    subType: parsedNode.subType || parsedNode.name,
                    configured: false,
                    ...defaultProps
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = (e, node) => {
        // Look up the clean node from state (not the ReactFlow-mapped one)
        console.log('[FlowCanvas] onNodeClick — raw node.data from ReactFlow:', node.data);
        setSelectedNode((prev) => {
            const cleanNode = nodes.find((n) => n.id === node.id);
            console.log('[FlowCanvas] onNodeClick — cleanNode from state:', cleanNode?.data);
            return cleanNode || node;
        });
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
        console.log('[FlowCanvas] updateNodeData — nodeId:', nodeId, 'dataUpdate:', dataUpdate);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...dataUpdate } };
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
        const lower = testMessage.toLowerCase().trim();
        const trigger = nodes.find((node) => {
            if (node.type !== 'triggerNode') return false;
            const subType = node.data?.subType || node.data?.type || node.type;
            if (subType === 'welcome') return true;

            const keywords = Array.isArray(node.data?.keywordList) && node.data.keywordList.length > 0
                ? node.data.keywordList.map(k => String(k).trim().toLowerCase()).filter(Boolean)
                : String(node.data?.keywords || node.data?.keyword || '')
                    .split(',')
                    .map((keyword) => keyword.trim().toLowerCase())
                    .filter(Boolean);

            if (keywords.length === 0) return false;

            const matchMode = node.data?.matchMode || 'contains';
            if (matchMode === 'exact') {
                return keywords.some((k) => lower === k);
            } else if (matchMode === 'starts_with') {
                return keywords.some((k) => lower.startsWith(k));
            } else {
                return keywords.some((k) => lower === k || lower.includes(k));
            }
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
                    nodes={nodes}
                    edges={edges}
                    colorMode="dark"
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={(e, node) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }); }}
                    onPaneClick={() => { setSelectedNode(null); setContextMenu(null); }}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.25, maxZoom: 0.95 }}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.95 }}
                    className="dark bg-dot-white/[0.05]"
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

                    <Panel position="top-right" className="flex items-center gap-3 m-6">
                        <div className="flex flex-col items-end mr-3">
                            <h1 className="text-sm font-black text-white leading-none capitalize">
                                {flowData?.name || 'New Workflow'}
                            </h1>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 pt-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Interactive Canvas
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoLayout('LR')}
                            className="bg-card/80 border-white/10 hover:bg-white/10 text-white rounded-xl gap-1.5 font-semibold text-xs shadow-lg"
                            title="Auto arrange nodes with Dagre"
                        >
                            <Wand2 size={14} className="text-emerald-400" />
                            Auto Layout
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSimulatorOpen(prev => !prev)}
                            className={`rounded-xl gap-1.5 font-semibold text-xs shadow-lg transition-all ${
                                isSimulatorOpen
                                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                                    : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                        >
                            <Smartphone size={14} />
                            {isSimulatorOpen ? 'Close Phone' : 'Live Phone Test'}
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl shadow-lg"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-1.5" />}
                            Save Changes
                        </Button>
                    </Panel>

                    <Panel position="bottom-right" className="m-6 w-80">
                        <div className="rounded-xl border border-white/10 bg-card dark:bg-[#1e1e2e]/90 shadow-2xl backdrop-blur-md p-4 space-y-3">
                            <div>
                                <h3 className="text-xs font-black text-white">Quick Text Preview</h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Quick string interpolation without opening phone.</p>
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
                                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white whitespace-pre-wrap max-h-32 overflow-y-auto">
                                    {testPreview}
                                </div>
                            )}
                        </div>
                    </Panel>
                </ReactFlow>

                <WhatsAppSimulator
                    isOpen={isSimulatorOpen}
                    onClose={() => {
                        setIsSimulatorOpen(false);
                        handleHighlightNode(null);
                    }}
                    nodes={nodes}
                    edges={edges}
                    flowName={flowData?.name || 'WhatsApp Bot'}
                    onHighlightNode={handleHighlightNode}
                />

                {selectedNode && (
                    <div className="absolute right-0 top-0 bottom-0 z-50">
                        <PropertyPanel
                            selectedNode={selectedNode}
                            updateNodeData={updateNodeData}
                            deleteNode={deleteNode}
                            closePanel={() => setSelectedNode(null)}
                            workspaceId={wsId}
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