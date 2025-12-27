
import { cn } from '@/lib/utils';



const statusConfig = {
    available: {
        label: 'Available',
        className: 'status-available',
    },
    occupied: {
        label: 'Occupied',
        className: 'status-occupied',
    },
    maintenance: {
        label: 'Maintenance',
        className: 'status-maintenance',
    },
    reserved: {
        label: 'Reserved',
        className: 'status-reserved',
    },
};

export const BedStatusBadge = ({ status, size = 'md' }) => {
    const config = statusConfig[status];

    return (
        <span className={cn(
            "inline-flex items-center rounded-full font-medium",
            config.className,
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        )}>
            <span className={cn(
                "rounded-full bg-current opacity-60 mr-1.5",
                size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
            )} />
            {config.label}
        </span>
    );
};
