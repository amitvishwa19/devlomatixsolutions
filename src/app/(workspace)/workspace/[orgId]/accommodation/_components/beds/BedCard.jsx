
import { BedStatusBadge } from './BedStatusBadge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';



export const BedCard = ({ bed, onAssign, onDischarge }) => {
    const isOccupied = bed.status === 'occupied';
    const isAvailable = bed.status === 'available';

    return (
        <div className={cn(
            "bg-card rounded-2xl border border-border p-5 shadow-card transition-all duration-300 hover:shadow-lg animate-scale-in",
            isOccupied && "border-l-4 border-l-status-occupied",
            isAvailable && "border-l-4 border-l-status-available"
        )}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Bed {bed.number}</h3>
                    <p className="text-sm text-muted-foreground">Room {bed.roomNumber}</p>
                </div>
                <BedStatusBadge status={bed.status} />
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium text-foreground">{bed.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Room Type:</span>
                    <span className="font-medium text-foreground capitalize">{bed.roomType.replace('-', ' ')}</span>
                </div>
                {isOccupied && bed.patient && (
                    <>
                        <div className="border-t border-border pt-3 mt-3">
                            <p className="text-sm font-medium text-foreground">{bed.patient.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {bed.patient.age} yrs, {bed.patient.gender}
                            </p>
                            {bed.patient.diagnosis && (
                                <p className="text-xs text-primary mt-1">{bed.patient.diagnosis}</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDistanceToNow(new Date(bed.lastUpdated), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                    {isAvailable && (
                        <Button
                            size="sm"
                            onClick={() => onAssign(bed)}
                            className="gradient-primary text-primary-foreground hover:opacity-90"
                        >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                        </Button>
                    )}
                    {isOccupied && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDischarge(bed.id)}
                            className="border-status-occupied/30 text-status-occupied hover:bg-status-occupied/10"
                        >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Discharge
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
