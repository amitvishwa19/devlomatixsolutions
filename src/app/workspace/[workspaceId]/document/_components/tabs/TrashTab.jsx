'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/global/EmptyState';
import {
    Folder as FolderIcon,
    FileText,
    FileIcon,
    Image as ImageIcon,
    FileSpreadsheet,
    Video,
    Music,
    FileArchive,
    Trash2,
    RefreshCcw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export function TrashTab({
    documents = [],
    loading = false,
    onRestoreItem,
    onPermanentDeleteItem,
    onRestoreAll,
    onEmptyTrash
}) {
    return (
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 transition-opacity duration-150 ${loading && documents.length > 0 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {documents.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-destructive" />
                        <span className="text-xs font-semibold text-foreground">
                            {documents.length} item{documents.length > 1 ? 's' : ''} in Recycle Bin
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRestoreAll && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRestoreAll}
                                className="h-7 text-xs font-semibold gap-1 rounded-lg"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" /> Restore All
                            </Button>
                        )}
                        {onEmptyTrash && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onEmptyTrash}
                                className="h-7 text-xs font-semibold gap-1 rounded-lg"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Empty Recycle Bin
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {loading && documents.length === 0 ? (
                <div className="p-8 space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 bg-muted/30 rounded-xl" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
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
                                    onClick={() => onRestoreItem(item.id)}
                                    className="h-8 px-3 text-xs font-semibold rounded-lg bg-background hover:bg-primary/5 hover:text-primary border-border/60"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Restore
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onPermanentDeleteItem(item.id)}
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
    );
}
