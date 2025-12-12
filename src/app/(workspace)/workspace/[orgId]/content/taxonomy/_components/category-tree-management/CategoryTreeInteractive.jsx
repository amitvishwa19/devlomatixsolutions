'use client';

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import CategoryNode from './CategoryNode';
import CategoryDetails from './CategoryDetails';
import CategoryModal from './CategoryModal';
import ConfirmDialog from './ConfirmDialog';
import SearchSuggestions from '../SearchSuggestions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader, Plus, PlusIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { newCategory } from '../../_actions/add-category';
import { useAction } from '@/hooks/use-action';
import { updateCategory } from '../../_actions/update-category';
import { useTaxonomy } from '../../_provider/taxanomyProvider';
import { slug } from '@/utils/functions';
import { deleteCategory } from '../../_actions/delete-category';

const CategoryTreeInteractive = ({ initialCategories }) => {
    //const [categories, setCategories] = useState(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedIds, setExpandedIds] = useState(['cat1', 'cat2']);
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedCategory, setDraggedCategory] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false)
    const { categories, setCategories } = useTaxonomy()

    function buildCategoryTree(categories) {
        const map = new Map();
        const roots = [];

        // create map entries
        for (const cat of categories) {
            map.set(cat.id, { ...cat, children: [] });
        }

        // assign children
        for (const cat of categories) {
            const node = map.get(cat.id);

            if (cat.parentId) {
                const parent = map.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else {
                roots.push(node); // root categories
            }
        }

        return roots;
    }

    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'add',
        category: null,
        parentCategory: null
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        id: '',
        onConfirm: () => { }
    });

    const flattenCategories = useCallback((cats, result = []) => {
        cats?.forEach(cat => {
            result?.push(cat);
            if (cat?.children && cat?.children?.length > 0) {
                flattenCategories(cat?.children, result);
            }
        });
        return result;
    }, []);

    const searchSuggestions = flattenCategories(categories)?.filter(cat => cat?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()))?.slice(0, 5)?.map(cat => ({
        label: cat?.name,
        description: cat?.path,
        icon: 'FolderIcon',
        data: cat
    }));

    const handleSearchSelect = (suggestion) => {
        setSelectedCategory(suggestion?.data);
        setShowDetails(true);
        setSearchQuery('');
    };

    const handleExpand = (categoryId) => {
        setExpandedIds(prev =>
            prev?.includes(categoryId)
                ? prev?.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleExpandAll = () => {
        const allIds = flattenCategories(categories)?.map(cat => cat?.id);
        setExpandedIds(allIds);
        toast.success('All categories expanded');
    };

    const handleCollapseAll = () => {
        setExpandedIds([]);
        toast.success('All categories collapsed');
    };

    const handleSelect = (category) => {
        setSelectedCategory(category);
        setShowDetails(true);
    };

    const handleAddCategory = () => {
        setModalState({
            isOpen: true,
            mode: 'add',
            category: null,
            parentCategory: null
        });
    };

    const handleAddSubcategory = (category) => {
        setModalState({
            isOpen: true,
            mode: 'subcategory',
            category: null,
            parentCategory: category
        });
    };

    const handleEdit = (category) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            category: category,
            parentCategory: null
        });
    };

    const handleDelete = async (category) => {
        //await deleteCat({ categoryId: category.id })

        setConfirmDialog({
            isOpen: true,
            title: 'Delete Category',
            message: `Are you sure you want to delete "${category?.name}"? This action cannot be undone. All subcategories and content will be permanently removed.`,
            type: 'danger',
            data: category,
            onConfirm: async () => {
                if (selectedCategory?.id === category?.id) {
                    setLoading(true)
                    setSelectedCategory(null);
                    setShowDetails(false);
                }
            }
        });
    };

    const handleArchive = (category) => {
        const action = category?.isArchived ? 'unarchive' : 'archive';
        setConfirmDialog({
            isOpen: true,
            title: `${action?.charAt(0)?.toUpperCase() + action?.slice(1)} Category`,
            message: `Are you sure you want to ${action} "${category?.name}"?`,
            type: 'warning',
            onConfirm: () => {
                success(`Category "${category?.name}" ${action}d successfully`);
            }
        });
    };

    const { execute: addCategory } = useAction(newCategory, {
        onSuccess: (data) => {
            console.log(data)
            setLoading(false)
            setModalState({ ...modalState, isOpen: false })
            setCategories(prev => [data.category, ...prev])
            toast.success('Category created successfully', { id: 'new-cat' });
        },
        onError: (error) => {
            toast.error(`Oops!, something went wrong, please try again later`, { id: 'new-cat' });
            setLoading(false)
        }
    })

    const { execute: editCategory } = useAction(updateCategory, {
        onSuccess: (data) => {
            console.log(data)
            setLoading(false)
            setModalState({ ...modalState, isOpen: false })
            setCategories(prev => prev.map(cat =>
                cat.id === data.category.id
                    ? { ...cat, ...data.category }
                    : cat
            ))
            toast.success('Category updated successfully', { id: 'new-cat' });
        },
        onError: (error) => {
            toast.error(`Oops!, something went wrong, please try again later`, { id: 'new-cat' });
            setLoading(false)
        }
    })

    const handleSaveCategory = async (formData) => {

        if (modalState?.mode === 'edit') {
            setLoading(true)
            await editCategory({ formData })
        } else {
            setLoading(true)
            await addCategory({ formData: { ...formData, slug: slug(formData.name) }, orgId: 'org' })
            console.log(formData)
        }
    };

    const handleDragStart = (category) => {
        setDraggedCategory(category);
    };

    const handleDragOver = () => {
        // Visual feedback handled in CategoryNode
    };

    const handleDrop = (targetCategory) => {
        if (draggedCategory && draggedCategory?.id !== targetCategory?.id) {
            toast.success(`Moved "${draggedCategory?.name}" to "${targetCategory?.name}"`);
            console.log(targetCategory)
            setDraggedCategory(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Tree Panel */}
            <div className="flex-1 flex flex-col bg-surface rounded-lg border border-border shadow-elevation-1 overflow-hidden">
                {/* Tree Header */}
                <div className="p-4 border-b border-border space-y-4">


                    {/* Search */}
                    <SearchSuggestions
                        query={searchQuery}
                        suggestions={searchSuggestions}
                        onSelect={handleSearchSelect}
                        placeholder="Search categories..."
                        className="w-full"
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExpandAll}
                                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                                <Icon name="ChevronDoubleDownIcon" size={16} variant="outline" />
                                Expand All
                            </button>
                            <button
                                onClick={handleCollapseAll}
                                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                                <Icon name="ChevronDoubleUpIcon" size={16} variant="outline" />
                                Collapse All
                            </button>
                        </div>
                        <Button
                            variant='save'
                            onClick={handleAddCategory}
                            className=""
                            disabled={loading}
                        >
                            <PlusIcon />
                            Add Category
                        </Button>

                    </div>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {categories?.length > 0 ? (
                        <div className="space-y-1">
                            {categories?.map((category) => (


                                <CategoryNode
                                    key={category?.id}
                                    category={category}
                                    level={0}
                                    onSelect={handleSelect}
                                    selectedId={selectedCategory?.id}
                                    onExpand={handleExpand}
                                    expandedIds={expandedIds}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onAddSubcategory={handleAddSubcategory}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onArchive={handleArchive}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-secondary">
                            <div className="text-center">
                                <Icon name="FolderIcon" size={48} variant="outline" className="mx-auto mb-4 opacity-50" />
                                <p className="text-sm mb-4">No categories found</p>
                                <Button
                                    variant='save'

                                    onClick={handleAddCategory}
                                    className=" shadow-elevation-1 transition-all duration-200"
                                >
                                    <PlusIcon />
                                    Create First Category
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Details Panel - Desktop */}
            <div className="hidden lg:block w-96 bg-surface rounded-lg border border-border shadow-elevation-1 overflow-hidden">
                <CategoryDetails
                    category={selectedCategory}
                    onClose={() => setShowDetails(false)}
                />
            </div>


            {/* Modals */}
            <CategoryModal
                isOpen={modalState?.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSave={handleSaveCategory}
                category={modalState?.category}
                mode={modalState?.mode}
                parentCategory={modalState?.parentCategory}
                allCategories={categories}
                loading={loading}
            />
            <ConfirmDialog
                data={confirmDialog?.data}
                isOpen={confirmDialog?.isOpen}
                onClose={() => { setLoading(false); setConfirmDialog({ ...confirmDialog, isOpen: false }) }}
                onConfirm={() => { setLoading(true) }}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                type={confirmDialog?.type}
                loading={loading}
            />
        </div>
    );
};



export default CategoryTreeInteractive;

//setConfirmDialog({ ...confirmDialog, isOpen: false })