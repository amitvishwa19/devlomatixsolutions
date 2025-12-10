'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { ScrollArea } from '@/components/ui/scroll-area';

const CategoryDetails = ({ category, onClose }) => {
    if (!category) {
        return (
            <div className="h-full flex items-center justify-center text-text-secondary">
                <div className="text-center">
                    <Icon name="FolderIcon" size={48} variant="outline" className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Select a category to view details</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date?.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <ScrollArea className="h-full flex flex-col bg-surface">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <Icon
                        name={category?.isArchived ? 'ArchiveBoxIcon' : 'FolderIcon'}
                        size={24}
                        variant="solid"
                        className="text-primary"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">{category?.name}</h2>
                        <p className="text-xs text-text-secondary mt-0.5">
                            ID: {category?.id}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
                >
                    <Icon name="XMarkIcon" size={20} variant="outline" className="text-text-secondary" />
                </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Badge */}
                {category?.isArchived && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg">
                        <Icon name="ArchiveBoxIcon" size={16} variant="solid" className="text-warning" />
                        <span className="text-sm font-medium text-warning">Archived Category</span>
                    </div>
                )}

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {category?.description || 'No description provided'}
                    </p>
                </div>

                {/* Statistics */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="FolderIcon" size={16} variant="outline" className="text-primary" />
                                <span className="text-xs text-text-secondary">Subcategories</span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{category?.subcategoryCount}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="DocumentTextIcon" size={16} variant="outline" className="text-primary" />
                                <span className="text-xs text-text-secondary">Content Items</span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{category?.contentCount}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="EyeIcon" size={16} variant="outline" className="text-primary" />
                                <span className="text-xs text-text-secondary">Total Views</span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{category?.viewCount}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="ChartBarIcon" size={16} variant="outline" className="text-primary" />
                                <span className="text-xs text-text-secondary">Usage Score</span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{category?.usageScore}%</p>
                        </div>
                    </div>
                </div>

                {/* Assigned Tags */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Assigned Tags</h3>
                    {category?.tags && category?.tags?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {category?.tags?.map((tag) => (
                                <span
                                    key={tag?.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: `${tag?.color}20`,
                                        color: tag?.color
                                    }}
                                >
                                    <Icon name="TagIcon" size={12} variant="solid" />
                                    {tag?.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No tags assigned</p>
                    )}
                </div>

                {/* Metadata */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Metadata</h3>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Icon name="UserIcon" size={16} variant="outline" className="text-text-secondary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-text-secondary">Created By</p>
                                <p className="text-sm text-text-primary font-medium">{category?.createdBy}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Icon name="CalendarIcon" size={16} variant="outline" className="text-text-secondary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-text-secondary">Created Date</p>
                                <p className="text-sm text-text-primary font-medium">{formatDate(category?.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Icon name="ClockIcon" size={16} variant="outline" className="text-text-secondary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-text-secondary">Last Modified</p>
                                <p className="text-sm text-text-primary font-medium">{formatDate(category?.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Permissions</h3>
                    <div className="space-y-2">
                        {category?.permissions?.map((permission) => (
                            <div key={permission?.role} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Icon name="ShieldCheckIcon" size={16} variant="outline" className="text-primary" />
                                    <span className="text-sm font-medium text-text-primary">{permission?.role}</span>
                                </div>
                                <span className="text-xs text-text-secondary">{permission?.access}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Path */}
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Category Path</h3>
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-text-secondary font-mono break-all">{category?.path}</p>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};



export default CategoryDetails;