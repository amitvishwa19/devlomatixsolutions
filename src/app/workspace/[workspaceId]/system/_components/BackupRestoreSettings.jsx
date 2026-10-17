'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DatabaseBackup,
    HardDriveDownload,
    HardDriveUpload,
    RotateCcw,
    FileJson,
    FolderArchive,
    History,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Cloud,
    Download,
    Upload,
    RefreshCw,
    Trash2,
    Layers,
    Users,
    Briefcase,
    Settings,
    Kanban,
    Zap,
    Key,
    Info,
    ArrowRight,
    Search,
    ShieldAlert,
    ExternalLink,
    Clock,
    FileText,
    Copy,
    Check,
    MessageSquare,
    ArchiveRestore
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Client-side REST API Helpers (eliminates Turbopack server-action factory stub errors)
async function fetchBackupStats(workspaceId) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup?action=stats`, { cache: 'no-store' });
    return await res.json();
}

async function fetchBackupSnapshots(workspaceId) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup?action=snapshots`, { cache: 'no-store' });
    return await res.json();
}

async function fetchSnapshotData(workspaceId, snapshotId) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup?action=snapshot-data&snapshotId=${encodeURIComponent(snapshotId)}`, { cache: 'no-store' });
    return await res.json();
}

async function createBackupApi(workspaceId, payload) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...payload })
    });
    return await res.json();
}

async function validateBackupApi(workspaceId, backupBundle) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', backupBundle })
    });
    return await res.json();
}

async function deleteSnapshotApi(workspaceId, snapshotId) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-snapshot', snapshotId })
    });
    return await res.json();
}

async function restoreBackupApi(workspaceId, payload) {
    const res = await fetch(`/api/workspace/${workspaceId}/system/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', ...payload })
    });
    return await res.json();
}

const MODULE_DEFINITIONS = [
    {
        id: 'crm',
        name: 'CRM & Sales',
        description: 'Accounts, Contacts, Contact Groups, Pipelines, Stages, Deals, Quotations, and Activities.',
        icon: Users,
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/30'
    },
    {
        id: 'konnectx',
        name: 'KonnectX WhatsApp Platform',
        description: 'Cloud API messages, chat threads, templates, campaigns, WhatsApp Flows, bot flows & steps, session auth.',
        icon: MessageSquare,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30'
    },
    {
        id: 'konnect-legacy',
        name: 'Konnect Legacy Store',
        description: 'Isolated Baileys WhatsApp chats & messages (7k+ records), legacy contacts, campaigns, rules, template groups & settings.',
        icon: ArchiveRestore,
        color: 'text-teal-500',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/30'
    },
    {
        id: 'productivity',
        name: 'Productivity & Kanban',
        description: 'Kanban boards, columns, tasks, covers, priorities, and task checklists.',
        icon: Kanban,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30'
    },
    {
        id: 'settings',
        name: 'Workspace Config & Branding',
        description: 'Global settings, theme colors, logos, security policies, privacy, and metadata.',
        icon: Settings,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30'
    },
    {
        id: 'automation',
        name: 'Automations & Crons',
        description: 'Visual workflows, scheduled system crons, and connected platform credentials.',
        icon: Zap,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30'
    },
    {
        id: 'ats',
        name: 'Recruitment & ATS',
        description: 'Hiring departments, job openings, candidates, parsed profiles, and job applications.',
        icon: Briefcase,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30'
    }
];

