'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const DistributionLists = ({
    lists,
    onCreateList,
    onEditList,
    onDeleteList,
    onViewMembers,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [expandedList, setExpandedList] = useState(null);

    useState(() => {
        setIsHydrated(true);
    });

    const toggleExpand = (id) => {
        setExpandedList(expandedList === id ? null : id);
    };

    if (!isHydrated) {
        return (
            <div className="bg-card rounded-lg shadow-elevation-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-40 h-6 bg-muted rounded animate-pulse" />
                    <div className="w-32 h-10 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                            <div className="space-y-2">
                                <div className="w-48 h-5 bg-muted rounded animate-pulse" />
                                <div className="w-full h-4 bg-muted rounded animate-pulse" />
                                <div className="flex space-x-4">
                                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow-elevation-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Distribution Lists</h3>
                <button
                    onClick={onCreateList}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                >
                    <Icon name="PlusIcon" size={18} />
                    <span className="text-sm font-medium">Create List</span>
                </button>
            </div>

            {lists.length === 0 ? (
                <div className="text-center py-12">
                    <Icon name="QueueListIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                        No distribution lists created yet
                    </p>
                    <button
                        onClick={onCreateList}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                    >
                        <Icon name="PlusIcon" size={18} />
                        <span className="text-sm font-medium">Create Your First List</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-smooth"
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="text-sm font-semibold text-foreground">
                                                {list.name}
                                            </h4>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {list.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {list.description}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                <Icon name="UserGroupIcon" size={14} />
                                                <span>{list.memberCount} members</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                <Icon name="CalendarIcon" size={14} />
                                                <span>Modified {list.lastModified}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleExpand(list.id)}
                                        className="p-1 rounded-md hover:bg-muted transition-smooth ml-2"
                                        aria-label={expandedList === list.id ? 'Collapse' : 'Expand'}
                                    >
                                        <Icon
                                            name={expandedList === list.id ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                            size={20}
                                            className="text-muted-foreground"
                                        />
                                    </button>
                                </div>

                                {expandedList === list.id && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-caption mb-1">
                                                    Created Date
                                                </p>
                                                <p className="text-sm text-foreground">{list.createdDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-caption mb-1">
                                                    Last Modified
                                                </p>
                                                <p className="text-sm text-foreground">{list.lastModified}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => onViewMembers(list)}
                                                className="flex items-center space-x-2 px-3 py-1.5 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-smooth"
                                            >
                                                <Icon name="UserGroupIcon" size={16} />
                                                <span className="text-sm">View Members</span>
                                            </button>
                                            <button
                                                onClick={() => onEditList(list)}
                                                className="flex items-center space-x-2 px-3 py-1.5 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-smooth"
                                            >
                                                <Icon name="PencilIcon" size={16} />
                                                <span className="text-sm">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => onDeleteList(list)}
                                                className="flex items-center space-x-2 px-3 py-1.5 bg-error/10 text-error rounded-md hover:bg-error/20 transition-smooth"
                                            >
                                                <Icon name="TrashIcon" size={16} />
                                                <span className="text-sm">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DistributionLists;