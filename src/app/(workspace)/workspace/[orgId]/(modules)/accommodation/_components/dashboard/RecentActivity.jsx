
import { formatDistanceToNow } from 'date-fns';
import { BedDouble, UserPlus, UserMinus, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';



const getActivityIcon = (status) => {
    switch (status) {
        case 'occupied':
            return UserPlus;
        case 'available':
            return UserMinus;
        case 'maintenance':
            return Wrench;
        default:
            return BedDouble;
    }
};

const getActivityMessage = (bed) => {
    switch (bed.status) {
        case 'occupied':
            return `${bed.patient?.name || 'Patient'} admitted to Bed ${bed.number}`;
        case 'available':
            return `Bed ${bed.number} is now available`;
        case 'maintenance':
            return `Bed ${bed.number} under maintenance`;
        case 'reserved':
            return `Bed ${bed.number} has been reserved`;
        default:
            return `Bed ${bed.number} status updated`;
    }
};

const statusColors = {
    occupied: 'bg-status-occupied/10 text-status-occupied',
    available: 'bg-status-available/10 text-status-available',
    maintenance: 'bg-status-maintenance/10 text-status-maintenance',
    reserved: 'bg-status-reserved/10 text-status-reserved',
};

export const RecentActivity = ({ beds }) => {
    const recentBeds = [...beds]
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 6);

    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                    Live updates
                </span>
            </div>

            <div className="space-y-4">
                {recentBeds.map((bed, index) => {
                    const Icon = getActivityIcon(bed.status);
                    return (
                        <div
                            key={bed.id}
                            className="flex items-start gap-4 animate-slide-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={cn(
                                "p-2 rounded-lg shrink-0",
                                statusColors[bed.status]
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {getActivityMessage(bed)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Room {bed.roomNumber} • {formatDistanceToNow(new Date(bed.lastUpdated), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
