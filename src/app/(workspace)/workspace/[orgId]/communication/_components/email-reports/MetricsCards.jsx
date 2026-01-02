import Icon from '@/components/ui/AppIcon';



const MetricsCards = ({ metrics }) => {
    const getChangeColor = (type) => {
        switch (type) {
            case 'increase':
                return 'text-success';
            case 'decrease':
                return 'text-error';
            default:
                return 'text-muted-foreground';
        }
    };

    const getChangeIcon = (type) => {
        switch (type) {
            case 'increase':
                return 'ArrowTrendingUpIcon';
            case 'decrease':
                return 'ArrowTrendingDownIcon';
            default:
                return 'MinusIcon';
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
                <div
                    key={metric.id}
                    className="bg-card rounded-lg shadow-elevation-md p-6 hover:shadow-elevation-lg transition-smooth"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                {metric.title}
                            </p>
                            <p className="text-3xl font-semibold text-foreground mb-2">
                                {metric.value}
                            </p>
                            <div className="flex items-center space-x-1">
                                <Icon
                                    name={getChangeIcon(metric.changeType)}
                                    size={16}
                                    className={getChangeColor(metric.changeType)}
                                />
                                <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                                    {metric.change}
                                </span>
                                <span className="text-sm text-muted-foreground">vs last period</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${metric.color}`}>
                            <Icon name={metric.icon} size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetricsCards;