'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Tags,
    Store,
    ShoppingBag,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    ChevronDown,
    FolderTree,
    Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const CategoryFlowNode = memo(({ data, selected }) => {
    const {
        isRoot,
        isStore,
        label,
        slug,
        description,
        color = '#3b82f6',
        type = 'GENERAL',
        productCount = 0,
        hasChildren = false,
        childCount = 0,
        isCollapsed = false,
        isSearchMatched,
        targetPosition = Position.Left,
        sourcePosition = Position.Right,
        onToggleCollapse,
        onAddSubcategory,
        onEdit,
        onDelete
    } = data;

    const isDimmed = isSearchMatched === false;
    const isHighlighted = isSearchMatched === true;

    // 1. Root Ecommerce Node
    if (isRoot) {
        return (
            <div
                className={`relative px-4 py-3 rounded-xl border bg-card/95 backdrop-blur-xl shadow-xl transition-all min-w-[210px] ${
                    selected ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                style={{
                    borderColor: `${color}60`,
                    boxShadow: `0 8px 24px -6px ${color}35`
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-inner"
                        style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
                    >
                        <ShoppingBag size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                ROOT
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                {productCount} items
                            </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate mt-0.5">{label}</h4>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={sourcePosition}
                    className="!w-2.5 !h-2.5 !border-2 !border-background !bg-primary transition-transform hover:scale-125"
                />
            </div>
        );
    }

    // 2. Store Node
    if (isStore) {
        return (
            <div
                className={`relative px-4 py-3 rounded-xl border bg-card/95 backdrop-blur-xl shadow-xl transition-all min-w-[230px] group ${
                    selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                style={{
                    borderColor: `${color}60`,
                    boxShadow: `0 8px 24px -6px ${color}30`
                }}
            >
                <Handle
                    type="target"
                    position={targetPosition}
                    className="!w-2.5 !h-2.5 !border-2 !border-background !bg-purple-500"
                />

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
                            style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
                        >
                            <Store size={15} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-purple-400">
                                STORE CHANNEL
                            </span>
                            <h4 className="text-xs font-bold text-foreground truncate">{label}</h4>
                        </div>
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddSubcategory?.();
                        }}
                        className="w-6 h-6 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                        title="Add Category to Store"
                    >
                        <Plus size={13} />
                    </Button>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px]">
                    <span className="text-muted-foreground font-mono">{productCount} products</span>
                    {hasChildren && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCollapse?.();
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                            {childCount} categories
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}
                </div>

                <Handle
                    type="source"
                    position={sourcePosition}
                    className="!w-2.5 !h-2.5 !border-2 !border-background !bg-purple-500"
                />
            </div>
        );
    }

    // 3. Category / Subcategory Node
    return (
        <div
            className={`relative p-3.5 rounded-xl border bg-card/95 backdrop-blur-xl shadow-lg transition-all min-w-[250px] max-w-[270px] group ${
                selected ? 'ring-2 ring-primary ring-offset-2' : ''
            } ${isHighlighted ? 'ring-2 ring-emerald-500 shadow-emerald-500/20' : ''} ${
                isDimmed ? 'opacity-25' : 'opacity-100 hover:shadow-xl'
            }`}
            style={{
                borderColor: `${color}40`,
                boxShadow: `0 4px 20px -4px ${color}25`
            }}
        >
            <Handle
                type="target"
                position={targetPosition}
                className="!w-2.5 !h-2.5 !border-2 !border-background"
                style={{ backgroundColor: color }}
            />

            {/* Top row: Icon, Category Name, Slug */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="w-7 h-7 rounded-md flex items-center justify-center border shadow-xs shrink-0"
                        style={{ backgroundColor: `${color}18`, borderColor: color, color }}
                    >
                        <Tags size={13} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate leading-tight">{label}</h4>
                        <span className="text-[9px] font-mono text-muted-foreground truncate block">
                            /{slug}
                        </span>
                    </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddSubcategory?.();
                        }}
                        className="p-1 rounded-md hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-500 transition-colors"
                        title="Add Subcategory"
                    >
                        <Plus size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="p-1 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit Category"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                        className="p-1 rounded-md hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete Category"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Optional Description */}
            {description && (
                <p className="text-[10px] text-muted-foreground/80 line-clamp-1 mt-1.5">
                    {description}
                </p>
            )}

            {/* Footer row: Badges and Collapse toggle */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="px-1.5 py-0 text-[9px] font-mono rounded">
                        {productCount} items
                    </Badge>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60">
                        {type}
                    </span>
                </div>

                {hasChildren ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCollapse?.();
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
                    >
                        <span>{childCount} sub</span>
                        {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                    </button>
                ) : (
                    <span className="text-[9px] text-muted-foreground/40 font-mono">leaf</span>
                )}
            </div>

            <Handle
                type="source"
                position={sourcePosition}
                className="!w-2.5 !h-2.5 !border-2 !border-background"
                style={{ backgroundColor: color }}
            />
        </div>
    );
});

CategoryFlowNode.displayName = 'CategoryFlowNode';
