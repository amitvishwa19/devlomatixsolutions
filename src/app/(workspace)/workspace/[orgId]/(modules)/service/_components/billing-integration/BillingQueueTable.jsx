'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const BillingQueueTable = ({ billingQueue, onSelectBilling, onProcessPayment, onGenerateInvoice }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const handleSelectAll = (e) => {
        if (e?.target?.checked) {
            setSelectedRows(billingQueue?.map(item => item?.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev?.includes(id) ? prev?.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedQueue = [...billingQueue]?.sort((a, b) => {
        if (sortConfig?.key === 'date') {
            return sortConfig?.direction === 'asc'
                ? new Date(a.date) - new Date(b.date)
                : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig?.key === 'amount') {
            return sortConfig?.direction === 'asc'
                ? a?.totalAmount - b?.totalAmount
                : b?.totalAmount - a?.totalAmount;
        }
        return 0;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
            case 'Processing': return 'bg-primary/10 text-primary border-primary/20';
            case 'Completed': return 'bg-success/10 text-success border-success/20';
            case 'Failed': return 'bg-error/10 text-error border-error/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getInsuranceStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return { name: 'CheckCircleIcon', color: 'text-success' };
            case 'Pending': return { name: 'ClockIcon', color: 'text-warning' };
            case 'Denied': return { name: 'XCircleIcon', color: 'text-error' };
            default: return { name: 'QuestionMarkCircleIcon', color: 'text-muted-foreground' };
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
                                    checked={selectedRows?.length === billingQueue?.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                    aria-label="Select all billing items"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Patient Info
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-2">
                                    Date
                                    <Icon
                                        name={sortConfig?.key === 'date' && sortConfig?.direction === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                        size={16}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Services
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center gap-2">
                                    Amount
                                    <Icon
                                        name={sortConfig?.key === 'amount' && sortConfig?.direction === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                        size={16}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Insurance
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedQueue?.map((item) => {
                            const insuranceIcon = getInsuranceStatusIcon(item?.insuranceStatus);
                            return (
                                <tr
                                    key={item?.id}
                                    className={`hover:bg-muted/30 transition-colors ${selectedRows?.includes(item?.id) ? 'bg-accent/5' : ''}`}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows?.includes(item?.id)}
                                            onChange={() => handleSelectRow(item?.id)}
                                            className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                            aria-label={`Select billing for ${item?.patientName}`}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => onSelectBilling(item)}
                                                className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
                                            >
                                                {item?.patientName}
                                            </button>
                                            <span className="text-xs text-muted-foreground">ID: {item?.patientId}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">{item?.date}</span>
                                            <span className="text-xs text-muted-foreground">{item?.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">{item?.serviceCount} services</span>
                                            <span className="text-xs text-muted-foreground">{item?.primaryService}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">${item?.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            {item?.discount > 0 && (
                                                <span className="text-xs text-success">-${item?.discount?.toFixed(2)} discount</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Icon name={insuranceIcon?.name} size={16} className={insuranceIcon?.color} />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-foreground">{item?.insuranceProvider}</span>
                                                <span className="text-xs text-muted-foreground">{item?.insuranceStatus}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item?.status)}`}>
                                            {item?.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onGenerateInvoice(item)}
                                                className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                aria-label="Generate invoice"
                                                title="Generate Invoice"
                                            >
                                                <Icon name="DocumentTextIcon" size={18} />
                                            </button>
                                            <button
                                                onClick={() => onProcessPayment(item)}
                                                className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors"
                                                aria-label="Process payment"
                                                title="Process Payment"
                                            >
                                                <Icon name="CreditCardIcon" size={18} />
                                            </button>
                                            <button
                                                onClick={() => onSelectBilling(item)}
                                                className="p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
                                                aria-label="View details"
                                                title="View Details"
                                            >
                                                <Icon name="EyeIcon" size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {selectedRows?.length > 0 && (
                <div className="px-4 py-3 bg-accent/5 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">
                        {selectedRows?.length} item{selectedRows?.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                            Batch Process
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors">
                            Export Selected
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

BillingQueueTable.propTypes = {
    billingQueue: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        patientName: PropTypes?.string?.isRequired,
        patientId: PropTypes?.string?.isRequired,
        date: PropTypes?.string?.isRequired,
        time: PropTypes?.string?.isRequired,
        serviceCount: PropTypes?.number?.isRequired,
        primaryService: PropTypes?.string?.isRequired,
        totalAmount: PropTypes?.number?.isRequired,
        discount: PropTypes?.number,
        insuranceProvider: PropTypes?.string?.isRequired,
        insuranceStatus: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired
    }))?.isRequired,
    onSelectBilling: PropTypes?.func?.isRequired,
    onProcessPayment: PropTypes?.func?.isRequired,
    onGenerateInvoice: PropTypes?.func?.isRequired
};

export default BillingQueueTable;