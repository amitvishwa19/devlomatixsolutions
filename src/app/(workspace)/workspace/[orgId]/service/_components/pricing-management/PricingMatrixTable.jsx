'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const PricingMatrixTable = ({ pricingData, onEditPrice, onViewHistory, onDuplicateTier }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'serviceName', direction: 'asc' });
    const [selectedRows, setSelectedRows] = useState([]);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const sortedData = [...pricingData]?.sort((a, b) => {
        if (sortConfig?.key === 'serviceName') {
            return sortConfig?.direction === 'asc'
                ? a?.serviceName?.localeCompare(b?.serviceName)
                : b?.serviceName?.localeCompare(a?.serviceName);
        }
        if (sortConfig?.key === 'basePrice') {
            return sortConfig?.direction === 'asc' ? a?.basePrice - b?.basePrice : b?.basePrice - a?.basePrice;
        }
        if (sortConfig?.key === 'effectiveDate') {
            return sortConfig?.direction === 'asc'
                ? new Date(a.effectiveDate) - new Date(b.effectiveDate)
                : new Date(b.effectiveDate) - new Date(a.effectiveDate);
        }
        return 0;
    });

    const handleSelectRow = (id) => {
        setSelectedRows((prev) =>
            prev?.includes(id) ? prev?.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRows?.length === pricingData?.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(pricingData?.map((item) => item?.id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success border-success/20';
            case 'Pending':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'Expired':
                return 'bg-muted text-muted-foreground border-border';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedRows?.length === pricingData?.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                    aria-label="Select all rows"
                                />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('serviceName')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                    Service Name
                                    <Icon
                                        name={sortConfig?.key === 'serviceName' && sortConfig?.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                        size={16}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-sm font-semibold text-foreground">Category</span>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <button
                                    onClick={() => handleSort('basePrice')}
                                    className="flex items-center gap-2 ml-auto text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                    Base Price
                                    <Icon
                                        name={sortConfig?.key === 'basePrice' && sortConfig?.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                        size={16}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <span className="text-sm font-semibold text-foreground">Insurance Rate</span>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <span className="text-sm font-semibold text-foreground">Discount</span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('effectiveDate')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                    Effective Date
                                    <Icon
                                        name={sortConfig?.key === 'effectiveDate' && sortConfig?.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                        size={16}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-sm font-semibold text-foreground">Status</span>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <span className="text-sm font-semibold text-foreground">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData?.map((item) => (
                            <tr key={item?.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows?.includes(item?.id)}
                                        onChange={() => handleSelectRow(item?.id)}
                                        className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                        aria-label={`Select ${item?.serviceName}`}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">{item?.serviceName}</span>
                                        <span className="text-xs text-muted-foreground">{item?.serviceCode}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-foreground">{item?.category}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-medium text-foreground">${item?.basePrice?.toLocaleString()}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm text-foreground">${item?.insuranceRate?.toLocaleString()}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm text-accent font-medium">{item?.discount}%</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-foreground">{item?.effectiveDate}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(item?.status)}`}>
                                        {item?.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEditPrice(item)}
                                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            aria-label={`Edit ${item?.serviceName}`}
                                        >
                                            <Icon name="PencilIcon" size={16} />
                                        </button>
                                        <button
                                            onClick={() => onViewHistory(item)}
                                            className="p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
                                            aria-label={`View history for ${item?.serviceName}`}
                                        >
                                            <Icon name="ClockIcon" size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDuplicateTier(item)}
                                            className="p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
                                            aria-label={`Duplicate ${item?.serviceName}`}
                                        >
                                            <Icon name="DocumentDuplicateIcon" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

PricingMatrixTable.propTypes = {
    pricingData: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            serviceName: PropTypes?.string?.isRequired,
            serviceCode: PropTypes?.string?.isRequired,
            category: PropTypes?.string?.isRequired,
            basePrice: PropTypes?.number?.isRequired,
            insuranceRate: PropTypes?.number?.isRequired,
            discount: PropTypes?.number?.isRequired,
            effectiveDate: PropTypes?.string?.isRequired,
            status: PropTypes?.string?.isRequired,
        })
    )?.isRequired,
    onEditPrice: PropTypes?.func?.isRequired,
    onViewHistory: PropTypes?.func?.isRequired,
    onDuplicateTier: PropTypes?.func?.isRequired,
};

export default PricingMatrixTable;