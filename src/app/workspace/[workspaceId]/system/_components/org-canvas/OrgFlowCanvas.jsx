'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { OrgRoleNode } from './OrgRoleNode';
import { OrgDeletableEdge } from './OrgDeletableEdge';
import { getLayoutedOrgElements } from './layoutOrgGraph';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Save,
  Maximize2,
  Minimize2,
  Search,
  ChevronDown,
  Plus,
  Network
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

const nodeTypes = {
  orgRoleNode: OrgRoleNode,
};

const edgeTypes = {
  orgEdge: OrgDeletableEdge,
};

function FlowCanvasInternal({
  nodesMap = {},
  rootNodeId,
  userMap,
  hasChanges,
  saving,
  onSave,
  onApplyTemplate,
  onAddReport,
  onEditRole,
  onAssignUser,
  onDeleteNode,
  onRemoveUserFromNode,
  onInsertRoleBetween,
  onUpdateNodesMap,
  isFullscreen,
  onToggleFullscreen,
}) {
  const { fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const isFirstRender = useRef(true);

  // Helper: Detect if setting target as child of source creates a circular hierarchy
  const wouldCreateCycle = useCallback(
    (sourceId, targetId, currentNodes) => {
      let curr = sourceId;
      const visited = new Set();
      while (curr && currentNodes[curr]) {
        if (curr === targetId) return true;
        if (visited.has(curr)) break;
        visited.add(curr);
        curr = currentNodes[curr].parentId;
      }
      return false;
    },
    []
  );

  // Handle severing edge between Manager and Subordinate
  const handleSeverEdge = useCallback(
    (parentId, childId) => {
      const child = nodesMap[childId];
      const parent = nodesMap[parentId];

      const updated = {
        ...nodesMap,
        [childId]: {
          ...child,
          parentId: null,
        },
      };

      onUpdateNodesMap(updated);
      toast.info(
        `Reporting line severed: "${child?.title || 'Subordinate'}" no longer reports to "${parent?.title || 'Manager'}"`
      );
    },
    [nodesMap, onUpdateNodesMap]
  );

  // Convert normalized nodesMap & edges to ReactFlow elements
  const rfNodes = useMemo(() => {
    return Object.values(nodesMap).map((node) => {
      const isRoot = node.id === rootNodeId;
      const assignedUsers = (node.assignedUserIds || [])
        .map((uid) => userMap.get(uid))
        .filter(Boolean);

      const nodeMailboxes = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
        ? node.mailboxEmails
        : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);

      const isMatch =
        searchQuery.trim() === '' ||
        node.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nodeMailboxes.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        assignedUsers.some((u) => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()));

      return {
        id: node.id,
        type: 'orgRoleNode',
        position: node.position || { x: 0, y: 0 },
        data: {
          ...node,
          isRoot,
          assignedUsers,
          onEditRole,
          onDeleteRole: onDeleteNode,
          onAssignUser,
          onRemoveUser: onRemoveUserFromNode,
          onAddReport,
        },
        selected: searchQuery.trim() !== '' && isMatch,
        style: {
          opacity: searchQuery.trim() === '' || isMatch ? 1 : 0.25,
          transition: 'opacity 0.2s ease',
        },
      };
    });
  }, [
    nodesMap,
    rootNodeId,
    userMap,
    searchQuery,
    onEditRole,
    onDeleteNode,
    onAssignUser,
    onRemoveUserFromNode,
    onAddReport,
  ]);

  const rfEdges = useMemo(() => {
    return Object.values(nodesMap)
      .filter((n) => n.parentId && nodesMap[n.parentId])
      .map((n) => ({
        id: `e-${n.parentId}-${n.id}`,
        source: n.parentId,
        target: n.id,
        type: 'orgEdge',
        data: {
          sourceNodeId: n.parentId,
          targetNodeId: n.id,
          onDeleteEdge: () => handleSeverEdge(n.parentId, n.id),
          onInsertRole: (source, target) => onInsertRoleBetween(source, target),
        },
      }));
  }, [nodesMap, handleSeverEdge, onInsertRoleBetween]);

  const [currentNodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [currentEdges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Synchronize state when nodesMap or search changes
  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  // Handle new connection drawn between nodes
  const onConnect = useCallback(
    (connection) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return;

      if (target === rootNodeId) {
        toast.error('The Root Role (CEO) cannot report to another position.');
        return;
      }

      if (wouldCreateCycle(source, target, nodesMap)) {
        toast.error('Circular reporting line detected! A manager cannot report to their subordinate.');
        return;
      }

      const targetNode = nodesMap[target];
      const sourceNode = nodesMap[source];

      const updated = {
        ...nodesMap,
        [target]: {
          ...targetNode,
          parentId: source,
        },
      };

      onUpdateNodesMap(updated);
      toast.success(`"${targetNode?.title}" now reports to "${sourceNode?.title}"`);
    },
    [nodesMap, rootNodeId, wouldCreateCycle, onUpdateNodesMap]
  );

  // Handle saving node coordinates on drag stop
  const onNodeDragStop = useCallback(
    (event, node) => {
      if (!node?.id || !nodesMap[node.id]) return;
      const updated = {
        ...nodesMap,
        [node.id]: {
          ...nodesMap[node.id],
          position: node.position,
        },
      };
      onUpdateNodesMap(updated);
    },
    [nodesMap, onUpdateNodesMap]
  );

  // Auto Layout using Dagre
  const handleAutoLayout = useCallback(
    (direction = 'TB') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedOrgElements(
        rfNodes,
        rfEdges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      // Save new coordinates back into nodesMap
      const updatedMap = { ...nodesMap };
      layoutedNodes.forEach((n) => {
        if (updatedMap[n.id]) {
          updatedMap[n.id] = {
            ...updatedMap[n.id],
            position: n.position,
          };
        }
      });
      onUpdateNodesMap(updatedMap);

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 50);

      toast.success('Organization hierarchy auto-arranged');
    },
    [rfNodes, rfEdges, nodesMap, onUpdateNodesMap, setNodes, setEdges, fitView]
  );

  // Auto-arrange on very first mount if positions are unset
  useEffect(() => {
    if (isFirstRender.current && Object.keys(nodesMap).length > 0) {
      isFirstRender.current = false;
      const needsLayout = Object.values(nodesMap).some((n) => !n.position || (n.position.x === 0 && n.position.y === 0));
      if (needsLayout) {
        handleAutoLayout('TB');
      } else {
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      }
    }
  }, [nodesMap, handleAutoLayout, fitView]);

  return (
    <div className={`relative w-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-background dark:bg-[#12121a] h-screen w-screen' : 'h-[620px] rounded-xl border border-border/80 dark:border-white/10'}`}>
      <ReactFlow
        nodes={currentNodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.6}
        colorMode={isDark ? 'dark' : 'light'}
        defaultEdgeOptions={{ type: 'orgEdge' }}
        className={`w-full h-full ${isDark ? 'dark bg-[#12121a]' : 'bg-slate-50/50'}`}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={18} size={1} className={isDark ? 'opacity-20' : 'opacity-40'} />
        <Controls className="!bg-background dark:!bg-[#1e1e2e] !border-border dark:!border-white/10 !shadow-md !rounded-lg text-foreground dark:text-white" />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isRoot) return '#8b5cf6';
            return '#3b82f6';
          }}
          maskColor={isDark ? 'rgba(18, 18, 26, 0.7)' : 'rgba(240, 240, 240, 0.6)'}
          className="!bg-background/90 dark:!bg-[#1e1e2e]/90 !border-border dark:!border-white/10 !rounded-lg !shadow-md hidden sm:block"
          zoomable
          pannable
        />

        {/* Top Floating Control Bar Panel */}
        <Panel position="top-right" className="flex flex-wrap items-center gap-1.5 m-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search role / member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-background/90 dark:bg-[#1e1e2e]/90 backdrop-blur-md border border-border/70 dark:border-white/10 rounded-lg w-36 sm:w-44 text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          {/* Add Standalone Role */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddReport(rootNodeId || null)}
            className="h-7 text-xs gap-1 border-border/70 dark:border-white/10 bg-background/90 dark:bg-[#1e1e2e]/90 text-foreground dark:text-white backdrop-blur-md shadow-xs hover:border-primary cursor-pointer"
            title="Create a new position in the organization"
          >
            <Plus className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Add Role</span>
          </Button>

          {/* Auto Layout (Dagre) */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAutoLayout('TB')}
            className="h-7 text-xs gap-1 border-border/70 dark:border-white/10 bg-background/90 dark:bg-[#1e1e2e]/90 text-foreground dark:text-white backdrop-blur-md shadow-xs hover:border-primary cursor-pointer"
            title="Cleanly arrange the hierarchy top-to-bottom"
          >
            <Network className="w-3 h-3 text-blue-500" />
            <span className="hidden sm:inline">Auto Layout</span>
          </Button>

          {/* Preset Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-border/70 dark:border-white/10 bg-background/90 dark:bg-[#1e1e2e]/90 text-foreground dark:text-white backdrop-blur-md shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="hidden md:inline">Templates</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs bg-popover dark:bg-[#1e1e2e] border border-border dark:border-white/10 text-foreground dark:text-white">
              <DropdownMenuItem onClick={() => onApplyTemplate('tech_startup')} className="cursor-pointer">
                <div>
                  <div className="font-semibold text-xs">Tech Startup</div>
                  <div className="text-[10px] text-muted-foreground">CEO, CTO, VP Sales, HR, CFO</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onApplyTemplate('corporate_agency')} className="cursor-pointer">
                <div>
                  <div className="font-semibold text-xs">Corporate Agency</div>
                  <div className="text-[10px] text-muted-foreground">MD, Creative, Ops, HR</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-white/10" />
              <DropdownMenuItem onClick={() => onApplyTemplate('blank')} className="cursor-pointer text-muted-foreground">
                <div>
                  <div className="font-semibold text-xs">Blank Canvas</div>
                  <div className="text-[10px] text-muted-foreground">Single CEO node</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleFullscreen}
            className="h-7 w-7 p-0 border-border/70 dark:border-white/10 bg-background/90 dark:bg-[#1e1e2e]/90 text-foreground dark:text-white backdrop-blur-md shadow-xs cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || !hasChanges}
            className={`h-7 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs ${
              hasChanges ? 'bg-primary text-primary-foreground animate-pulse' : ''
            }`}
          >
            <Save className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save Structure'}</span>
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function OrgFlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInternal {...props} />
    </ReactFlowProvider>
  );
}

export default OrgFlowCanvas;
