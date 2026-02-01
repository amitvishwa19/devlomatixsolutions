import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, iconColor }) => {
    const getChangeColor = () => {
        if (changeType === 'positive') return 'text-success';
        if (changeType === 'negative') return 'text-error';
        return 'text-muted-foreground';
    };

    const getChangeIcon = () => {
        if (changeType === 'positive') return 'ArrowTrendingUpIcon';
        if (changeType === 'negative') return 'ArrowTrendingDownIcon';
        return 'MinusIcon';
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconColor}`}>
                    <Icon name={icon} size={24} variant="solid" />
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Icon name={getChangeIcon()} size={16} className={getChangeColor()} />
                <span className={`text-sm font-medium ${getChangeColor()}`}>{change}</span>
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
            </div>
        </div>
    );
};

MetricsCard.propTypes = {
    title: PropTypes?.string?.isRequired,
    value: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
    change: PropTypes?.string?.isRequired,
    changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral'])?.isRequired,
    icon: PropTypes?.string?.isRequired,
    iconColor: PropTypes?.string?.isRequired,
};

export default MetricsCard;