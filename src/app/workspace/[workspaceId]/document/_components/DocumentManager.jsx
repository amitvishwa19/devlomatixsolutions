"use client";

import React, { useState, useEffect } from "react";
import {
    FolderPlus,
    Share2,
    Plus,
    Download,
    Trash,
    RefreshCw,
    Home,
    ChevronRight,
    FileUp,
    Loader2,
    Loader,
    Grid,
    List,
    Search,
    UserPlus,
    ExternalLink,
    FileText as FileTextIcon,
    Folder as FolderIcon,
    Image as ImageIcon,
    Video,
    Music,
    Globe,
    Filter,
    ArrowUpDown,
    MoreVertical,
    FileIcon,
    Folder,
    Upload,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import axios from "@/utils/axios";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { DocumentCard } from "./DocumentCard";
import DocumentStats from "./DocumentStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecentDocuments from "./RecentDocuments";
import ActivityFeeds from "./ActivityFeeds";

const FileTypeIcon = ({ document }) => {
    const type = document.fileType;
    const isFolder = document.isFolder;

    if (isFolder) return (
        <div className="w-12 h-12 rounded-md bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
            <Folder className="w-7 h-7 text-amber-500 fill-amber-500/20" />
        </div>
    );

    let bgColor = "bg-blue-50";
    let iconColor = "text-blue-500";
    let Icon = FileIcon;

    if (type?.startsWith("image/")) {
        bgColor = "bg-emerald-50";
        iconColor = "text-emerald-500";
        Icon = ImageIcon;
    } else if (type === "application/pdf") {
        bgColor = "bg-rose-50";
        iconColor = "text-rose-500";
        Icon = FileTextIcon;
    } else if (type?.startsWith("video/")) {
        bgColor = "bg-purple-50";
        iconColor = "text-purple-500";
        Icon = Video;
    } else if (type?.startsWith("audio/")) {
        bgColor = "bg-pink-50";
        iconColor = "text-pink-500";
        Icon = Music;
    }

    return (
        <div className={`w-12 h-12 rounded-md ${bgColor} flex items-center justify-center border border-border/50 shadow-sm`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
    );
};

const ShareModal = ({ doc, onClose }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground ml-1">Recipient Email</Label>
                <Input placeholder="user@example.com" className="h-12 bg-muted/30 border-none rounded-md font-bold" />
            </div>
            <Button className="w-full rounded-md shadow-lg shadow-primary/20" onClick={() => {
                toast.success("Shared successfully");
                onClose();
            }}>
                Send Invitation
            </Button>
        </div>
    );
};

export const DocumentManager = ({ workspaceId, userId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [newFolderName, setNewFolderName] = useState("");
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async (parentId = null) => {
        try {
            setLoading(true);
            const pId = parentId || "root";
            const response = await axios.get(`/api/workspace/${workspaceId}/document`);
            setDocuments(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchDocuments(currentFolder?.id);
        }
    }, [workspaceId, currentFolder]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return toast.error("Please select a file");

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${workspaceId}/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('devlomatix')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('devlomatix')
                .getPublicUrl(filePath);

            await axios.post(`/api/workspace/${workspaceId}/document`, {
                name: file.name,
                fileUrl: publicUrl,
                fileKey: filePath,
                fileType: file.type,
                fileSize: file.size,
                workspaceId,
                userId: userId,
                isFolder: false,
                parentId: currentFolder?.id || null
            });

            toast.success("File uploaded successfully");
            setIsUploadOpen(false);
            fetchDocuments(currentFolder?.id);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return toast.error("Folder name is required");
        setLoading(true)
        try {
            await axios.post(`/api/workspace/${workspaceId}/document`, {
                name: newFolderName,
                workspaceId,
                userId: userId,
                isFolder: true,
                parentId: currentFolder?.id || null
            });
            toast.success("Folder created");
            setIsFolderOpen(false);
            setNewFolderName("");
            fetchDocuments(currentFolder?.id);
        } catch (error) {
            toast.error("Failed to create folder");
        } finally {
            setLoading(false)
        }
    };

    const handleDelete = async (id) => {
        try {
            const docToDelete = documents.find(d => d.id === id);
            if (docToDelete && docToDelete.fileKey) {
                await supabase.storage.from('devlomatix').remove([docToDelete.fileKey]);
            }
            await axios.delete(`/api/workspace/${workspaceId}/document/${id}`);
            toast.success("Deleted successfully");
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleMoveDocument = async (documentId, targetFolderId) => {
        try {
            await axios.patch(`/api/workspace/${workspaceId}/document/${documentId}`, {
                parentId: targetFolderId
            });
            toast.success("Item moved successfully");
            fetchDocuments(currentFolder?.id);
        } catch (error) {
            toast.error("Failed to move item");
            console.error("Move error:", error);
        }
    };

    const openFolder = (folder) => {
        setBreadcrumbs((prev) => [...prev, folder]);
        setCurrentFolder(folder);
    };

    const navigateTo = (folder, index) => {
        if (folder === null) {
            setBreadcrumbs([]);
            setCurrentFolder(null);
        } else {
            setBreadcrumbs((prev) => prev.slice(0, index + 1));
            setCurrentFolder(folder);
        }
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Top Navigation / Breadcrumbs Area */}
            <div className=" backdrop-blur-md ">
                <div>
                    <h1 className="text-xl font-semibold ">Dashboard</h1>
                    <p className="text-muted-foreground text-xs mt-1">Overview of your document management system</p>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-2">
                <DocumentStats workspaceId={workspaceId} userId={userId} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <RecentDocuments workspaceId={workspaceId} userId={userId} />
                <ActivityFeeds workspaceId={workspaceId} userId={userId} />
            </div>



            {/* Modals & Dialogs */}
            <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-md overflow-hidden border-border/40 shadow-2xl p-0">
                    <DialogHeader className="p-8 pb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-md flex items-center justify-center mb-4 border border-amber-100 shadow-sm">
                            <FolderPlus className="w-6 h-6 text-amber-500" />
                        </div>
                        <DialogTitle className="text-2xl">Create New Folder</DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            Organize your documents by creating a new directory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-8 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-muted-foreground ml-1">Folder Name</Label>
                            <Input
                                placeholder="Enter folder name..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md font-bold"
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-4 flex flex-row gap-4">
                        <Button variant="ghost" className="rounded-md font-bold flex-1" onClick={() => setIsFolderOpen(false)}>Cancel</Button>
                        <Button className="rounded-md flex-1 shadow-lg shadow-primary/20" onClick={handleCreateFolder}>Create Folder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-md overflow-hidden border-border/40 shadow-2xl p-0">
                    <DialogHeader className="p-8 pb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4 border border-primary/20 shadow-sm">
                            <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl">Upload Assets</DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            Select files to securely store in the current directory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 pt-4">
                        <div className="relative group cursor-pointer border-2 border-dashed border-border/40 rounded-[2rem] bg-muted/5 p-12 text-center transition-all hover:bg-primary/[0.02] hover:border-primary/30">
                            <Input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-all duration-300">
                                <div className="w-20 h-20 bg-background rounded-[1.5rem] flex items-center justify-center shadow-xl border border-border/20 group-hover:border-primary/20 ring-4 ring-primary/5">
                                    {uploading ? (
                                        <Loader className="w-10 h-10 text-primary animate-spin" />
                                    ) : (
                                        <Plus className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base text-foreground/80">Click or drag files here</p>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] opacity-60">PDF • IMAGE • VIDEO • AUDIO</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col rounded-[2.5rem] overflow-hidden border-border/40 shadow-2xl bg-background/95 backdrop-blur-3xl">
                    <DialogHeader className="p-8 border-b border-border/20 flex flex-row items-center justify-between shrink-0 bg-background/50">
                        <div className="flex items-center gap-5">
                            <div className="flex-shrink-0">
                                <FileTypeIcon document={previewDoc || {}} />
                            </div>
                            <div className="flex flex-col">
                                <DialogTitle className="text-2xl truncate max-w-[40vw] ">
                                    {previewDoc?.name}
                                </DialogTitle>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground tracking-[0.15em] mt-1 italic">
                                    <span>Added {previewDoc && format(new Date(previewDoc.createdAt), "MMMM d, yyyy")}</span>
                                    {previewDoc?.fileSize && (
                                        <>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                            <span>{(previewDoc.fileSize / 1024).toFixed(1)} KB</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mr-8">
                            <Button variant="outline" size="sm" onClick={() => window.open(previewDoc?.fileUrl, "_blank")} className="rounded-md px-6 font-bold border-border/60 hover:bg-muted transition-all bg-background/50">
                                <ExternalLink className="w-4 h-4 mr-2" /> Open Externally
                            </Button>
                            <Button size="sm" onClick={() => window.open(previewDoc?.fileUrl, "_blank")} className="rounded-md px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="w-full flex-1 bg-[#f1f5f9]/40 flex items-center justify-center p-12 overflow-y-auto">
                        {(() => {
                            const mType = previewDoc?.fileType || "";

                            if (mType.startsWith("image/")) {
                                return (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-20 -z-10 animate-pulse" />
                                        <img src={previewDoc.fileUrl} alt={previewDoc.name} className="max-w-full max-h-[65vh] object-contain rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-8 border-white ring-1 ring-border/20 transition-transform duration-700 hover:scale-[1.01]" />
                                    </div>
                                );
                            }

                            if (mType === "application/pdf") {
                                return (
                                    <div className="w-full h-full p-2">
                                        <iframe src={`${previewDoc.fileUrl}#toolbar=0`} title={previewDoc.name} className="w-full h-full rounded-[1.5rem] shadow-2xl border-4 border-white bg-white shadow-primary/[0.02]" />
                                    </div>
                                );
                            }

                            if (mType.startsWith("video/")) {
                                return (
                                    <div className="w-full max-w-4xl relative">
                                        <div className="absolute inset-0 bg-primary/30 blur-[150px] rounded-full opacity-10 -z-10" />
                                        <video controls autoPlay className="w-full rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-8 border-white ring-1 ring-border/20">
                                            <source src={previewDoc.fileUrl} type={mType} />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                );
                            }

                            if (mType.startsWith("audio/")) {
                                return (
                                    <div className="bg-background/80 backdrop-blur-3xl p-16 rounded-[3rem] border border-border/20 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] flex flex-col items-center gap-12 w-full max-w-lg relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
                                        <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-inner relative z-10 ring-4 ring-primary/5">
                                            <Music className="w-16 h-16 text-primary" />
                                        </div>
                                        <audio controls className="w-full relative z-10 custom-audio-player">
                                            <source src={previewDoc.fileUrl} type={mType} />
                                            Your browser does not support the audio element.
                                        </audio>
                                        <p className="text-[10px] text-muted-foreground tracking-[0.3em] italic relative z-10 opacity-40">{previewDoc.name}</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col items-center justify-center py-20 text-center max-w-md">
                                    <div className="w-32 h-32 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mb-10 relative group ring-1 ring-border/50 shadow-inner">
                                        <Globe className="w-14 h-14 text-muted-foreground/20 group-hover:text-primary/30 transition-all duration-500 group-hover:rotate-12" />
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-background border border-border/40 rounded-md flex items-center justify-center text-[11px] text-primary shadow-2xl ring-4 ring-muted/20">
                                            {previewDoc?.extension?.replace('.', '') || '?'}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl text-foreground/80 mb-4 tracking-tighter leading-none">Can't Preview File</h3>
                                    <p className="text-sm text-muted-foreground/60 mb-12 font-medium leading-[1.6] max-w-xs mx-auto">
                                        This file type isn't supported for direct view. Download it or open it in a new tab to see contents.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                                        <Button onClick={() => window.open(previewDoc?.fileUrl, "_blank")} className="rounded-[1.2rem] shadow-2xl shadow-primary/30 px-10 w-full sm:w-auto hover:translate-y-[-2px] transition-all active:translate-y-0">
                                            <Globe className="w-5 h-5 mr-3" /> View Externally
                                        </Button>
                                        <Button variant="ghost" onClick={() => window.open(previewDoc?.fileUrl, "_blank")} className="rounded-[1.2rem] px-8 text-muted-foreground hover:text-foreground transition-all w-full sm:w-auto">
                                            <Download className="w-5 h-5 mr-3" /> Download
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-md overflow-hidden border-border/40 shadow-2xl p-0">
                    <DialogHeader className="p-8 pb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4 border border-primary/20 shadow-sm">
                            <Share2 className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl">Share Asset</DialogTitle>
                        <DialogDescription className="text-sm font-medium leading-relaxed">
                            Manage access and permissions for this document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 pt-0">
                        {selectedDoc && <ShareModal doc={selectedDoc} onClose={() => setIsShareOpen(false)} />}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
