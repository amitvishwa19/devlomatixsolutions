'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    FolderPlus,
    Share2,
    Plus,
    Download,
    Trash2,
    Home,
    ChevronRight,
    Loader2,
    LayoutGrid,
    List as ListIcon,
    Search,
    UserPlus,
    ExternalLink,
    FileText,
    Folder as FolderIcon,
    Image as ImageIcon,
    Video,
    Music,
    Globe,
    Filter,
    ArrowUpDown,
    MoreVertical,
    MoreHorizontal,
    Upload,
    Star,
    Sparkles,
    CheckSquare,
    Square,
    FolderOutput,
    Users,
    Clock,
    Layers,
    FileCode,
    Pencil,
    RefreshCcw,
    RotateCcw,
    AlertTriangle,
    Eye,
    FolderOpen,
    Check,
    X,
    FileSpreadsheet,
    FileArchive,
    FileIcon,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getDocuments } from '../_actions/get-documents';
import { getDocumentById } from '../_actions/get-document-by-id';
import { createDocument } from '../_actions/create-document';
import { updateDocument } from '../_actions/update-document';
import { deleteDocument } from '../_actions/delete-document';
import { moveDocuments } from '../_actions/move-documents';
import { restoreDocuments } from '../_actions/restore-documents';
import { emptyTrash } from '../_actions/empty-trash';
import { duplicateDocument } from '../_actions/duplicate-document';

import { DocumentCard } from './DocumentCard';
import DocumentStats from './DocumentStats';
import ShareModal from './ShareModal';
import FileViewerModal from './FileViewerModal';
import RichDocumentEditorModal from './RichDocumentEditorModal';
import DocumentInspector from './DocumentInspector';
import FolderDetailsModal from './FolderDetailsModal';
import DocumentAiModal from './DocumentAiModal';
import { EmptyState } from '@/components/global/EmptyState';

const getFileIcon = (fileType = '', name = '') => {
    if (fileType.includes("pdf") || name.endsWith(".pdf")) return <FileText className="w-4 h-4 text-rose-500" />;
    if (fileType.includes("image") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".webp")) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    if (fileType === 'application/vnd.devlomatix.note' || name.endsWith(".doc")) return <FileText className="w-4 h-4 text-purple-500" />;
    if (fileType.includes("video") || name.endsWith(".mp4")) return <Video className="w-4 h-4 text-indigo-500" />;
    if (fileType.includes("audio") || name.endsWith(".mp3")) return <Music className="w-4 h-4 text-pink-500" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="w-4 h-4 text-amber-500" />;

    return <FileIcon className="w-4 h-4 text-primary" />;
};

