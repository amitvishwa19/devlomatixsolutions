
//import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import DashboardInteractive from './DashboardInteractive';
import { ScrollArea } from '@/components/ui/scroll-area';


// export const metadata = {
//     title: 'Taxonomy',
//     description: 'Comprehensive tag creation, organization, and assignment capabilities for enhanced medical content categorization and retrieval in healthcare systems.'
// };

export default async function TaxonomyPage() {

    const mockStats = {
        totalCategories: 248,
        activeTags: 156,
        totalItems: 3847,
        recentUpdates: 42
    };

    const mockCategories = [
        {
            id: 1,
            name: 'Cardiology Department',
            description: 'Heart and cardiovascular system related content',
            hasChildren: true,
            itemCount: 487,
            tags: [
                { name: 'Critical', color: '#DC2626' },
                { name: 'Medical', color: '#2563EB' },
                { name: 'Department', color: '#059669' }
            ]
        },
        {
            id: 2,
            name: 'Patient Records',
            description: 'Comprehensive patient medical history and documentation',
            hasChildren: true,
            itemCount: 1234,
            tags: [
                { name: 'Confidential', color: '#DC2626' },
                { name: 'HIPAA', color: '#D97706' }
            ]
        },
        {
            id: 3,
            name: 'Medical Equipment',
            description: 'Hospital equipment inventory and maintenance records',
            hasChildren: true,
            itemCount: 356,
            tags: [
                { name: 'Inventory', color: '#2563EB' },
                { name: 'Maintenance', color: '#D97706' },
                { name: 'Assets', color: '#059669' }
            ]
        },
        {
            id: 4,
            name: 'Emergency Protocols',
            description: 'Critical emergency response procedures and guidelines',
            hasChildren: false,
            itemCount: 89,
            tags: [
                { name: 'Critical', color: '#DC2626' },
                { name: 'Protocol', color: '#2563EB' }
            ]
        },
        {
            id: 5,
            name: 'Laboratory Services',
            description: 'Lab test results, procedures, and quality control',
            hasChildren: true,
            itemCount: 567,
            tags: [
                { name: 'Lab', color: '#2563EB' },
                { name: 'Testing', color: '#059669' },
                { name: 'Quality', color: '#D97706' }
            ]
        }
    ];

    const mockActivities = [
        {
            id: 1,
            type: 'create',
            user: 'Dr. Sarah Johnson',
            action: 'created category',
            target: 'Pediatric Cardiology',
            timestamp: '2025-12-07T11:45:00Z'
        },
        {
            id: 2,
            type: 'edit',
            user: 'Admin Mike Chen',
            action: 'updated',
            target: 'Patient Records structure',
            timestamp: '2025-12-07T11:30:00Z'
        },
        {
            id: 3,
            type: 'tag',
            user: 'Dr. Emily Rodriguez',
            action: 'added tags to',
            target: 'Emergency Protocols',
            timestamp: '2025-12-07T11:15:00Z'
        },
        {
            id: 4,
            type: 'move',
            user: 'Content Manager Lisa Park',
            action: 'moved',
            target: 'Lab Equipment to Medical Equipment',
            timestamp: '2025-12-07T10:50:00Z'
        },
        {
            id: 5,
            type: 'create',
            user: 'Dr. James Wilson',
            action: 'created category',
            target: 'Surgical Instruments',
            timestamp: '2025-12-07T10:30:00Z'
        },
        {
            id: 6,
            type: 'edit',
            user: 'Admin Mike Chen',
            action: 'updated description for',
            target: 'Cardiology Department',
            timestamp: '2025-12-07T10:15:00Z'
        },
        {
            id: 7,
            type: 'delete',
            user: 'System Administrator',
            action: 'archived',
            target: 'Deprecated Equipment Category',
            timestamp: '2025-12-07T09:45:00Z'
        },
        {
            id: 8,
            type: 'tag',
            user: 'Dr. Sarah Johnson',
            action: 'removed tags from',
            target: 'Old Patient Records',
            timestamp: '2025-12-07T09:20:00Z'
        }
    ];

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/category-management-dashboard' }
    ];

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Taxonomy Management Dashboard</h2>
                    <h2 className='text-xs text-muted-foreground'>Comprehensive overview of your healthcare content organization system</h2>
                </div>
            </div>
            <div className='h-full flex flex-grow w-full dark:bg-darkSecondaryBackground p-2 rounded-md '>
                <ScrollArea className='h-[85vh] w-full'>
                    <DashboardInteractive
                        initialStats={mockStats}
                        initialCategories={mockCategories}
                        initialActivities={mockActivities}
                    />
                </ScrollArea>
            </div>
        </div>
    )
}
