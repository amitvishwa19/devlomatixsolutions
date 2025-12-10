import { useState } from "react";
import { Plus, X, Pencil, Check, Search, ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function buildCategoryTree(categories) {
    const map = new Map();
    const roots = [];

    categories.forEach((cat) => {
        map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
        const node = map.get(cat.id);
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)?.children?.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

function CategoryItem({
    category,
    level,
    expandedIds,
    editingId,
    editName,
    onToggle,
    onStartEdit,
    onSaveEdit,
    onEditNameChange,
    onDelete,
    onAddChild,
}) {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isEditing = editingId === category.id;

    return (
        <div className="animate-fade-in">
            <div
                className="group flex items-center gap-2 p-3 rounded-lg bg-card dark:bg-darkPrimaryBackground border border-border/50 hover:border-border hover:shadow-card transition-all"
                style={{ marginLeft: `${level * 24}px` }}
            >
                <button
                    onClick={() => onToggle(category.id)}
                    className={`p-1 rounded hover:bg-secondary transition-colors ${!hasChildren ? "opacity-0 pointer-events-none" : ""}`}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                    <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                {isEditing ? (
                    <Input
                        value={editName}
                        onChange={(e) => onEditNameChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSaveEdit(category.id)}
                        className="flex-1 h-8 bg-secondary/50"
                        autoFocus
                    />
                ) : (
                    <span className="flex-1 font-medium">{category.name}</span>
                )}

                {category.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                        {category.count} items
                    </Badge>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddChild(category.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add subcategory"
                >
                    <Plus className="h-4 w-4" />
                </Button>

                {isEditing ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSaveEdit(category.id)}
                        className="h-8 w-8 text-tag-green hover:text-tag-green"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStartEdit(category)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-2 space-y-2">
                    {category.children?.map((child) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                            expandedIds={expandedIds}
                            editingId={editingId}
                            editName={editName}
                            onToggle={onToggle}
                            onStartEdit={onStartEdit}
                            onSaveEdit={onSaveEdit}
                            onEditNameChange={onEditNameChange}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategoryManager({
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [addingToParent, setAddingToParent] = useState(null);
    const [childName, setChildName] = useState("");

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryTree = buildCategoryTree(
        searchQuery ? filteredCategories : categories
    );

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory({ name: newCategoryName.trim(), parentId: null });
            setNewCategoryName("");
        }
    };

    const handleAddChild = (parentId) => {
        setAddingToParent(parentId);
        setExpandedIds((prev) => new Set([...prev, parentId]));
    };

    const confirmAddChild = () => {
        if (childName.trim() && addingToParent) {
            onAddCategory({ name: childName.trim(), parentId: addingToParent });
            setChildName("");
            setAddingToParent(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const startEditing = (cat) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const saveEdit = (id) => {
        if (editName.trim()) {
            onUpdateCategory(id, { name: editName.trim() });
        }
        setEditingId(null);
        setEditName("");
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50 focus:bg-card focus:dark:bg-darkPrimaryBackground"
                />
            </div>

            {/* Add New Category */}
            <div className="flex gap-3 p-2 rounded-xl bg-secondary/30 border border-border/50">
                <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    className="flex-1 bg-card dark:bg-darkPrimaryBackground border-border/50"
                />
                <Button onClick={handleAddCategory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Add Subcategory Dialog */}
            {addingToParent && (
                <div className="flex gap-3 p-2 rounded-xl  bg-secondary/30    animate-scale-in">
                    <Input
                        placeholder="Subcategory name..."
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmAddChild()}
                        className="flex-1 bg-card dark:bg-darkPrimaryBackground border-border/50"
                        autoFocus
                    />
                    <Button onClick={confirmAddChild} size="sm">
                        Add
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setAddingToParent(null);
                            setChildName("");
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Categories Tree */}
            <div className="space-y-2">
                {categoryTree.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Folder className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No categories found</p>
                    </div>
                ) : (
                    categoryTree.map((category) => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            level={0}
                            expandedIds={expandedIds}
                            editingId={editingId}
                            editName={editName}
                            onToggle={toggleExpand}
                            onStartEdit={startEditing}
                            onSaveEdit={saveEdit}
                            onEditNameChange={setEditName}
                            onDelete={onDeleteCategory}
                            onAddChild={handleAddChild}
                        />
                    ))
                )}
            </div>
        </div>
    );
}