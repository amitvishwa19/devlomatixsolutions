import Icon from '@/components/ui/AppIcon';



export default function NotificationAlert({
    type,
    title,
    message,
    actionLabel,
    onActionClick,
}) {
    const getTypeConfig = () => {
        switch (type) {
            case 'info':
                return {
                    icon: 'InformationCircleIcon',
                    bgColor: 'bg-primary/10',
                    borderColor: 'border-primary/20',
                    textColor: 'text-primary',
                };
            case 'warning':
                return {
                    icon: 'ExclamationTriangleIcon',
                    bgColor: 'bg-warning/10',
                    borderColor: 'border-warning/20',
                    textColor: 'text-warning',
                };
            case 'error':
                return {
                    icon: 'XCircleIcon',
                    bgColor: 'bg-error/10',
                    borderColor: 'border-error/20',
                    textColor: 'text-error',
                };
            case 'success':
                return {
                    icon: 'CheckCircleIcon',
                    bgColor: 'bg-success/10',
                    borderColor: 'border-success/20',
                    textColor: 'text-success',
                };
            default:
                return {
                    icon: 'InformationCircleIcon',
                    bgColor: 'bg-muted',
                    borderColor: 'border-border',
                    textColor: 'text-muted-foreground',
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}
        >
            <div className="flex items-start space-x-3">
                <Icon
                    name={config.icon}
                    size={20}
                    className={`${config.textColor} flex-shrink-0 mt-0.5`}
                />
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${config.textColor} mb-1`}>
                        {title}
                    </h4>
                    <p className="text-sm text-foreground">{message}</p>
                    {actionLabel && onActionClick && (
                        <button
                            onClick={onActionClick}
                            className={`mt-2 text-sm font-medium ${config.textColor} hover:underline transition-smooth`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}