'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/global/EmptyState';
import {
    FolderOpen,
    FolderPlus,
    Star,
    Upload,
    Share2,
    Trash2,
    MoreHorizontal,
    Users,
    Briefcase,
    Code,
    Shield,
    Rocket,
    Target,
    Sparkles,
    BookOpen
} from 'lucide-react';

const getFolderTheme = (folder) => {
    const tags = folder.tags || [];
    const colorTag = tags.find(t => t?.startsWith('color:'))?.replace('color:', '') || 'amber';
    const iconTag = tags.find(t => t?.startsWith('icon:'))?.replace('icon:', '') || 'folder';

    const colorMap = {
        emerald: { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", fill: "fill-emerald-500/20 text-emerald-500" },
        rose: { bg: "bg-rose-500/10 border-rose-500/20 text-rose-500", fill: "fill-rose-500/20 text-rose-500" },
        indigo: { bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500", fill: "fill-indigo-500/20 text-indigo-500" },
        amber: { bg: "bg-amber-500/10 border-amber-500/20 text-amber-500", fill: "fill-amber-500/20 text-amber-500" },
        cyan: { bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500", fill: "fill-cyan-500/20 text-cyan-500" },
        purple: { bg: "bg-purple-500/10 border-purple-500/20 text-purple-500", fill: "fill-purple-500/20 text-purple-500" },
        blue: { bg: "bg-blue-500/10 border-blue-500/20 text-blue-500", fill: "fill-blue-500/20 text-blue-500" },
    };

    const theme = colorMap[colorTag] || colorMap.amber;
    let Icon = FolderOpen;
    if (iconTag === 'briefcase') Icon = Briefcase;
    else if (iconTag === 'code') Icon = Code;
    else if (iconTag === 'shield') Icon = Shield;
    else if (iconTag === 'rocket') Icon = Rocket;
    else if (iconTag === 'target') Icon = Target;
    else if (iconTag === 'sparkles') Icon = Sparkles;
    else if (iconTag === 'book') Icon = BookOpen;

    return { theme, Icon };
};

export function FoldersGridTab({
    documents = [],
    loading = false,
    searchTerm = '',
    onOpenFolder,
    onOpenFolderDetails,
    onUploadToFolder,
    onShareFolder,
    onToggleStar,
    onDeleteFolder,
    onOpenCreateFolder
}) {
    return (
        <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-150 ${loading && documents.length > 0 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {loading && documents.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-xl border border-border/40 bg-muted/20 p-4" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                    <EmptyState
                        icon={FolderOpen}
                        title="No Folders Found"
                        description={searchTerm ? "No folders match your search criteria." : "Organize your workspace by creating your first folder."}
                    />
                    <Button onClick={onOpenCreateFolder} size="sm" className="mt-4 text-xs font-semibold gap-1.5">
                        <FolderPlus className="w-3.5 h-3.5" /> Create Directory Folder
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                    {documents.map((folder) => {
                        const { theme, Icon: FolderIcon } = getFolderTheme(folder);
                        return (
                            <Card
                                key={folder.id}
                                onClick={() => onOpenFolderDetails(folder)}
                                className="p-4 flex flex-col justify-between hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border-border/60 bg-card rounded-xl relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between w-full mb-3">
                                    <div className={`h-10 w-10 rounded-lg ${theme.bg} border flex items-center justify-center ${theme.fill} group-hover:scale-105 transition-transform`}>
                                        <FolderIcon className="h-5 w-5" />
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                        <button
                                            onClick={() => onToggleStar(folder)}
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
                                                    onClick={() => onOpenFolder(folder)}
                                                >
                                                    <FolderOpen className="h-3.5 w-3.5 text-primary" /> Open Folder
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs font-semibold gap-2 cursor-pointer"
                                                    onClick={() => onUploadToFolder(folder)}
                                                >
                                                    <Upload className="h-3.5 w-3.5 text-emerald-500" /> Upload Files Here
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs font-semibold gap-2 cursor-pointer"
                                                    onClick={() => onShareFolder(folder)}
                                                >
                                                    <Share2 className="h-3.5 w-3.5 text-primary" /> Share Folder
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteFolder(folder.id)}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
