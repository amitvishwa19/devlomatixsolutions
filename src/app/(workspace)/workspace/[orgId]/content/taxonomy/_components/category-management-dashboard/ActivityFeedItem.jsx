import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ActivityFeedItem = ({ activity }) => {
    const getActivityIcon = (type) => {
        const icons = {
            create: 'PlusCircleIcon',
            edit: 'PencilSquareIcon',
            delete: 'TrashIcon',
            tag: 'TagIcon',
            move: 'ArrowsRightLeftIcon'
        };
        return icons?.[type] || 'InformationCircleIcon';
    };

    const getActivityColor = (type) => {
        const colors = {
            create: 'text-success',
            edit: 'text-primary',
            delete: 'text-error',
            tag: 'text-warning',
            move: 'text-secondary'
        };
        return colors?.[type] || 'text-text-secondary';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors duration-150">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-muted ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} variant="solid" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                    <span className="font-medium">{activity?.user}</span>
                    {' '}
                    <span className="text-text-secondary">{activity?.action}</span>
                    {' '}
                    <span className="font-medium">{activity?.target}</span>
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{formatTimestamp(activity?.timestamp)}</p>
            </div>
        </div>
    );
};

ActivityFeedItem.propTypes = {
    activity: PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        type: PropTypes?.oneOf(['create', 'edit', 'delete', 'tag', 'move'])?.isRequired,
        user: PropTypes?.string?.isRequired,
        action: PropTypes?.string?.isRequired,
        target: PropTypes?.string?.isRequired,
        timestamp: PropTypes?.string?.isRequired
    })?.isRequired
};

export default ActivityFeedItem;