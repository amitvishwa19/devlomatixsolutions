'use client'
import React from 'react'
import ServiceSearchBar from '../ServiceSearchBar';
import DashboardInteractive from './DashboardInteractive';

export default function Dashboard() {

    const dashboardData = {
        userRole: 'admin',
        metrics: {
            totalServices: 1247,
            cards: [
                {
                    id: 1,
                    title: 'Total Services',
                    value: '1,247',
                    change: '+12.5%',
                    changeType: 'positive',
                    icon: 'CubeIcon',
                    iconColor: 'bg-primary/10 text-primary',
                },
                {
                    id: 2,
                    title: 'Active Pricing Tiers',
                    value: '18',
                    change: '+2',
                    changeType: 'positive',
                    icon: 'CurrencyDollarIcon',
                    iconColor: 'bg-success/10 text-success',
                },
                {
                    id: 3,
                    title: 'Recent Updates',
                    value: '34',
                    change: '-5.2%',
                    changeType: 'negative',
                    icon: 'ClockIcon',
                    iconColor: 'bg-warning/10 text-warning',
                },
                {
                    id: 4,
                    title: 'Monthly Revenue',
                    value: '$2.4M',
                    change: '+18.3%',
                    changeType: 'positive',
                    icon: 'ChartBarIcon',
                    iconColor: 'bg-accent/10 text-accent',
                },
            ],
        },
        activities: [
            {
                id: 1,
                type: 'approval_request',
                title: 'New Service Approval Required',
                description: 'Cardiology Department requested approval for Advanced Cardiac Imaging service',
                timestamp: '2025-12-06T18:30:00',
                actionRequired: true,
            },
            {
                id: 2,
                type: 'price_change',
                title: 'Price Update Completed',
                description: 'Emergency Room consultation rates updated from $250 to $275',
                timestamp: '2025-12-06T17:45:00',
                actionRequired: false,
            },
            {
                id: 3,
                type: 'new_service',
                title: 'New Service Added',
                description: 'Telemedicine Consultation service added to Outpatient category',
                timestamp: '2025-12-06T16:20:00',
                actionRequired: false,
            },
            {
                id: 4,
                type: 'service_update',
                title: 'Service Details Modified',
                description: 'MRI Scan service description and duration updated',
                timestamp: '2025-12-06T15:10:00',
                actionRequired: false,
            },
            {
                id: 5,
                type: 'approval_request',
                title: 'Bulk Import Pending Review',
                description: '45 laboratory test services imported and awaiting approval',
                timestamp: '2025-12-06T14:30:00',
                actionRequired: true,
            },
        ],
        departments: [
            {
                id: 1,
                name: 'Cardiology',
                icon: 'HeartIcon',
                serviceCount: 156,
                revenue: 485000,
                trend: 12.5,
            },
            {
                id: 2,
                name: 'Emergency',
                icon: 'BoltIcon',
                serviceCount: 89,
                revenue: 620000,
                trend: 8.3,
            },
            {
                id: 3,
                name: 'Diagnostics',
                icon: 'BeakerIcon',
                serviceCount: 234,
                revenue: 340000,
                trend: -3.2,
            },
            {
                id: 4,
                name: 'Surgery',
                icon: 'ScissorsIcon',
                serviceCount: 178,
                revenue: 890000,
                trend: 15.7,
            },
        ],
        chartData: [
            { department: 'Cardiology', services: 156, revenue: 485 },
            { department: 'Emergency', services: 89, revenue: 620 },
            { department: 'Diagnostics', services: 234, revenue: 340 },
            { department: 'Surgery', services: 178, revenue: 890 },
            { department: 'Pediatrics', services: 123, revenue: 275 },
            { department: 'Orthopedics', services: 145, revenue: 410 },
        ],
        shortcuts: [
            {
                id: 1,
                label: 'Service Management',
                description: 'Manage all services',
                path: '/service-management',
                icon: 'CubeIcon',
            },
            {
                id: 2,
                label: 'Pricing Controls',
                description: 'Update pricing tiers',
                path: '/pricing-management',
                icon: 'CurrencyDollarIcon',
            },
            {
                id: 3,
                label: 'Billing Integration',
                description: 'Configure billing',
                path: '/billing-integration',
                icon: 'DocumentTextIcon',
            },
            {
                id: 4,
                label: 'Service Browser',
                description: 'Browse catalog',
                path: '/service-catalog-browser',
                icon: 'MagnifyingGlassIcon',
            },
        ],
    };


    return (
        <div className='flex flex-col gap-2 w-full'>
            {/* <div className="w-[50%]">
                <ServiceSearchBar
                    searchType="admin"
                    showFilters={true}
                    placeholder="Search services, categories, or CPT codes..."
                />
            </div> */}
            <DashboardInteractive initialData={dashboardData} />
        </div>
    )
}
