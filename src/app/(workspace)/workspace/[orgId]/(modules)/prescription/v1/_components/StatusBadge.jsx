import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';


const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    },
    dispensed: {
        label: 'Dispensed',
        icon: CheckCircle2,
        className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
    },
};

export function StatusBadge({ status, className }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-medium gap-1.5 px-2.5 py-1',
                config.className,
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
}
