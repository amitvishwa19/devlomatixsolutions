'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function PatientResultsTable({ patients, onSort }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        onSort(key, direction);
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig?.key !== columnKey) {
            return <Icon name="ChevronUpDownIcon" size={16} className="text-text-secondary" />;
        }
        return sortConfig?.direction === 'asc'
            ? <Icon name="ChevronUpIcon" size={16} className="text-primary" />
            : <Icon name="ChevronDownIcon" size={16} className="text-primary" />;
    };

    const totalPages = Math.ceil(patients?.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPatients = patients?.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getInsuranceStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success';
            case 'Pending':
                return 'bg-warning/10 text-warning';
            case 'Expired':
                return 'bg-error/10 text-error';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 ease-out"
                                >
                                    Patient Name
                                    {getSortIcon('name')}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('id')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 ease-out"
                                >
                                    Patient ID
                                    {getSortIcon('id')}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('dob')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 ease-out"
                                >
                                    Date of Birth
                                    {getSortIcon('dob')}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('lastVisit')}
                                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 ease-out"
                                >
                                    Last Visit
                                    {getSortIcon('lastVisit')}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <span className="text-sm font-semibold text-foreground">Assigned Provider</span>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <span className="text-sm font-semibold text-foreground">Insurance Status</span>
                            </th>
                            <th className="px-6 py-4 text-right">
                                <span className="text-sm font-semibold text-foreground">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentPatients?.map((patient) => (
                            <tr key={patient?.id} className="hover:bg-muted/50 transition-colors duration-200 ease-out">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon name="UserIcon" size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">{patient?.name}</div>
                                            <div className="text-xs text-text-secondary">{patient?.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-mono text-foreground">{patient?.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-foreground">{patient?.dob}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-foreground">{patient?.lastVisit}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-foreground">{patient?.provider}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getInsuranceStatusColor(patient?.insuranceStatus)}`}>
                                        {patient?.insuranceStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href="/patient-profile"
                                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 ease-out group"
                                            title="View Profile"
                                        >
                                            <Icon name="UserCircleIcon" size={20} className="text-text-secondary group-hover:text-primary" />
                                        </Link>
                                        <Link
                                            href="/patient-profile"
                                            className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200 ease-out group"
                                            title="Schedule Appointment"
                                        >
                                            <Icon name="CalendarIcon" size={20} className="text-text-secondary group-hover:text-accent" />
                                        </Link>
                                        <button
                                            className="p-2 rounded-lg hover:bg-warning/10 transition-colors duration-200 ease-out group"
                                            title="Add Note"
                                        >
                                            <Icon name="DocumentTextIcon" size={20} className="text-text-secondary group-hover:text-warning" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <div className="text-sm text-text-secondary">
                        Showing {startIndex + 1} to {Math.min(endIndex, patients?.length)} of {patients?.length} results
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out"
                            aria-label="Previous page"
                        >
                            <Icon name="ChevronLeftIcon" size={20} className="text-foreground" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ease-out ${currentPage === page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-input hover:bg-muted text-foreground'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out"
                            aria-label="Next page"
                        >
                            <Icon name="ChevronRightIcon" size={20} className="text-foreground" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

PatientResultsTable.propTypes = {
    patients: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            phone: PropTypes?.string?.isRequired,
            dob: PropTypes?.string?.isRequired,
            lastVisit: PropTypes?.string?.isRequired,
            provider: PropTypes?.string?.isRequired,
            insuranceStatus: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onSort: PropTypes?.func?.isRequired
};