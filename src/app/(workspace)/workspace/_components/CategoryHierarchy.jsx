'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { CirclePlus, Loader, Pencil, Plus, Save, Trash2, TriangleAlert } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';
import { deleteCategory } from '../[orgId]/content/taxonomy/_actions/delete-category';
import { upsertHierarchyCategory } from '../[orgId]/content/taxonomy/_actions/upsert-hierarchy-category';


const predefinedColors = [
    '#2563EB', '#DC2626', '#059669', '#D97706',
    '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
];



const CategoryHierarchy = ({ data = [], title, category: root, onUpdate }) => {
    const [expandedCategories, setExpandedCategories] = useState({});
    const [editor, setEditor] = useState(false)



    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'add',
        root: root,
        category: null,
        parentCategory: null
    });

    const [delModalState, setDelModalState] = useState({
        isOpen: false,
        mode: 'delete',
        root: root,
        category: null,
        parentCategory: null
    });


    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev?.[categoryId]
        }));
    };

    return (
        <div className="bg-card border rounded-md p-4 w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <CirclePlus size={18} className=' cursor-pointer text-sky-500' onClick={() => {
                    console.log(modalState)
                    setModalState({
                        ...modalState,
                        isOpen: true,
                        mode: 'subcategory',
                        root: root,
                        category: null,
                        parentCategory: root
                    });
                }} />
            </div>
            <div className="space-y-2">
                {root?.children?.map((category) => (
                    <div key={category?.id} className="border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleCategory(category?.id)}
                            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-2">
                                <Icon
                                    name={expandedCategories?.[category?.id] ? 'ChevronDownIcon' : 'ChevronRightIcon'}
                                    size={16}
                                    className="text-muted-foreground"
                                />
                                {category.icon ? <DynamicIcon size={16} name={category.icon} color={category?.color || 'currentColor'} /> : <DynamicIcon size={16} name={'folder'} color={category?.color || 'currentColor'} />}

                                <div className='flex flex-row items-center gap-2'>
                                    <span className="text-sm font-medium text-foreground">{category?.name}</span>
                                    <span className="text-xs text-muted-foreground">({category?.children?.length})</span>
                                </div>
                            </div>
                            <div className='flex flex-row gap-2'>
                                <Plus size={16} className=' cursor-pointer' onClick={(e) => {
                                    e.stopPropagation()
                                    setModalState({
                                        ...modalState,
                                        isOpen: true,
                                        root: root,
                                        mode: 'add',
                                        category: null,
                                        parentCategory: category

                                    });
                                }} />

                                <Pencil size={14} className='cursor-pointer' onClick={(e) => {
                                    e.stopPropagation()
                                    setModalState({
                                        ...modalState,
                                        isOpen: true,
                                        root: root,
                                        mode: 'edit',
                                        category: category,
                                        parentCategory: category

                                    });

                                }} />
                                <Trash2 size={14} className='' onClick={(e) => {
                                    e.stopPropagation()
                                    setDelModalState({
                                        isOpen: true,
                                        mode: 'delete',
                                        root: root,
                                        category: category,
                                        parentCategory: null
                                    })
                                }} />
                            </div>
                        </button>

                        {expandedCategories?.[category?.id] && (
                            <div className="p-2 space-y-2 bg-card">
                                <div className='w-full flex items-center justify-center'>
                                    {category?.children?.length === 0 && <span className='text-xs text-muted-foreground ml-6'>No sub items found</span>}
                                </div>
                                {category?.children?.map((subcategory) => (
                                    <div
                                        key={subcategory?.id}
                                        className="flex p-1 items-center justify-between  rounded-md hover:bg-muted/30 transition-colors duration-200 w-full "
                                    >
                                        <div className='flex flex-row items-center justify-between w-full'>
                                            <div className="flex items-center gap-2 pl-6">
                                                <Icon name="Bars3Icon" size={14} className="text-muted-foreground cursor-move" />
                                                <span className="text-sm text-foreground">{subcategory?.name}</span>
                                                <span className="text-xs text-muted-foreground">({subcategory?.children?.length})</span>
                                            </div>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Pencil size={14} className='cursor-pointer' onClick={(e) => {
                                                    e.stopPropagation()
                                                    setModalState({
                                                        ...modalState,
                                                        isOpen: true,
                                                        root: root,
                                                        mode: 'edit',
                                                        category: subcategory,
                                                        parentCategory: subcategory

                                                    });

                                                }} />

                                                <Trash2 size={14} className=' cursor-pointer' onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDelModalState({
                                                        isOpen: true,
                                                        mode: 'delete',
                                                        root: root,
                                                        category: subcategory,
                                                        parentCategory: null
                                                    })
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className='text-xs text-muted-foreground'>
                    {root?.children?.length === 0 && 'No items found'}
                </div>
            </div>

            <HierarchyEditorModal
                isOpen={modalState.isOpen}
                root={modalState.root}
                category={modalState.category}
                parentCategory={modalState.parentCategory}
                handleClose={() => { setModalState({ ...modalState, isOpen: false }) }}
                mode={modalState.mode}
                onSave={(c) => {
                    //setCategory(c)
                    onUpdate(c)
                }}
            />

            <CatDeleteModal
                root={delModalState.root}
                isOpen={delModalState.isOpen}
                onClose={(cat) => {
                    setDelModalState({ ...delModalState, isOpen: false })
                    if (cat) {
                        //setCategory(cat);
                        onUpdate(cat)
                    }
                }}
                category={delModalState.category}
            />
        </div>
    );
};


const HierarchyEditorModal = ({ isOpen, handleClose, onSave, root, category, parentCategory, mode, allCategories = [] }) => {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        tags: [],
        parentId: null,
        color: '#FFFF',
        icon: 'folder',
        isActive: true,
        sortOrder: 0
    });

    useEffect(() => {
        if (category || parentCategory) {
            setFormData({
                id: category?.id,
                name: category?.name || '',
                description: category?.description || '',
                color: category?.color || '#FFFF',
                icon: category?.icon || 'folder',
                tags: category?.tags || [],
                parentId: parentCategory?.id || null,
                isActive: category?.status || true,
                sortOrder: category?.sortOrder || 0
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                tags: [],
                parentId: null,
                color: '#FFFF',
                icon: 'folder',
                isActive: true,
                sortOrder: 0
            });
        }

    }, [category, mode, isOpen, parentCategory]);

    // Helper function to flatten categories into a selectable list
    const flattenCategoriesForSelection = (cats, level = 0, currentCategoryId = null) => {
        let result = [];
        cats?.forEach(cat => {
            // Don't include the current category being edited (prevent circular parent)
            if (cat?.id !== currentCategoryId) {
                result?.push({
                    id: cat?.id,
                    name: cat?.name,
                    path: cat?.path,
                    level: level,
                    isArchived: cat?.isArchived
                });
                if (cat?.children && cat?.children?.length > 0) {
                    result = result?.concat(flattenCategoriesForSelection(cat?.children, level + 1, currentCategoryId));
                }
            }
        });
        return result;
    };

    const selectableCategories = flattenCategoriesForSelection(
        allCategories,
        0,
        mode === 'edit' ? category?.id : null
    )?.filter(cat => !cat?.isArchived); // Filter out archived categories

    const handleChange = (e) => {

        const { name, value } = e?.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors?.[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleParentChange = (e) => {
        const parentId = e?.target?.value || null;
        setFormData(prev => ({
            ...prev,
            parentId: parentId
        }));
    };

    const toggleTag = (tag) => {
        setFormData(prev => {
            const isSelected = prev?.tags?.some(t => t?.id === tag?.id);
            return {
                ...prev,
                tags: isSelected
                    ? prev?.tags?.filter(t => t?.id !== tag?.id)
                    : [...prev?.tags, tag]
            };
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData?.name?.trim()) {
            newErrors.name = 'Category name is required';
        }
        if (formData?.name?.trim()?.length < 2) {
            newErrors.name = 'Category name must be at least 2 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const { execute } = useAction(upsertHierarchyCategory, {
        onSuccess: (data) => {
            onSave(data?.parentCategory)
            toast.success(`Category "${formData.name}" created successfully`, { id: 'new-appointment' })
            handleOnCLose()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            //toast.error('Oops something went wrong,please try again later', { id: 'new-appointment' });
        }
    })

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (validate()) {
            setLoading(true)
            //toast.loading(`Creating category "${formData?.name}"`, { id: 'new-cat' })
            await execute({ formData, root })
        }
    };

    if (!isOpen) return null;

    const modalTitle = mode === 'edit' ? 'Edit Category'
        : mode === 'subcategory'
            ? `Add Subcategory to "${parentCategory?.name}"`
            : 'Add New Category';

    const getSelectedParentName = () => {
        if (!formData?.parentId) return null;
        const parent = selectableCategories?.find(cat => cat?.id === formData?.parentId);
        return parent?.name;
    };


    const handleOnCLose = () => {
        handleClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOnCLose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-md'>{modalTitle}</DialogTitle>
                    <DialogDescription className='text-xs'>
                        Add new category under {parentCategory?.name}, added category will reflect under parent category ({parentCategory?.name})
                    </DialogDescription>

                </DialogHeader>

                <div>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-2 space-y-4">

                        {/* Category Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                                Category Name <span className="text-error">*</span>
                            </label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={formData?.name}
                                onChange={handleChange}
                                placeholder="Enter category name"
                                disabled={loading}

                            />
                            {errors?.name && (
                                <p className="mt-1.5 text-xs text-error dark:text-orange-500 flex items-center gap-1 text-muted-foreground">
                                    <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                                    {errors?.name}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData?.description}
                                onChange={handleChange}
                                placeholder="Enter category description"
                                rows={4}
                                disabled={loading}
                            />
                        </div>



                        {/* Icon Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                                Icon <span className="text-error"></span>
                            </label>
                            <Input
                                type="text"
                                id="icon"
                                name="icon"
                                value={formData?.icon}
                                onChange={handleChange}
                                placeholder="e.g consulting"
                                disabled={loading}

                            />
                            {errors?.name && (
                                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                                    <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                                    {errors?.name}
                                </p>
                            )}
                            <span className='text-xs text-muted-foreground'>Lucide icon name (optional)</span>
                        </div>


                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Tag Color
                            </label>

                            <div className="flex items-center gap-3 mb-3">
                                <Input
                                    type="color"
                                    name="color"
                                    value={formData?.color}
                                    onChange={handleChange}
                                    className="w-10 h-10   p-0 rounded-md cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    name='color'
                                    value={formData?.color}
                                    onChange={handleChange}
                                    placeholder="#2563EB"

                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {predefinedColors?.map((color) => (
                                    <Button
                                        key={color}
                                        type="button"
                                        name='color'
                                        onClick={() => { setFormData({ ...formData, color: color }) }}
                                        className={`w-8 h-8 rounded border-2 transition-all ${formData?.color === color ? 'border-text-primary scale-110' : 'border-border hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Parent Category Info for Subcategory Mode */}
                        {mode === 'subcategory' && parentCategory && (
                            <div className="p-4 bg-muted dark:bg-darkSecondaryBackground rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="InformationCircleIcon" size={16} variant="solid" className="text-primary" />
                                    <span className="text-sm font-medium text-text-primary">Parent Category</span>
                                </div>
                                <p className="text-sm text-text-secondary">{parentCategory?.name}</p>
                            </div>
                        )}

                        {/* Status */}
                        <div className='flex items-center justify-between rounded-lg border p-4'>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                                    Status <span className="text-error"></span>
                                </label>
                                <span className='text-xs text-muted-foreground'>
                                    Inactive categories won't be visible to users
                                </span>
                            </div>
                            <Switch checked={formData.isActive} onCheckedChange={(e) => { setFormData({ ...formData, isActive: e }) }} />


                        </div>


                    </form>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            disabled={loading}
                            size='sm'
                            className="transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant='save'
                        onClick={handleSubmit}
                        disabled={loading}
                        size='sm'
                        className=" transition-all duration-200 flex items-center gap-2"
                    >
                        {loading ? <Loader className=' animate-spin' /> : <Save />}
                        {mode === 'edit' ? 'Save Changes' : 'Create Category'}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}


const CatDeleteModal = ({ isOpen, onClose, category, root }) => {
    const [loading, setLoading] = useState(false)


    const { execute } = useAction(deleteCategory, {
        onSuccess: (data) => {
            setLoading(false)
            onClose(data.category)
            toast.success(`Category "${category?.name}" deleted successfully`)
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Oops something went wrong,please try again later');
        }
    })


    const handleDelete = async () => {
        setLoading(true)
        await execute({ categoryId: category?.id, rootId: root?.id })
    }


    const handleClose = () => {
        setLoading(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='w-[520px] [&>button:last-child]:hidden p-0 overflow-hidden'>

                <DialogHeader className=''>
                    <DialogTitle className='flex flex-row items-center gap-2 p-4'>
                        <TriangleAlert size={18} />
                        <span>
                            Delete category "{category?.name}"
                        </span>
                    </DialogTitle>
                    <DialogDescription className='px-4 text-sm text-muted-foreground'>
                        This will permanently delete the data and remove all associated data from our servers. All your files, settings, and preferences will be lost forever.
                    </DialogDescription>
                </DialogHeader>



                <DialogFooter className='p-4'>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={loading} size='sm'>Cancel</Button>
                    </DialogClose>
                    <Button variant="save" disabled={loading} size='sm' onClick={handleDelete}>
                        {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                        Delete Category
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}


export default CategoryHierarchy;