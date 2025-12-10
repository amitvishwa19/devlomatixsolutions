import React from 'react'
import TagManagementInteractive from './TagManagementInteractive';

export default function TagsComponent() {
    const mockTags = [
        {
            id: 1,
            name: 'Urgent',
            color: '#DC2626',
            description: 'High priority medical cases requiring immediate attention',
            usageCount: 87,
            categories: ['Emergency Medicine', 'Surgery', 'Cardiology'],
            createdAt: 'Jan 15, 2025'
        },
        {
            id: 2,
            name: 'Routine Checkup',
            color: '#059669',
            description: 'Standard patient examination and health monitoring',
            usageCount: 156,
            categories: ['Internal Medicine', 'Pediatrics'],
            createdAt: 'Jan 10, 2025'
        },
        {
            id: 3,
            name: 'Follow-up Required',
            color: '#D97706',
            description: 'Cases requiring subsequent appointments or monitoring',
            usageCount: 64,
            categories: ['Cardiology', 'Orthopedics', 'Neurology'],
            createdAt: 'Jan 8, 2025'
        },
        {
            id: 4,
            name: 'Lab Results Pending',
            color: '#7C3AED',
            description: 'Awaiting laboratory test results for diagnosis',
            usageCount: 42,
            categories: ['Radiology', 'Internal Medicine'],
            createdAt: 'Jan 5, 2025'
        },
        {
            id: 5,
            name: 'Consultation',
            color: '#2563EB',
            description: 'Initial patient consultation and assessment',
            usageCount: 93,
            categories: ['Internal Medicine', 'Neurology', 'Pediatrics'],
            createdAt: 'Dec 28, 2024'
        },
        {
            id: 6,
            name: 'Surgical Procedure',
            color: '#DB2777',
            description: 'Scheduled or completed surgical interventions',
            usageCount: 38,
            categories: ['Surgery', 'Orthopedics'],
            createdAt: 'Dec 20, 2024'
        },
        {
            id: 7,
            name: 'Medication Review',
            color: '#0891B2',
            description: 'Review and adjustment of patient medication plans',
            usageCount: 71,
            categories: ['Internal Medicine', 'Cardiology'],
            createdAt: 'Dec 15, 2024'
        },
        {
            id: 8,
            name: 'Imaging Required',
            color: '#65A30D',
            description: 'Cases requiring diagnostic imaging procedures',
            usageCount: 55,
            categories: ['Radiology', 'Orthopedics', 'Neurology'],
            createdAt: 'Dec 10, 2024'
        },
        {
            id: 9,
            name: 'Chronic Condition',
            color: '#DC2626',
            description: 'Long-term health conditions requiring ongoing management',
            usageCount: 128,
            categories: ['Internal Medicine', 'Cardiology'],
            createdAt: 'Dec 5, 2024'
        },
        {
            id: 10,
            name: 'Preventive Care',
            color: '#059669',
            description: 'Preventive health measures and screenings',
            usageCount: 102,
            categories: ['Internal Medicine', 'Pediatrics'],
            createdAt: 'Nov 28, 2024'
        },
        {
            id: 11,
            name: 'Specialist Referral',
            color: '#7C3AED',
            description: 'Referral to specialized medical departments',
            usageCount: 47,
            categories: ['Internal Medicine', 'Neurology', 'Cardiology'],
            createdAt: 'Nov 20, 2024'
        },
        {
            id: 12,
            name: 'Post-Operative',
            color: '#D97706',
            description: 'Post-surgical recovery and monitoring',
            usageCount: 33,
            categories: ['Surgery', 'Orthopedics'],
            createdAt: 'Nov 15, 2024'
        },
        {
            id: 13,
            name: 'Diagnostic Testing',
            color: '#2563EB',
            description: 'Comprehensive diagnostic test procedures',
            usageCount: 59,
            categories: ['Radiology', 'Internal Medicine'],
            createdAt: 'Nov 10, 2024'
        },
        {
            id: 14,
            name: 'Rehabilitation',
            color: '#0891B2',
            description: 'Physical therapy and rehabilitation programs',
            usageCount: 41,
            categories: ['Orthopedics', 'Neurology'],
            createdAt: 'Nov 5, 2024'
        },
        {
            id: 15,
            name: 'Wellness Program',
            color: '#65A30D',
            description: 'Health and wellness initiatives',
            usageCount: 0,
            categories: ['Internal Medicine'],
            createdAt: 'Oct 28, 2024'
        }
    ];

    const mockAnalytics = {
        totalTags: mockTags?.length,
        activeTags: mockTags?.filter(tag => tag?.usageCount > 0)?.length,
        unusedTags: mockTags?.filter(tag => tag?.usageCount === 0)?.length,
        totalUsage: mockTags?.reduce((sum, tag) => sum + tag?.usageCount, 0)
    };
    return (
        <div>
            <TagManagementInteractive
                initialTags={mockTags}
                initialAnalytics={mockAnalytics}
            />
        </div>
    )
}
