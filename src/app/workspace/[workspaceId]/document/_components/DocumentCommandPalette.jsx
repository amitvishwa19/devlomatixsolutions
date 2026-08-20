'use client';

import React, { useState, useEffect } from 'react';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command';
import {
    FileText,
    Folder,
    Upload,
    Pencil,
    Star,
    Trash2,
    LayoutGrid,
    List,
    Sparkles,
    FileIcon,
    ImageIcon,
    FileSpreadsheet,
    Video,
    Music,
    FolderPlus
} from 'lucide-react';

const getDocIcon = (doc) => {
    if (doc.isFolder) return <Folder className="w-4 h-4 text-amber-500" />;
    if (doc.fileType?.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (doc.fileType?.includes('pdf') || doc.name?.endsWith('.pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (doc.fileType === 'application/vnd.devlomatix.note' || doc.content) return <FileText className="w-4 h-4 text-purple-500" />;
    if (doc.fileType?.includes('video')) return <Video className="w-4 h-4 text-indigo-500" />;
    if (doc.fileType?.includes('audio')) return <Music className="w-4 h-4 text-pink-500" />;
    return <FileIcon className="w-4 h-4 text-primary" />;
};

export function DocumentCommandPalette({
    isOpen,
    onOpenChange,
    documents = [],
    onCreateNote,
    onCreateFolder,
    onUploadFile,
    onNavigateView,
    onSelectDocument,
    onToggleViewMode,
    viewMode = 'grid'
}) {
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [onOpenChange]);

    return (
        <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search documents..." />
            <CommandList className="max-h-[350px]">
                <CommandEmpty>No matching documents or actions found.</CommandEmpty>

                {/* Quick Creation & Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onCreateNote();
                        }}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Create New Rich Note</span>
                        <CommandShortcut>N</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onCreateFolder();
                        }}
                        className="cursor-pointer"
                    >
                        <FolderPlus className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Create Directory Folder</span>
                        <CommandShortcut>F</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onUploadFile();
                        }}
                        className="cursor-pointer"
                    >
                        <Upload className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Upload Files</span>
                        <CommandShortcut>U</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onToggleViewMode();
                        }}
                        className="cursor-pointer"
                    >
                        {viewMode === 'grid' ? (
                            <>
                                <List className="mr-2 h-4 w-4 text-emerald-500" />
                                <span>Switch to List View</span>
                            </>
                        ) : (
                            <>
                                <LayoutGrid className="mr-2 h-4 w-4 text-emerald-500" />
                                <span>Switch to Grid View</span>
                            </>
                        )}
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Navigation Views */}
                <CommandGroup heading="Views & Filters">
                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onNavigateView('all');
                        }}
                        className="cursor-pointer"
                    >
                        <Folder className="mr-2 h-4 w-4 text-primary" />
                        <span>All Documents & Folders</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onNavigateView('starred');
                        }}
                        className="cursor-pointer"
                    >
                        <Star className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Starred Favorites</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => {
                            onOpenChange(false);
                            onNavigateView('trash');
                        }}
                        className="cursor-pointer"
                    >
                        <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
                        <span>Recycle Bin / Trash</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Documents Search */}
                {documents.length > 0 && (
                    <CommandGroup heading="Documents & Files">
                        {documents.slice(0, 15).map((doc) => (
                            <CommandItem
                                key={doc.id}
                                value={`${doc.name} ${doc.category || ''} ${doc.tags?.join(' ') || ''}`}
                                onSelect={() => {
                                    onOpenChange(false);
                                    onSelectDocument(doc);
                                }}
                                className="cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {getDocIcon(doc)}
                                    <span className="truncate font-medium text-xs">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {doc.category && (
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                            {doc.category}
                                        </span>
                                    )}
                                    {doc.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
