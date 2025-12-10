import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import CategoryTreeInteractive from './CategoryTreeInteractive';


export function CatogeriesTree() {

    const mockCategories = [
        {
            id: 'cat1',
            name: 'Cardiology',
            description: 'Heart and cardiovascular system related medical content and procedures',
            subcategoryCount: 3,
            contentCount: 145,
            viewCount: 2847,
            usageScore: 92,
            isArchived: false,
            path: '/Cardiology',
            createdBy: 'Dr. Sarah Johnson',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-12-05T14:22:00Z',
            tags: [
                { id: 'tag1', name: 'Cardiology', color: '#EF4444' },
                { id: 'tag4', name: 'Emergency', color: '#F59E0B' }
            ],
            permissions: [
                { role: 'Administrator', access: 'Full Access' },
                { role: 'Medical Staff', access: 'Read & Write' },
                { role: 'Viewer', access: 'Read Only' }
            ],
            children: [
                {
                    id: 'cat1-1',
                    name: 'Interventional Cardiology',
                    description: 'Catheter-based treatment of structural heart diseases',
                    subcategoryCount: 2,
                    contentCount: 67,
                    viewCount: 1234,
                    usageScore: 88,
                    isArchived: false,
                    path: '/Cardiology/Interventional Cardiology',
                    createdBy: 'Dr. Michael Chen',
                    createdAt: '2024-02-10T09:15:00Z',
                    updatedAt: '2024-12-03T11:45:00Z',
                    tags: [
                        { id: 'tag1', name: 'Cardiology', color: '#EF4444' },
                        { id: 'tag5', name: 'Surgery', color: '#8B5CF6' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: [
                        {
                            id: 'cat1-1-1',
                            name: 'Coronary Angioplasty',
                            description: 'Procedures to open blocked coronary arteries',
                            subcategoryCount: 0,
                            contentCount: 34,
                            viewCount: 678,
                            usageScore: 85,
                            isArchived: false,
                            path: '/Cardiology/Interventional Cardiology/Coronary Angioplasty',
                            createdBy: 'Dr. Emily Rodriguez',
                            createdAt: '2024-03-05T14:20:00Z',
                            updatedAt: '2024-12-01T16:30:00Z',
                            tags: [
                                { id: 'tag1', name: 'Cardiology', color: '#EF4444' },
                                { id: 'tag5', name: 'Surgery', color: '#8B5CF6' }
                            ],
                            permissions: [
                                { role: 'Administrator', access: 'Full Access' },
                                { role: 'Medical Staff', access: 'Read & Write' }
                            ],
                            children: []
                        },
                        {
                            id: 'cat1-1-2',
                            name: 'Cardiac Catheterization',
                            description: 'Diagnostic and therapeutic heart procedures',
                            subcategoryCount: 0,
                            contentCount: 33,
                            viewCount: 556,
                            usageScore: 82,
                            isArchived: false,
                            path: '/Cardiology/Interventional Cardiology/Cardiac Catheterization',
                            createdBy: 'Dr. Michael Chen',
                            createdAt: '2024-03-12T10:45:00Z',
                            updatedAt: '2024-11-28T09:15:00Z',
                            tags: [
                                { id: 'tag1', name: 'Cardiology', color: '#EF4444' }
                            ],
                            permissions: [
                                { role: 'Administrator', access: 'Full Access' },
                                { role: 'Medical Staff', access: 'Read & Write' }
                            ],
                            children: []
                        }
                    ]
                },
                {
                    id: 'cat1-2',
                    name: 'Electrophysiology',
                    description: 'Study and treatment of cardiac electrical activity',
                    subcategoryCount: 0,
                    contentCount: 45,
                    viewCount: 892,
                    usageScore: 79,
                    isArchived: false,
                    path: '/Cardiology/Electrophysiology',
                    createdBy: 'Dr. James Wilson',
                    createdAt: '2024-02-20T13:30:00Z',
                    updatedAt: '2024-12-04T15:20:00Z',
                    tags: [
                        { id: 'tag1', name: 'Cardiology', color: '#EF4444' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                },
                {
                    id: 'cat1-3',
                    name: 'Heart Failure',
                    description: 'Management of chronic and acute heart failure conditions',
                    subcategoryCount: 0,
                    contentCount: 33,
                    viewCount: 721,
                    usageScore: 76,
                    isArchived: false,
                    path: '/Cardiology/Heart Failure',
                    createdBy: 'Dr. Sarah Johnson',
                    createdAt: '2024-03-01T11:00:00Z',
                    updatedAt: '2024-12-02T10:30:00Z',
                    tags: [
                        { id: 'tag1', name: 'Cardiology', color: '#EF4444' },
                        { id: 'tag4', name: 'Emergency', color: '#F59E0B' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                }
            ]
        },
        {
            id: 'cat2',
            name: 'Neurology',
            description: 'Brain, spinal cord, and nervous system disorders and treatments',
            subcategoryCount: 2,
            contentCount: 98,
            viewCount: 1956,
            usageScore: 87,
            isArchived: false,
            path: '/Neurology',
            createdBy: 'Dr. Robert Martinez',
            createdAt: '2024-01-20T08:45:00Z',
            updatedAt: '2024-12-06T13:15:00Z',
            tags: [
                { id: 'tag2', name: 'Neurology', color: '#3B82F6' }
            ],
            permissions: [
                { role: 'Administrator', access: 'Full Access' },
                { role: 'Medical Staff', access: 'Read & Write' },
                { role: 'Viewer', access: 'Read Only' }
            ],
            children: [
                {
                    id: 'cat2-1',
                    name: 'Stroke Management',
                    description: 'Acute and chronic stroke care protocols',
                    subcategoryCount: 0,
                    contentCount: 52,
                    viewCount: 1045,
                    usageScore: 91,
                    isArchived: false,
                    path: '/Neurology/Stroke Management',
                    createdBy: 'Dr. Lisa Anderson',
                    createdAt: '2024-02-15T12:20:00Z',
                    updatedAt: '2024-12-05T16:40:00Z',
                    tags: [
                        { id: 'tag2', name: 'Neurology', color: '#3B82F6' },
                        { id: 'tag4', name: 'Emergency', color: '#F59E0B' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                },
                {
                    id: 'cat2-2',
                    name: 'Epilepsy',
                    description: 'Seizure disorders diagnosis and treatment',
                    subcategoryCount: 0,
                    contentCount: 46,
                    viewCount: 911,
                    usageScore: 83,
                    isArchived: false,
                    path: '/Neurology/Epilepsy',
                    createdBy: 'Dr. Robert Martinez',
                    createdAt: '2024-02-25T09:30:00Z',
                    updatedAt: '2024-12-03T14:25:00Z',
                    tags: [
                        { id: 'tag2', name: 'Neurology', color: '#3B82F6' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                }
            ]
        },
        {
            id: 'cat3',
            name: 'Pediatrics',
            description: 'Medical care for infants, children, and adolescents',
            subcategoryCount: 2,
            contentCount: 127,
            viewCount: 2134,
            usageScore: 89,
            isArchived: false,
            path: '/Pediatrics',
            createdBy: 'Dr. Jennifer Lee',
            createdAt: '2024-01-25T10:15:00Z',
            updatedAt: '2024-12-07T11:50:00Z',
            tags: [
                { id: 'tag3', name: 'Pediatrics', color: '#10B981' }
            ],
            permissions: [
                { role: 'Administrator', access: 'Full Access' },
                { role: 'Medical Staff', access: 'Read & Write' },
                { role: 'Viewer', access: 'Read Only' }
            ],
            children: [
                {
                    id: 'cat3-1',
                    name: 'Neonatology',
                    description: 'Newborn and premature infant care',
                    subcategoryCount: 0,
                    contentCount: 68,
                    viewCount: 1234,
                    usageScore: 94,
                    isArchived: false,
                    path: '/Pediatrics/Neonatology',
                    createdBy: 'Dr. Amanda White',
                    createdAt: '2024-02-18T14:00:00Z',
                    updatedAt: '2024-12-06T10:20:00Z',
                    tags: [
                        { id: 'tag3', name: 'Pediatrics', color: '#10B981' },
                        { id: 'tag4', name: 'Emergency', color: '#F59E0B' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                },
                {
                    id: 'cat3-2',
                    name: 'Pediatric Emergency',
                    description: 'Emergency care protocols for children',
                    subcategoryCount: 0,
                    contentCount: 59,
                    viewCount: 900,
                    usageScore: 86,
                    isArchived: false,
                    path: '/Pediatrics/Pediatric Emergency',
                    createdBy: 'Dr. Jennifer Lee',
                    createdAt: '2024-03-08T11:45:00Z',
                    updatedAt: '2024-12-04T13:35:00Z',
                    tags: [
                        { id: 'tag3', name: 'Pediatrics', color: '#10B981' },
                        { id: 'tag4', name: 'Emergency', color: '#F59E0B' }
                    ],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' },
                        { role: 'Medical Staff', access: 'Read & Write' }
                    ],
                    children: []
                }
            ]
        },
        {
            id: 'cat4',
            name: 'Radiology',
            description: 'Medical imaging and diagnostic procedures',
            subcategoryCount: 0,
            contentCount: 84,
            viewCount: 1567,
            usageScore: 81,
            isArchived: false,
            path: '/Radiology',
            createdBy: 'Dr. David Kim',
            createdAt: '2024-02-05T09:00:00Z',
            updatedAt: '2024-12-05T15:10:00Z',
            tags: [
                { id: 'tag6', name: 'Radiology', color: '#EC4899' }
            ],
            permissions: [
                { role: 'Administrator', access: 'Full Access' },
                { role: 'Medical Staff', access: 'Read & Write' },
                { role: 'Viewer', access: 'Read Only' }
            ],
            children: []
        },
        {
            id: 'cat5',
            name: 'Archived Categories',
            description: 'Previously active categories that have been archived',
            subcategoryCount: 1,
            contentCount: 23,
            viewCount: 145,
            usageScore: 12,
            isArchived: true,
            path: '/Archived Categories',
            createdBy: 'System',
            createdAt: '2024-01-10T08:00:00Z',
            updatedAt: '2024-11-15T10:00:00Z',
            tags: [],
            permissions: [
                { role: 'Administrator', access: 'Full Access' }
            ],
            children: [
                {
                    id: 'cat5-1',
                    name: 'Legacy Procedures',
                    description: 'Outdated medical procedures no longer in use',
                    subcategoryCount: 0,
                    contentCount: 23,
                    viewCount: 145,
                    usageScore: 12,
                    isArchived: true,
                    path: '/Archived Categories/Legacy Procedures',
                    createdBy: 'System',
                    createdAt: '2024-01-10T08:30:00Z',
                    updatedAt: '2024-11-15T10:30:00Z',
                    tags: [],
                    permissions: [
                        { role: 'Administrator', access: 'Full Access' }
                    ],
                    children: []
                }
            ]
        }
    ];

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='h-full flex flex-grow w-full dark:bg-darkSecondaryBackground  rounded-md '>
                <CategoryTreeInteractive initialCategories={mockCategories} />
            </div>
        </div>
    )
}
