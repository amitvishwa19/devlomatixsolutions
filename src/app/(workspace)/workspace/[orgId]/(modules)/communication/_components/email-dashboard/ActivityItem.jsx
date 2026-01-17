import Icon from '@/components/ui/AppIcon';



export default function ActivityItem({
    type,
    title,
    description,
    timestamp,
    recipientCount,
}) {
    const getTypeConfig = () => {
        switch (type) {
            case 'sent':
                return {
                    icon: 'PaperAirplaneIcon',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10',
                };
            case 'delivered':
                return {
                    icon: 'CheckCircleIcon',
                    color: 'text-success',
                    bgColor: 'bg-success/10',
                };
            case 'pending':
                return {
                    icon: 'ClockIcon',
                    color: 'text-warning',
                    bgColor: 'bg-warning/10',
                };
            case 'failed':
                return {
                    icon: 'ExclamationCircleIcon',
                    color: 'text-error',
                    bgColor: 'bg-error/10',
                };
            default:
                return {
                    icon: 'InformationCircleIcon',
                    color: 'text-muted-foreground',
                    bgColor: 'bg-muted',
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-smooth">
            <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
                <Icon name={config.icon} size={20} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{title}</h4>
                    <span className="text-xs text-muted-foreground font-caption whitespace-nowrap ml-2">
                        {timestamp}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{description}</p>
                {recipientCount && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Icon name="UsersIcon" size={14} />
                        <span>{recipientCount} recipients</span>
                    </div>
                )}
            </div>
        </div>
    );
}