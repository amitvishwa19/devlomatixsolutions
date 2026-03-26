'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/utils/axios';
import { useModal } from '@/hooks/useModal';
import { AlertModal } from '@/components/global/AlertModal';
import {
    Loader2,
    Plus,
    Trash2,
    Search,
    Filter,
    Tags,
    MoreHorizontal,
    Edit2,
    LayoutGrid,
    ChevronRight,
    ChevronDown,
    FolderTree,
    CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

// Local Components
import { AddCategoryModal } from './_components/AddCategoryModal';

export default function CategoryManagementPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});

    const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/management/category`);
            setCategories(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            await axios.delete(`/api/workspace/${workspaceId}/management/category/${categoryToDelete.id}`);
            toast.success("Category removed successfully");
            setIsDeletingModalOpen(false);
            setCategoryToDelete(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete category");
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setIsDeletingModalOpen(true);
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const parentCategories = categories.filter(c => !c.parentId);

    const filteredCategories = parentCategories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.children?.some(child =>
            child.name.toLowerCase().includes(search.toLowerCase()) ||
            child.slug?.toLowerCase().includes(search.toLowerCase())
        )
    );

    const renderCategoryRow = (category, isChild = false) => (
        <tr key={category.id} className={`group hover:bg-primary/[0.02] transition-colors ${isChild ? 'bg-muted/5' : ''}`}>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    {isChild && (
                        <CornerDownRight size={14} className="text-muted-foreground/40 ml-2" />
                    )}
                    {!isChild && category.children?.length > 0 ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors"
                        >
                            {expandedCategories[category.id] ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                            ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                            )}
                        </button>
                    ) : !isChild ? (
                        <div className="w-6" />
                    ) : null}
                    <div
                        className={`${isChild ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center border-2 border-background shadow-md`}
                        style={{ backgroundColor: `${category.color}20`, borderColor: category.color }}
                    >
                        <Tags size={isChild ? 14 : 18} style={{ color: category.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className={`${isChild ? 'text-[10px]' : 'text-sm'} font-bold text-foreground/90 truncate`}>{category.name}</p>
                        <p className={`${isChild ? 'text-[8px]' : 'text-[10px]'} font-bold text-muted-foreground truncate opacity-70 tracking-widest`}>
                            {category.description || 'No description'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <Badge variant="outline" className="text-[10px] font-bold tracking-widest bg-muted/30 border-none font-mono">
                    {category.slug}
                </Badge>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    {isChild ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-xl border border-border/20">
                            <FolderTree className="w-3 h-3" />
                            <span className="text-[10px] font-bold tracking-widest">Sub</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20">
                            <LayoutGrid className="w-3 h-3" />
                            <span className="text-[10px] font-bold tracking-widest">{category.type}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 rounded-xl text-muted-foreground/50 hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-2xl border-border/40 p-2">
                        <DropdownMenuLabel className="text-[10px] font-bold tracking-widest text-muted-foreground px-3 py-2">Management</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onOpen('addCategory', { workspaceId, category, parentCategories, onApply: fetchData })}
                            className="cursor-pointer font-bold text-[10px] tracking-widest px-3 py-2.5 rounded-md"
                        >
                            <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit
                        </DropdownMenuItem>
                        {!isChild && (
                            <DropdownMenuItem
                                onClick={() => onOpen('addCategory', { workspaceId, parentCategories, parentId: category.id, onApply: fetchData })}
                                className="cursor-pointer font-bold text-[10px] tracking-widest px-3 py-2.5 rounded-md"
                            >
                                <Plus className="w-4 h-4 mr-2 text-emerald-500" /> Add Sub
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border/10" />
                        <DropdownMenuItem
                            onClick={() => confirmDelete(category)}
                            className="cursor-pointer font-bold text-[10px] tracking-widest px-3 py-2.5 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );

    return (
        <div className=" animate-fade-in p-2">
            {/* Local Modal */}
            <AddCategoryModal />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-4 rounded-xl shadow-soft mb-4">
                <div className="space-y-1 text-left mb-4">
                    <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Tags className="text-primary h-8 w-8" />
                        Category Management
                    </h1>
                    <p className="text-muted-foreground text-xs font-bold  opacity-70">
                        Organize your content and workspace entities with custom categories and subcategories.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => onOpen('addCategory', { workspaceId, parentCategories, onApply: fetchData })}
                        className='bg-primary hover:bg-primary/90 rounded-xl font-bold h-11 px-6 text-[10px] tracking-widest shadow-soft'
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Category
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="SEARCH CATEGORIES..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 bg-background border border-border rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-inner font-bold text-[10px] tracking-widest"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-12 rounded-md border-border/40 bg-background/50">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden mt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] animate-pulse">Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-24 px-6 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mb-6 border border-border/20 shadow-inner">
                            <Tags className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            {search ? `Nothing found for "${search}"` : "No categories yet"}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest opacity-70">
                            {search ? "Try refining your search terms." : "Start by creating your first category to organize your workspace."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/20 bg-muted/10">
                                    <th className="px-6 py-5 text-[10px] font-bold tracking-widest text-muted-foreground whitespace-nowrap">Category Meta</th>
                                    <th className="px-6 py-5 text-[10px] font-bold tracking-widest text-muted-foreground whitespace-nowrap">Identifier</th>
                                    <th className="px-6 py-5 text-[10px] font-bold tracking-widest text-muted-foreground whitespace-nowrap">Schema</th>
                                    <th className="px-6 py-5 text-[10px] font-bold tracking-widest text-muted-foreground whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {filteredCategories.map((category) => (
                                    <Fragment key={category.id}>
                                        {renderCategoryRow(category)}
                                        {expandedCategories[category.id] && category.children?.map(child =>
                                            renderCategoryRow(child, true)
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AlertModal
                isOpen={isDeletingModalOpen}
                onClose={() => setIsDeletingModalOpen(false)}
                onConfirm={handleDeleteCategory}
                loading={isDeleting}
                title="Delete Category?"
                description={`This action cannot be undone.`}
            />
        </div>
    );
}
