
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';



const statuses = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
];

const statusColors = {
    all: 'bg-muted text-foreground',
    available: 'bg-status-available text-white',
    occupied: 'bg-status-occupied text-white',
    reserved: 'bg-status-reserved text-white',
    maintenance: 'bg-status-maintenance text-white',
};

export const StatusFilter = ({ selectedStatus, onStatusChange }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
                <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(status.value)}
                    className={cn(
                        "border transition-all",
                        selectedStatus === status.value
                            ? statusColors[status.value]
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                >
                    {status.label}
                </Button>
            ))}
        </div>
    );
};
