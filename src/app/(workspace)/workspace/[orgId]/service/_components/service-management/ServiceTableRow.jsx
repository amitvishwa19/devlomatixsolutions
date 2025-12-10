'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ServiceTableRow = ({ service, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        })?.format(price);
    };

    return (
        <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                        aria-label={`Select ${service?.name}`}
                    />
                    <div>
                        <p className="text-sm font-medium text-foreground">{service?.name}</p>
                        <p className="text-xs text-muted-foreground">{service?.code}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-foreground">{service?.category}</span>
                    <span className="text-xs text-muted-foreground">{service?.subcategory}</span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm font-medium text-foreground">{formatPrice(service?.price)}</span>
            </td>
            <td className="px-4 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(service?.status)}`}>
                    {service?.status}
                </span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm text-muted-foreground">{formatDate(service?.lastUpdated)}</span>
            </td>
            <td className="px-4 py-4">
                <div className="relative">
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
                                        <span>Edit Service</span>
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
            </td>
        </tr>
    );
};

ServiceTableRow.propTypes = {
    service: PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        code: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        subcategory: PropTypes?.string?.isRequired,
        price: PropTypes?.number?.isRequired,
        status: PropTypes?.string?.isRequired,
        lastUpdated: PropTypes?.string?.isRequired
    })?.isRequired,
    onEdit: PropTypes?.func?.isRequired,
    onDelete: PropTypes?.func?.isRequired,
    onDuplicate: PropTypes?.func?.isRequired,
    onToggleStatus: PropTypes?.func?.isRequired
};

export default ServiceTableRow;