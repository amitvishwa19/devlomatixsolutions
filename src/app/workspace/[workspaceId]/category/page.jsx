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
    CornerDownRight,
    MoreVertical
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

    const renderCategoryRow = (category, isChild = false, isGrandChild = false) => (
        <tr key={category.id} className={`group transition-colors ${isChild ? 'bg-muted/5' : ''} ${isGrandChild ? 'bg-muted/10' : ''}`}>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    {isChild && (
                        <CornerDownRight size={14} className="text-primary ml-10" />
                    )}
                    {isGrandChild && (
                        <CornerDownRight size={14} className="ml-8 text-red-700" />
                    )}
                    {!isChild && category.children?.length > 0 ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors bg-background border border-border/40 shadow-sm"
                        >
                            {expandedCategories[category.id] ? (
                                <ChevronDown size={12} className="text-primary font-bold" />
                            ) : (
                                <ChevronRight size={12} className="text-muted-foreground" />
                            )}
                        </button>
                    ) : !isChild ? (
                        <div className="w-6" />
                    ) : null}
                    <div
                        className={`${isChild ? 'w-8 h-8    ' : 'w-10 h-10'} rounded-md flex items-center justify-center border-2 border-background shadow-md transition-transform group-hover:scale-110`}
                        style={{ backgroundColor: `${category.color}15`, borderColor: category.color }}
                    >
                        <Tags size={isChild ? 8 : 10} style={{ color: category.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className={`${isChild ? 'text-[10px]' : 'text-xs    '} font-bold text-foreground/90 truncate  `}>{category.name}</p>
                        <p className={`${isChild ? 'text-[8px]' : 'text-[10px]'} font-bold text-muted-foreground truncate `}>
                            {category.description || 'No description provided'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <Badge variant="outline" className="px-3 py-1 rounded-md">
                    {category.slug}
                </Badge>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    {isChild ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/20 shadow-sm">
                            <FolderTree className="w-3.5 h-3.5" />
                            <span className="text-[9px]         ">Sub Unit</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20 shadow-sm">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="text-[9px]         ">{category.type}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-md text-muted-foreground/40 hover:text-primary transition-all hover:bg-primary/10">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-md shadow-2xl border-border/40 p-2 bg-card/95 backdrop-blur-xl">
                        <DropdownMenuLabel className="   text-muted-foreground/40 px-3 py-3">Category Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onOpen('addCategory', { workspaceId, category, parentCategories: categories, onApply: fetchData })}
                            className="cursor-pointer px-3 py-3 rounded-md gap-3 text-xs"
                        >
                            <Edit2 className="w-4 h-4 text-primary" /> Edit Properties
                        </DropdownMenuItem>
                        {!isChild && (
                            <DropdownMenuItem
                                onClick={() => onOpen('addCategory', { workspaceId, parentCategories: categories, parentId: category.id, onApply: fetchData })}
                                className="cursor-pointer px-3 py-3 rounded-md gap-3 text-xs"
                            >
                                <Plus className="w-4 h-4 text-emerald-500" /> Create Sub-Category
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border/10 my-2" />
                        <DropdownMenuItem
                            onClick={() => confirmDelete(category)}
                            className="cursor-pointer px-3  rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors gap-3"
                        >
                            <Trash2 className="w-4 h-4" /> Terminate Category
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );

    return (
        <div className="animate-in fade-in duration-700 p-4 space-y-6">
            {/* Local Modal */}
            <AddCategoryModal />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-black/5 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FolderTree size={120} className="text-primary rotate-12" />
                </div>
                <div className="space-y-2 text-left relative z-10">
                    <h1 className="text-xl flex items-center gap-4">
                        <Tags className="text-primary h-8 w-8" />
                        Content Hierarchy
                    </h1>
                    <p className="text-muted-foreground text-xs ">
                        Define multi-level organizational structures for your workspace assets.
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Button
                        onClick={() => onOpen('addCategory', { workspaceId, parentCategories: categories, onApply: fetchData })}
                        className='bg-primary hover:bg-primary/90  rounded-md  px-8 shadow-lg shadow-primary/20 transition-all active:scale-95'
                    >
                        <Plus className="w-5 h-5 " /> New Hierarchy
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-card/20  rounded-md border shadow-xl shadow-black/5 backdrop-blur-xl mt-10">
                <div className="relative flex-1 group ">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search Content Hierarchy..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-14 bg-transparent border-none rounded-md focus-visible:ring-0 shadow-none"
                    />
                </div>
                <div className="h-8 w-px bg-border/40 hidden md:block mx-2" />
                <div className="flex items-center gap-2 px-4">
                    <Button variant="ghost" className="h-10 rounded-md px-4        text-[10px]   gap-2 opacity-40 hover:opacity-100">
                        <Filter className="w-4 h-4" /> Filters
                    </Button>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-card/30 backdrop-blur-xl rounded-md border border-border/40 shadow-2xl shadow-black/10 overflow-hidden mt-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-lg shadow-primary/20" />
                        <p className="text-[10px]     text-muted-foreground   animate-pulse">Syncing Hierarchy...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-32 px-6 flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-muted/20 rounded-md flex items-center justify-center border border-border/20 shadow-inner group">
                            <Tags className="w-10 h-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">
                                {search ? `No matches for "${search}"` : "Hierarchy is Empty"}
                            </h3>
                            <p className="text-[10px]          text-muted-foreground opacity-40">
                                {search ? "Adjust your search parameters and try again." : "Start by creating your first primary category."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/20 bg-muted/10">
                                    <th className="px-8 py-6 text-sm text-muted-foreground  whitespace-nowrap">Meta Identity</th>
                                    <th className="px-8 py-6 text-sm text-muted-foreground  whitespace-nowrap">Identifier</th>
                                    <th className="px-8 py-6 text-sm text-muted-foreground  whitespace-nowrap">Registry Schema</th>
                                    <th className="px-8 py-6 text-sm text-muted-foreground  whitespace-nowrap text-right pr-12">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10 text-xs">
                                {categories.map((category) => (
                                    <Fragment key={category.id}>
                                        {renderCategoryRow(category)}
                                        {expandedCategories[category.id] && category.children?.map(child =>
                                            <Fragment key={child.id}>
                                                {renderCategoryRow(child, true)}
                                                {child.children?.map(grandChild =>
                                                    renderCategoryRow(grandChild, true, true)
                                                )}
                                            </Fragment>
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