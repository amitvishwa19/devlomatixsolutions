'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/global/EmptyState';
import {
    FileText,
    FileIcon,
    Image as ImageIcon,
    FileSpreadsheet,
    Video,
    Music,
    FileArchive,
    Star,
    Users,
    Eye,
    Pencil,
    Download,
    Trash2,
    MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

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

export function FilesTableTab({
    documents = [],
    loading = false,
    selectedDocIds = [],
    onSelectToggle,
    onSelectAll,
    onToggleStar,
    onEditNote,
    onViewDocument,
    onShareDocument,
    onDeleteDocument
}) {
    return (
        <div className={`flex-1 overflow-hidden p-4 flex flex-col transition-opacity duration-150 ${loading && documents.length > 0 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border/60 shadow-xs flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="p-3 w-10 text-center">
                                    <Checkbox
                                        checked={selectedDocIds.length === documents.length && documents.length > 0}
                                        onCheckedChange={onSelectAll}
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
                            {loading && documents.length === 0 ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="p-3.5">
                                            <div className="h-6 bg-muted/30 rounded-md w-full" />
                                        </td>
                                    </tr>
                                ))
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
                                                onCheckedChange={(c) => onSelectToggle(f.id, c)}
                                                className="rounded border-border/60"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2.5">
                                                <button
                                                    onClick={() => onToggleStar(f)}
                                                    className="text-muted-foreground/40 hover:text-amber-500 transition-colors"
                                                >
                                                    <Star className={`w-3.5 h-3.5 ${f.isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                                                </button>
                                                {getFileIcon(f.fileType, f.name)}
                                                <span
                                                    onClick={() => {
                                                        if (f.content) {
                                                            onEditNote(f);
                                                        } else {
                                                            onViewDocument(f);
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
                                                        onClick={() => onViewDocument(f)}
                                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-primary" /> View / Preview
                                                    </DropdownMenuItem>
                                                    {f.content && (
                                                        <DropdownMenuItem
                                                            onClick={() => onEditNote(f)}
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
                                                        onClick={() => onShareDocument(f)}
                                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                                    >
                                                        <Users className="w-3.5 h-3.5 text-primary" /> Share Access
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => onDeleteDocument(f.id)}
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
    );
}
