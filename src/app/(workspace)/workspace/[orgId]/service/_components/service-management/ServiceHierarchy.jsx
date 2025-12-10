'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ServiceHierarchy = ({ hierarchyData }) => {
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev?.[categoryId]
        }));
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Service Hierarchy</h3>
                <button className="text-xs text-primary hover:text-primary/80 transition-colors duration-200">
                    Expand All
                </button>
            </div>
            <div className="space-y-2">
                {hierarchyData?.map((category) => (
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
                                <span className="text-sm font-medium text-foreground">{category?.name}</span>
                                <span className="text-xs text-muted-foreground">({category?.serviceCount})</span>
                            </div>
                            <Icon name="Bars3Icon" size={16} className="text-muted-foreground cursor-move" />
                        </button>

                        {expandedCategories?.[category?.id] && (
                            <div className="p-3 space-y-2 bg-card">
                                {category?.subcategories?.map((subcategory) => (
                                    <div
                                        key={subcategory?.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-2 pl-6">
                                            <Icon name="Bars3Icon" size={14} className="text-muted-foreground cursor-move" />
                                            <span className="text-sm text-foreground">{subcategory?.name}</span>
                                            <span className="text-xs text-muted-foreground">({subcategory?.serviceCount})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

ServiceHierarchy.propTypes = {
    hierarchyData: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            serviceCount: PropTypes?.number?.isRequired,
            subcategories: PropTypes?.arrayOf(
                PropTypes?.shape({
                    id: PropTypes?.number?.isRequired,
                    name: PropTypes?.string?.isRequired,
                    serviceCount: PropTypes?.number?.isRequired
                })
            )?.isRequired
        })
    )?.isRequired
};

export default ServiceHierarchy;