export function DocumentManager({ workspaceId, userId, initialView = 'all' }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const currentUserId = userId || session?.user?.userId || session?.user?.id;

    // View tab (all, files, folders, shared, starred, uploads, trash)
    const [activeTab, setActiveTab] = useState(initialView);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Hierarchy & Navigation
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    // Multi-selection states
    const [selectedDocIds, setSelectedDocIds] = useState([]);

    // Modals and Drawers
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isRichDocOpen, setIsRichDocOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [shareTargetDoc, setShareTargetDoc] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [viewerTargetDoc, setViewerTargetDoc] = useState(null);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [inspectorDoc, setInspectorDoc] = useState(null);
    const [folderDetailsDoc, setFolderDetailsDoc] = useState(null);
    const [isFolderDetailsOpen, setIsFolderDetailsOpen] = useState(false);

    // AI Intelligence Modal
    const [aiTargetDoc, setAiTargetDoc] = useState(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const handleOpenAiInsights = (doc) => {
        setAiTargetDoc(doc);
        setIsAiModalOpen(true);
    };

    const handleDuplicateDocument = async (doc) => {
        try {
            toast.loading("Duplicating document...", { id: "duplicate-doc" });
            const res = await duplicateDocument(workspaceId, doc.id);
            if (!res.success) throw new Error(res.error);
            toast.success(`"${doc.name}" duplicated successfully`, { id: "duplicate-doc" });
            fetchDocuments();
            fetchAllFolders();
        } catch (error) {
            console.error("Duplicate error:", error);
            toast.error(error.message || "Failed to duplicate document", { id: "duplicate-doc" });
        }
    };

    // Batch move & upload destination modal
    const [isBatchMoveOpen, setIsBatchMoveOpen] = useState(false);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [targetFolderId, setTargetFolderId] = useState('root');
    const [uploadTargetFolderId, setUploadTargetFolderId] = useState('root');

    // Fetch all folders for folder-target operations
    const fetchAllFolders = useCallback(async () => {
        if (!workspaceId) return;
        try {
            const res = await getDocuments(workspaceId, { isFolder: true });
            if (res.success) {
                setAvailableFolders(res.data || []);
            }
        } catch (e) {
            console.error("Failed to load folders:", e);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchAllFolders();
    }, [fetchAllFolders]);

    const handleOpenUploadModal = (targetFolder = null) => {
        fetchAllFolders();
        if (targetFolder && targetFolder.id) {
            setUploadTargetFolderId(targetFolder.id);
        } else if (currentFolder?.id) {
            setUploadTargetFolderId(currentFolder.id);
        } else {
            const urlFolderId = searchParams.get('folderId') || searchParams.get('parentId');
            setUploadTargetFolderId(urlFolderId || 'root');
        }
        setIsUploadModalOpen(true);
    };

    // Upload queue & Dropzone states (for uploads tab)
    const [dragOver, setDragOver] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const fileInputRef = useRef(null);

    // Sync activeTab with URL search param
    useEffect(() => {
        const currentParam = searchParams.get('view') || 'all';
        if (currentParam !== activeTab) {
            setActiveTab(currentParam);
        }
    }, [searchParams, activeTab]);

    // Sync currentFolder and breadcrumbs with URL folderId / parentId parameter
    useEffect(() => {
        const folderIdParam = searchParams.get('folderId') || searchParams.get('parentId');

        if (!folderIdParam || folderIdParam === 'root') {
            if (currentFolder !== null) {
                setCurrentFolder(null);
                setBreadcrumbs([]);
            }
            return;
        }

        if (currentFolder && currentFolder.id === folderIdParam) {
            return;
        }

        let isMounted = true;
        const fetchFolderInfo = async () => {
            try {
                const res = await getDocumentById(workspaceId, folderIdParam);
                if (!isMounted) return;
                if (res.success && res.data) {
                    const folderData = res.data;
                    setCurrentFolder(folderData);

                    const crumbs = [];
                    if (folderData.parent) {
                        crumbs.push({ id: folderData.parent.id, name: folderData.parent.name });
                    }
                    crumbs.push({ id: folderData.id, name: folderData.name });
                    setBreadcrumbs(crumbs);
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Error fetching folder info:", error);
                setCurrentFolder(null);
                setBreadcrumbs([]);
            }
        };

        fetchFolderInfo();

        return () => {
            isMounted = false;
        };
    }, [workspaceId, searchParams, currentFolder]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSelectedDocIds([]);
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newTab);
        if (newTab !== 'all') {
            params.delete('parentId');
            params.delete('folderId');
            setCurrentFolder(null);
            setBreadcrumbs([]);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Fetch documents based on active tab and filters
    const fetchDocuments = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const isTrashView = activeTab === 'trash';
            const isFolderOnly = activeTab === 'folders';
            const isFilesOnly = activeTab === 'files';

            const filterType = activeTab === 'shared' ? 'shared' :
                activeTab === 'starred' ? 'starred' :
                    activeTab === 'mine' ? 'mine' : 'all';

            const folderIdParam = searchParams.get('folderId') || searchParams.get('parentId');
            const targetParentId = activeTab === 'all' ? (folderIdParam || currentFolder?.id || 'root') : undefined;

            const res = await getDocuments(workspaceId, {
                filter: filterType,
                isTrash: isTrashView,
                isFolder: isFolderOnly ? true : isFilesOnly ? false : undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                search: searchTerm || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
                parentId: targetParentId,
                sortBy,
                sortOrder
            });

            if (res.success) {
                setDocuments(res.data || []);

                // Check if preview param is in URL
                const previewDocId = searchParams.get('preview');
                if (previewDocId && !viewerTargetDoc) {
                    const found = res.data?.find(d => d.id === previewDocId);
                    if (found) {
                        setViewerTargetDoc(found);
                        setIsViewerModalOpen(true);
                    }
                }
            } else {
                toast.error(res.error || "Failed to load documents");
            }
        } catch (error) {
            console.error("Error loading documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, activeTab, selectedType, searchTerm, statusFilter, categoryFilter, currentFolder?.id, sortBy, sortOrder, searchParams, viewerTargetDoc]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Folder navigation
    const handleOpenFolder = (folder) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('folderId', folder.id);
        params.delete('parentId');
        if (activeTab !== 'all') {
            params.set('view', 'all');
            setActiveTab('all');
        }
        router.push(`${pathname}?${params.toString()}`);
        setCurrentFolder(folder);
        setBreadcrumbs(prev => {
            const existsIdx = prev.findIndex(b => b.id === folder.id);
            if (existsIdx !== -1) return prev.slice(0, existsIdx + 1);
            return [...prev, folder];
        });
        setSelectedDocIds([]);
    };

    const handleNavigateBreadcrumb = (folder, index) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('parentId');
        if (folder === null) {
            params.delete('folderId');
            setBreadcrumbs([]);
            setCurrentFolder(null);
        } else {
            params.set('folderId', folder.id);
            setBreadcrumbs(prev => prev.slice(0, index + 1));
            setCurrentFolder(folder);
        }
        setSelectedDocIds([]);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Upload handling via Supabase Storage
    const startUploadFile = async (file, overrideFolderId) => {
        const uploadId = Math.random().toString(36).substring(2, 9);
        const newUpload = {
            id: uploadId,
            name: file.name,
            size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
            progress: 15,
            status: "uploading",
        };

        setUploadQueue(prev => [newUpload, ...prev]);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${workspaceId}/${fileName}`;

            let progressInterval = setInterval(() => {
                setUploadQueue(curr => curr.map(u =>
                    u.id === uploadId ? { ...u, progress: Math.min(u.progress + 25, 90) } : u
                ));
            }, 300);

            const { error: uploadError } = await supabase.storage
                .from('devlomatix')
                .upload(filePath, file);

            clearInterval(progressInterval);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('devlomatix')
                .getPublicUrl(filePath);

            // Determine destination folder ID
            let destinationFolderId = null;
            if (overrideFolderId !== undefined && overrideFolderId !== null) {
                destinationFolderId = overrideFolderId === 'root' ? null : overrideFolderId;
            } else if (uploadTargetFolderId && uploadTargetFolderId !== 'root') {
                destinationFolderId = uploadTargetFolderId;
            } else if (uploadTargetFolderId === 'root') {
                destinationFolderId = null;
            } else {
                const urlFolderId = searchParams.get('folderId') || searchParams.get('parentId');
                destinationFolderId = currentFolder?.id || urlFolderId || null;
            }

            const res = await createDocument(workspaceId, {
                name: file.name,
                fileUrl: publicUrl,
                fileKey: filePath,
                fileType: file.type,
                fileSize: file.size,
                isFolder: false,
                parentId: destinationFolderId
            });

            if (!res.success) throw new Error(res.error);

            setUploadQueue(curr => curr.map(u =>
                u.id === uploadId ? { ...u, progress: 100, status: "complete" } : u
            ));

            toast.success(`${file.name} uploaded successfully`);
            setIsUploadModalOpen(false);
            fetchDocuments();
            fetchAllFolders();
        } catch (error) {
            console.error("Upload error:", error);
            setUploadQueue(curr => curr.map(u =>
                u.id === uploadId ? { ...u, status: "failed" } : u
            ));
            toast.error(error.message || `Failed to upload ${file.name}`);
        }
    };

    const handleFileInputChange = (e, overrideFolderId) => {
        const files = Array.from(e.target.files || []);
        files.forEach(f => startUploadFile(f, overrideFolderId));
    };

    const handleDropUpload = (e, overrideFolderId) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        files.forEach(f => startUploadFile(f, overrideFolderId));
    };

    // Folder creation
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return toast.error("Folder name is required");
        setIsCreatingFolder(true);
        const activeFolderId = searchParams.get('folderId') || searchParams.get('parentId') || currentFolder?.id;
        try {
            const res = await createDocument(workspaceId, {
                name: newFolderName.trim(),
                isFolder: true,
                parentId: activeFolderId || null
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Folder created successfully");
            setIsFolderOpen(false);
            setNewFolderName('');
            fetchDocuments();
            fetchAllFolders();
        } catch (error) {
            toast.error(error.message || "Failed to create folder");
        } finally {
            setIsCreatingFolder(false);
        }
    };

    // Star/Unstar toggle
    const handleToggleStar = async (doc) => {
        try {
            const res = await updateDocument(workspaceId, doc.id, {
                isStarred: !doc.isStarred
            });
            if (!res.success) throw new Error(res.error);
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isStarred: !d.isStarred } : d));
            if (inspectorDoc?.id === doc.id) {
                setInspectorDoc(prev => ({ ...prev, isStarred: !doc.isStarred }));
            }
        } catch (error) {
            toast.error("Failed to update star");
        }
    };

    // Soft delete
    const handleDeleteDocument = async (id) => {
        try {
            const res = await deleteDocument(workspaceId, id, false);
            if (!res.success) throw new Error(res.error);
            toast.success("Moved to Trash");
            setDocuments(prev => prev.filter(d => d.id !== id));
            setSelectedDocIds(prev => prev.filter(item => item !== id));
            if (inspectorDoc?.id === id) setInspectorDoc(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete document");
        }
    };

    // Move document into folder
    const handleMoveDocument = async (draggedDocId, targetFolderId) => {
        try {
            const res = await updateDocument(workspaceId, draggedDocId, {
                parentId: targetFolderId === 'root' ? null : targetFolderId
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Item moved successfully");
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Failed to move item");
        }
    };

    // Trash operations
    const handleRestoreItem = async (id) => {
        try {
            const res = await restoreDocuments(workspaceId, [id]);
            if (!res.success) throw new Error(res.error);
            toast.success("Item restored!");
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            toast.error(error.message || "Failed to restore item");
        }
    };

    const handlePermanentDeleteItem = async (id) => {
        try {
            const res = await deleteDocument(workspaceId, id, true);
            if (!res.success) throw new Error(res.error);
            toast.success("Permanently deleted");
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            toast.error(error.message || "Failed to delete permanently");
        }
    };

    const handleRestoreAllTrash = async () => {
        try {
            const res = await restoreDocuments(workspaceId, [], true);
            if (!res.success) throw new Error(res.error);
            toast.success("All items restored!");
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Failed to restore all items");
        }
    };

    const handleEmptyTrash = async () => {
        try {
            const res = await emptyTrash(workspaceId, [], true);
            if (!res.success) throw new Error(res.error);
            toast.success("Trash emptied successfully");
            setDocuments([]);
        } catch (error) {
            toast.error(error.message || "Failed to empty trash");
        }
    };

    // Multi-select handlers
    const handleSelectToggle = (id, checked) => {
        if (checked) {
            setSelectedDocIds(prev => [...prev, id]);
        } else {
            setSelectedDocIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedDocIds(documents.map(d => d.id));
        } else {
            setSelectedDocIds([]);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedDocIds.length === 0) return;
        try {
            await Promise.all(selectedDocIds.map(id => deleteDocument(workspaceId, id, false)));
            toast.success(`${selectedDocIds.length} items moved to Trash`);
            setSelectedDocIds([]);
            fetchDocuments();
        } catch (error) {
            toast.error("Failed to delete selected items");
        }
    };

    const openBatchMoveModal = async () => {
        try {
            const res = await getDocuments(workspaceId, { isFolder: true });
            if (res.success) {
                setAvailableFolders(res.data.filter(d => !selectedDocIds.includes(d.id)));
                setTargetFolderId('root');
                setIsBatchMoveOpen(true);
            }
        } catch (error) {
            toast.error("Failed to load folders");
        }
    };

    const handleConfirmBatchMove = async () => {
        try {
            const res = await moveDocuments(workspaceId, selectedDocIds, targetFolderId);
            if (!res.success) throw new Error(res.error);
            toast.success(`${selectedDocIds.length} items moved`);
            setIsBatchMoveOpen(false);
            setSelectedDocIds([]);
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Failed to move selected items");
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-card/20 relative">
            {/* Top Stats Banner */}
            <div className="p-3 border-b border-border/40 bg-card/40 backdrop-blur-md shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-foreground">Document Management Workspace</h1>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                                Production Hub
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Securely store, organize, edit, and collaborate on rich documents and media assets.
                        </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setEditingDoc(null);
                                setIsRichDocOpen(true);
                            }}
                            className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-primary/5 hover:text-primary shadow-xs"
                        >
                            <Pencil className="w-3.5 h-3.5 text-purple-500" /> New Note / Doc
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsFolderOpen(true)}
                            className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-amber-500/5 hover:text-amber-500 shadow-xs"
                        >
                            <FolderPlus className="w-3.5 h-3.5 text-amber-500" /> New Folder
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => handleOpenUploadModal()}
                            className="text-xs font-semibold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                            <Upload className="w-3.5 h-3.5" /> Upload File
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Ribbon */}
                <DocumentStats workspaceId={workspaceId} userId={currentUserId} />
            </div>

            {/* Quick Filter Navigation Tabs */}
            <div className="px-3 py-2 border-b border-border/40 bg-card/60 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                    <TabsList className="bg-muted/40 p-1 rounded-lg border border-border/40 flex items-center gap-1 w-full md:w-auto overflow-x-auto">
                        <TabsTrigger value="all" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> All Assets
                        </TabsTrigger>
                        <TabsTrigger value="files" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Files Table
                        </TabsTrigger>
                        <TabsTrigger value="folders" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <FolderIcon className="w-3.5 h-3.5 text-amber-500" /> Folders
                        </TabsTrigger>
                        <TabsTrigger value="shared" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" /> Shared with Me
                        </TabsTrigger>
                        <TabsTrigger value="starred" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Starred
                        </TabsTrigger>
                        <TabsTrigger value="uploads" className="text-xs font-semibold px-2.5 py-1 gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-blue-500" /> Uploads
                        </TabsTrigger>
                        <TabsTrigger value="trash" className="text-xs font-semibold px-2.5 py-1 gap-1.5 text-destructive data-[state=active]:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" /> Trash
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Search & Status Filters */}
                {activeTab !== 'uploads' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-52">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search assets, tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 h-8 text-xs bg-background rounded-md border-border/60"
                            />
                        </div>

                        {activeTab !== 'trash' && (
                            <>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-8 w-28 text-xs font-semibold bg-background rounded-md border-border/60">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md">
                                        <SelectItem value="ALL" className="text-xs">All Status</SelectItem>
                                        <SelectItem value="APPROVED" className="text-xs">Approved</SelectItem>
                                        <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                                        <SelectItem value="REVIEW" className="text-xs">Review</SelectItem>
                                        <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-8 w-28 text-xs font-semibold bg-background rounded-md border-border/60">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                                        <SelectItem value="GENERAL" className="text-xs">General</SelectItem>
                                        <SelectItem value="SPECIFICATION" className="text-xs">Specification</SelectItem>
                                        <SelectItem value="CONTRACT" className="text-xs">Contract</SelectItem>
                                        <SelectItem value="REPORT" className="text-xs">Report</SelectItem>
                                        <SelectItem value="FINANCE" className="text-xs">Finance</SelectItem>
                                    </SelectContent>
                                </Select>

                                {activeTab === 'all' && (
                                    <div className="flex items-center rounded-md border border-border/60 bg-muted/40 p-0.5">
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="h-7 w-7 rounded-sm"
                                            onClick={() => setViewMode('grid')}
                                            title="Grid View"
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="h-7 w-7 rounded-sm"
                                            onClick={() => setViewMode('list')}
                                            title="List View"
                                        >
                                            <ListIcon className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Breadcrumb Navigation & Type Pills (Active in 'all' view) */}
            {activeTab === 'all' && (
                <div className="px-3 py-1.5 border-b border-border/30 bg-muted/10 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto">
                        <button
                            onClick={() => handleNavigateBreadcrumb(null, 0)}
                            className={`flex items-center gap-1 font-semibold hover:text-foreground transition-colors ${currentFolder === null ? 'text-foreground' : ''}`}
                        >
                            <Home className="w-3.5 h-3.5 text-primary" /> Root
                        </button>

                        {breadcrumbs.map((b, idx) => (
                            <React.Fragment key={b.id}>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                                <button
                                    onClick={() => handleNavigateBreadcrumb(b, idx)}
                                    className={`font-semibold hover:text-foreground transition-colors truncate max-w-[140px] ${idx === breadcrumbs.length - 1 ? 'text-foreground' : ''}`}
                                >
                                    {b.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-1 shrink-0">
                        {[
                            { id: 'all', label: 'All Types' },
                            { id: 'note', label: 'Notes' },
                            { id: 'pdf', label: 'PDFs' },
                            { id: 'image', label: 'Images' },
                            { id: 'video', label: 'Video' },
                            { id: 'audio', label: 'Audio' },
                            { id: 'folder', label: 'Folders' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedType(t.id)}
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-all ${selectedType === t.id
                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Trash Actions Header */}
            {activeTab === 'trash' && documents.length > 0 && (
                <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between gap-3 text-xs font-semibold text-destructive animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">{documents.length}</Badge>
                        <span>items in Recycle Bin</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRestoreAllTrash}
                            className="h-7 text-xs font-semibold gap-1.5 bg-background border-border/60 hover:bg-primary/5 hover:text-primary"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore All
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs font-semibold gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Empty Trash
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="w-5 h-5" /> Empty Recycle Bin?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs">
                                        This will permanently delete all {documents.length} items in the trash and remove associated cloud files. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
                                        Permanently Empty
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}

            {/* Batch Actions Bar (Shows when items are selected) */}
            {selectedDocIds.length > 0 && activeTab !== 'trash' && (
                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-3 text-xs font-semibold text-primary animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-xs">{selectedDocIds.length}</Badge>
                        <span>items selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={openBatchMoveModal}
                            className="h-7 text-xs font-semibold gap-1.5 bg-background border-primary/30"
                        >
                            <FolderOutput className="w-3.5 h-3.5" /> Move Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBatchDelete}
                            className="h-7 text-xs font-semibold gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDocIds([])}
                            className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* 1. UPLOADS TAB VIEW */}
                {activeTab === 'uploads' ? (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Target Destination Folder Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card/80 border border-border/60 rounded-xl backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <FolderIcon className="w-4 h-4 text-amber-500" />
                                <div>
                                    <p className="text-xs font-bold text-foreground">Upload Destination Folder</p>
                                    <p className="text-[10px] text-muted-foreground">Files dropped or uploaded here will be stored in this directory</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-64">
                                <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                                    <SelectTrigger className="h-8 text-xs font-semibold bg-background rounded-lg border-border/60">
                                        <SelectValue placeholder="Select target folder" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg max-h-56">
                                        <SelectItem value="root" className="text-xs font-semibold">📁 [Root Directory] (Main Workspace)</SelectItem>
                                        {availableFolders.map((f) => (
                                            <SelectItem key={f.id} value={f.id} className="text-xs font-semibold">
                                                📁 {f.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Card
                            className={`border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer rounded-2xl ${dragOver
                                ? "border-primary bg-primary/5 scale-[1.01]"
                                : "border-border/60 bg-card/60 hover:bg-muted/10 hover:border-primary/40"
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDropUpload}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Upload className="h-7 w-7 text-primary" />
                            </div>
                            <p className="font-bold text-sm text-foreground">Click to browse or drop files here</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                                PDF • DOCX • XLSX • PNG • JPG • MP4 • MP3 (UP TO 50 MB)
                            </p>
                        </Card>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            className="hidden"
                            multiple
                        />

                        {/* Active Queue */}
                        {uploadQueue.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Upload Progress ({uploadQueue.length})
                                </h3>
                                <div className="space-y-2">
                                    {uploadQueue.map((item) => (
                                        <Card key={item.id} className="p-3.5 border border-border/60 bg-card flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Upload className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold truncate text-foreground">{item.name}</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">{item.size}</span>
                                                    </div>
                                                    {item.status === 'uploading' && (
                                                        <Progress value={item.progress} className="h-1.5" />
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload History Table */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Recently Uploaded Files
                            </h3>
                            <Card className="border border-border/60 bg-card/80 backdrop-blur-md rounded-xl overflow-hidden divide-y divide-border/30">
                                {loading && documents.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                                        <span className="text-xs font-mono text-muted-foreground">Loading history...</span>
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <EmptyState
                                            icon={Clock}
                                            title="No Uploads Yet"
                                            description="Files you upload in this workspace will appear here."
                                        />
                                    </div>
                                ) : (
                                    documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                                    <FileIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : 'Unknown size'} • {format(new Date(doc.createdAt), "yyyy-MM-dd HH:mm")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setViewerTargetDoc(doc);
                                                        setIsViewerModalOpen(true);
                                                    }}
                                                    className="h-7 text-xs font-semibold gap-1 text-primary hover:bg-primary/10"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </Button>
                                                {doc.fileUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <a href={doc.fileUrl} download>
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </Card>
                        </div>
                    </div>
                ) : activeTab === 'files' ? (
                    /* 2. FILES TABLE VIEW */
                    <div className="flex-1 overflow-hidden p-4 flex flex-col">
                        <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border/60 shadow-xs flex-1 overflow-hidden flex flex-col">
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            <th className="p-3 w-10 text-center">
                                                <Checkbox
                                                    checked={selectedDocIds.length === documents.length && documents.length > 0}
                                                    onCheckedChange={handleSelectAll}
                                                    className="rounded border-border/60"
                                                />
                                            </th>
                                            <th className="p-3">Asset Name</th>
                                            <th className="p-3">Owner / Author</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">File Size</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Collaborators</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3 w-12 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30 text-xs font-medium text-foreground/90">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={9} className="p-12 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                        <span className="text-xs font-mono">Loading files database...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : documents.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="p-16 text-center">
                                                    <EmptyState
                                                        icon={FileText}
                                                        title="No Files Found"
                                                        description="No files match your search criteria or category filter."
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            documents.map((f) => (
                                                <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="p-3 text-center">
                                                        <Checkbox
                                                            checked={selectedDocIds.includes(f.id)}
                                                            onCheckedChange={(c) => handleSelectToggle(f.id, c)}
                                                            className="rounded border-border/60"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <button
                                                                onClick={() => handleToggleStar(f)}
                                                                className="text-muted-foreground/40 hover:text-amber-500 transition-colors"
                                                            >
                                                                <Star className={`w-3.5 h-3.5 ${f.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                                                            </button>
                                                            {getFileIcon(f.fileType, f.name)}
                                                            <span
                                                                onClick={() => {
                                                                    if (f.content) {
                                                                        setEditingDoc(f);
                                                                        setIsRichDocOpen(true);
                                                                    } else {
                                                                        setViewerTargetDoc(f);
                                                                        setIsViewerModalOpen(true);
                                                                    }
                                                                }}
                                                                className="truncate max-w-[260px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                {f.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground">
                                                        {f.user?.displayName || "Member"}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-[10px] border-border/60 font-mono">
                                                            {f.category || "GENERAL"}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground font-mono">
                                                        {f.fileSize ? (f.fileSize > 1024 * 1024 ? `${(f.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${(f.fileSize / 1024).toFixed(0)} KB`) : "Rich Doc"}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary" className="text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                                            {f.status || 'APPROVED'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        {f.sharedCount > 0 ? (
                                                            <span className="flex items-center gap-1 text-primary text-[11px] font-semibold">
                                                                <Users className="w-3 h-3" /> {f.sharedCount} members
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground/60 italic">Private</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                                                        {format(new Date(f.createdAt), "yyyy-MM-dd")}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:text-foreground">
                                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-44 rounded-lg shadow-xl border-border/50">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setViewerTargetDoc(f);
                                                                        setIsViewerModalOpen(true);
                                                                    }}
                                                                    className="text-xs font-semibold gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-primary" /> View / Preview
                                                                </DropdownMenuItem>
                                                                {f.content && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setEditingDoc(f);
                                                                            setIsRichDocOpen(true);
                                                                        }}
                                                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5 text-purple-500" /> Edit Note
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {f.fileUrl && (
                                                                    <DropdownMenuItem asChild className="text-xs font-semibold gap-2 cursor-pointer">
                                                                        <a href={f.fileUrl} download>
                                                                            <Download className="w-3.5 h-3.5 text-emerald-500" /> Download
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setShareTargetDoc(f);
                                                                        setIsShareModalOpen(true);
                                                                    }}
                                                                    className="text-xs font-semibold gap-2 cursor-pointer"
                                                                >
                                                                    <Users className="w-3.5 h-3.5 text-primary" /> Share Access
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteDocument(f.id)}
                                                                    className="text-xs font-semibold gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'folders' ? (
                    /* 3. FOLDERS GRID VIEW */
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading && documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-xs font-mono text-muted-foreground animate-pulse">Loading Directory Folders...</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="py-16 text-center">
                                <EmptyState
                                    icon={FolderOpen}
                                    title="No Folders Found"
                                    description={searchTerm ? "No folders match your search criteria." : "Organize your workspace by creating your first folder."}
                                />
                                <Button onClick={() => setIsFolderOpen(true)} size="sm" className="mt-4 text-xs font-semibold gap-1.5">
                                    <FolderPlus className="w-3.5 h-3.5" /> Create Directory Folder
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                                {documents.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        onClick={() => {
                                            setFolderDetailsDoc(folder);
                                            setIsFolderDetailsOpen(true);
                                        }}
                                        className="p-4 flex flex-col justify-between hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border-border/60 bg-card rounded-xl relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between w-full mb-3">
                                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                                                <FolderOpen className="h-5 w-5 fill-amber-500/20" />
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleStar(folder)}
                                                    className={`p-1 rounded-md text-muted-foreground/60 hover:text-amber-500 transition-colors ${folder.isStarred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                        }`}
                                                    title={folder.isStarred ? "Unstar" : "Star"}
                                                >
                                                    <Star className={`w-3.5 h-3.5 ${folder.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                                                </button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-md text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-border/50">
                                                        <DropdownMenuItem
                                                            className="text-xs font-semibold gap-2 cursor-pointer"
                                                            onClick={() => handleOpenFolder(folder)}
                                                        >
                                                            <FolderOpen className="h-3.5 w-3.5 text-primary" /> Open Folder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-xs font-semibold gap-2 cursor-pointer"
                                                            onClick={() => handleOpenUploadModal(folder)}
                                                        >
                                                            <Upload className="h-3.5 w-3.5 text-emerald-500" /> Upload Files Here
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-xs font-semibold gap-2 cursor-pointer"
                                                            onClick={() => {
                                                                setShareTargetDoc(folder);
                                                                setIsShareModalOpen(true);
                                                            }}
                                                        >
                                                            <Share2 className="h-3.5 w-3.5 text-primary" /> Share Folder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteDocument(folder.id)}
                                                            className="text-xs font-semibold gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete Folder
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">
                                                {folder.name}
                                            </h3>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>{folder._count?.children || 0} files</span>
                                                {folder.sharedCount > 0 && (
                                                    <span className="flex items-center gap-0.5 text-primary font-semibold">
                                                        <Users className="w-2.5 h-2.5" /> {folder.sharedCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'trash' ? (
                    /* 4. TRASH VIEW */
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading && documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-xs font-mono text-muted-foreground animate-pulse">Loading Trash Items...</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="py-20 text-center">
                                <EmptyState
                                    icon={Trash2}
                                    title="Recycle Bin is Empty"
                                    description="Deleted documents and folders will appear here where you can restore them or permanently delete them."
                                />
                            </div>
                        ) : (
                            <Card className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden divide-y divide-border/30">
                                {documents.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-muted/30 transition-colors group gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                                {item.isFolder ? <FolderIcon className="w-5 h-5 text-amber-500 fill-amber-500/20" /> : getFileIcon(item.fileType, item.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Deleted {formatDistanceToNow(new Date(item.deletedAt || new Date()))} ago
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRestoreItem(item.id)}
                                                className="h-8 px-3 text-xs font-semibold rounded-lg bg-background hover:bg-primary/5 hover:text-primary border-border/60"
                                            >
                                                <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Restore
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handlePermanentDeleteItem(item.id)}
                                                className="h-8 px-3 text-xs font-semibold rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Permanently
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        )}
                    </div>
                ) : (
                    /* 5. EXPLORER / ALL ASSETS / SHARED / STARRED VIEW */
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-xs font-mono text-muted-foreground animate-pulse uppercase tracking-wider">
                                    Synchronizing Documents...
                                </span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="py-16 text-center">
                                <EmptyState
                                    icon={currentFolder ? FolderOpen : FileText}
                                    title={
                                        activeTab === 'starred' ? "No Starred Items" :
                                            activeTab === 'shared' ? "No Shared Documents" :
                                                currentFolder ? `"${currentFolder.name}" is empty` :
                                                    "No Documents Found"
                                    }
                                    description={
                                        searchTerm ? "No assets match your search criteria." :
                                            currentFolder ? "This folder has no files or subfolders yet. Upload a file or create a note to get started." :
                                                "Start by creating a note, folder, or uploading a file."
                                    }
                                />
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingDoc(null);
                                            setIsRichDocOpen(true);
                                        }}
                                        className="text-xs font-semibold gap-1.5"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Create Note
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenUploadModal()}
                                        className="text-xs font-semibold gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Upload File
                                    </Button>
                                </div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                                {documents.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        isSelected={selectedDocIds.includes(doc.id)}
                                        onSelectToggle={handleSelectToggle}
                                        onDelete={handleDeleteDocument}
                                        onDownload={(d) => window.open(d.fileUrl, '_blank')}
                                        onView={(d) => {
                                            setViewerTargetDoc(d);
                                            setIsViewerModalOpen(true);
                                        }}
                                        onShare={(d) => {
                                            setShareTargetDoc(d);
                                            setIsShareModalOpen(true);
                                        }}
                                        onEditNote={(d) => {
                                            setEditingDoc(d);
                                            setIsRichDocOpen(true);
                                        }}
                                        onOpenFolder={handleOpenFolder}
                                        onUploadToFolder={handleOpenUploadModal}
                                        onMoveDocument={handleMoveDocument}
                                        onToggleStar={handleToggleStar}
                                        onDuplicate={handleDuplicateDocument}
                                        onAiInsights={handleOpenAiInsights}
                                        onSelectForInspector={(d) => setInspectorDoc(d)}
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        isSelected={selectedDocIds.includes(doc.id)}
                                        onSelectToggle={handleSelectToggle}
                                        onDelete={handleDeleteDocument}
                                        onDownload={(d) => window.open(d.fileUrl, '_blank')}
                                        onView={(d) => {
                                            setViewerTargetDoc(d);
                                            setIsViewerModalOpen(true);
                                        }}
                                        onShare={(d) => {
                                            setShareTargetDoc(d);
                                            setIsShareModalOpen(true);
                                        }}
                                        onEditNote={(d) => {
                                            setEditingDoc(d);
                                            setIsRichDocOpen(true);
                                        }}
                                        onOpenFolder={handleOpenFolder}
                                        onUploadToFolder={handleOpenUploadModal}
                                        onMoveDocument={handleMoveDocument}
                                        onToggleStar={handleToggleStar}
                                        onDuplicate={handleDuplicateDocument}
                                        onAiInsights={handleOpenAiInsights}
                                        onSelectForInspector={(d) => setInspectorDoc(d)}
                                        viewMode="list"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Right Inspector Drawer (Active in Explorer & Shared Views) */}
                {inspectorDoc && activeTab !== 'uploads' && activeTab !== 'trash' && (
                    <DocumentInspector
                        document={inspectorDoc}
                        onClose={() => setInspectorDoc(null)}
                        onView={(d) => {
                            setViewerTargetDoc(d);
                            setIsViewerModalOpen(true);
                        }}
                        onDownload={(d) => window.open(d.fileUrl, '_blank')}
                        onShare={(d) => {
                            setShareTargetDoc(d);
                            setIsShareModalOpen(true);
                        }}
                        onEditNote={(d) => {
                            setEditingDoc(d);
                            setIsRichDocOpen(true);
                        }}
                        onToggleStar={handleToggleStar}
                        onDuplicate={handleDuplicateDocument}
                        onDelete={handleDeleteDocument}
                        workspaceId={workspaceId}
                    />
                )}
            </div>

            {/* Global Modals */}
            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onOpenChange={setIsShareModalOpen}
                document={shareTargetDoc}
                workspaceId={workspaceId}
                onShareComplete={fetchDocuments}
            />

            {/* File Viewer Modal */}
            <FileViewerModal
                isOpen={isViewerModalOpen}
                onOpenChange={setIsViewerModalOpen}
                file={viewerTargetDoc}
                workspaceId={workspaceId}
                onShare={(d) => {
                    setShareTargetDoc(d);
                    setIsShareModalOpen(true);
                }}
            />

            {/* Rich Document Editor Modal */}
            <RichDocumentEditorModal
                isOpen={isRichDocOpen}
                onOpenChange={setIsRichDocOpen}
                document={editingDoc}
                workspaceId={workspaceId}
                currentFolderId={currentFolder?.id || searchParams.get('folderId') || searchParams.get('parentId')}
                onSaveComplete={fetchDocuments}
            />

            {/* Folder Details Modal */}
            <FolderDetailsModal
                isOpen={isFolderDetailsOpen}
                onOpenChange={setIsFolderDetailsOpen}
                folder={folderDetailsDoc}
                workspaceId={workspaceId}
                onDelete={handleDeleteDocument}
                onUploadToFolder={handleOpenUploadModal}
            />

            {/* Create Folder Modal */}
            <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border border-border/60 p-6 shadow-2xl">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-500">
                            <FolderPlus className="w-5 h-5" />
                            <DialogTitle className="text-base font-bold">Create Directory Folder</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a new folder in <span className="font-semibold text-foreground">{currentFolder ? currentFolder.name : 'Root Directory'}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Folder Name</Label>
                        <Input
                            placeholder="e.g. Invoices 2026, Product Specs..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="h-10 text-xs font-semibold rounded-lg bg-background border-border/60"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsFolderOpen(false)} className="text-xs font-semibold">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleCreateFolder}
                            disabled={isCreatingFolder || !newFolderName.trim()}
                            className="text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                        >
                            {isCreatingFolder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                            Create Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload File Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl border border-border/60 p-6 shadow-2xl">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <Upload className="w-5 h-5" />
                            <DialogTitle className="text-base font-bold">Upload Document / Media Asset</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Upload any file to your root workspace or select a specific destination folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-4">
                        {/* Destination Folder Selector */}
                        <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <FolderIcon className="w-3.5 h-3.5 text-amber-500" /> Destination Folder
                                </Label>
                                <span className="text-[10px] text-muted-foreground">Choose where files will be stored</span>
                            </div>
                            <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                                <SelectTrigger className="h-9 text-xs font-semibold bg-background rounded-lg border-border/60">
                                    <SelectValue placeholder="Select destination folder" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg max-h-56">
                                    <SelectItem value="root" className="text-xs font-semibold">
                                        📁 [Root Directory] (Main Workspace)
                                    </SelectItem>
                                    {availableFolders.map((f) => (
                                        <SelectItem key={f.id} value={f.id} className="text-xs font-semibold">
                                            📁 {f.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Dropzone */}
                        <div className="relative group cursor-pointer border-2 border-dashed border-border/60 rounded-2xl bg-muted/10 p-8 text-center transition-all hover:bg-primary/5 hover:border-primary/40">
                            <Input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileInputChange}
                                multiple
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md">
                                    <Upload className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">Click or drag files here to upload</p>
                                    <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-mono">
                                        PDF • DOCX • XLSX • PNG • JPG • MP4 • MP3 (UP TO 50MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Batch Move Modal */}
            <Dialog open={isBatchMoveOpen} onOpenChange={setIsBatchMoveOpen}>
                <DialogContent className="sm:max-w-md rounded-xl border border-border/60 p-6 shadow-2xl">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <FolderOutput className="w-5 h-5" />
                            <DialogTitle className="text-base font-bold">Move {selectedDocIds.length} Items</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Choose target destination folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Folder</Label>
                        <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                            <SelectTrigger className="h-10 text-xs font-semibold bg-background rounded-lg border-border/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="root" className="text-xs font-semibold">📁 [Root Directory]</SelectItem>
                                {availableFolders.map((f) => (
                                    <SelectItem key={f.id} value={f.id} className="text-xs font-semibold">
                                        📁 {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsBatchMoveOpen(false)} className="text-xs font-semibold">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleConfirmBatchMove} className="text-xs font-semibold">
                            Confirm Move
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Document Intelligence Modal */}
            <DocumentAiModal
                isOpen={isAiModalOpen}
                onOpenChange={setIsAiModalOpen}
                document={aiTargetDoc}
                workspaceId={workspaceId}
            />
        </div>
    );
}