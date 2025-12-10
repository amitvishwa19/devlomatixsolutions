'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

const CategoryNode = ({
    category,
    level = 0,
    onSelect,
    selectedId,
    onExpand,
    expandedIds,
    onDragStart,
    onDragOver,
    onDrop,
    onAddSubcategory,
    onEdit,
    onDelete,
    onArchive
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = expandedIds?.includes(category?.id);
    const isSelected = selectedId === category?.id;
    const hasChildren = category?.children && category?.children?.length > 0;

    const handleDragStart = (e) => {
        setIsDragging(true);
        onDragStart(category);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e?.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(category);
    };

    const handleDrop = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        onDrop(category);
    };

    const toggleExpand = (e) => {
        e?.stopPropagation();
        if (hasChildren) {
            onExpand(category?.id);
        }
    };

    const handleSelect = () => {
        onSelect(category);
    };

    const handleAction = (e, action) => {
        e?.stopPropagation();
        action(category);
    };

    return (
        <div className="select-none">
            <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleSelect}
                className={`
                            flex items-center gap-2 py-2.5 px-3 rounded-md cursor-pointer
                            transition-all duration-200 ease-out
                            ${isSelected ? 'bg-primary/20 dark:bg-darkFocusColor ' : 'hover:bg-primary/10 dark:hover:bg-darkFocusColor text-text-primary'}
                            ${isDragging ? 'opacity-50' : 'opacity-100'}
                        `}
                style={{ paddingLeft: `${level * 24 + 12}px` }}
            >

                {/* Expand/Collapse Button */}
                <button
                    onClick={toggleExpand}
                    className={`
                                flex-shrink-0 w-5 h-5 flex items-center justify-center rounded
                                transition-all duration-200 ease-out
                                ${hasChildren ? 'hover:bg-muted' : 'invisible'}
                                ${isSelected ? 'text-primary-foreground' : 'text-text-secondary'}
                            `}
                >
                    {hasChildren && (
                        <Icon
                            name="ChevronRightIcon"
                            size={16}
                            variant="solid"
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    )}
                </button>

                {/* Folder Icon */}
                <Icon
                    name={isExpanded ? 'FolderOpenIcon' : 'FolderIcon'}
                    size={20}
                    variant={isSelected ? 'solid' : 'outline'}
                    className={`flex-shrink-0 `}
                />

                {/* Category Name */}
                <span className={`flex-1 text-sm font-medium truncate text-text-primary`}>
                    {category?.name}
                </span>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {category?.subcategoryCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/80 ' : 'bg-muted'}`}>
                            {category?.subcategoryCount}
                        </span>
                    )}
                    {category?.contentCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/80' : 'bg-primary/10 text-primary'}`}>
                            {category?.contentCount} items
                        </span>
                    )}
                    {category?.isArchived && (
                        <Icon
                            name="ArchiveBoxIcon"
                            size={16}
                            variant="outline"
                            className={isSelected ? 'text-primary-foreground' : 'text-warning'}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                {isHovered && !isDragging && (
                    <div className="flex flex-row gap-2">
                        <Icon name="PlusIcon" size={16} variant="outline" onClick={(e) => handleAction(e, onAddSubcategory)} />
                        <Icon name="PencilIcon" size={16} variant="outline" onClick={(e) => handleAction(e, onEdit)} />
                        <Icon name="ArchiveBoxIcon" size={16} variant="outline" onClick={(e) => handleAction(e, onArchive)} />
                        <Icon name="TrashIcon" size={16} variant="outline" onClick={(e) => handleAction(e, onDelete)} />

                    </div>
                )}
            </div>

            {/* Render Children */}
            {isExpanded && hasChildren && (
                <div className="mt-1">
                    {category?.children?.map((child) => (
                        <CategoryNode
                            key={child?.id}
                            category={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            onExpand={onExpand}
                            expandedIds={expandedIds}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onAddSubcategory={onAddSubcategory}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onArchive={onArchive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryNode;