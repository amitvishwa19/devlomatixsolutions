"use client";

import { format } from "date-fns";
import { 
    FileIcon, 
    Folder, 
    MoreVertical, 
    Share2, 
    Trash, 
    Eye, 
    Download, 
    FileText, 
    Image as ImageIcon,
    Video,
    Music,
    Globe,
    FolderPlus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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

const FileTypeIcon = ({ document }) => {
    const type = document.fileType;
    const isFolder = document.isFolder;

    if (isFolder) return (
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
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
        Icon = FileText;
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
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
    );
};

export const DocumentCard = ({ document, onDelete, onDownload, onView, onShare, onOpenFolder, onMoveDocument, viewMode = "grid" }) => {
    const fileSize = document.fileSize ? (document.fileSize / 1024 / 1024).toFixed(2) + " MB" : "";

    const handleDragStart = (e) => {
        e.dataTransfer.setData("documentId", document.id);
    };

    const handleDragOver = (e) => {
        if (document.isFolder) {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-primary", "bg-primary/5");
        }
    };

    const handleDragLeave = (e) => {
        if (document.isFolder) {
            e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-primary/5");
        }
    };

    const handleDrop = (e) => {
        if (document.isFolder) {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-primary/5");
            const draggedId = e.dataTransfer.getData("documentId");
            if (draggedId && draggedId !== document.id && onMoveDocument) {
                onMoveDocument(draggedId, document.id);
            }
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        document.isFolder ? onOpenFolder(document) : onView(document);
    };

    if (viewMode === "list") {
        return (
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className="group flex items-center justify-between p-3 rounded-xl border border-border/100 bg-card/100 hover:bg-primary/5 cursor-pointer transition-all duration-300 hover:shadow-sm w-full"
            >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-background border border-primary/10 shadow-sm group-hover:bg-primary/10 transition-all">
                        <FileTypeIcon document={document} className="w-5 h-5 text-primary drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate text-foreground/90">{document.name}</span>
                            {document.isStarred && (
                                <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            )}
                            {document.status && document.status !== "APPROVED" && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{document.status}</Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{format(new Date(document.createdAt), "MMM d, yyyy")}</span>
                            {fileSize && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <span>{fileSize}</span>
                                </>
                            )}
                            {document.isFolder && document._count?.children !== undefined && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <span>{document._count.children} item{document._count.children !== 1 ? 's' : ''}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                    {document.category && (
                        <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-2 py-0.5 border-primary/10 bg-primary/5 text-primary">
                            {document.category}
                        </Badge>
                    )}
                    {document.sharedWith?.length > 0 && (
                        <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0.5 border-primary/20 text-primary bg-background/50">
                            Shared
                        </Badge>
                    )}
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                        {!document.isFolder && (
                            <>
                                <Button title="Preview" variant="ghost" size="icon" className="w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => { e.stopPropagation(); onView(document); }}>
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button title="Download" variant="ghost" size="icon" className="w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => onDownload(document)}>
                                    <Download className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                        <Button title="Share" variant="ghost" size="icon" className="w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => onShare(document)}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {document.isFolder ? 'Folder' : 'Document'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this {document.isFolder ? 'folder and all its contents' : 'document'}? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(document.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex flex-col p-5 rounded-2xl border border-border/100 bg-card/100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex-row items-center gap-4' : ''}`}
            onClick={handleClick}
        >
            <div className={`flex items-start justify-between mb-4 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                <FileTypeIcon document={document} />
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-xl border-border/10 backdrop-blur-md bg-background/95">
                        {!document.isFolder && (
                            <>
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); onView(document); }}>
                                    <Eye className="w-4 h-4 text-primary" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); onDownload(document); }}>
                                    <Download className="w-4 h-4 text-primary" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="opacity-50" />
                            </>
                        )}
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); onShare(document); }}>
                            <Share2 className="w-4 h-4 text-primary" /> Share
                        </DropdownMenuItem>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <Trash className="w-4 h-4" /> Delete
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {document.isFolder ? 'Folder' : 'Document'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this {document.isFolder ? 'folder and all its contents' : 'document'}? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(document.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-1 group-hover:translate-x-1 transition-transform duration-300">
                <h3 className="font-bold text-[15px] text-foreground/90 line-clamp-1">
                    {document.name}
                </h3>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-medium">
                        {document.userId ? 'Added by You' : 'System'}
                    </p>
                    {document.status && document.status !== "APPROVED" && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{document.status}</Badge>
                    )}
                </div>
            </div>

            {document.tags && document.tags.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                    {document.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/10">{tag}</Badge>
                    ))}
                </div>
            )}

            {document.isStarred && (
                <div className="absolute top-5 right-12 z-10 bg-amber-50 rounded-full p-1 opacity-100 shadow-sm border border-amber-100">
                    <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground/70 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    {document.isFolder ? (
                        <>
                            <FileIcon className="w-3.5 h-3.5 opacity-50" />
                            <span>{document._count?.children || 0} Files</span>
                        </>
                    ) : (
                        <>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
                        </>
                    )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(document.createdAt), "MMM d")}
                </div>
            </div>
            
            {document.sharedWithCount > 0 && (
                <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="h-5 px-1.5 bg-background/50 backdrop-blur-sm border-primary/10 rounded-full scale-75 origin-top-left">
                        <Share2 className="w-2.5 h-2.5 mr-1" /> {document.sharedWithCount}
                    </Badge>
                </div>
            )}
        </Card>
    );
};
