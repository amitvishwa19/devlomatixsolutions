'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Users,
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Save,
  RotateCcw,
  Layers,
  LayoutGrid,
  ListTree,
  Building2,
  Briefcase,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Crown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  getOrgBuilderData,
  saveOrgStructure
} from '../_actions/org-builder-actions';
import { DEFAULT_ORG_TEMPLATES } from '../_lib/org-templates';

const DEPARTMENT_COLORS = {
  Executive: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    border: 'border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    dot: 'bg-violet-500'
  },
  Engineering: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500'
  },
  'Human Resources': {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
    dot: 'bg-pink-500'
  },
  Sales: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  Finance: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500'
  },
  Marketing: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500'
  },
  Operations: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    dot: 'bg-orange-500'
  },
  Design: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500'
  },
  Product: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-500'
  }
};

const COMMON_DEPARTMENTS = [
  'Executive',
  'Human Resources',
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Product',
  'Design'
];

export function OrgBuilderSettings({ workspaceId = 'global' }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [structure, setStructure] = useState(DEFAULT_ORG_TEMPLATES.tech_startup);
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'tree' | 'list'
  const [hasChanges, setHasChanges] = useState(false);
  const [zoom, setZoom] = useState(85); // 85% default fits all main departments side-by-side cleanly

  // Modals state
  const [roleModal, setRoleModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    nodeId: null,
    parentId: null,
    title: '',
    department: 'Engineering',
    responsibilities: ''
  });

  const [assignModal, setAssignModal] = useState({
    open: false,
    nodeId: null,
    search: ''
  });

  // Load org data on mount (Universal Global)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrgBuilderData(workspaceId || 'global');
      if (res.success && res.structure) {
        setStructure(res.structure);
      }
      if (res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load org structure', err);
      toast.error('Failed to load organizational structure');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save (Saves to Universal Global key across all workspaces and users)
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveOrgStructure('global', structure);
      if (res.success) {
        setHasChanges(false);
        toast.success('Organization hierarchy saved to universal global configuration across all users!');
      } else {
        toast.error(res.error || 'Failed to save organization structure');
      }
    } catch (err) {
      toast.error('Error saving organization structure');
    } finally {
      setSaving(false);
    }
  };

  // Switch Template
  const handleApplyTemplate = (templateKey) => {
    const template = DEFAULT_ORG_TEMPLATES[templateKey];
    if (!template) return;
    setStructure(template);
    setHasChanges(true);
    toast.info(`Applied ${templateKey.replace('_', ' ')} template. Click Save to persist.`);
  };

  // Quick lookup helper
  const nodes = structure?.nodes || {};
  const rootNodeId = structure?.rootNodeId || Object.keys(nodes)[0];

  // Map parent -> children
  const childrenMap = useMemo(() => {
    const map = {};
    Object.values(nodes).forEach((node) => {
      const pId = node.parentId || 'root';
      if (!map[pId]) map[pId] = [];
      map[pId].push(node);
    });
    // Sort by order
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    return map;
  }, [nodes]);

  // User map
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Open Add Direct Report Dialog
  const handleOpenAddReport = (parentId) => {
    setRoleModal({
      open: true,
      mode: 'create',
      nodeId: null,
      parentId,
      title: '',
      department: nodes[parentId]?.department || 'Engineering',
      responsibilities: ''
    });
  };

  // Open Edit Role Dialog
  const handleOpenEditRole = (nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;
    setRoleModal({
      open: true,
      mode: 'edit',
      nodeId,
      parentId: node.parentId,
      title: node.title,
      department: node.department || 'Engineering',
      responsibilities: node.responsibilities || ''
    });
  };

  // Save Role Modal (Create or Edit)
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleModal.title.trim()) {
      toast.error('Role title is required');
      return;
    }

    if (roleModal.mode === 'create') {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newNode = {
        id: newId,
        title: roleModal.title.trim(),
        department: roleModal.department,
        parentId: roleModal.parentId || null,
        assignedUserIds: [],
        responsibilities: roleModal.responsibilities.trim(),
        order: (childrenMap[roleModal.parentId || 'root']?.length || 0) + 1
      };

      setStructure((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [newId]: newNode
        }
      }));
      toast.success(`Role '${newNode.title}' added!`);
    } else {
      // Edit existing
      setStructure((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [roleModal.nodeId]: {
            ...prev.nodes[roleModal.nodeId],
            title: roleModal.title.trim(),
            department: roleModal.department,
            parentId: roleModal.parentId,
            responsibilities: roleModal.responsibilities.trim()
          }
        }
      }));
      toast.success('Role updated');
    }

    setHasChanges(true);
    setRoleModal({ open: false, mode: 'create', nodeId: null, parentId: null, title: '', department: 'Engineering', responsibilities: '' });
  };

  // Delete Node
  const handleDeleteNode = (nodeId) => {
    if (nodeId === rootNodeId && Object.keys(nodes).length === 1) {
      toast.error('Cannot delete the only root role in the organization');
      return;
    }

    const nodeToDelete = nodes[nodeId];
    if (!nodeToDelete) return;

    const newNodes = { ...nodes };
    delete newNodes[nodeId];

    // Re-parent children to parent of deleted node
    Object.values(newNodes).forEach((n) => {
      if (n.parentId === nodeId) {
        newNodes[n.id] = {
          ...n,
          parentId: nodeToDelete.parentId || null
        };
      }
    });

    let newRoot = rootNodeId;
    if (nodeId === rootNodeId) {
      newRoot = Object.keys(newNodes)[0] || null;
    }

    setStructure({
      ...structure,
      rootNodeId: newRoot,
      nodes: newNodes
    });
    setHasChanges(true);
    toast.success(`Removed role '${nodeToDelete.title}'`);
  };

  // Open Assign User Dialog
  const handleOpenAssign = (nodeId) => {
    setAssignModal({
      open: true,
      nodeId,
      search: ''
    });
  };

  // Toggle user assignment
  const handleToggleUserAssignment = (userId) => {
    const { nodeId } = assignModal;
    if (!nodeId || !nodes[nodeId]) return;

    const currentNode = nodes[nodeId];
    const isAssigned = currentNode.assignedUserIds?.includes(userId);

    const updatedUserIds = isAssigned
      ? currentNode.assignedUserIds.filter((id) => id !== userId)
      : [...(currentNode.assignedUserIds || []), userId];

    setStructure((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...currentNode,
          assignedUserIds: updatedUserIds
        }
      }
    }));

    setHasChanges(true);
  };

  // Quick remove user from node directly on card
  const handleRemoveUserFromNode = (nodeId, userId, e) => {
    e.stopPropagation();
    const node = nodes[nodeId];
    if (!node) return;

    setStructure((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...node,
          assignedUserIds: (node.assignedUserIds || []).filter((id) => id !== userId)
        }
      }
    }));
    setHasChanges(true);
    toast.info('User unassigned from role');
  };

  // Count metrics
  const totalRoles = Object.keys(nodes).length;
  const totalAssignedUsers = useMemo(() => {
    const set = new Set();
    Object.values(nodes).forEach((n) => {
      n.assignedUserIds?.forEach((uId) => set.add(uId));
    });
    return set.size;
  }, [nodes]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading organization builder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-secondary/30 border border-border/60 rounded-xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-500">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-foreground">Organization Hierarchy Builder</h3>
              <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Universal Global
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25">
                {totalRoles} Roles
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                {totalAssignedUsers} Assigned Users
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Universal Global: Define company reporting structure, executive roles, and team assignments across the entire organization.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search role or person..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-7 pr-2.5 py-1 text-xs bg-background border border-border/60 rounded-lg w-36 sm:w-44 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border/60 rounded-lg p-0.5 bg-background">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'tree' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              title="Tree Chart View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              title="Hierarchy List View"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">List</span>
            </button>
          </div>

          {/* Zoom Controls (Chart View Only) */}
          {viewMode === 'tree' && (
            <div className="flex items-center border border-border/60 rounded-lg p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-semibold text-muted-foreground min-w-[30px] text-center select-none">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 10))}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(85)}
                className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer font-medium"
                title="Fit to screen (85%)"
              >
                Fit
              </button>
            </div>
          )}

          {/* Preset Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border/60 cursor-pointer">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={() => handleApplyTemplate('tech_startup')} className="cursor-pointer">
                <div className="font-semibold text-xs">Tech Startup</div>
                <div className="text-[10px] text-muted-foreground">CEO, CTO, VP Sales, HR, CFO</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleApplyTemplate('corporate_agency')} className="cursor-pointer">
                <div className="font-semibold text-xs">Corporate Agency</div>
                <div className="text-[10px] text-muted-foreground">MD, Creative, Ops, HR</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleApplyTemplate('blank')} className="cursor-pointer text-muted-foreground">
                <div className="font-semibold text-xs">Blank Canvas</div>
                <div className="text-[10px] text-muted-foreground">Start with single CEO node</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`h-7 text-xs font-semibold gap-1.5 cursor-pointer ${hasChanges ? 'bg-primary text-primary-foreground shadow-sm animate-pulse' : ''
              }`}
          >
            <Save className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save Structure'}</span>
          </Button>
        </div>
      </div>

      {/* Main Builder Canvas */}
      {viewMode === 'tree' ? (
        <div className="relative p-4 sm:p-6 bg-card border border-border/70 rounded-xl overflow-x-auto overflow-y-auto min-h-[460px] max-w-full">
          {/* Background grid dots for canvas feel */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          <div
            className="min-w-full w-max mx-auto flex flex-col items-center pb-12 px-6 transition-transform duration-150 origin-top"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {rootNodeId && nodes[rootNodeId] ? (
              <OrgTreeNode
                nodeId={rootNodeId}
                nodes={nodes}
                childrenMap={childrenMap}
                userMap={userMap}
                searchFilter={searchFilter}
                onAddReport={handleOpenAddReport}
                onEditRole={handleOpenEditRole}
                onAssignUser={handleOpenAssign}
                onDeleteNode={handleDeleteNode}
                onRemoveUser={handleRemoveUserFromNode}
                isRoot={true}
              />
            ) : (
              <div className="text-center py-12 space-y-2">
                <p className="text-xs text-muted-foreground">No roles configured yet.</p>
                <Button size="sm" onClick={() => handleApplyTemplate('tech_startup')} className="cursor-pointer text-xs">
                  Apply Default Startup Template
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Hierarchical List View */
        <div className="p-3 bg-card border border-border/70 rounded-xl space-y-2">
          {rootNodeId && nodes[rootNodeId] ? (
            <OrgTreeListView
              nodeId={rootNodeId}
              nodes={nodes}
              childrenMap={childrenMap}
              userMap={userMap}
              searchFilter={searchFilter}
              onAddReport={handleOpenAddReport}
              onEditRole={handleOpenEditRole}
              onAssignUser={handleOpenAssign}
              onDeleteNode={handleDeleteNode}
              onRemoveUser={handleRemoveUserFromNode}
              level={0}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No roles defined.</p>
          )}
        </div>
      )}

      {/* MODAL 1: Add or Edit Role */}
      <Dialog
        open={roleModal.open}
        onOpenChange={(open) => !open && setRoleModal((p) => ({ ...p, open: false }))}
      >
        <DialogContent className="max-w-md p-5 bg-card border border-border shadow-2xl rounded-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              {roleModal.mode === 'create' ? 'Add New Organization Role' : 'Edit Role Position'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the title, department, reporting manager, and responsibilities for this position.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-3.5 pt-2">
            {/* Role Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Role Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chief Executive Officer, Head of HR, Lead Architect..."
                value={roleModal.title}
                onChange={(e) => setRoleModal((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Department</label>
              <Select
                value={roleModal.department || 'Engineering'}
                onValueChange={(val) => setRoleModal((p) => ({ ...p, department: val }))}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-background border border-border/70 rounded-lg focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-[99999] max-h-56 bg-popover border border-border shadow-xl">
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-xs cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${DEPARTMENT_COLORS[dept]?.dot || 'bg-violet-500'
                            }`}
                        />
                        <span>{dept}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reports To (Parent Selector) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Reports To (Reporting Manager)</label>
              <Select
                value={roleModal.parentId || '__top_level__'}
                onValueChange={(val) =>
                  setRoleModal((p) => ({
                    ...p,
                    parentId: val === '__top_level__' ? null : val
                  }))
                }
                disabled={roleModal.mode === 'edit' && roleModal.nodeId === rootNodeId}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-background border border-border/70 rounded-lg focus:ring-1 focus:ring-primary disabled:opacity-50">
                  <SelectValue placeholder="Select reporting manager" />
                </SelectTrigger>
                <SelectContent className="z-[99999] max-h-56 bg-popover border border-border shadow-xl">
                  <SelectItem
                    value="__top_level__"
                    className="text-xs cursor-pointer font-medium text-primary"
                  >
                    Top Level (Executive Root)
                  </SelectItem>
                  {Object.values(nodes)
                    .filter((n) => n.id !== roleModal.nodeId)
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id} className="text-xs cursor-pointer">
                        <span className="font-medium">{n.title}</span>{' '}
                        <span className="text-[10px] text-muted-foreground">({n.department})</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsibilities */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Role Description & Responsibilities</label>
              <textarea
                rows={3}
                placeholder="Brief description of primary duties, deliverables, and team leadership..."
                value={roleModal.responsibilities}
                onChange={(e) => setRoleModal((p) => ({ ...p, responsibilities: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRoleModal((p) => ({ ...p, open: false }))}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer text-xs">
                {roleModal.mode === 'create' ? 'Create Role' : 'Update Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Assign Users Dialog */}
      <Dialog
        open={assignModal.open}
        onOpenChange={(open) => !open && setAssignModal((p) => ({ ...p, open: false }))}
      >
        <DialogContent className="max-w-md p-5 bg-card border border-border shadow-2xl rounded-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              Assign Team Member to Position
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select one or more organization team members to hold the role of{' '}
              <span className="font-semibold text-foreground">
                {assignModal.nodeId ? nodes[assignModal.nodeId]?.title : ''}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {/* Search Member Filter */}
          <div className="relative pt-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={assignModal.search}
              onChange={(e) => setAssignModal((p) => ({ ...p, search: e.target.value }))}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* User List */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/30">
            {users
              .filter((u) => {
                const s = assignModal.search.toLowerCase();
                return (
                  !s ||
                  (u.displayName || '').toLowerCase().includes(s) ||
                  (u.email || '').toLowerCase().includes(s)
                );
              })
              .map((u) => {
                const isAssigned =
                  assignModal.nodeId &&
                  nodes[assignModal.nodeId]?.assignedUserIds?.includes(u.id);

                return (
                  <div
                    key={u.id}
                    onClick={() => handleToggleUserAssignment(u.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isAssigned
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'hover:bg-secondary/40'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="w-7 h-7 border border-border/50">
                        <AvatarImage src={u.avatar || ''} alt={u.displayName || 'User'} />
                        <AvatarFallback className="text-[10px] bg-secondary font-bold">
                          {(u.displayName || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {u.displayName || 'Unnamed User'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isAssigned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                          <Check className="w-2.5 h-2.5" /> Assigned
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] px-2 border-border/60 cursor-pointer"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

            {users.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No users found in this workspace.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              onClick={() => setAssignModal((p) => ({ ...p, open: false }))}
              className="cursor-pointer text-xs"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Recursive Org Tree Node (Visual Chart Flow)
 */
function OrgTreeNode({
  nodeId,
  nodes,
  childrenMap,
  userMap,
  searchFilter,
  onAddReport,
  onEditRole,
  onAssignUser,
  onDeleteNode,
  onRemoveUser,
  isRoot = false
}) {
  const node = nodes[nodeId];
  if (!node) return null;

  const children = childrenMap[nodeId] || [];
  const assignedUsers = (node.assignedUserIds || []).map((id) => userMap.get(id)).filter(Boolean);

  const deptStyle =
    DEPARTMENT_COLORS[node.department] || DEPARTMENT_COLORS.Engineering;

  const isHighlighted =
    searchFilter &&
    (node.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (node.department || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      assignedUsers.some((u) => (u.displayName || '').toLowerCase().includes(searchFilter.toLowerCase())));

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-56 p-2.5 bg-card rounded-xl border transition-all duration-200 shadow-sm relative group hover:shadow-md shrink-0 ${isHighlighted
            ? 'ring-2 ring-primary border-primary bg-primary/5'
            : isRoot
              ? 'border-violet-500/50 shadow-violet-500/5'
              : 'border-border/80 hover:border-border'
          }`}
      >
        {/* Department Badge & Actions Header */}
        <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-border/40">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${deptStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${deptStyle.dot}`} />
            {node.department || 'General'}
          </span>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEditRole(node.id)}
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Edit Role"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteNode(node.id)}
              className="p-1 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
              title="Delete Role"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Role Title */}
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground leading-snug truncate" title={node.title}>
            {isRoot && <Crown className="w-3 h-3 inline mr-1 text-amber-500" />}
            {node.title}
          </h4>
          {node.responsibilities && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5" title={node.responsibilities}>
              {node.responsibilities}
            </p>
          )}
        </div>

        {/* Assigned Users Section */}
        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1.5">
          {assignedUsers.length > 0 ? (
            <div className="space-y-1">
              {assignedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-1 px-1.5 rounded-md bg-secondary/40 border border-border/40 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="w-5 h-5 border border-border/60">
                      <AvatarImage src={u.avatar || ''} />
                      <AvatarFallback className="text-[8px] bg-secondary font-bold">
                        {(u.displayName || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-medium text-foreground truncate max-w-[120px]">
                      {u.displayName || 'User'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onRemoveUser(node.id, u.id, e)}
                    className="p-0.5 hover:bg-rose-500/20 rounded text-muted-foreground hover:text-rose-500 cursor-pointer"
                    title="Unassign user"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => onAssignUser(node.id)}
              className="flex items-center justify-center gap-1 p-1.5 border border-dashed border-border/70 hover:border-emerald-500/60 rounded-md text-[10px] text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer bg-secondary/15"
            >
              <UserPlus className="w-3 h-3" />
              <span>Assign Member</span>
            </div>
          )}

          {/* Quick Add Assignee if already has users */}
          {assignedUsers.length > 0 && (
            <button
              type="button"
              onClick={() => onAssignUser(node.id)}
              className="w-full text-center text-[9px] text-primary hover:underline font-semibold cursor-pointer pt-0.5"
            >
              + Manage / Add Users
            </button>
          )}
        </div>

        {/* Add Report Bottom Button */}
        <div className="mt-2.5 pt-1 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddReport(node.id)}
            className="w-full h-6 text-[10px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1 rounded-md cursor-pointer justify-center"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add Direct Report</span>
          </Button>
        </div>
      </motion.div>

      {/* Branch Lines and Child Level */}
      {children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* Vertical stem down from parent */}
          <div className="w-0.5 h-6 bg-border/80" />

          {/* Horizontal crossbar for multiple children */}
          <div className="relative flex justify-center">
            {children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-border/80"
                style={{
                  left: '112px', // half of w-56 card (224px / 2 = 112px)
                  right: '112px'
                }}
              />
            )}

            <div className="flex gap-4 items-start pt-6">
              {children.map((childNode) => (
                <div key={childNode.id} className="relative flex flex-col items-center">
                  {/* Vertical stem up to crossbar */}
                  <div className="w-0.5 h-6 bg-border/80 absolute -top-6 left-1/2 -translate-x-1/2" />
                  <OrgTreeNode
                    nodeId={childNode.id}
                    nodes={nodes}
                    childrenMap={childrenMap}
                    userMap={userMap}
                    searchFilter={searchFilter}
                    onAddReport={onAddReport}
                    onEditRole={onEditRole}
                    onAssignUser={onAssignUser}
                    onDeleteNode={onDeleteNode}
                    onRemoveUser={onRemoveUser}
                    isRoot={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Recursive Org Tree List View (Outline View)
 */
function OrgTreeListView({
  nodeId,
  nodes,
  childrenMap,
  userMap,
  searchFilter,
  onAddReport,
  onEditRole,
  onAssignUser,
  onDeleteNode,
  onRemoveUser,
  level = 0
}) {
  const node = nodes[nodeId];
  if (!node) return null;

  const children = childrenMap[nodeId] || [];
  const assignedUsers = (node.assignedUserIds || []).map((id) => userMap.get(id)).filter(Boolean);
  const deptStyle = DEPARTMENT_COLORS[node.department] || DEPARTMENT_COLORS.Engineering;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 text-xs transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {level > 0 && <span className="text-muted-foreground">└─</span>}
          <span className={`w-2 h-2 rounded-full ${deptStyle.dot} shrink-0`} />
          <span className="font-bold text-foreground truncate">{node.title}</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${deptStyle.badge}`}>
            {node.department}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Assigned Members Mini Pill */}
          <div className="flex items-center gap-1">
            {assignedUsers.length > 0 ? (
              assignedUsers.map((u) => (
                <span
                  key={u.id}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium"
                >
                  {u.displayName}
                </span>
              ))
            ) : (
              <button
                type="button"
                onClick={() => onAssignUser(node.id)}
                className="text-[10px] text-muted-foreground hover:text-emerald-500 cursor-pointer"
              >
                + Assign
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 border-l border-border/40 pl-2">
            <button
              type="button"
              onClick={() => onAddReport(node.id)}
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-primary cursor-pointer"
              title="Add Direct Report"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEditRole(node.id)}
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit Role"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteNode(node.id)}
              className="p-1 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-500 cursor-pointer"
              title="Delete Role"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {children.map((child) => (
        <OrgTreeListView
          key={child.id}
          nodeId={child.id}
          nodes={nodes}
          childrenMap={childrenMap}
          userMap={userMap}
          searchFilter={searchFilter}
          onAddReport={onAddReport}
          onEditRole={onEditRole}
          onAssignUser={onAssignUser}
          onDeleteNode={onDeleteNode}
          onRemoveUser={onRemoveUser}
          level={level + 1}
        />
      ))}
    </div>
  );
}

export default OrgBuilderSettings;
