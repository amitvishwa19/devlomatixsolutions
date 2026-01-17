'use client';

import { useState, useEffect } from 'react';
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import DeliveryChart from './DeliveryChart';
import DepartmentUsageChart from './DepartmentUsageChart';
import EmailHistoryTable from './EmailHistoryTable';
import TemplateEffectivenessTable from './TemplateEffectivenessTable';



const EmailReportsInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'last7days',
        department: 'all',
        emailType: 'all',
        deliveryStatus: 'all',
        searchQuery: '',
    });

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const metricsData = [
        {
            id: '1',
            title: 'Total Emails Sent',
            value: '12,458',
            change: '+12.5%',
            changeType: 'increase',
            icon: 'PaperAirplaneIcon',
            color: 'bg-primary',
        },
        {
            id: '2',
            title: 'Delivery Rate',
            value: '98.2%',
            change: '+2.1%',
            changeType: 'increase',
            icon: 'CheckCircleIcon',
            color: 'bg-success',
        },
        {
            id: '3',
            title: 'Open Rate',
            value: '67.8%',
            change: '-3.2%',
            changeType: 'decrease',
            icon: 'EnvelopeOpenIcon',
            color: 'bg-accent',
        },
        {
            id: '4',
            title: 'Bounce Rate',
            value: '1.8%',
            change: '-0.5%',
            changeType: 'decrease',
            icon: 'ExclamationTriangleIcon',
            color: 'bg-warning',
        },
    ];

    const deliveryChartData = [
        { date: '12/23', delivered: 1850, opened: 1245, bounced: 32 },
        { date: '12/24', delivered: 1620, opened: 1098, bounced: 28 },
        { date: '12/25', delivered: 980, opened: 654, bounced: 15 },
        { date: '12/26', delivered: 2150, opened: 1456, bounced: 38 },
        { date: '12/27', delivered: 1980, opened: 1342, bounced: 35 },
        { date: '12/28', delivered: 2280, opened: 1548, bounced: 41 },
        { date: '12/29', delivered: 2050, opened: 1389, bounced: 36 },
    ];

    const departmentData = [
        { name: 'Emergency', value: 3245, color: '#DC2626' },
        { name: 'Cardiology', value: 2856, color: '#2563EB' },
        { name: 'Pediatrics', value: 2134, color: '#7C3AED' },
        { name: 'Radiology', value: 1987, color: '#059669' },
        { name: 'Surgery', value: 2236, color: '#D97706' },
    ];

    const emailRecords = [
        {
            id: '1',
            sender: 'Dr. Sarah Johnson',
            recipient: 'john.doe@email.com',
            template: 'Appointment Reminder',
            department: 'Cardiology',
            status: 'opened',
            sentDate: '12/29/2025 09:15 AM',
            openedDate: '12/29/2025 10:32 AM',
        },
        {
            id: '2',
            sender: 'Nurse Emily Chen',
            recipient: 'jane.smith@email.com',
            template: 'Test Results Available',
            department: 'Radiology',
            status: 'delivered',
            sentDate: '12/29/2025 08:45 AM',
        },
        {
            id: '3',
            sender: 'Dr. Michael Brown',
            recipient: 'robert.wilson@email.com',
            template: 'Billing Statement',
            department: 'Emergency',
            status: 'opened',
            sentDate: '12/29/2025 08:30 AM',
            openedDate: '12/29/2025 09:15 AM',
        },
        {
            id: '4',
            sender: 'Admin Staff',
            recipient: 'mary.johnson@email.com',
            template: 'General Announcement',
            department: 'Surgery',
            status: 'delivered',
            sentDate: '12/29/2025 07:00 AM',
        },
        {
            id: '5',
            sender: 'Dr. Lisa Anderson',
            recipient: 'david.martinez@email.com',
            template: 'Appointment Confirmation',
            department: 'Pediatrics',
            status: 'bounced',
            sentDate: '12/28/2025 04:30 PM',
        },
        {
            id: '6',
            sender: 'Nurse Tom Wilson',
            recipient: 'susan.taylor@email.com',
            template: 'Prescription Ready',
            department: 'Cardiology',
            status: 'opened',
            sentDate: '12/28/2025 03:15 PM',
            openedDate: '12/28/2025 04:45 PM',
        },
        {
            id: '7',
            sender: 'Dr. James Lee',
            recipient: 'patricia.garcia@email.com',
            template: 'Follow-up Appointment',
            department: 'Emergency',
            status: 'delivered',
            sentDate: '12/28/2025 02:00 PM',
        },
        {
            id: '8',
            sender: 'Admin Staff',
            recipient: 'christopher.rodriguez@email.com',
            template: 'Insurance Update',
            department: 'Radiology',
            status: 'failed',
            sentDate: '12/28/2025 01:30 PM',
        },
        {
            id: '9',
            sender: 'Dr. Rachel Green',
            recipient: 'daniel.hernandez@email.com',
            template: 'Lab Results',
            department: 'Surgery',
            status: 'opened',
            sentDate: '12/28/2025 11:45 AM',
            openedDate: '12/28/2025 01:20 PM',
        },
        {
            id: '10',
            sender: 'Nurse Kevin Park',
            recipient: 'nancy.lopez@email.com',
            template: 'Vaccination Reminder',
            department: 'Pediatrics',
            status: 'pending',
            sentDate: '12/28/2025 10:00 AM',
        },
    ];

    const templateStats = [
        {
            id: '1',
            name: 'Appointment Reminder',
            category: 'Appointments',
            sent: 3245,
            delivered: 3189,
            opened: 2456,
            clickRate: 45.2,
            deliveryRate: 98.3,
            openRate: 77.0,
        },
        {
            id: '2',
            name: 'Test Results Available',
            category: 'Medical Records',
            sent: 2134,
            delivered: 2098,
            opened: 1876,
            clickRate: 82.5,
            deliveryRate: 98.3,
            openRate: 89.4,
        },
        {
            id: '3',
            name: 'Billing Statement',
            category: 'Billing',
            sent: 1987,
            delivered: 1945,
            opened: 1234,
            clickRate: 38.7,
            deliveryRate: 97.9,
            openRate: 63.5,
        },
        {
            id: '4',
            name: 'Prescription Ready',
            category: 'Pharmacy',
            sent: 1654,
            delivered: 1628,
            opened: 1456,
            clickRate: 67.8,
            deliveryRate: 98.4,
            openRate: 89.4,
        },
        {
            id: '5',
            name: 'General Announcement',
            category: 'Communications',
            sent: 2856,
            delivered: 2789,
            opened: 1567,
            clickRate: 28.4,
            deliveryRate: 97.7,
            openRate: 56.2,
        },
    ];

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleExport = () => {
        if (!isHydrated) return;
        alert('Exporting report data as CSV...');
    };

    const handleViewDetails = (recordId) => {
        if (!isHydrated) return;
        alert(`Viewing details for email record: ${recordId}`);
    };

    if (!isHydrated) {
        return (
            <div className="space-y-6">
                <div className="bg-card rounded-lg shadow-elevation-md p-6 animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-lg shadow-elevation-md p-6 animate-pulse">
                            <div className="h-20 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ReportFilters onFilterChange={handleFilterChange} onExport={handleExport} />
            <MetricsCards metrics={metricsData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeliveryChart data={deliveryChartData} />
                <DepartmentUsageChart data={departmentData} />
            </div>
            <EmailHistoryTable records={emailRecords} onViewDetails={handleViewDetails} />
            <TemplateEffectivenessTable templates={templateStats} />
        </div>
    );
};

export default EmailReportsInteractive;