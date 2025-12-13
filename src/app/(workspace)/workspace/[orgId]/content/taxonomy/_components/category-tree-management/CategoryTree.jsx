import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal, Plus, Pencil, Trash2, GripVertical, GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


export default function CategoryTree({ category, onEdit, onDelete, onAddChild, selectedId, onSelect }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;


    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                    "hover:bg-accent/50",
                    selectedId === category.id && "bg-primary/10 border border-primary/20"
                )}
                style={{ paddingLeft: `${category.depth * 24 + 12}px` }}
                onClick={() => onSelect?.(category)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GripVerticalIcon className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-0.5 rounded hover:bg-muted transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}

                    {isExpanded && hasChildren ? (
                        <FolderOpen className="h-5 w-5 text-primary" />
                    ) : (
                        <Folder className="h-5 w-5 text-muted-foreground" />
                    )}


                    <span className="font-medium text-sm truncate">{category.name}</span>

                    {!category.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}

                    {hasChildren && (
                        <Badge variant="outline" className="text-xs font-normal">
                            {category.children?.length}
                        </Badge>
                    )}

                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(category.id);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddChild(category.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subcategory
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="relative">
                    <div
                        className="absolute left-0 top-0 bottom-0 w-px bg-border"
                        style={{ marginLeft: `${category.depth * 24 + 28}px` }}
                    />
                    {category.children?.map((child) => (
                        <CategoryTree
                            key={child.id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
