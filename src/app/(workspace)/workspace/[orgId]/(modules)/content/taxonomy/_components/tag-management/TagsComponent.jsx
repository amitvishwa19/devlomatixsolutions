import React from 'react'
import TagManagementInteractive from './TagManagementInteractive';
import { useTaxonomy } from '../../_provider/taxanomyProvider';

export default function TagsComponent() {
    const { tags } = useTaxonomy()

    console.log('@tags', tags)

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
