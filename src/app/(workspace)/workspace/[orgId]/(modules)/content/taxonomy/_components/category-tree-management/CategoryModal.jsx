'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader, Plus, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTaxonomy } from '../../_provider/taxanomyProvider';
import { Switch } from '@/components/ui/switch';
import { upsertCategory } from '../../_actions/upsert-category';

const predefinedColors = [
    '#2563EB', '#DC2626', '#059669', '#D97706',
    '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
];

const CategoryModal = ({ isOpen, onClose, onSave, category, mode, parentCategory, allCategories = [], loading }) => {

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        tags: [],
        parentId: null,
        color: '#FFFF',
        icon: '',
        isActive: true,
        sortOrder: 0
    });

    const [errors, setErrors] = useState({});

    const availableTags = [
        { id: 'tag1', name: 'Cardiology', color: '#EF4444' },
        { id: 'tag2', name: 'Neurology', color: '#3B82F6' },
        { id: 'tag3', name: 'Pediatrics', color: '#10B981' },
        { id: 'tag4', name: 'Emergency', color: '#F59E0B' },
        { id: 'tag5', name: 'Surgery', color: '#8B5CF6' },
        { id: 'tag6', name: 'Radiology', color: '#EC4899' }
    ];

    useEffect(() => {
        if (category && mode === 'edit') {
            setFormData({
                id: category?.id,
                name: category?.name || '',
                description: category?.description || '',
                color: category?.color || '#FFFF',
                icon: category.icon,
                tags: category?.tags || [],
                parentId: category?.parentId || null,
                isActive: category.status || true,
                sortOrder: category.sortOrder || 0
            });
        } else if (mode === 'subcategory' && parentCategory) {
            setFormData({
                id: '',
                name: '',
                description: '',
                tags: [],
                parentId: parentCategory?.id || null,
                color: '#FFFF',
                icon: '',
                isActive: true,
                sortOrder: 0
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                tags: [],
                parentId: null,
                color: '#FFFF',
                icon: '',
                isActive: true,
                sortOrder: 0
            });
        }
        setErrors({});
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



    const handleSubmit = (e) => {
        e?.preventDefault();
        if (validate()) {
            onSave(formData);
            //onClose();
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

    return (

        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className='dark:bg-darkPrimaryBackground p-2 sm:max-w-[500px] '>
                <DialogHeader className={'p-2'}>
                    <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>

                <div>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-2 space-y-6">



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
                                <p className="mt-1.5 text-xs text-error flex items-center gap-1 text-muted-foreground">
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

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        size='sm'
                        className="transition-colors duration-200"
                    >
                        Cancel
                    </Button>
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
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default CategoryModal;