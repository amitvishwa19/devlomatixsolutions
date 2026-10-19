"use client";

import React from 'react';
import { 
    CheckSquare, 
    Square, 
    DownloadCloud, 
    CheckCircle2, 
    Loader2, 
    Layers, 
    Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ScraperBatchActions({
    totalCount,
    selectedCount,
    onSelectAll,
    onDeselectAll,
    importStatus,
    setImportStatus,
    onImport,
    isImporting
}) {
    const isAllSelected = totalCount > 0 && selectedCount === totalCount;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card/80 backdrop-blur-md border border-border/80 shadow-sm gap-3">
            {/* Left: Selection Counter & Toggle */}
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={isAllSelected ? onDeselectAll : onSelectAll}
                    className="h-8 text-xs gap-1.5 border-border/80 bg-background/60"
                >
                    {isAllSelected ? (
                        <>
                            <Square className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Deselect All</span>
                        </>
                    ) : (
                        <>
                            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Select All</span>
                        </>
                    )}
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                        {selectedCount} of {totalCount} Selected
                    </span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                        Ready for Import
                    </Badge>
                </div>
            </div>

            {/* Right: Import Status & CTA */}
            <div className="flex items-center gap-2.5">
                <div className="w-36">
                    <Select value={importStatus} onValueChange={setImportStatus} disabled={isImporting}>
                        <SelectTrigger className="h-8 text-xs bg-background/60 border-border/80">
                            <SelectValue placeholder="Import Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active" className="text-xs">Publish Active</SelectItem>
                            <SelectItem value="draft" className="text-xs">Save as Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    size="sm"
                    disabled={selectedCount === 0 || isImporting}
                    onClick={onImport}
                    className="h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20"
                >
                    {isImporting ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Importing to Store...</span>
                        </>
                    ) : (
                        <>
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Import ({selectedCount}) to Store</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
