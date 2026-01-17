import PropTypes from 'prop-types';

import Icon from '@/components/ui/AppIcon';
import ActivityFeedItem from './ActivityFeedItem';

const RecentActivityFeed = ({ activities }) => {
    return (
        <div className="bg-surface rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors duration-150">
                    View All
                    <Icon name="ChevronRightIcon" size={16} variant="outline" />
                </button>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {activities?.length > 0 ? (
                    activities?.map((activity) => (
                        <ActivityFeedItem key={activity?.id} activity={activity} />
                    ))
                ) : (
                    <div className="text-center py-8">
                        <Icon name="InformationCircleIcon" size={48} variant="outline" className="text-text-secondary mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

RecentActivityFeed.propTypes = {
    activities: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            type: PropTypes?.string?.isRequired,
            user: PropTypes?.string?.isRequired,
            action: PropTypes?.string?.isRequired,
            target: PropTypes?.string?.isRequired,
            timestamp: PropTypes?.string?.isRequired
        })
    )?.isRequired
};

export default RecentActivityFeed;