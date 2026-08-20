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
import { BatchActionBar } from './BatchActionBar';
import { DocumentCommandPalette } from './DocumentCommandPalette';
import {
    AllAssetsTab,
    FilesTableTab,
    FoldersGridTab,
    UploadsTab,
    TrashTab
} from './tabs';
import { EmptyState } from '@/components/global/EmptyState';

const getFileIcon = (fileType, name) => {
    const type = (fileType || '').toLowerCase();
    const fileName = (name || '').toLowerCase();

    if (type.includes("pdf") || fileName.endsWith(".pdf")) return <FileText className="w-4 h-4 text-rose-500" />;
    if (type.includes("image") || fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".webp") || fileName.endsWith(".svg")) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (type.includes("spreadsheet") || type.includes("excel") || fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    if (type === 'application/vnd.devlomatix.note' || fileName.endsWith(".doc") || fileName.endsWith(".docx") || fileName.endsWith(".note")) return <FileText className="w-4 h-4 text-purple-500" />;
    if (type.includes("video") || fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".mov")) return <Video className="w-4 h-4 text-indigo-500" />;
    if (type.includes("audio") || fileName.endsWith(".mp3") || fileName.endsWith(".wav") || fileName.endsWith(".m4a")) return <Music className="w-4 h-4 text-pink-500" />;
    if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("gz") || fileName.endsWith(".zip")) return <FileArchive className="w-4 h-4 text-amber-500" />;

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
    const [newFolderColor, setNewFolderColor] = useState('amber');
    const [newFolderIcon, setNewFolderIcon] = useState('folder');
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

    // Command Palette state
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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

    // Sync activeTab with URL search param without looping
    useEffect(() => {
        const currentParam = searchParams.get('view') || 'all';
        if (currentParam !== activeTab) {
            setActiveTab(currentParam);
        }
    }, [searchParams]);

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
    }, [workspaceId, searchParams, currentFolder?.id]);

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;
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
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Extract folderId parameter value for fetch dependencies
    const urlFolderId = searchParams.get('folderId') || searchParams.get('parentId') || '';

    // Fetch documents based on active tab and filters
    const fetchDocuments = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const isTrashView = activeTab === 'trash';
            const isFolderOnly = activeTab === 'folders';
            const isFilesOnly = activeTab === 'files' || activeTab === 'uploads';

            const filterType = activeTab === 'shared' ? 'shared' :
                activeTab === 'starred' ? 'starred' :
                    activeTab === 'mine' ? 'mine' : 'all';

            const targetParentId = activeTab === 'all' ? (urlFolderId || currentFolder?.id || 'root') : undefined;

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
            } else {
                toast.error(res.error || "Failed to load documents");
            }
        } catch (error) {
            console.error("Error loading documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, activeTab, selectedType, searchTerm, statusFilter, categoryFilter, currentFolder?.id, urlFolderId, sortBy, sortOrder]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Handle URL preview param independently
    useEffect(() => {
        const previewDocId = searchParams.get('preview');
        if (previewDocId && !viewerTargetDoc && documents.length > 0) {
            const found = documents.find(d => d.id === previewDocId);
            if (found) {
                setViewerTargetDoc(found);
                setIsViewerModalOpen(true);
            }
        }
    }, [searchParams, documents, viewerTargetDoc]);

    // Folder navigation
    const handleOpenFolder = (folder) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('folderId', folder.id);
        params.delete('parentId');
        if (activeTab !== 'all') {
            params.set('view', 'all');
            setActiveTab('all');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        setCurrentFolder(folder);
        setBreadcrumbs(prev => {
            const existsIdx = prev.findIndex(b => b.id === folder.id);
            if (existsIdx !== -1) return prev.slice(0, existsIdx + 1);
            return [...prev, folder];
        });
        setSelectedDocIds([]);
    };

    const handleNavigateBreadcrumb = (target) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('parentId');
        if (!target || target === 'root' || target === null) {
            params.delete('folderId');
            setBreadcrumbs([]);
            setCurrentFolder(null);
        } else if (typeof target === 'string') {
            const idx = breadcrumbs.findIndex(b => b.id === target);
            params.set('folderId', target);
            if (idx !== -1) {
                setBreadcrumbs(prev => prev.slice(0, idx + 1));
                setCurrentFolder(breadcrumbs[idx]);
            }
        } else {
            params.set('folderId', target.id);
            const idx = breadcrumbs.findIndex(b => b.id === target.id);
            if (idx !== -1) setBreadcrumbs(prev => prev.slice(0, idx + 1));
            setCurrentFolder(target);
        }
        setSelectedDocIds([]);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
                parentId: activeFolderId || null,
                tags: [`color:${newFolderColor}`, `icon:${newFolderIcon}`]
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Folder created successfully");
            setIsFolderOpen(false);
            setNewFolderName('');
            setNewFolderColor('amber');
            setNewFolderIcon('folder');
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

    // Bulk Star toggle
    const handleBatchToggleStar = async () => {
        if (selectedDocIds.length === 0) return;
        try {
            const selectedDocs = documents.filter(d => selectedDocIds.includes(d.id));
            const shouldStar = selectedDocs.some(d => !d.isStarred);
            await Promise.all(
                selectedDocIds.map(id => updateDocument(workspaceId, id, { isStarred: shouldStar }))
            );
            toast.success(`${selectedDocIds.length} items ${shouldStar ? 'starred' : 'unstarred'}`);
            fetchDocuments();
        } catch (error) {
            toast.error("Failed to update stars");
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
        <div
            className="flex flex-col h-full overflow-hidden bg-card/20 relative"
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                setDragOver(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files || []);
                const activeFolderId = currentFolder?.id || searchParams.get('folderId') || searchParams.get('parentId') || null;
                files.forEach(f => startUploadFile(f, activeFolderId));
            }}
        >
            {/* Global Drag & Drop Overlay */}
            {dragOver && (
                <div className="absolute inset-0 z-50 bg-background/85 backdrop-blur-md border-4 border-dashed border-primary/60 rounded-xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-3 shadow-lg scale-110 animate-bounce">
                        <Upload className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Drop files anywhere to upload</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Uploading into <span className="font-semibold text-foreground">{currentFolder ? currentFolder.name : 'Root Directory'}</span>
                    </p>
                </div>
            )}

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
                        {/* Command Palette Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="text-xs font-semibold gap-2 h-8 bg-muted/40 border-border/60 hover:bg-muted text-muted-foreground px-3"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Commands</span>
                            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
                                Ctrl K
                            </kbd>
                        </Button>

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

            {/* Main Content Area with Top Loading Bar */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
                {/* Smooth Top Loading Indicator */}
                <div className="h-0.5 w-full bg-transparent overflow-hidden shrink-0">
                    {loading && (
                        <div className="h-full w-full bg-primary animate-pulse transition-all duration-300" />
                    )}
                </div>

                <div className="flex-1 min-h-0 flex overflow-hidden">
                    {/* 1. UPLOADS TAB VIEW */}
                    {activeTab === 'uploads' ? (
                        <UploadsTab
                            workspaceId={workspaceId}
                            documents={documents}
                            loading={loading}
                            availableFolders={availableFolders}
                            uploadTargetFolderId={uploadTargetFolderId}
                            setUploadTargetFolderId={setUploadTargetFolderId}
                            onViewDocument={(doc) => {
                                setViewerTargetDoc(doc);
                                setIsViewerModalOpen(true);
                            }}
                            onUploadSuccess={() => {
                                fetchDocuments();
                                fetchAllFolders();
                            }}
                        />
                    ) : activeTab === 'files' ? (
                        /* 2. FILES TABLE VIEW */
                        <FilesTableTab
                            documents={documents}
                            loading={loading}
                            selectedDocIds={selectedDocIds}
                            onSelectToggle={handleSelectToggle}
                            onSelectAll={handleSelectAll}
                            onToggleStar={handleToggleStar}
                            onEditNote={(doc) => {
                                setEditingDoc(doc);
                                setIsRichDocOpen(true);
                            }}
                            onViewDocument={(doc) => {
                                setViewerTargetDoc(doc);
                                setIsViewerModalOpen(true);
                            }}
                            onShareDocument={(doc) => {
                                setShareTargetDoc(doc);
                                setIsShareModalOpen(true);
                            }}
                            onDeleteDocument={handleDeleteDocument}
                        />
                    ) : activeTab === 'folders' ? (
                        /* 3. FOLDERS GRID VIEW */
                        <FoldersGridTab
                            documents={documents}
                            loading={loading}
                            searchTerm={searchTerm}
                            onOpenFolder={handleOpenFolder}
                            onOpenFolderDetails={(folder) => {
                                setFolderDetailsDoc(folder);
                                setIsFolderDetailsOpen(true);
                            }}
                            onUploadToFolder={handleOpenUploadModal}
                            onShareFolder={(folder) => {
                                setShareTargetDoc(folder);
                                setIsShareModalOpen(true);
                            }}
                            onToggleStar={handleToggleStar}
                            onDeleteFolder={handleDeleteDocument}
                            onOpenCreateFolder={() => setIsFolderOpen(true)}
                        />
                    ) : activeTab === 'trash' ? (
                        /* 4. TRASH VIEW */
                        <TrashTab
                            documents={documents}
                            loading={loading}
                            onRestoreItem={handleRestoreItem}
                            onPermanentDeleteItem={handlePermanentDeleteItem}
                            onRestoreAll={handleRestoreAllTrash}
                            onEmptyTrash={handleEmptyTrash}
                        />
                    ) : (
                        /* 5. EXPLORER / ALL ASSETS / SHARED / STARRED VIEW */
                        <AllAssetsTab
                            documents={documents}
                            loading={loading}
                            viewMode={viewMode}
                            activeTab={activeTab}
                            currentFolder={currentFolder}
                            breadcrumbs={breadcrumbs}
                            searchTerm={searchTerm}
                            selectedDocIds={selectedDocIds}
                            onSelectToggle={handleSelectToggle}
                            onNavigateBreadcrumb={handleNavigateBreadcrumb}
                            onDeleteDocument={handleDeleteDocument}
                            onViewDocument={(doc) => {
                                setViewerTargetDoc(doc);
                                setIsViewerModalOpen(true);
                            }}
                            onShareDocument={(doc) => {
                                setShareTargetDoc(doc);
                                setIsShareModalOpen(true);
                            }}
                            onEditNote={(doc) => {
                                setEditingDoc(doc);
                                setIsRichDocOpen(true);
                            }}
                            onOpenFolder={handleOpenFolder}
                            onUploadToFolder={handleOpenUploadModal}
                            onMoveDocument={handleMoveDocument}
                            onToggleStar={handleToggleStar}
                            onDuplicate={handleDuplicateDocument}
                            onAiInsights={handleOpenAiInsights}
                            onSelectForInspector={(d) => setInspectorDoc(d)}
                            onOpenCreateNote={() => {
                                setEditingDoc(null);
                                setIsRichDocOpen(true);
                            }}
                            onOpenUploadModal={() => handleOpenUploadModal()}
                        />
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
                <DialogContent className="sm:max-w-[460px] rounded-2xl border border-border/60 p-6 shadow-2xl">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-500">
                            <FolderPlus className="w-5 h-5" />
                            <DialogTitle className="text-base font-bold">Create Directory Folder</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a custom-branded folder in <span className="font-semibold text-foreground">{currentFolder ? currentFolder.name : 'Root Directory'}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Folder Name *</Label>
                            <Input
                                placeholder="e.g. Invoices 2026, Engineering Specs..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="h-10 text-xs font-semibold rounded-lg bg-background border-border/60"
                            />
                        </div>

                        {/* Color Theme Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accent Color</Label>
                            <div className="flex items-center gap-2">
                                {[
                                    { id: 'amber', bg: 'bg-amber-500', label: 'Amber' },
                                    { id: 'emerald', bg: 'bg-emerald-500', label: 'Emerald' },
                                    { id: 'blue', bg: 'bg-blue-500', label: 'Blue' },
                                    { id: 'indigo', bg: 'bg-indigo-500', label: 'Indigo' },
                                    { id: 'rose', bg: 'bg-rose-500', label: 'Rose' },
                                    { id: 'purple', bg: 'bg-purple-500', label: 'Purple' },
                                    { id: 'cyan', bg: 'bg-cyan-500', label: 'Cyan' },
                                ].map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setNewFolderColor(c.id)}
                                        className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${newFolderColor === c.id ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-md' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Icon Style Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Folder Icon</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'folder', label: 'Folder' },
                                    { id: 'briefcase', label: 'Business' },
                                    { id: 'code', label: 'Tech' },
                                    { id: 'shield', label: 'Security' },
                                    { id: 'rocket', label: 'Releases' },
                                    { id: 'target', label: 'Marketing' },
                                    { id: 'sparkles', label: 'Creative' },
                                    { id: 'book', label: 'Docs' },
                                ].map((ic) => (
                                    <button
                                        key={ic.id}
                                        type="button"
                                        onClick={() => setNewFolderIcon(ic.id)}
                                        className={`p-2 rounded-lg border text-xs font-medium transition-colors text-center ${newFolderIcon === ic.id ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'}`}
                                    >
                                        {ic.label}
                                    </button>
                                ))}
                            </div>
                        </div>
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

            {/* Floating Linear-style Multi-Select Action Dock */}
            <BatchActionBar
                selectedDocs={documents.filter(d => selectedDocIds.includes(d.id))}
                onClearSelection={() => setSelectedDocIds([])}
                onMove={openBatchMoveModal}
                onDelete={handleBatchDelete}
                onToggleStarAll={handleBatchToggleStar}
                isTrashView={activeTab === 'trash'}
                onRestore={handleRestoreAllTrash}
                onPermanentDelete={handleEmptyTrash}
            />

            {/* Power-User Command Palette (Cmd+K / Ctrl+K) */}
            <DocumentCommandPalette
                isOpen={isCommandPaletteOpen}
                onOpenChange={setIsCommandPaletteOpen}
                documents={documents}
                onCreateNote={() => {
                    setEditingDoc(null);
                    setIsRichDocOpen(true);
                }}
                onCreateFolder={() => setIsFolderOpen(true)}
                onUploadFile={() => handleOpenUploadModal()}
                onNavigateView={(view) => handleTabChange(view)}
                onSelectDocument={(doc) => {
                    if (doc.isFolder) {
                        handleOpenFolder(doc);
                    } else if (!doc.fileUrl || doc.fileType === 'application/vnd.devlomatix.note') {
                        setEditingDoc(doc);
                        setIsRichDocOpen(true);
                    } else {
                        setViewerTargetDoc(doc);
                        setIsViewerModalOpen(true);
                    }
                }}
                onToggleViewMode={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                viewMode={viewMode}
            />
        </div>
    );
}