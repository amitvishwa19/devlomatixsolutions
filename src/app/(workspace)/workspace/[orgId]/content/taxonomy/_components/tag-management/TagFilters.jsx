'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TagFilters = ({ onFilterChange, totalTags }) => {
    const [activeFilters, setActiveFilters] = useState({
        sortBy: 'name',
        sortOrder: 'asc',
        colorFilter: 'all',
        usageRange: 'all'
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...activeFilters, [key]: value };
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            sortBy: 'name',
            sortOrder: 'asc',
            colorFilter: 'all',
            usageRange: 'all'
        };
        setActiveFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters = activeFilters?.colorFilter !== 'all' || activeFilters?.usageRange !== 'all';

    return (
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon name="FunnelIcon" size={20} variant="outline" className="text-text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">Filters & Sorting</h3>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                        {totalTags} tags
                    </span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
                    >
                        <Icon name="XMarkIcon" size={14} variant="outline" />
                        Reset
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sort By */}
                <div>
                    <label htmlFor="sortBy" className="block text-xs font-medium text-text-secondary mb-2">
                        Sort By
                    </label>
                    <select
                        id="sortBy"
                        value={activeFilters?.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                    >
                        <option value="name">Name</option>
                        <option value="usageCount">Usage Count</option>
                        <option value="createdAt">Creation Date</option>
                        <option value="categories">Categories</option>
                    </select>
                </div>

                {/* Sort Order */}
                <div>
                    <label htmlFor="sortOrder" className="block text-xs font-medium text-text-secondary mb-2">
                        Order
                    </label>
                    <select
                        id="sortOrder"
                        value={activeFilters?.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e?.target?.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                {/* Color Filter */}
                <div>
                    <label htmlFor="colorFilter" className="block text-xs font-medium text-text-secondary mb-2">
                        Color Category
                    </label>
                    <select
                        id="colorFilter"
                        value={activeFilters?.colorFilter}
                        onChange={(e) => handleFilterChange('colorFilter', e?.target?.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                    >
                        <option value="all">All Colors</option>
                        <option value="blue">Blue Tags</option>
                        <option value="red">Red Tags</option>
                        <option value="green">Green Tags</option>
                        <option value="orange">Orange Tags</option>
                        <option value="purple">Purple Tags</option>
                    </select>
                </div>

                {/* Usage Range */}
                <div>
                    <label htmlFor="usageRange" className="block text-xs font-medium text-text-secondary mb-2">
                        Usage Range
                    </label>
                    <select
                        id="usageRange"
                        value={activeFilters?.usageRange}
                        onChange={(e) => handleFilterChange('usageRange', e?.target?.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                    >
                        <option value="all">All Usage</option>
                        <option value="high">High Usage (50+)</option>
                        <option value="medium">Medium Usage (10-49)</option>
                        <option value="low">Low Usage (1-9)</option>
                        <option value="unused">Unused (0)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

TagFilters.propTypes = {
    onFilterChange: PropTypes?.func?.isRequired,
    totalTags: PropTypes?.number?.isRequired
};

export default TagFilters;