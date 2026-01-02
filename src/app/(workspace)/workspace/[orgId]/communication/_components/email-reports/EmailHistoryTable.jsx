'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const EmailHistoryTable = ({ records, onViewDetails }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(records.length / recordsPerPage);

    const getStatusBadge = (status) => {
        const statusConfig = {
            delivered: { color: 'bg-success/10 text-success', label: 'Delivered', icon: 'CheckCircleIcon' },
            opened: { color: 'bg-primary/10 text-primary', label: 'Opened', icon: 'EnvelopeOpenIcon' },
            bounced: { color: 'bg-warning/10 text-warning', label: 'Bounced', icon: 'ExclamationTriangleIcon' },
            failed: { color: 'bg-error/10 text-error', label: 'Failed', icon: 'XCircleIcon' },
            pending: { color: 'bg-muted text-muted-foreground', label: 'Pending', icon: 'ClockIcon' },
        };

        const config = statusConfig[status];

        return (
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
                <Icon name={config.icon} size={14} />
                <span>{config.label}</span>
            </span>
        );
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="bg-card rounded-lg shadow-elevation-md overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-1">Email History</h2>
                <p className="text-sm text-muted-foreground">Detailed log of all email communications</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Sender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Recipient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Template
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Sent Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-muted/50 transition-smooth">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {record.sender}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {record.recipient}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {record.template}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {record.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(record.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {record.sentDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => onViewDetails(record.id)}
                                        className="text-primary hover:text-primary/80 transition-smooth font-medium"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, records.length)} of {records.length} records
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailHistoryTable;