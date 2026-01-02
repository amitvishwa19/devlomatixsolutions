'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const ReportFilters = ({ onFilterChange, onExport }) => {
    const [filters, setFilters] = useState({
        dateRange: 'last7days',
        department: 'all',
        emailType: 'all',
        deliveryStatus: 'all',
        searchQuery: '',
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-card rounded-lg shadow-elevation-md p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Report Filters</h2>
                <button
                    onClick={onExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                >
                    <Icon name="ArrowDownTrayIcon" size={20} />
                    <span className="text-sm font-medium">Export Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="dateRange" className="block text-sm font-medium text-foreground mb-2">
                        Date Range
                    </label>
                    <select
                        id="dateRange"
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last90days">Last 90 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                        Department
                    </label>
                    <select
                        id="department"
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Departments</option>
                        <option value="emergency">Emergency</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="radiology">Radiology</option>
                        <option value="surgery">Surgery</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="emailType" className="block text-sm font-medium text-foreground mb-2">
                        Email Type
                    </label>
                    <select
                        id="emailType"
                        value={filters.emailType}
                        onChange={(e) => handleFilterChange('emailType', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Types</option>
                        <option value="appointment">Appointment Reminders</option>
                        <option value="test_results">Test Results</option>
                        <option value="billing">Billing Notifications</option>
                        <option value="general">General Announcements</option>
                        <option value="emergency">Emergency Alerts</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="deliveryStatus" className="block text-sm font-medium text-foreground mb-2">
                        Delivery Status
                    </label>
                    <select
                        id="deliveryStatus"
                        value={filters.deliveryStatus}
                        onChange={(e) => handleFilterChange('deliveryStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Status</option>
                        <option value="delivered">Delivered</option>
                        <option value="opened">Opened</option>
                        <option value="bounced">Bounced</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
                    Search
                </label>
                <div className="relative">
                    <Icon
                        name="MagnifyingGlassIcon"
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by recipient, sender, or template..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;