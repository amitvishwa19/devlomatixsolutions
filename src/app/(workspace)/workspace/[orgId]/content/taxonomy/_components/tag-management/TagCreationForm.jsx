'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@/components/ui/checkbox';

const TagCreationForm = ({ onSubmit, editingTag, onCancel }) => {
    const [formData, setFormData] = useState({
        name: editingTag?.name || '',
        color: editingTag?.color || '#2563EB',
        description: editingTag?.description || '',
        categories: editingTag?.categories || []
    });

    const [errors, setErrors] = useState({});

    const availableCategories = [
        'Cardiology',
        'Neurology',
        'Pediatrics',
        'Orthopedics',
        'Emergency Medicine',
        'Radiology',
        'Surgery',
        'Internal Medicine'
    ];

    const predefinedColors = [
        '#2563EB', '#DC2626', '#059669', '#D97706',
        '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
    ];

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

    const handleCategoryToggle = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev?.categories?.includes(category)
                ? prev?.categories?.filter(c => c !== category)
                : [...prev?.categories, category]
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData?.name?.trim()) {
            newErrors.name = 'Tag name is required';
        }
        if (formData?.name?.length > 50) {
            newErrors.name = 'Tag name must be less than 50 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (validate()) {
            onSubmit(formData);
            if (!editingTag) {
                setFormData({
                    name: '',
                    color: '#2563EB',
                    description: '',
                    categories: []
                });
            }
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            color: '#2563EB',
            description: '',
            categories: []
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Icon name={editingTag ? "PencilIcon" : "PlusCircleIcon"} size={20} variant="outline" />
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                </h2>
                {editingTag && (
                    <button
                        onClick={onCancel}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        aria-label="Cancel editing"
                    >
                        <Icon name="XMarkIcon" size={20} variant="outline" className="text-text-secondary" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Tag Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                        Tag Name <span className="text-error">*</span>
                    </label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData?.name}
                        onChange={handleChange}
                        placeholder="e.g., Urgent, High Priority"

                    />
                    {errors?.name && (
                        <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                            <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                            {errors?.name}
                        </p>
                    )}
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
                            value={formData?.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e?.target?.value }))}
                            placeholder="#2563EB"

                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {predefinedColors?.map((color) => (
                            <Button
                                key={color}
                                type="button"

                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded border-2 transition-all ${formData?.color === color ? 'border-text-primary scale-110' : 'border-border hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>
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
                        rows={3}
                        placeholder="Brief description of tag usage..."
                        className=""
                    />
                </div>

                {/* Category Assignment */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Assign to Categories
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  overflow-y-auto p-2  border border-input rounded-lg">
                        {availableCategories?.map((category) => (
                            <Label
                                key={category}
                                className="flex items-center gap-2 p-2  rounded cursor-pointer transition-colors"
                            >
                                <Checkbox
                                    type="checkbox"
                                    checked={formData?.categories?.includes(category)}
                                    onChange={() => handleCategoryToggle(category)}
                                    className="w-4 h-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                                />
                                <span className="text-sm text-text-primary">{category}</span>
                            </Label>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                        {formData?.categories?.length} {formData?.categories?.length === 1 ? 'category' : 'categories'} selected
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-border self-end w-full">
                    <Button type="submit" variant='outline' size='sm' className=""                    >
                        <Icon name={editingTag ? "CheckIcon" : "PlusIcon"} size={18} variant="outline" />
                        {editingTag ? 'Update Tag' : 'Create Tag'}
                    </Button>

                </div>
            </form>

        </div>
    );
};

TagCreationForm.propTypes = {
    onSubmit: PropTypes?.func?.isRequired,
    editingTag: PropTypes?.shape({
        id: PropTypes?.number,
        name: PropTypes?.string,
        color: PropTypes?.string,
        description: PropTypes?.string,
        categories: PropTypes?.arrayOf(PropTypes?.string)
    }),
    onCancel: PropTypes?.func
};

export default TagCreationForm;