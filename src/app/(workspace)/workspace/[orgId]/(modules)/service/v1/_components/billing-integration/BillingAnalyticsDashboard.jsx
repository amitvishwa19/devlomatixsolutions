import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const BillingAnalyticsDashboard = ({ analytics }) => {
    const getMetricIcon = (type) => {
        switch (type) {
            case 'revenue': return { name: 'CurrencyDollarIcon', color: 'text-success', bg: 'bg-success/10' };
            case 'pending': return { name: 'ClockIcon', color: 'text-warning', bg: 'bg-warning/10' };
            case 'insurance': return { name: 'ShieldCheckIcon', color: 'text-primary', bg: 'bg-primary/10' };
            case 'outstanding': return { name: 'ExclamationTriangleIcon', color: 'text-error', bg: 'bg-error/10' };
            default: return { name: 'ChartBarIcon', color: 'text-muted-foreground', bg: 'bg-muted' };
        }
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return { name: 'ArrowTrendingUpIcon', color: 'text-success' };
        if (trend < 0) return { name: 'ArrowTrendingDownIcon', color: 'text-error' };
        return { name: 'MinusIcon', color: 'text-muted-foreground' };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics?.map((metric) => {
                const iconConfig = getMetricIcon(metric?.type);
                const trendIcon = getTrendIcon(metric?.trend);

                return (
                    <div key={metric?.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-card transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${iconConfig?.bg}`}>
                                <Icon name={iconConfig?.name} size={24} className={iconConfig?.color} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Icon name={trendIcon?.name} size={16} className={trendIcon?.color} />
                                <span className={`text-xs font-medium ${trendIcon?.color}`}>
                                    {Math.abs(metric?.trend)}%
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-muted-foreground">{metric?.label}</h3>
                            <p className="text-2xl font-bold text-foreground">
                                {metric?.prefix}{metric?.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">{metric?.subtitle}</p>
                        </div>
                        {metric?.progress && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progress</span>
                                    <span>{metric?.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${iconConfig?.bg?.replace('/10', '')} transition-all duration-300`}
                                        style={{ width: `${metric?.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

BillingAnalyticsDashboard.propTypes = {
    analytics: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        type: PropTypes?.string?.isRequired,
        label: PropTypes?.string?.isRequired,
        value: PropTypes?.number?.isRequired,
        prefix: PropTypes?.string,
        subtitle: PropTypes?.string?.isRequired,
        trend: PropTypes?.number?.isRequired,
        progress: PropTypes?.number
    }))?.isRequired
};

export default BillingAnalyticsDashboard;