'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const BulkActionsBar = ({
    selectedCount,
    onAddToList,
    onExport,
    onUpdateStatus,
    onDelete,
    onClearSelection,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [showActions, setShowActions] = useState(false);

    useState(() => {
        setIsHydrated(true);
    });

    if (!isHydrated || selectedCount === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100]">
            <div className="bg-card shadow-elevation-xl rounded-lg border border-border overflow-hidden">
                <div className="flex items-center space-x-4 px-6 py-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {selectedCount}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                            {selectedCount === 1 ? 'contact' : 'contacts'} selected
                        </span>
                    </div>

                    <div className="h-6 w-px bg-border" />

                    <div className="hidden md:flex items-center space-x-2">
                        <button
                            onClick={onAddToList}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                            title="Add to distribution list"
                        >
                            <Icon name="PlusCircleIcon" size={18} />
                            <span className="text-sm font-medium">Add to List</span>
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-smooth"
                            title="Export selected contacts"
                        >
                            <Icon name="ArrowDownTrayIcon" size={18} />
                            <span className="text-sm font-medium">Export</span>
                        </button>
                        <button
                            onClick={onUpdateStatus}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-smooth"
                            title="Update contact status"
                        >
                            <Icon name="PencilSquareIcon" size={18} />
                            <span className="text-sm font-medium">Update Status</span>
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-error/10 text-error rounded-md hover:bg-error/20 transition-smooth"
                            title="Delete selected contacts"
                        >
                            <Icon name="TrashIcon" size={18} />
                            <span className="text-sm font-medium">Delete</span>
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 rounded-md hover:bg-muted transition-smooth"
                            aria-label="Toggle actions menu"
                        >
                            <Icon name="EllipsisVerticalIcon" size={20} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-border" />

                    <button
                        onClick={onClearSelection}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        title="Clear selection"
                        aria-label="Clear selection"
                    >
                        <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {showActions && (
                    <div className="md:hidden border-t border-border">
                        <div className="p-3 space-y-2">
                            <button
                                onClick={() => {
                                    onAddToList();
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth"
                            >
                                <Icon name="PlusCircleIcon" size={18} />
                                <span>Add to List</span>
                            </button>
                            <button
                                onClick={() => {
                                    onExport();
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth"
                            >
                                <Icon name="ArrowDownTrayIcon" size={18} />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => {
                                    onUpdateStatus();
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth"
                            >
                                <Icon name="PencilSquareIcon" size={18} />
                                <span>Update Status</span>
                            </button>
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-smooth"
                            >
                                <Icon name="TrashIcon" size={18} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkActionsBar;