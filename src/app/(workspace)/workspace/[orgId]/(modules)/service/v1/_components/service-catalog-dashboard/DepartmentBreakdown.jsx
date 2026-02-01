import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const DepartmentBreakdown = ({ departments }) => {
    const getTrendIcon = (trend) => {
        if (trend > 0) return { name: 'ArrowTrendingUpIcon', color: 'text-success' };
        if (trend < 0) return { name: 'ArrowTrendingDownIcon', color: 'text-error' };
        return { name: 'MinusIcon', color: 'text-muted-foreground' };
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Department Breakdown</h2>
            <div className="space-y-4">
                {departments?.map((dept) => {
                    const trendIcon = getTrendIcon(dept?.trend);
                    return (
                        <div key={dept?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name={dept?.icon} size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{dept?.name}</p>
                                    <p className="text-xs text-muted-foreground">{dept?.serviceCount} services</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">${dept?.revenue?.toLocaleString()}</p>
                                <div className="flex items-center gap-1 justify-end">
                                    <Icon name={trendIcon?.name} size={14} className={trendIcon?.color} />
                                    <span className={`text-xs font-medium ${trendIcon?.color}`}>
                                        {Math.abs(dept?.trend)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

DepartmentBreakdown.propTypes = {
    departments: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            icon: PropTypes?.string?.isRequired,
            serviceCount: PropTypes?.number?.isRequired,
            revenue: PropTypes?.number?.isRequired,
            trend: PropTypes?.number?.isRequired,
        })
    )?.isRequired,
};

export default DepartmentBreakdown;