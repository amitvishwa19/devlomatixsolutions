'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Plus, RotateCcw } from 'lucide-react';

export function DataTableToolbar({
    searchQuery = '',
    onSearchChange,
    placeholder = 'Search items...',
    totalCount,
    filteredCount,
    actionLabel,
    onAction,
    actionIcon: ActionIcon = Plus,
    extraFilters,
    onReset,
    className = ''
}) {
    const isFiltered = searchQuery.length > 0 || (totalCount !== undefined && filteredCount !== undefined && filteredCount < totalCount);

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-1 ${className}`}>
            <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        placeholder={placeholder}
                        className="pl-8 pr-3 h-8 text-xs bg-secondary/30 border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    />
                </div>

                {isFiltered && onReset && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden md:inline">Reset</span>
                    </Button>
                )}

                {totalCount !== undefined && (
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 h-6 shrink-0 bg-secondary/50 border-border/40">
                        {filteredCount !== undefined && filteredCount !== totalCount
                            ? `${filteredCount} of ${totalCount}`
                            : `${totalCount} total`}
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {extraFilters}

                {actionLabel && onAction && (
                    <Button
                        size="sm"
                        onClick={onAction}
                        className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3.5 shadow-2xs cursor-pointer"
                    >
                        <ActionIcon className="w-3.5 h-3.5" />
                        <span>{actionLabel}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
