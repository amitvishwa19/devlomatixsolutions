'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const CategoryModal = ({ isOpen, onClose, onSave, category, mode, parentCategory, allCategories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: [],
        parentId: null
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
                name: category?.name || '',
                description: category?.description || '',
                tags: category?.tags || [],
                parentId: category?.parentId || null
            });
        } else if (mode === 'subcategory' && parentCategory) {
            setFormData({
                name: '',
                description: '',
                tags: [],
                parentId: parentCategory?.id || null
            });
        } else {
            setFormData({
                name: '',
                description: '',
                tags: [],
                parentId: null
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
            onClose();
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
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Category
                </Button>
            </DialogTrigger>
            <DialogContent className='dark:bg-darkPrimaryBackground p-2 w-full max-w-lg'>
                <DialogHeader className={'p-4'}>
                    <DialogTitle>Select your catogory</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Parent Category Selector */}
                        {mode !== 'subcategory' && selectableCategories?.length > 0 && (
                            <div>
                                <label htmlFor="parentId" className="block text-sm font-medium text-text-primary mb-2">
                                    Parent Category
                                </label>

                                <Select defaultValue={formData?.parentId || ''} onValueChange={handleParentChange}>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select Parent Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>None (Root Category)</SelectLabel>
                                            {selectableCategories?.map((cat, index) => (
                                                <SelectItem key={index} value={cat?.id}>
                                                    {'└─'?.repeat(cat?.level)} {cat?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formData?.parentId && (
                                    <p className="mt-1.5 text-sm text-text-secondary flex items-center gap-1">
                                        <Icon name="InformationCircleIcon" size={14} variant="solid" className="text-primary" />
                                        Will be nested under "{getSelectedParentName()}"
                                    </p>
                                )}
                            </div>
                        )}

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

                            />
                            {errors?.name && (
                                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
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
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Assign Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags?.map((tag) => {
                                    const isSelected = formData?.tags?.some(t => t?.id === tag?.id);
                                    return (
                                        <Badge
                                            key={tag?.id}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`
                                                        inline-flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium cursor-default
                                                        transition-all duration-200 ease-out
                                                        ${isSelected
                                                    ? 'border' : 'opacity-60 hover:opacity-100'
                                                }
                                            `}
                                            style={{
                                                backgroundColor: `${tag?.color}20`,
                                                color: tag?.color,
                                                ringColor: isSelected ? tag?.color : 'transparent'
                                            }}
                                        >
                                            <Icon
                                                name={isSelected ? 'CheckIcon' : 'TagIcon'}
                                                size={14}
                                                variant="solid"
                                            />
                                            {tag?.name}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Parent Category Info for Subcategory Mode */}
                        {mode === 'subcategory' && parentCategory && (
                            <div className="p-4 bg-muted rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="InformationCircleIcon" size={16} variant="solid" className="text-primary" />
                                    <span className="text-sm font-medium text-text-primary">Parent Category</span>
                                </div>
                                <p className="text-sm text-text-secondary">{parentCategory?.name}</p>
                            </div>
                        )}


                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="transition-colors duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='save'
                        onClick={handleSubmit}
                        className=" transition-all duration-200 flex items-center gap-2"
                    >
                        <Save />
                        {mode === 'edit' ? 'Save Changes' : 'Create Category'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default CategoryModal;