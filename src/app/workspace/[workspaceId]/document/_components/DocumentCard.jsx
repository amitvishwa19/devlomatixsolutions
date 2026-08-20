'use client';

import React from "react";
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
    FolderPlus,
    Star,
    Pencil,
    Users,
    Check,
    Upload
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const FileTypeVisual = ({ document }) => {
    const type = document.fileType || '';
    const isFolder = document.isFolder;
    const isNote = !isFolder && (!document.fileUrl || type === 'application/vnd.devlomatix.note');

    if (isFolder) {
        return (
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
        );
    }

    if (type.startsWith("image/") && document.fileUrl) {
        return (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/20 border border-border/40 flex items-center justify-center shrink-0">
                <img src={document.fileUrl} alt={document.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    let bgClass = "bg-primary/10 border-primary/20 text-primary";
    let Icon = FileIcon;

    if (isNote) {
        bgClass = "bg-purple-500/10 border-purple-500/20 text-purple-500";
        Icon = FileText;
    } else if (type === "application/pdf") {
        bgClass = "bg-rose-500/10 border-rose-500/20 text-rose-500";
        Icon = FileText;
    } else if (type.startsWith("video/")) {
        bgClass = "bg-indigo-500/10 border-indigo-500/20 text-indigo-500";
        Icon = Video;
    } else if (type.startsWith("audio/")) {
        bgClass = "bg-pink-500/10 border-pink-500/20 text-pink-500";
        Icon = Music;
    }

    return (
        <div className={`w-10 h-10 rounded-lg ${bgClass} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200`}>
            <Icon className="w-5 h-5" />
        </div>
    );
};

export const DocumentCard = ({
    document,
    isSelected = false,
    onSelectToggle,
    onDelete,
    onDownload,
    onView,
    onShare,
    onEditNote,
    onOpenFolder,
    onUploadToFolder,
    onMoveDocument,
    onToggleStar,
    onSelectForInspector,
    viewMode = "grid"
}) => {
    const isFolder = document.isFolder;
    const isNote = !isFolder && (!document.fileUrl || document.fileType === 'application/vnd.devlomatix.note');
    const fileSize = document.fileSize
        ? (document.fileSize > 1024 * 1024
            ? `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB`
            : `${(document.fileSize / 1024).toFixed(0)} KB`)
        : (isFolder ? `${document._count?.children || 0} items` : '');

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

    const handleCardClick = (e) => {
        e.stopPropagation();
        if (onSelectForInspector) {
            onSelectForInspector(document);
        }
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (isFolder && onOpenFolder) {
            onOpenFolder(document);
        } else if (isNote && onEditNote) {
            onEditNote(document);
        } else if (onView) {
            onView(document);
        }
    };

    if (viewMode === "list") {
        return (
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleCardClick}
                onDoubleClick={handleDoubleClick}
                className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/50 bg-card hover:bg-muted/30 hover:border-border"
                    }`}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {onSelectToggle && (
                        <div onClick={(e) => e.stopPropagation()} className="px-1">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelectToggle(document.id, checked)}
                                className="rounded border-border/60"
                            />
                        </div>
                    )}

                    <FileTypeVisual document={document} />

                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate max-w-[280px]">
                                {document.name}
                            </span>
                            {document.isStarred && (
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            {document.status && document.status !== "APPROVED" && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{document.status}</Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{format(new Date(document.createdAt), "MMM d, yyyy")}</span>
                            {fileSize && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    <span>{fileSize}</span>
                                </>
                            )}
                            {document.category && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    <span>{document.category}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right metadata and action buttons */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                    {document.sharedCount > 0 && (
                        <Badge variant="outline" className="hidden sm:inline-flex text-[9px] px-1.5 py-0 border-primary/20 text-primary bg-primary/5 gap-1">
                            <Users className="w-2.5 h-2.5" /> Shared ({document.sharedCount})
                        </Badge>
                    )}

                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                        <button
                            onClick={() => onToggleStar && onToggleStar(document)}
                            className="p-1 rounded-md text-muted-foreground hover:text-amber-500 transition-colors"
                            title={document.isStarred ? "Unstar" : "Star"}
                        >
                            <Star className={`w-3.5 h-3.5 ${document.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                        </button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                            onClick={() => onShare && onShare(document)}
                            title="Share with members"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-border/50">
                                {isFolder && (
                                    <>
                                        <DropdownMenuItem onClick={() => onOpenFolder && onOpenFolder(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                            <Folder className="w-3.5 h-3.5 text-primary" /> Open Folder
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUploadToFolder && onUploadToFolder(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                            <Upload className="w-3.5 h-3.5 text-emerald-500" /> Upload Files Here
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {!isFolder && (
                                    <DropdownMenuItem onClick={() => onView && onView(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                        <Eye className="w-3.5 h-3.5 text-primary" /> Preview
                                    </DropdownMenuItem>
                                )}
                                {isNote && (
                                    <DropdownMenuItem onClick={() => onEditNote && onEditNote(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                        <Pencil className="w-3.5 h-3.5 text-purple-500" /> Edit Note
                                    </DropdownMenuItem>
                                )}
                                {document.fileUrl && !isFolder && (
                                    <DropdownMenuItem onClick={() => onDownload && onDownload(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                        <Download className="w-3.5 h-3.5 text-emerald-500" /> Download
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onShare && onShare(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                    <Share2 className="w-3.5 h-3.5 text-primary" /> Share Access
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete && onDelete(document.id)}
                                    className="text-xs font-semibold gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <Trash className="w-3.5 h-3.5" /> Move to Trash
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View Card
    return (
        <Card
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleCardClick}
            onDoubleClick={handleDoubleClick}
            className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border/60 bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
        >
            {/* Top Bar: Icon + Star/Select + Menu */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    {onSelectToggle && (
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelectToggle(document.id, checked)}
                                className="rounded border-border/60"
                            />
                        </div>
                    )}
                    <FileTypeVisual document={document} />
                </div>

                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                    <button
                        onClick={() => onToggleStar && onToggleStar(document)}
                        className={`p-1 rounded-md text-muted-foreground/60 hover:text-amber-500 transition-colors ${document.isStarred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        title={document.isStarred ? "Unstar" : "Star"}
                    >
                        <Star className={`w-3.5 h-3.5 ${document.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-border/50">
                            {isFolder && (
                                <>
                                    <DropdownMenuItem onClick={() => onOpenFolder && onOpenFolder(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                        <Folder className="w-3.5 h-3.5 text-primary" /> Open Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onUploadToFolder && onUploadToFolder(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                        <Upload className="w-3.5 h-3.5 text-emerald-500" /> Upload Files Here
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {!isFolder && (
                                <DropdownMenuItem onClick={() => onView && onView(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                    <Eye className="w-3.5 h-3.5 text-primary" /> Preview
                                </DropdownMenuItem>
                            )}
                            {isNote && (
                                <DropdownMenuItem onClick={() => onEditNote && onEditNote(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5 text-purple-500" /> Edit Note
                                </DropdownMenuItem>
                            )}
                            {document.fileUrl && !isFolder && (
                                <DropdownMenuItem onClick={() => onDownload && onDownload(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                    <Download className="w-3.5 h-3.5 text-emerald-500" /> Download
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onShare && onShare(document)} className="text-xs font-semibold gap-2 cursor-pointer">
                                <Share2 className="w-3.5 h-3.5 text-primary" /> Share Access
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete && onDelete(document.id)}
                                className="text-xs font-semibold gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash className="w-3.5 h-3.5" /> Move to Trash
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Middle: Name & Badges */}
            <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors" title={document.name}>
                    {document.name}
                </h3>

                <div className="flex items-center gap-1.5 flex-wrap">
                    {document.status && document.status !== "APPROVED" && (
                        <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">{document.status}</Badge>
                    )}
                    {document.category && (
                        <span className="text-[9px] text-muted-foreground font-mono bg-muted/40 px-1 rounded">
                            {document.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom info: File size + Sharing indicator + Date */}
            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{fileSize}</span>

                <div className="flex items-center gap-1.5">
                    {document.sharedCount > 0 && (
                        <span className="flex items-center gap-0.5 text-primary font-semibold" title={`Shared with ${document.sharedCount} collaborators`}>
                            <Users className="w-2.5 h-2.5" /> {document.sharedCount}
                        </span>
                    )}
                    <span>{format(new Date(document.createdAt), "MMM d")}</span>
                </div>
            </div>
        </Card>
    );
};