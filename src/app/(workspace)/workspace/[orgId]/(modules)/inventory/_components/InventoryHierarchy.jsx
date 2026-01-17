'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { CirclePlus, Plus } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';

const InventoryHierarchy = ({ hierarchyData = [] }) => {
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
                <h3 className="text-sm font-semibold text-foreground">Inventory Hierarchy</h3>
                <CirclePlus size={18} className=' cursor-pointer text-sky-500' onClick={() => {
                    console.log('Add Category')
                }} />
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
                                <DynamicIcon size={16} name={category.icon} />
                                <div>
                                    <span className="text-sm font-medium text-foreground">{category?.name}</span>
                                    <span className="text-xs text-muted-foreground">({category?.children?.length})</span>
                                </div>
                            </div>
                            <Plus size={16} className='' onClick={(e) => {
                                e.stopPropagation()
                            }} />
                        </button>

                        {expandedCategories?.[category?.id] && (
                            <div className="p-3 space-y-2 bg-card">
                                <div className='w-full flex items-center justify-center'>
                                    {category?.children?.length === 0 && <span className='text-xs text-muted-foreground ml-6'>No sub items found</span>}
                                </div>
                                {category?.children?.map((subcategory) => (
                                    <div
                                        key={subcategory?.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-2 pl-6">
                                            <Icon name="Bars3Icon" size={14} className="text-muted-foreground cursor-move" />
                                            <span className="text-sm text-foreground">{subcategory?.name}</span>
                                            <span className="text-xs text-muted-foreground">({subcategory?.children?.length})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className='text-xs text-muted-foreground'>
                    {hierarchyData?.length === 0 && 'No items found'}
                </div>
            </div>
        </div>
    );
};



export default InventoryHierarchy;