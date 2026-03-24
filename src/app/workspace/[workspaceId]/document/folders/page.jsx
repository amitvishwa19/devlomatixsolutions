'use client'

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    FolderOpen,
    FolderPlus,
    MoreHorizontal,
    FileText,
    Pencil,
    Trash2,
    Share2,
    Lock,
    Users,
    ChevronRight,
    Search,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import axios from "@/utils/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import ShareModal from "../_components/ShareModal";
import FolderDetailsModal from "../_components/FolderDetailsModal";

export default function FoldersPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const workspaceId = params.workspaceId;
    const userId = session?.user?.userId;

    const [search, setSearch] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchFolders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/workspace/${workspaceId}/document`);
            // Filter only folders
            const folderList = response.data.filter(doc => doc.isFolder);
            setFolders(folderList.map(f => ({
                id: f.id,
                name: f.name,
                files: f._count?.children || 0, // Assuming count comes from backend or we track it
                size: "0 MB", // Folders typically don't show size easily without recursion
                owner: f.user?.name || "Member",
                shared: false,
                locked: false,
                isStarred: f.isStarred || false,
                status: f.status || 'APPROVED',
                updated: format(new Date(f.updatedAt), "yyyy-MM-dd"),
                color: "bg-blue-100 text-blue-700" // Default color
            })));
        } catch (error) {
            console.error("Error fetching folders:", error);
            toast.error("Failed to load folders");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (workspaceId) {
            fetchFolders();
        }
    }, [workspaceId, fetchFolders]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return toast.error("Folder name is required");

        try {
            setIsCreating(true);
            await axios.post(`/api/workspace/${workspaceId}/document`, {
                name: newFolderName,
                workspaceId,
                userId: userId,
                isFolder: true,
                parentId: null
            });
            toast.success("Folder created successfully");
            setNewFolderName("");
            setIsDialogOpen(false);
            fetchFolders();
        } catch (error) {
            console.error("Folder creation error:", error);
            toast.error("Failed to create folder");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleStar = async (folder) => {
        try {
            await axios.patch(`/api/workspace/${workspaceId}/document/${folder.id}`, { isStarred: !folder.isStarred });
            fetchFolders();
        } catch (error) {
            console.error(error);
        }
    };

    // Share Modal States
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [folderToShare, setFolderToShare] = useState(null);

    const openShareModal = (folder) => {
        setFolderToShare(folder);
        setIsShareModalOpen(true);
    };

    // Folder Details Modal States
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedFolderDetails, setSelectedFolderDetails] = useState(null);

    const openDetailsModal = (folder) => {
        setSelectedFolderDetails(folder);
        setIsDetailsModalOpen(true);
    };

    const toggleStatus = async (folder) => {
        const statuses = ["PENDING", "REVIEW", "APPROVED"];
        const currentIndex = statuses.indexOf((folder.status || "APPROVED").toUpperCase());
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        try {
            await axios.patch(`/api/workspace/${workspaceId}/document/${folder.id}`, { status: nextStatus });
            fetchFolders();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            await axios.delete(`/api/workspace/${workspaceId}/document/${folderId}`);
            toast.success("Folder deleted");
            setFolders(prev => prev.filter(f => f.id !== folderId));
        } catch (error) {
            toast.error("Failed to delete folder");
        }
    };

    const filtered = folders.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.owner.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl h-full overflow-y-auto pr-2 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Folders</h1>
                    <p className="text-muted-foreground text-sm mt-1 uppercase font-black tracking-widest opacity-60">
                        {folders.length} folders · {folders.reduce((a, f) => a + f.files, 0)} total files
                    </p>
                </div>


                <ShareModal 
                isOpen={isShareModalOpen} 
                onOpenChange={setIsShareModalOpen} 
                document={folderToShare} 
                workspaceId={workspaceId} 
                onShareComplete={fetchFolders} 
            />

            <FolderDetailsModal
                isOpen={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                folder={selectedFolderDetails}
                workspaceId={workspaceId}
                onDelete={handleDeleteFolder}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 active:scale-[0.97] transition-transform bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <FolderPlus className="h-4 w-4" />
                            New Folder
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight">Create New Folder</DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <Input
                                placeholder="E.g. Project Assets, Q4 Reports..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="h-12 bg-muted/30 border-none rounded-xl font-bold transition-all focus-visible:ring-primary/20"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="ghost" className="rounded-xl font-bold">Cancel</Button>
                            </DialogClose>
                            <Button
                                onClick={handleCreateFolder}
                                disabled={isCreating}
                                className="rounded-xl h-12 font-black shadow-lg shadow-primary/20 px-8"
                            >
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Folder"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="p-3 shadow-sm border-none bg-background/50 backdrop-blur-sm animate-fade-up">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Search folders..."
                        className="pl-10 h-10 border-none bg-muted/50 rounded-xl font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Folder Grid */}
            {loading && folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Library...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border-2 border-dashed border-border/50">
                    <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mb-6">
                        <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-black text-foreground/80 mb-2">No folders found</h3>
                    <p className="text-sm text-muted-foreground/60 max-w-[280px] mx-auto mb-8 font-medium">
                        {search ? "No folders match your search criteria." : "Start organizing your workspace by creating your first folder."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
                    {filtered.map((folder) => (
                        <Card
                            key={folder.id}
                            onClick={() => openDetailsModal(folder)}
                            className="h-40 w-40 p-5 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-border/40 bg-background/80 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between w-full">
                                <div className="relative">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-border/10 ${folder.color} group-hover:scale-110 transition-transform duration-500`}>
                                        <FolderOpen className="h-6 w-6 shrink-0" />
                                    </div>
                                    {folder.isStarred && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-amber-100 rounded-full p-0.5 shadow-sm">
                                            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        </div>
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2 min-w-[160px]">
                                        <DropdownMenuItem className="rounded-lg font-bold gap-3 py-2.5" onClick={() => router.push(`/workspace/${workspaceId}/document?folderId=${folder.id}`)}>
                                            <FolderOpen className="h-4 w-4 text-primary" /> Open Folder
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg font-bold gap-3 py-2.5" onClick={(e) => { e.stopPropagation(); toggleStar(folder); }}>
                                            <svg className="w-4 h-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={folder.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            {folder.isStarred ? 'Unstar Folder' : 'Star Folder'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg font-bold gap-3 py-2.5" onClick={(e) => { e.stopPropagation(); toggleStatus(folder); }}>
                                            <Loader2 className="h-4 w-4 text-blue-500" /> Toggle Status
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg font-bold gap-3 py-2.5">
                                            <Pencil className="h-4 w-4 text-amber-500" /> Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg font-bold gap-3 py-2.5" onClick={(e) => {
                                            e.stopPropagation();
                                            openShareModal(folder);
                                        }}>
                                            <Share2 className="h-4 w-4 text-primary" /> Share Access
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFolder(folder.id);
                                            }}
                                            className="rounded-lg font-bold gap-3 py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete Folder
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-black text-sm mb-1 truncate text-foreground/90 group-hover:text-primary transition-colors tracking-tight">{folder.name}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{folder.files} files</p>
                                    {folder.status && folder.status !== "APPROVED" && (
                                        <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">{folder.status}</Badge>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
