'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const MobileServiceCard = ({ service, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-success/10 text-success border-success/20';
            case 'inactive':
                return 'bg-muted text-muted-foreground border-border';
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        })?.format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{service?.name}</h3>
                        <p className="text-xs text-muted-foreground">{service?.code}</p>
                    </div>
                    <div className="relative ml-2">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
                            aria-label="Actions menu"
                        >
                            <Icon name="EllipsisVerticalIcon" size={20} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onEdit(service);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                                        >
                                            <Icon name="PencilIcon" size={16} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onDuplicate(service);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                                        >
                                            <Icon name="DocumentDuplicateIcon" size={16} />
                                            <span>Duplicate</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onToggleStatus(service);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                                        >
                                            <Icon name={service?.status === 'Active' ? 'XCircleIcon' : 'CheckCircleIcon'} size={16} />
                                            <span>{service?.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                                        </button>
                                        <div className="border-t border-border my-1" />
                                        <button
                                            onClick={() => {
                                                onDelete(service);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
                                        >
                                            <Icon name="TrashIcon" size={16} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">{formatPrice(service?.price)}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(service?.status)}`}>
                        {service?.status}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{service?.category}</span>
                    <span>{formatDate(service?.lastUpdated)}</span>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                >
                    <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                    <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
                </button>

                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Subcategory:</span>
                            <span className="text-foreground font-medium">{service?.subcategory}</span>
                        </div>
                        {service?.description && (
                            <div className="text-xs">
                                <span className="text-muted-foreground">Description:</span>
                                <p className="text-foreground mt-1">{service?.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

MobileServiceCard.propTypes = {
    service: PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        code: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        subcategory: PropTypes?.string?.isRequired,
        description: PropTypes?.string,
        price: PropTypes?.number?.isRequired,
        status: PropTypes?.string?.isRequired,
        lastUpdated: PropTypes?.string?.isRequired
    })?.isRequired,
    onEdit: PropTypes?.func?.isRequired,
    onDelete: PropTypes?.func?.isRequired,
    onDuplicate: PropTypes?.func?.isRequired,
    onToggleStatus: PropTypes?.func?.isRequired
};

export default MobileServiceCard;