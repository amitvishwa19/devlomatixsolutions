'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const FilterPanel = ({
    filterOptions,
    activeFilters,
    onFilterChange,
    resultCount,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [expandedSections, setExpandedSections] = useState([
        'types',
        'departments',
        'statuses',
    ]);

    useState(() => {
        setIsHydrated(true);
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) =>
            prev.includes(section)
                ? prev.filter((s) => s !== section)
                : [...prev, section]
        );
    };

    const handleFilterToggle = (
        category,
        value
    ) => {
        const currentValues = activeFilters[category];
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];

        onFilterChange({
            ...activeFilters,
            [category]: newValues,
        });
    };

    const clearAllFilters = () => {
        onFilterChange({
            types: [],
            departments: [],
            statuses: [],
            communicationPreferences: [],
        });
    };

    const hasActiveFilters =
        activeFilters.types.length > 0 ||
        activeFilters.departments.length > 0 ||
        activeFilters.statuses.length > 0 ||
        activeFilters.communicationPreferences.length > 0;

    if (!isHydrated) {
        return (
            <div className="bg-card rounded-lg shadow-elevation-sm p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="w-24 h-6 bg-muted rounded animate-pulse" />
                        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="w-32 h-5 bg-muted rounded animate-pulse" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow-elevation-sm p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-primary hover:text-primary/80 transition-smooth font-caption"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md">
                    <span className="text-sm text-muted-foreground font-caption">Results</span>
                    <span className="text-sm font-semibold text-foreground">{resultCount}</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <button
                            onClick={() => toggleSection('types')}
                            className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                        >
                            <span>Contact Type</span>
                            <Icon
                                name={expandedSections.includes('types') ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                size={16}
                            />
                        </button>
                        {expandedSections.includes('types') && (
                            <div className="mt-2 space-y-2">
                                {filterOptions.types.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.types.includes(type)}
                                            onChange={() => handleFilterToggle('types', type)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                        />
                                        <span className="text-sm text-foreground group-hover:text-primary transition-smooth">
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border pt-4">
                        <button
                            onClick={() => toggleSection('departments')}
                            className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                        >
                            <span>Department</span>
                            <Icon
                                name={expandedSections.includes('departments') ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                size={16}
                            />
                        </button>
                        {expandedSections.includes('departments') && (
                            <div className="mt-2 space-y-2">
                                {filterOptions.departments.map((dept) => (
                                    <label
                                        key={dept}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.departments.includes(dept)}
                                            onChange={() => handleFilterToggle('departments', dept)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                        />
                                        <span className="text-sm text-foreground group-hover:text-primary transition-smooth">
                                            {dept}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border pt-4">
                        <button
                            onClick={() => toggleSection('statuses')}
                            className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                        >
                            <span>Status</span>
                            <Icon
                                name={expandedSections.includes('statuses') ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                size={16}
                            />
                        </button>
                        {expandedSections.includes('statuses') && (
                            <div className="mt-2 space-y-2">
                                {filterOptions.statuses.map((status) => (
                                    <label
                                        key={status}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.statuses.includes(status)}
                                            onChange={() => handleFilterToggle('statuses', status)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                        />
                                        <span className="text-sm text-foreground group-hover:text-primary transition-smooth">
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border pt-4">
                        <button
                            onClick={() => toggleSection('communicationPreferences')}
                            className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                        >
                            <span>Communication Preference</span>
                            <Icon
                                name={
                                    expandedSections.includes('communicationPreferences')
                                        ? 'ChevronUpIcon' : 'ChevronDownIcon'
                                }
                                size={16}
                            />
                        </button>
                        {expandedSections.includes('communicationPreferences') && (
                            <div className="mt-2 space-y-2">
                                {filterOptions.communicationPreferences.map((pref) => (
                                    <label
                                        key={pref}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.communicationPreferences.includes(pref)}
                                            onChange={() => handleFilterToggle('communicationPreferences', pref)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                        />
                                        <span className="text-sm text-foreground group-hover:text-primary transition-smooth capitalize">
                                            {pref}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;