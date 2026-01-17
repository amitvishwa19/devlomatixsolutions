'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const BulkOperationsToolbar = ({ selectedCount, onBulkEdit, onBulkDelete, onBulkMerge, onClearSelection }) => {
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [mergeTargetName, setMergeTargetName] = useState('');

    const handleMergeConfirm = () => {
        if (mergeTargetName?.trim()) {
            onBulkMerge(mergeTargetName);
            setShowMergeDialog(false);
            setMergeTargetName('');
        }
    };

    const handleDeleteConfirm = () => {
        onBulkDelete();
        setShowDeleteDialog(false);
    };

    if (selectedCount === 0) return null;

    return (
        <>
            <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-elevation-2 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-foreground/20 rounded-lg">
                            <Icon name="CheckCircleIcon" size={20} variant="solid" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {selectedCount} {selectedCount === 1 ? 'tag' : 'tags'} selected
                            </p>
                            <p className="text-xs opacity-90">Choose a bulk action to apply</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBulkEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-lg transition-colors"
                            aria-label="Bulk edit tags"
                        >
                            <Icon name="PencilIcon" size={16} variant="outline" />
                            <span className="text-sm font-medium hidden sm:inline">Edit</span>
                        </button>

                        <button
                            onClick={() => setShowMergeDialog(true)}
                            disabled={selectedCount < 2}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Merge tags"
                        >
                            <Icon name="ArrowsPointingInIcon" size={16} variant="outline" />
                            <span className="text-sm font-medium hidden sm:inline">Merge</span>
                        </button>

                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-error hover:bg-error/90 text-error-foreground rounded-lg transition-colors"
                            aria-label="Delete tags"
                        >
                            <Icon name="TrashIcon" size={16} variant="outline" />
                            <span className="text-sm font-medium hidden sm:inline">Delete</span>
                        </button>

                        <button
                            onClick={onClearSelection}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-lg transition-colors"
                            aria-label="Clear selection"
                        >
                            <Icon name="XMarkIcon" size={16} variant="outline" />
                            <span className="text-sm font-medium hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Merge Dialog */}
            {showMergeDialog && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-text-primary/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-lg shadow-elevation-3 max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                                <Icon name="ArrowsPointingInIcon" size={20} variant="outline" className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">Merge Tags</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">
                            Merge {selectedCount} selected tags into a single tag. All associations will be transferred to the new tag.
                        </p>
                        <div className="mb-6">
                            <label htmlFor="mergeTargetName" className="block text-sm font-medium text-text-primary mb-2">
                                New Tag Name
                            </label>
                            <input
                                type="text"
                                id="mergeTargetName"
                                value={mergeTargetName}
                                onChange={(e) => setMergeTargetName(e?.target?.value)}
                                placeholder="Enter merged tag name"
                                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleMergeConfirm}
                                disabled={!mergeTargetName?.trim()}
                                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Merge Tags
                            </button>
                            <button
                                onClick={() => {
                                    setShowMergeDialog(false);
                                    setMergeTargetName('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-text-primary rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-text-primary/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-lg shadow-elevation-3 max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-error/10 rounded-lg">
                                <Icon name="ExclamationTriangleIcon" size={20} variant="outline" className="text-error" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">Delete Tags</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-6">
                            Are you sure you want to delete {selectedCount} selected {selectedCount === 1 ? 'tag' : 'tags'}? This action cannot be undone and will remove all associations.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 text-error-foreground rounded-lg font-medium transition-colors"
                            >
                                Delete Tags
                            </button>
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-text-primary rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

BulkOperationsToolbar.propTypes = {
    selectedCount: PropTypes?.number?.isRequired,
    onBulkEdit: PropTypes?.func?.isRequired,
    onBulkDelete: PropTypes?.func?.isRequired,
    onBulkMerge: PropTypes?.func?.isRequired,
    onClearSelection: PropTypes?.func?.isRequired
};

export default BulkOperationsToolbar;