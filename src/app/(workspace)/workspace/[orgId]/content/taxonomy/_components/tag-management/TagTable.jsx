'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TagTable = ({ tags, onEdit, onDelete, onSelect, selectedTags }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedTags = [...tags]?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];

        if (typeof aValue === 'string') {
            return sortConfig?.direction === 'asc'
                ? aValue?.localeCompare(bValue)
                : bValue?.localeCompare(aValue);
        }

        return sortConfig?.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
    });

    const isSelected = (tagId) => selectedTags?.includes(tagId);

    const handleSelectAll = () => {
        if (selectedTags?.length === tags?.length) {
            onSelect([]);
        } else {
            onSelect(tags?.map(tag => tag?.id));
        }
    };

    const handleSelectTag = (tagId) => {
        if (isSelected(tagId)) {
            onSelect(selectedTags?.filter(id => id !== tagId));
        } else {
            onSelect([...selectedTags, tagId]);
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig?.key !== columnKey) {
            return <Icon name="ChevronUpDownIcon" size={16} variant="outline" className="text-text-secondary" />;
        }
        return sortConfig?.direction === 'asc'
            ? <Icon name="ChevronUpIcon" size={16} variant="solid" className="text-primary" />
            : <Icon name="ChevronDownIcon" size={16} variant="solid" className="text-primary" />;
    };

    SortIcon.propTypes = {
        columnKey: PropTypes?.string?.isRequired
    };

    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>

                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                                >
                                    Tag Name
                                    <SortIcon columnKey="name" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-sm font-semibold text-text-primary">Color</span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('usageCount')}
                                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                                >
                                    Usage
                                    <SortIcon columnKey="usageCount" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-sm font-semibold text-text-primary">Categories</span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                                >
                                    Created
                                    <SortIcon columnKey="createdAt" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <span className="text-sm font-semibold text-text-primary">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedTags?.map((tag) => (
                            <tr
                                key={tag?.id}
                                className={`hover:bg-muted/50 transition-colors ${isSelected(tag?.id) ? 'bg-primary/5' : ''
                                    }`}
                            >

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Icon name="TagIcon" size={16} variant="outline" className="text-text-secondary" />
                                        <span className="text-sm font-medium text-text-primary">{tag?.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-border"
                                            style={{ backgroundColor: tag?.color }}
                                            aria-label={`Tag color: ${tag?.color}`}
                                        />
                                        <span className="text-xs text-text-secondary font-mono">{tag?.color}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-text-primary">{tag?.usageCount}</span>
                                        <div className="flex-1 max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min((tag?.usageCount / 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {tag?.categories?.slice(0, 2)?.map((category, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-muted text-text-secondary text-xs rounded"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                        {tag?.categories?.length > 2 && (
                                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                                                +{tag?.categories?.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-text-secondary">{tag?.createdAt}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(tag)}
                                            className="p-1.5 hover:bg-muted rounded transition-colors"
                                            aria-label={`Edit ${tag?.name}`}
                                        >
                                            <Icon name="PencilIcon" size={16} variant="outline" className="text-text-secondary hover:text-primary" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(tag?.id)}
                                            className="p-1.5 hover:bg-error/10 rounded transition-colors"
                                            aria-label={`Delete ${tag?.name}`}
                                        >
                                            <Icon name="TrashIcon" size={16} variant="outline" className="text-text-secondary hover:text-error" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
                {sortedTags?.map((tag) => (
                    <div
                        key={tag?.id}
                        className={`p-4 ${isSelected(tag?.id) ? 'bg-primary/5' : ''}`}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isSelected(tag?.id)}
                                onChange={() => handleSelectTag(tag?.id)}
                                className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                                aria-label={`Select ${tag?.name}`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="TagIcon" size={16} variant="outline" className="text-text-secondary" />
                                    <span className="text-sm font-semibold text-text-primary">{tag?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-5 h-5 rounded border border-border"
                                        style={{ backgroundColor: tag?.color }}
                                    />
                                    <span className="text-xs text-text-secondary">{tag?.color}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-text-secondary">Usage:</span>
                                    <span className="text-sm font-semibold text-text-primary">{tag?.usageCount}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {tag?.categories?.map((category, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 bg-muted text-text-secondary text-xs rounded"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-xs text-text-secondary mb-3">
                                    Created: {tag?.createdAt}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(tag)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-text-primary rounded-lg transition-colors"
                                    >
                                        <Icon name="PencilIcon" size={16} variant="outline" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(tag?.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
                                    >
                                        <Icon name="TrashIcon" size={16} variant="outline" />
                                        <span className="text-sm font-medium">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {sortedTags?.length === 0 && (
                <div className="p-12 text-center">
                    <Icon name="TagIcon" size={48} variant="outline" className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary text-sm">No tags found</p>
                </div>
            )}
        </div>
    );
};

TagTable.propTypes = {
    tags: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            color: PropTypes?.string?.isRequired,
            usageCount: PropTypes?.number?.isRequired,
            categories: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
            createdAt: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onEdit: PropTypes?.func?.isRequired,
    onDelete: PropTypes?.func?.isRequired,
    onSelect: PropTypes?.func?.isRequired,
    selectedTags: PropTypes?.arrayOf(PropTypes?.number)?.isRequired
};

export default TagTable;