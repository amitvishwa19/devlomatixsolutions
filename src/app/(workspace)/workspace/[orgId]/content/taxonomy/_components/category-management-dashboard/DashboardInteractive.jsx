'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatsCard from './StatsCard';
import QuickActionButton from './QuickActionButton';
import CategoryTreePreview from './CategoryTreePreview';
import RecentActivityFeed from './RecentActivityFeed';

import SearchSuggestions from '../SearchSuggestions';

const DashboardInteractive = ({ initialStats, initialCategories, initialActivities }) => {
    const { orgId } = useParams()
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const statsData = [
        {
            title: 'Total Categories',
            value: initialStats?.totalCategories,
            subtitle: 'Active categories',
            icon: 'FolderIcon',
            trend: 'up',
            trendValue: '+12%',
            bgColor: 'bg-surface'
        },
        {
            title: 'Active Tags',
            value: initialStats?.activeTags,
            subtitle: 'In use',
            icon: 'TagIcon',
            trend: 'up',
            trendValue: '+8%',
            bgColor: 'bg-surface'
        },
        {
            title: 'Total Items',
            value: initialStats?.totalItems,
            subtitle: 'Categorized items',
            icon: 'DocumentTextIcon',
            trend: 'up',
            trendValue: '+24%',
            bgColor: 'bg-surface'
        },
        {
            title: 'Recent Updates',
            value: initialStats?.recentUpdates,
            subtitle: 'Last 24 hours',
            icon: 'ClockIcon',
            bgColor: 'bg-surface'
        }
    ];

    const quickActions = [
        {
            label: 'Category',
            icon: 'PlusCircleIcon',
            variant: 'primary',
            action: () => {
                router?.push(`/workspace/${orgId}/content/taxonomy/category`)
            }
        },
        {
            label: 'Import Structure',
            icon: 'ArrowUpTrayIcon',
            variant: 'outline',
            action: () => {
                info('Import functionality coming soon');
            }
        },
        {
            label: 'Bulk Operations',
            icon: 'QueueListIcon',
            variant: 'outline',
            action: () => {
                info('Bulk operations panel opening...');
            }
        },
        {
            label: 'Export Data',
            icon: 'ArrowDownTrayIcon',
            variant: 'outline',
            action: () => {
                success('Preparing export...');
            }
        }
    ];

    const searchSuggestions = [
        { label: 'Cardiology Department', icon: 'FolderIcon', description: 'Main category' },
        { label: 'Patient Records', icon: 'DocumentTextIcon', description: '1,234 items' },
        { label: 'Medical Equipment', icon: 'WrenchScrewdriverIcon', description: 'Inventory category' },
        { label: 'Emergency Protocols', icon: 'ExclamationTriangleIcon', description: 'Critical procedures' },
        { label: 'Lab Results', icon: 'BeakerIcon', description: '567 items' }
    ];

    const handleSearchSelect = (suggestion) => {
        setSearchQuery(suggestion?.label);
        success(`Navigating to: ${suggestion?.label}`);
        setTimeout(() => router?.push('/advanced-search-and-filtering'), 500);
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Search Bar */}

            <SearchSuggestions
                query={searchQuery}
                suggestions={searchSuggestions}
                onSelect={handleSearchSelect}
                placeholder="Search categories, tags, or items..."
                className="w-full"
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData?.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>


            {/* Main Content Grid */}
            <div className="">
                {/* Category Tree Preview - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <CategoryTreePreview categories={initialCategories} />
                </div>


            </div>
        </div>
    );
};

export default DashboardInteractive;