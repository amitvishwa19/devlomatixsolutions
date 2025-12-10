import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const StatsCard = ({ title, value, subtitle, icon, trend, trendValue, bgColor }) => {
    const isPositiveTrend = trend === 'up';

    return (
        <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-border transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Icon name={icon} size={24} variant="outline" className="text-primary" />
                </div>
            </div>

            {subtitle && (
                <p className="text-sm text-text-secondary mb-2">{subtitle}</p>
            )}

            {trend && trendValue && (
                <div className="flex items-center gap-1">
                    <Icon
                        name={isPositiveTrend ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
                        size={16}
                        variant="solid"
                        className={isPositiveTrend ? 'text-success' : 'text-error'}
                    />
                    <span className={`text-sm font-medium ${isPositiveTrend ? 'text-success' : 'text-error'}`}>
                        {trendValue}
                    </span>
                    <span className="text-sm text-text-secondary ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
};

StatsCard.propTypes = {
    title: PropTypes?.string?.isRequired,
    value: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
    subtitle: PropTypes?.string,
    icon: PropTypes?.string?.isRequired,
    trend: PropTypes?.oneOf(['up', 'down']),
    trendValue: PropTypes?.string,
    bgColor: PropTypes?.string
};

StatsCard.defaultProps = {
    bgColor: 'bg-surface'
};

export default StatsCard;