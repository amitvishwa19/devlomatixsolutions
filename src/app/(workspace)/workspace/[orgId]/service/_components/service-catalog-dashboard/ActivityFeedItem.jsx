'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ActivityFeedItem = ({ activity }) => {
    const [formattedTime, setFormattedTime] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'price_change':
                return { name: 'CurrencyDollarIcon', color: 'text-warning bg-warning/10' };
            case 'new_service':
                return { name: 'PlusCircleIcon', color: 'text-success bg-success/10' };
            case 'approval_request':
                return { name: 'ClockIcon', color: 'text-primary bg-primary/10' };
            case 'service_update':
                return { name: 'PencilSquareIcon', color: 'text-accent bg-accent/10' };
            default:
                return { name: 'InformationCircleIcon', color: 'text-muted-foreground bg-muted' };
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return date?.toLocaleDateString();
        }
    };

    useEffect(() => {
        setIsMounted(true);
        setFormattedTime(formatTimestamp(activity?.timestamp));

        // Update time every minute
        const interval = setInterval(() => {
            setFormattedTime(formatTimestamp(activity?.timestamp));
        }, 60000);

        return () => clearInterval(interval);
    }, [activity?.timestamp]);

    const iconConfig = getActivityIcon(activity?.type);

    return (
        <div className="flex gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors duration-200">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconConfig?.color}`}>
                <Icon name={iconConfig?.name} size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {isMounted ? formattedTime : '...'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{activity?.description}</p>
                {activity?.actionRequired && (
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200">
                            Review
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors duration-200">
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

ActivityFeedItem.propTypes = {
    activity: PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        type: PropTypes?.oneOf(['price_change', 'new_service', 'approval_request', 'service_update'])?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        timestamp: PropTypes?.string?.isRequired,
        actionRequired: PropTypes?.bool,
    })?.isRequired,
};

export default ActivityFeedItem;