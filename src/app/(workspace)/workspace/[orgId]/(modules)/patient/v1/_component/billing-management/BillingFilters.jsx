'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function BillingFilters({ onFilterChange }) {
    const [filters, setFilters] = useState({
        dateRange: 'all',
        status: 'all',
        paymentMethod: 'all',
        searchQuery: ''
    });

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSearchChange = (e) => {
        const value = e?.target?.value;
        handleFilterChange('searchQuery', value);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            dateRange: 'all',
            status: 'all',
            paymentMethod: 'all',
            searchQuery: ''
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">Filters</h3>
                <button
                    onClick={handleClearFilters}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                    Clear All
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                    <div className="relative">
                        <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            value={filters?.searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by patient name or invoice ID..."
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                    <select
                        value={filters?.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <select
                        value={filters?.status}
                        onChange={(e) => handleFilterChange('status', e?.target?.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                        <option value="processing">Processing</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                    <select
                        value={filters?.paymentMethod}
                        onChange={(e) => handleFilterChange('paymentMethod', e?.target?.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Methods</option>
                        <option value="credit-card">Credit Card</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="insurance">Insurance</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

BillingFilters.propTypes = {
    onFilterChange: PropTypes?.func?.isRequired
};