export function BackupRestoreSettings() {
    const { workspaceId } = useParams();

    // Navigation sub-tab inside Backup & Restore
    const [subTab, setSubTab] = useState('create'); // 'create' | 'restore' | 'history' | 'docs'

    // Data states
    const [loadingStats, setLoadingStats] = useState(true);
    const [stats, setStats] = useState(null);
    const [snapshots, setSnapshots] = useState([]);
    const [loadingSnapshots, setLoadingSnapshots] = useState(false);

    // Create Backup Form State
    const [selectedModules, setSelectedModules] = useState(['crm', 'konnectx', 'konnect-legacy', 'productivity', 'settings', 'automation', 'ats']);
    const [backupLabel, setBackupLabel] = useState('');
    const [saveToVault, setSaveToVault] = useState(true);
    const [includeSensitive, setIncludeSensitive] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Restore Form State
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedBundle, setUploadedBundle] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [restoreMode, setRestoreMode] = useState('merge'); // 'merge' | 'clean'
    const [restoreModules, setRestoreModules] = useState(['crm', 'konnectx', 'konnect-legacy', 'productivity', 'settings', 'automation', 'ats']);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreProgress, setRestoreProgress] = useState(0);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [restoreResultSummary, setRestoreResultSummary] = useState(null);

    // Load Backup Stats
    const loadStats = useCallback(async () => {
        if (!workspaceId) return;
        setLoadingStats(true);
        try {
            const res = await fetchBackupStats(workspaceId);
            if (res.success) {
                setStats(res.stats);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStats(false);
        }
    }, [workspaceId]);

    // Load Snapshots List
    const loadSnapshots = useCallback(async () => {
        if (!workspaceId) return;
        setLoadingSnapshots(true);
        try {
            const res = await fetchBackupSnapshots(workspaceId);
            if (res.success) {
                setSnapshots(res.snapshots || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSnapshots(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadStats();
        loadSnapshots();
    }, [loadStats, loadSnapshots]);

    // Toggle module in Create list
    const toggleModule = (modId) => {
        setSelectedModules(prev =>
            prev.includes(modId)
                ? prev.filter(m => m !== modId)
                : [...prev, modId]
        );
    };

    // Toggle module in Restore list
    const toggleRestoreModule = (modId) => {
        setRestoreModules(prev =>
            prev.includes(modId)
                ? prev.filter(m => m !== modId)
                : [...prev, modId]
        );
    };

    // Trigger JSON File Download helper
    const triggerFileDownload = (bundle, filename) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // Handle Create Backup
    const handleCreateBackup = async (downloadDirectly = false) => {
        if (selectedModules.length === 0) {
            toast.error("Please select at least one module to back up.");
            return;
        }

        setIsCreating(true);
        try {
            const res = await createBackupApi(workspaceId, {
                selectedModules,
                label: backupLabel.trim(),
                saveAsSnapshot: saveToVault,
                includeSensitive
            });

            if (!res.success) {
                toast.error(res.error || "Failed to create backup");
                return;
            }

            const manifest = res.backupBundle.manifest;
            const filename = `workspace-backup-${workspaceId.substring(0, 6)}-${new Date().toISOString().substring(0, 10)}.json`;

            if (downloadDirectly || !saveToVault) {
                triggerFileDownload(res.backupBundle, filename);
                toast.success(`Backup bundle generated & downloaded! (${manifest.totalRecords} records)`);
            } else {
                toast.success(`Snapshot "${manifest.label}" created & saved to Vault!`);
            }

            setBackupLabel('');
            loadStats();
            loadSnapshots();
        } catch (err) {
            toast.error(err.message || "An error occurred creating backup");
        } finally {
            setIsCreating(false);
        }
    };

    // Handle File Drop / Selection for Restore
    const handleFileSelect = (file) => {
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            toast.error("Please select a valid .json backup file.");
            return;
        }

        setUploadedFile(file);
        setValidationResult(null);
        setRestoreResultSummary(null);
        setIsValidating(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                setUploadedBundle(parsed);

                const validation = await validateBackupApi(workspaceId, parsed);

                setValidationResult(validation);

                if (validation.valid) {
                    toast.success("Backup package inspected & verified!");
                    if (parsed.manifest?.modules && Array.isArray(parsed.manifest.modules)) {
                        setRestoreModules(parsed.manifest.modules);
                    }
                } else {
                    toast.error(validation.error || "Invalid backup schema");
                }
            } catch (err) {
                setValidationResult({ valid: false, error: "Failed to parse JSON file: " + err.message });
                toast.error("Corrupted or invalid JSON backup file");
            } finally {
                setIsValidating(false);
            }
        };
        reader.readAsText(file);
    };

    // Load Snapshot into Restore view directly from History
    const handleLoadSnapshotForRestore = async (snapshotId) => {
        toast.loading("Loading snapshot from cloud vault...", { id: 'load-snap' });
        try {
            const res = await fetchSnapshotData(workspaceId, snapshotId);
            if (!res.success) {
                toast.error(res.error || "Failed to load snapshot", { id: 'load-snap' });
                return;
            }

            const bundle = res.backupBundle;
            setUploadedBundle(bundle);
            setUploadedFile({ name: `${bundle.manifest.label || 'Snapshot'}.json` });

            const validation = await validateBackupApi(workspaceId, bundle);

            setValidationResult(validation);
            if (bundle.manifest?.modules) {
                setRestoreModules(bundle.manifest.modules);
            }

            setSubTab('restore');
            toast.success("Snapshot loaded into restore staging area!", { id: 'load-snap' });
        } catch (e) {
            toast.error(e.message, { id: 'load-snap' });
        }
    };

    // Delete a Snapshot
    const handleDeleteSnapshot = async (snapshotId, label) => {
        if (!confirm(`Are you sure you want to delete snapshot "${label}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await deleteSnapshotApi(workspaceId, snapshotId);
            if (res.success) {
                toast.success("Snapshot removed from vault");
                loadSnapshots();
                loadStats();
            } else {
                toast.error(res.error || "Failed to delete snapshot");
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    // Execute Restore
    const handleExecuteRestore = async () => {
        if (!uploadedBundle) {
            toast.error("No backup package staged for restoration.");
            return;
        }

        if (restoreMode === 'clean' && confirmText.trim().toUpperCase() !== 'RESTORE') {
            toast.error("Please type RESTORE to confirm clean wipe restoration.");
            return;
        }

        setConfirmDialogOpen(false);
        setIsRestoring(true);
        setRestoreProgress(25);

        try {
            setRestoreProgress(50);
            const res = await restoreBackupApi(workspaceId, {
                backupBundle: uploadedBundle,
                options: {
                    mode: restoreMode,
                    selectedModules: restoreModules,
                    overwrite: true
                }
            });

            setRestoreProgress(100);

            if (res.success) {
                setRestoreResultSummary(res.summary);
                toast.success("Workspace restoration completed successfully!");
                loadStats();
                loadSnapshots();
            } else {
                toast.error(res.error || "Failed to restore backup");
            }
        } catch (err) {
            toast.error(err.message || "Restoration encountered an unexpected error");
        } finally {
            setIsRestoring(false);
            setConfirmText('');
        }
    };

    // Format file size
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Format relative date
    const formatDate = (isoString) => {
        if (!isoString) return 'Never';
        try {
            const date = new Date(isoString);
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="space-y-4 max-w-5xl mx-auto">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-3 bg-secondary/15 border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Vault Status</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <h4 className="text-xs font-bold text-foreground">Protected</h4>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        Last Snapshot: {stats?.lastBackupDate ? formatDate(stats.lastBackupDate) : 'No snapshots yet'}
                    </p>
                </Card>

                <Card className="p-3 bg-secondary/15 border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Total Records</p>
                            <h4 className="text-base font-bold text-foreground mt-0.5">
                                {loadingStats ? '...' : (stats?.totalRecords?.toLocaleString() || 0)}
                            </h4>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <DatabaseBackup className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        CRM: {stats?.counts?.crm?.total || 0} | KonnectX: {stats?.counts?.konnectx?.total || 0} | Legacy: {stats?.counts?.konnectLegacy?.total || 0}
                    </p>
                </Card>

                <Card className="p-3 bg-secondary/15 border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Cloud Snapshots</p>
                            <h4 className="text-base font-bold text-foreground mt-0.5">
                                {loadingSnapshots ? '...' : `${snapshots.length} / 10`}
                            </h4>
                        </div>
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                            <Cloud className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        Stored in persistent database vault
                    </p>
                </Card>

                <Card className="p-3 bg-secondary/15 border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Recovery Engine</p>
                            <h4 className="text-xs font-bold text-foreground mt-1">v2.1 Schema</h4>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            <RotateCcw className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        Full & selective relational restore
                    </p>
                </Card>
            </div>

            {/* Sub-Navigation Bar */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-lg border border-border/40">
                    <button
                        onClick={() => setSubTab('create')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            subTab === 'create'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <HardDriveDownload className="w-3.5 h-3.5 text-primary" />
                        <span>Create Backup</span>
                    </button>

                    <button
                        onClick={() => setSubTab('restore')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            subTab === 'restore'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <HardDriveUpload className="w-3.5 h-3.5 text-sky-500" />
                        <span>Restore Data</span>
                        {uploadedBundle && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                    </button>

                    <button
                        onClick={() => setSubTab('history')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            subTab === 'history'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <History className="w-3.5 h-3.5 text-amber-500" />
                        <span>Snapshot Vault</span>
                        {snapshots.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-secondary text-foreground font-bold">
                                {snapshots.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { loadStats(); loadSnapshots(); toast.success("Refreshed backup telemetry"); }}
                        className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Tab 1: CREATE BACKUP */}
            {subTab === 'create' && (
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card">
                        <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <DatabaseBackup className="w-4 h-4 text-primary" />
                                        <span>Create Workspace Snapshot & Backup</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Export all workspace data or selectively pick modules for targeted disaster recovery.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedModules(['crm', 'konnectx', 'konnect-legacy', 'productivity', 'settings', 'automation', 'ats'])}
                                        className="h-7 text-[11px] cursor-pointer"
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedModules([])}
                                        className="h-7 text-[11px] cursor-pointer"
                                    >
                                        Deselect
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-4 space-y-4">
                            {/* Module Selector Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {MODULE_DEFINITIONS.map(mod => {
                                    const isSelected = selectedModules.includes(mod.id);
                                    const Icon = mod.icon;

                                    return (
                                        <div
                                            key={mod.id}
                                            onClick={() => toggleModule(mod.id)}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                                isSelected
                                                    ? `${mod.bgColor} ${mod.borderColor} ring-1 ring-primary/20`
                                                    : 'bg-secondary/10 border-border/40 hover:bg-secondary/25'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-md ${mod.bgColor} ${mod.color} shrink-0 mt-0.5`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-xs font-bold text-foreground">{mod.name}</h5>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                            : 'border-muted-foreground/30'
                                                    }`}>
                                                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                                                    {mod.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Additional Backup Configuration */}
                            <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-semibold">Snapshot Label (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Pre-migration checkpoint, Q4 Archive..."
                                        value={backupLabel}
                                        onChange={(e) => setBackupLabel(e.target.value)}
                                        className="h-8 text-xs mt-1 bg-secondary/20"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Helps identify this snapshot in your cloud vault later.
                                    </p>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/10 border border-border/30">
                                        <div>
                                            <p className="text-xs font-medium text-foreground">Save to Snapshot Vault</p>
                                            <p className="text-[10px] text-muted-foreground">Keep a copy stored in cloud database for 1-click restore</p>
                                        </div>
                                        <Switch
                                            checked={saveToVault}
                                            onCheckedChange={setSaveToVault}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/10 border border-border/30">
                                        <div>
                                            <p className="text-xs font-medium text-foreground">Include Credentials & API Keys</p>
                                            <p className="text-[10px] text-muted-foreground">Export configured OAuth & webhook credential records</p>
                                        </div>
                                        <Switch
                                            checked={includeSensitive}
                                            onCheckedChange={setIncludeSensitive}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="px-4 py-3 border-t border-border/40 bg-secondary/5 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                <span>{selectedModules.length} module(s) selected for export.</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreateBackup(true)}
                                    disabled={isCreating || selectedModules.length === 0}
                                    className="h-8 text-xs gap-1.5 cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5 text-primary" />
                                    <span>Download JSON File</span>
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => handleCreateBackup(false)}
                                    disabled={isCreating || selectedModules.length === 0}
                                    className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs cursor-pointer"
                                >
                                    {isCreating ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Building Backup...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Cloud className="w-3.5 h-3.5" />
                                            <span>Create Cloud Snapshot</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Direct API Route Quick Export info banner */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <FileJson className="w-4 h-4 text-primary shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">Direct REST Backup Endpoint</p>
                                <p className="text-[10px] text-muted-foreground">
                                    Automate your backups via cron or external tools: <code className="bg-secondary/40 px-1 py-0.5 rounded text-foreground font-mono">/api/workspace/{workspaceId}/system/backup</code>
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/api/workspace/${workspaceId}/system/backup?format=download`}
                            download
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                            <span>Direct Link</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            )}

            {/* Tab 2: RESTORE FROM BACKUP */}
            {subTab === 'restore' && (
                <div className="space-y-4">
                    {/* Staging Dropzone / File Picker */}
                    <Card className="border-border/50 bg-card">
                        <CardHeader className="pb-3 pt-4 px-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <HardDriveUpload className="w-4 h-4 text-sky-500" />
                                <span>Restore Workspace Data</span>
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Select a backup JSON package to preview contents, inspect schema integrity, and execute restoration.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-4 space-y-4">
                            {/* Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleFileSelect(file);
                                }}
                                className="border-2 border-dashed border-border/70 hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                    className="hidden"
                                />

                                <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    <Upload className="w-5 h-5" />
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-foreground">
                                        {uploadedFile ? uploadedFile.name : 'Click to browse or drag & drop backup JSON file'}
                                    </h5>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Supports Devlomatix Backup schema v1.x and v2.x JSON bundles
                                    </p>
                                </div>

                                {uploadedFile && (
                                    <Badge variant="outline" className="text-[10px] mt-1 gap-1">
                                        <FileJson className="w-3 h-3 text-primary" />
                                        <span>File Selected: {uploadedFile.name}</span>
                                    </Badge>
                                )}
                            </div>

                            {/* Inspection / Dry Run Telemetry */}
                            {isValidating && (
                                <div className="p-4 rounded-lg bg-secondary/20 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                    <span>Inspecting package manifest and verifying relational integrity...</span>
                                </div>
                            )}

                            {validationResult && validationResult.valid && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 rounded-lg bg-secondary/15 border border-border/50 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-bold text-foreground">Package Inspection Passed</span>
                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                {validationResult.totalRecordsDetected} records ready
                                            </Badge>
                                        </div>

                                        <span className="text-[11px] text-muted-foreground">
                                            Originated: {formatDate(validationResult.manifest?.createdAt)}
                                        </span>
                                    </div>

                                    {/* Warnings if cross workspace */}
                                    {validationResult.warnings?.length > 0 && (
                                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] flex items-start gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            <div>
                                                {validationResult.warnings.map((w, idx) => (
                                                    <p key={idx}>{w}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Entity Counts Detected Pill Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-muted-foreground">CRM Data</p>
                                            <p className="text-xs font-bold text-foreground">
                                                {validationResult.detectedCounts.accounts + validationResult.detectedCounts.contacts + validationResult.detectedCounts.deals}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-emerald-500 font-medium">KonnectX</p>
                                            <p className="text-xs font-bold text-emerald-500">
                                                {validationResult.detectedCounts.konnectxMessages + validationResult.detectedCounts.konnectxTemplates}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-teal-500 font-medium">Konnect Legacy</p>
                                            <p className="text-xs font-bold text-teal-500">
                                                {validationResult.detectedCounts.legacyMessages + validationResult.detectedCounts.legacyContacts}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-muted-foreground">Kanban Tasks</p>
                                            <p className="text-xs font-bold text-foreground">{validationResult.detectedCounts.kanbanTasks}</p>
                                        </div>
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-muted-foreground">Workflows</p>
                                            <p className="text-xs font-bold text-foreground">
                                                {validationResult.detectedCounts.workflows + validationResult.detectedCounts.systemCrons}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-card border border-border/40 text-center">
                                            <p className="text-[10px] text-muted-foreground">Jobs & ATS</p>
                                            <p className="text-xs font-bold text-foreground">
                                                {validationResult.detectedCounts.jobs + validationResult.detectedCounts.candidates}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Restore Strategy Selection */}
                                    <div className="pt-2 border-t border-border/40 space-y-2">
                                        <Label className="text-xs font-bold">Restoration Strategy</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div
                                                onClick={() => setRestoreMode('merge')}
                                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                    restoreMode === 'merge'
                                                        ? 'bg-primary/10 border-primary text-foreground'
                                                        : 'bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RotateCcw className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-xs font-bold">Merge & Update (Safe)</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Keeps all existing records untouched. Updates matching items and appends new ones.
                                                </p>
                                            </div>

                                            <div
                                                onClick={() => setRestoreMode('clean')}
                                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                    restoreMode === 'clean'
                                                        ? 'bg-rose-500/10 border-rose-500/50 text-foreground'
                                                        : 'bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="text-xs font-bold text-rose-500">Clean Overwrite (Wipe & Replace)</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Wipes selected module records in this workspace and replaces them with backup snapshot.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selective Module Checkboxes */}
                                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                                        <Label className="text-xs font-bold">Select Modules to Restore</Label>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {MODULE_DEFINITIONS.map(mod => {
                                                const isChecked = restoreModules.includes(mod.id);
                                                return (
                                                    <button
                                                        key={mod.id}
                                                        type="button"
                                                        onClick={() => toggleRestoreModule(mod.id)}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                                            isChecked
                                                                ? 'bg-primary/20 text-primary border border-primary/30 font-semibold'
                                                                : 'bg-secondary/20 text-muted-foreground border border-border/40 hover:bg-secondary/40'
                                                        }`}
                                                    >
                                                        {isChecked && <Check className="w-3 h-3 text-primary stroke-[3]" />}
                                                        <span>{mod.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Execution Progress Bar */}
                            {isRestoring && (
                                <div className="space-y-2 p-3 rounded-lg bg-secondary/20">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                                            Restoring workspace data...
                                        </span>
                                        <span className="text-muted-foreground">{restoreProgress}%</span>
                                    </div>
                                    <Progress value={restoreProgress} className="h-1.5" />
                                </div>
                            )}

                            {/* Restoration Summary Card */}
                            {restoreResultSummary && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <h5 className="text-xs font-bold text-foreground">Restore Successfully Executed</h5>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                                            Mode: {restoreResultSummary.mode.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="text-[11px] text-muted-foreground space-y-1">
                                        <p>Modules restored: <span className="text-foreground font-semibold">{restoreResultSummary.modulesRestored.join(', ')}</span></p>
                                        {restoreResultSummary.counts.crm && (
                                            <p>CRM: {restoreResultSummary.counts.crm.contacts} contacts, {restoreResultSummary.counts.crm.deals} deals, {restoreResultSummary.counts.crm.quotations} quotations</p>
                                        )}
                                        {restoreResultSummary.counts.konnectx && (
                                            <p className="text-emerald-500">KonnectX: {restoreResultSummary.counts.konnectx.messages} WhatsApp messages, {restoreResultSummary.counts.konnectx.templates} templates, {restoreResultSummary.counts.konnectx.botFlows} bot flows</p>
                                        )}
                                        {restoreResultSummary.counts.konnectLegacy && (
                                            <p className="text-teal-500">Konnect Legacy: {restoreResultSummary.counts.konnectLegacy.messages} legacy messages, {restoreResultSummary.counts.konnectLegacy.contacts} contacts, {restoreResultSummary.counts.konnectLegacy.campaigns} campaigns</p>
                                        )}
                                        {restoreResultSummary.counts.productivity && (
                                            <p>Productivity: {restoreResultSummary.counts.productivity.tasks} kanban tasks restored</p>
                                        )}
                                    </div>

                                    {restoreResultSummary.errors?.length > 0 && (
                                        <div className="p-2 rounded bg-amber-500/10 text-amber-500 text-[10px]">
                                            <p className="font-semibold">Minor warnings:</p>
                                            {restoreResultSummary.errors.slice(0, 3).map((e, idx) => (
                                                <p key={idx}>• {e}</p>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </CardContent>

                        <CardFooter className="px-4 py-3 border-t border-border/40 bg-secondary/5 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setUploadedFile(null);
                                    setUploadedBundle(null);
                                    setValidationResult(null);
                                    setRestoreResultSummary(null);
                                }}
                                disabled={!uploadedBundle || isRestoring}
                                className="h-8 text-xs text-muted-foreground cursor-pointer"
                            >
                                Clear Staged File
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => {
                                    if (restoreMode === 'clean') {
                                        setConfirmDialogOpen(true);
                                    } else {
                                        handleExecuteRestore();
                                    }
                                }}
                                disabled={!validationResult?.valid || isRestoring || restoreModules.length === 0}
                                className={`h-8 text-xs gap-1.5 font-bold shadow-xs cursor-pointer ${
                                    restoreMode === 'clean'
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                        : 'bg-primary text-primary-foreground'
                                }`}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{restoreMode === 'clean' ? 'Proceed with Clean Restore...' : 'Start Safe Restoration'}</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Tab 3: CLOUD SNAPSHOT VAULT */}
            {subTab === 'history' && (
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card">
                        <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Cloud className="w-4 h-4 text-sky-500" />
                                        <span>Cloud Snapshot Vault</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Persistent workspace checkpoints stored directly in your platform database. 1-click restore ready.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {snapshots.length} / 10 slots
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="px-4 pb-4">
                            {loadingSnapshots ? (
                                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                    <span>Loading snapshot vault...</span>
                                </div>
                            ) : snapshots.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-border/60 rounded-xl space-y-2">
                                    <Cloud className="w-8 h-8 mx-auto text-muted-foreground/50" />
                                    <h5 className="text-xs font-bold text-foreground">No Snapshots Saved Yet</h5>
                                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                                        Create your first snapshot in the 'Create Backup' tab to safeguard your workspace state.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setSubTab('create')}
                                        className="h-7 text-xs mt-2 cursor-pointer"
                                    >
                                        Create Snapshot
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {snapshots.map((snap) => (
                                        <div
                                            key={snap.id}
                                            className="p-3 rounded-lg border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-xs font-bold text-foreground truncate">{snap.label}</h5>
                                                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
                                                        {snap.totalRecords} records
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(snap.createdAt)}
                                                    </span>
                                                    <span>Size: {formatBytes(snap.sizeBytes)}</span>
                                                    <span>By: {snap.createdBy}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 pt-0.5">
                                                    {snap.modules?.map((m) => (
                                                        <span key={m} className="px-1.5 py-0.2 rounded text-[9px] bg-secondary/40 text-muted-foreground">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        const res = await fetchSnapshotData(workspaceId, snap.id);
                                                        if (res.success) {
                                                            triggerFileDownload(res.backupBundle, `${snap.label.replace(/\s+/g, '_')}.json`);
                                                            toast.success("Snapshot downloaded");
                                                        }
                                                    }}
                                                    className="h-7 text-xs px-2 gap-1 cursor-pointer"
                                                    title="Download JSON"
                                                >
                                                    <Download className="w-3 h-3 text-primary" />
                                                    <span className="hidden sm:inline">JSON</span>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => handleLoadSnapshotForRestore(snap.id)}
                                                    className="h-7 text-xs px-2.5 gap-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 cursor-pointer font-semibold"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    <span>Restore</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSnapshot(snap.id, snap.label)}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 cursor-pointer"
                                                    title="Delete Snapshot"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Clean Wipe Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-rose-500 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <span>Confirm Clean Overwrite Restore</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground pt-1">
                            Clean overwrite is a destructive operation. Existing records for the selected modules ({restoreModules.join(', ')}) in this workspace will be deleted and replaced with this snapshot.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed">
                            To prevent accidental data loss, please type <strong className="font-mono text-white">RESTORE</strong> below to proceed.
                        </div>

                        <Input
                            placeholder="Type RESTORE to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="h-9 text-xs font-mono uppercase bg-secondary/20"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDialogOpen(false)}
                            className="text-xs cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleExecuteRestore}
                            disabled={confirmText.trim().toUpperCase() !== 'RESTORE'}
                            className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer"
                        >
                            Execute Clean Restore
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default BackupRestoreSettings;
