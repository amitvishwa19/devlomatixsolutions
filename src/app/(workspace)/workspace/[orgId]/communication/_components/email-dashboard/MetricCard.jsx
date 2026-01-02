

import Icon from '@/components/ui/AppIcon';

export default function MetricCard({
    label,
    value,
    trend,
    iconName,
    iconColor,
}) {
    return (
        <div className="bg-card rounded-lg p-6 shadow-elevation-sm">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${iconColor}`}>
                    <Icon name={iconName} size={24} className="text-white" />
                </div>
                {trend && (
                    <div
                        className={`flex items-center space-x-1 text-sm font-medium ${trend.direction === 'up' ? 'text-success' : 'text-error'
                            }`}
                    >
                        <Icon
                            name={
                                trend.direction === 'up' ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'
                            }
                            size={16}
                        />
                        <span>{trend.percentage}%</span>
                    </div>
                )}
            </div>
            <p className="text-3xl font-semibold text-foreground mb-1">{value}</p>
            <p className="text-sm text-muted-foreground font-caption">{label}</p>
        </div>
    );
}