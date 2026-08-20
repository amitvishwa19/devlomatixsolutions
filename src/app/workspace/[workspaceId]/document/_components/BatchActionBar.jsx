'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FolderInput,
    Star,
    Download,
    Trash2,
    X,
    CheckCircle2,
    Layers
} from 'lucide-react';
import { downloadFilesAsZip } from '../_lib/zipUtils';

export function BatchActionBar({
    selectedDocs = [],
    onClearSelection,
    onMove,
    onDelete,
    onToggleStarAll,
    isTrashView = false,
    onRestore,
    onPermanentDelete
}) {
    if (!selectedDocs || selectedDocs.length === 0) return null;

    const handleDownloadZip = () => {
        downloadFilesAsZip(selectedDocs, `selection-${selectedDocs.length}-files.zip`);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 text-foreground">
                {/* Count Badge */}
                <div className="flex items-center gap-2 pr-3 border-r border-border/60">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs">
                        {selectedDocs.length}
                    </Badge>
                    <span className="text-xs font-semibold hidden sm:inline text-muted-foreground">
                        selected
                    </span>
                </div>

                {/* Regular View Actions */}
                {!isTrashView ? (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onMove}
                            className="h-8 text-xs font-semibold gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        >
                            <FolderInput className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Move</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onToggleStarAll}
                            className="h-8 text-xs font-semibold gap-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded-xl"
                        >
                            <Star className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Star</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDownloadZip}
                            className="h-8 text-xs font-semibold gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download ZIP</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onDelete}
                            className="h-8 text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Trash</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onRestore}
                            className="h-8 text-xs font-semibold gap-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Restore Selected</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onPermanentDelete}
                            className="h-8 text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Permanently</span>
                        </Button>
                    </>
                )}

                {/* Close / Deselect */}
                <div className="pl-2 border-l border-border/60">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Clear selection"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
