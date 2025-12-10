'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import ServiceTableRow from './ServiceTableRow';

const ServiceTable = ({ services, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedServices = [...services]?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];

        if (sortConfig?.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    const SortIcon = ({ columnKey }) => {
        if (sortConfig?.key !== columnKey) {
            return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
        }
        return (
            <Icon
                name={sortConfig?.direction === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                size={16}
                className="text-primary"
            />
        );
    };

    SortIcon.propTypes = {
        columnKey: PropTypes?.string?.isRequired
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                    aria-label="Select all services"
                                />
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-1 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-200"
                                >
                                    Service Name
                                    <SortIcon columnKey="name" />
                                </button>
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => handleSort('category')}
                                className="flex items-center gap-1 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-200"
                            >
                                Category
                                <SortIcon columnKey="category" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => handleSort('price')}
                                className="flex items-center gap-1 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-200"
                            >
                                Price
                                <SortIcon columnKey="price" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => handleSort('status')}
                                className="flex items-center gap-1 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-200"
                            >
                                Status
                                <SortIcon columnKey="status" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => handleSort('lastUpdated')}
                                className="flex items-center gap-1 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-200"
                            >
                                Last Updated
                                <SortIcon columnKey="lastUpdated" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {sortedServices?.map((service) => (
                        <ServiceTableRow
                            key={service?.id}
                            service={service}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onToggleStatus={onToggleStatus}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

ServiceTable.propTypes = {
    services: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            code: PropTypes?.string?.isRequired,
            category: PropTypes?.string?.isRequired,
            subcategory: PropTypes?.string?.isRequired,
            price: PropTypes?.number?.isRequired,
            status: PropTypes?.string?.isRequired,
            lastUpdated: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onEdit: PropTypes?.func?.isRequired,
    onDelete: PropTypes?.func?.isRequired,
    onDuplicate: PropTypes?.func?.isRequired,
    onToggleStatus: PropTypes?.func?.isRequired
};

export default ServiceTable;