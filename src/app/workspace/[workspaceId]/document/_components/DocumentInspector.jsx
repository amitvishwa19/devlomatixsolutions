'use client';

import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    X,
    Eye,
    Download,
    Share2,
    Trash2,
    ExternalLink,
    Copy,
    Folder,
    FileText,
    Image as ImageIcon,
    Video,
    Music,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    FileIcon,
    Users,
    Calendar,
    HardDrive,
    Tag,
    Star,
    Check,
    Pencil
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentInspector({
    document,
    onClose,
    onView,
    onDownload,
    onShare,
    onEditNote,
    onToggleStar,
    onDelete,
    workspaceId
}) {
    const [copied, setCopied] = React.useState(false);

    if (!document) return null;

    const isFolder = document.isFolder;
    const isNote = !isFolder && (!document.fileUrl || document.fileType === 'application/vnd.devlomatix.note');
    const isOwner = document.isOwner;

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 KB';
        if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    const handleCopyDirectLink = () => {
        if (typeof window === 'undefined') return;
        const url = document.fileUrl || `${window.location.origin}/workspace/${workspaceId}/document?preview=${document.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const renderThumbnail = () => {
        if (isFolder) {
            return (
                <div className="w-full h-36 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Folder className="w-14 h-14 text-amber-500 fill-amber-500/20" />
                </div>
            );
        }

        if (document.fileType?.startsWith('image/') && document.fileUrl) {
            return (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-black/40 border border-border/40 flex items-center justify-center relative group">
                    <img
                        src={document.fileUrl}
                        alt={document.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            );
        }

        let bgClass = "bg-primary/10 border-primary/20 text-primary";
        let IconComponent = FileIcon;

        if (isNote) {
            bgClass = "bg-purple-500/10 border-purple-500/20 text-purple-500";
            IconComponent = FileText;
        } else if (document.fileType === 'application/pdf') {
            bgClass = "bg-rose-500/10 border-rose-500/20 text-rose-500";
            IconComponent = FileText;
        } else if (document.fileType?.startsWith('video/')) {
            bgClass = "bg-indigo-500/10 border-indigo-500/20 text-indigo-500";
            IconComponent = Video;
        } else if (document.fileType?.startsWith('audio/')) {
            bgClass = "bg-pink-500/10 border-pink-500/20 text-pink-500";
            IconComponent = Music;
        }

        return (
            <div className={`w-full h-36 rounded-xl ${bgClass} border flex flex-col items-center justify-center gap-2`}>
                <IconComponent className="w-12 h-12" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-75">
                    {document.extension?.replace('.', '') || (isNote ? 'NOTE' : 'FILE')}
                </span>
            </div>
        );
    };

    return (
        <div className="w-80 shrink-0 border-l border-border/50 bg-card/60 backdrop-blur-md flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Inspector & Details
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Visual Preview Banner */}
                {renderThumbnail()}

                {/* Title & Star */}
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-bold text-foreground leading-tight break-words">
                            {document.name}
                        </h2>
                        <button
                            onClick={() => onToggleStar && onToggleStar(document)}
                            className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                            title={document.isStarred ? "Unstar" : "Star"}
                        >
                            <Star className={`w-4 h-4 ${document.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                        </button>
                    </div>
                    {document.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {document.description}
                        </p>
                    )}
                </div>

                {/* Status & Category Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {document.status && (
                        <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            {document.status}
                        </Badge>
                    )}
                    {document.category && (
                        <Badge variant="outline" className="text-[10px] font-medium border-border/60">
                            {document.category}
                        </Badge>
                    )}
                    {document.isStarred && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Starred</Badge>
                    )}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isFolder && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView && onView(document)}
                            className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-muted"
                        >
                            <Eye className="w-3.5 h-3.5 text-primary" /> Preview
                        </Button>
                    )}
                    {isNote && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditNote && onEditNote(document)}
                            className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-muted"
                        >
                            <Pencil className="w-3.5 h-3.5 text-purple-500" /> Edit Note
                        </Button>
                    )}
                    {document.fileUrl && !isFolder && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownload && onDownload(document)}
                            className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-muted"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-500" /> Download
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => onShare && onShare(document)}
                        className="text-xs font-semibold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground col-span-2 shadow-xs"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Share with Team
                    </Button>
                </div>

                <Separator className="opacity-50" />

                {/* Collaborators / Sharing Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Sharing & Access
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onShare && onShare(document)}
                            className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10"
                        >
                            Manage
                        </Button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                        {/* Owner */}
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={document.user?.avatar} />
                                    <AvatarFallback className="text-[9px] font-bold bg-amber-500/10 text-amber-500">
                                        {document.user?.displayName?.charAt(0) || document.user?.name?.charAt(0) || 'O'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-foreground truncate">
                                    {document.user?.displayName || document.user?.name || (isOwner ? 'You' : 'Owner')}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-500">Owner</span>
                        </div>

                        {/* Shared members list preview */}
                        {document.sharedWith && document.sharedWith.length > 0 ? (
                            <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                                <div className="flex -space-x-1.5">
                                    {document.sharedWith.slice(0, 4).map((access, i) => (
                                        <Avatar key={access.id || i} className="h-6 w-6 border-2 border-background ring-1 ring-border/40">
                                            <AvatarImage src={access.user?.avatar} />
                                            <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                                                {access.user?.displayName?.charAt(0) || access.user?.name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <span className="text-[10px] text-muted-foreground ml-1.5">
                                    +{document.sharedWith.length} shared
                                </span>
                            </div>
                        ) : (
                            <p className="text-[10px] text-muted-foreground italic">
                                Private to you & owner.
                            </p>
                        )}
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Metadata Properties */}
                <div className="space-y-2.5 text-xs">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        File Details
                    </span>

                    <div className="space-y-2 bg-muted/20 p-2.5 rounded-lg border border-border/40 text-[11px]">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-semibold text-foreground truncate max-w-[140px]">
                                {isFolder ? 'Folder' : (isNote ? 'Rich Note' : (document.fileType || 'File'))}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-semibold text-foreground">
                                {isFolder ? `${document._count?.children || 0} items` : formatFileSize(document.fileSize)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-semibold text-foreground">
                                {format(new Date(document.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Modified:</span>
                            <span className="font-semibold text-foreground">
                                {format(new Date(document.updatedAt || document.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tags section */}
                {document.tags && document.tags.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Tags
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {document.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] bg-muted/30 border-border/60">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Direct Link Copy */}
                <div className="pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyDirectLink}
                        className="w-full text-xs font-semibold gap-2 border border-border/50 bg-background/50 hover:bg-muted justify-between h-9"
                    >
                        <span className="truncate text-muted-foreground">Copy direct link</span>
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                </div>

                {/* Delete button */}
                <div className="pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete && onDelete(document.id)}
                        className="w-full text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive h-8"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                    </Button>
                </div>
            </div>
        </div>
    );
}
