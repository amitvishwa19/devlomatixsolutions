import { cn } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle2, Pause, AlertTriangle } from 'lucide-react';


const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-warning/10 text-warning border-warning/20',
    },
    'in-progress': {
        label: 'In Progress',
        icon: AlertCircle,
        className: 'bg-info/10 text-info border-info/20',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        className: 'bg-success/10 text-success border-success/20',
    },
    'on-hold': {
        label: 'On Hold',
        icon: Pause,
        className: 'bg-muted text-muted-foreground border-border',
    },
    critical: {
        label: 'Critical',
        icon: AlertTriangle,
        className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
};

export function StatusBadge({ status, className }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                config.className,
                className
            )}
        >
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}
