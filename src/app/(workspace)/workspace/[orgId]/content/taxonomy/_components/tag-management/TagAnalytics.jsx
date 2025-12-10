'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TagAnalytics = ({ analytics }) => {
    const stats = [
        {
            label: 'Total Tags',
            value: analytics?.totalTags,
            icon: 'TagIcon',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            label: 'Active Tags',
            value: analytics?.activeTags,
            icon: 'CheckCircleIcon',
            color: 'text-success',
            bgColor: 'bg-success/10'
        },
        {
            label: 'Unused Tags',
            value: analytics?.unusedTags,
            icon: 'ExclamationTriangleIcon',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
        },
        {
            label: 'Total Usage',
            value: analytics?.totalUsage,
            icon: 'ChartBarIcon',
            color: 'text-accent',
            bgColor: 'bg-accent/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats?.map((stat, index) => (
                <div
                    key={index}
                    className="bg-surface border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`flex items-center justify-center w-10 h-10 ${stat?.bgColor} rounded-lg`}>
                            <Icon name={stat?.icon} size={20} variant="outline" className={stat?.color} />
                        </div>
                        <span className={`text-2xl font-bold ${stat?.color}`}>
                            {stat?.value?.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-secondary">{stat?.label}</p>
                </div>
            ))}
        </div>
    );
};

TagAnalytics.propTypes = {
    analytics: PropTypes?.shape({
        totalTags: PropTypes?.number?.isRequired,
        activeTags: PropTypes?.number?.isRequired,
        unusedTags: PropTypes?.number?.isRequired,
        totalUsage: PropTypes?.number?.isRequired
    })?.isRequired
};

export default TagAnalytics;