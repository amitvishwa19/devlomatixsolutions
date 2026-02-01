import PropTypes from 'prop-types';
import ActivityFeedItem from './ActivityFeedItem';

const ActivityFeed = ({ activities }) => {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {activities?.length > 0 ? (
                    activities?.map((activity) => (
                        <ActivityFeedItem key={activity?.id} activity={activity} />
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

ActivityFeed.propTypes = {
    activities: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            type: PropTypes?.string?.isRequired,
            title: PropTypes?.string?.isRequired,
            description: PropTypes?.string?.isRequired,
            timestamp: PropTypes?.string?.isRequired,
            actionRequired: PropTypes?.bool,
        })
    )?.isRequired,
};

export default ActivityFeed;