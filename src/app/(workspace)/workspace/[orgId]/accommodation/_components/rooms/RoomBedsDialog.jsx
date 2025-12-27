
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BedStatusBadge } from '../beds/BedStatusBadge';



export const RoomBedsDialog = ({
    room,
    open,
    onOpenChange,
    onAssign,
    onDischarge,
}) => {
    if (!room) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Room {room.number} - Beds</DialogTitle>
                    <DialogDescription>
                        {room.department} • {room.type.replace('-', ' ')} • Floor {room.floor}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 mt-4">
                    {room.beds.map((bed) => (
                        <div
                            key={bed.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30",
                                bed.status === 'occupied' && "border-l-4 border-l-status-occupied",
                                bed.status === 'available' && "border-l-4 border-l-status-available"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-medium text-foreground">Bed {bed.number}</p>
                                    {bed.status === 'occupied' && bed.patient && (
                                        <div className="mt-1">
                                            <p className="text-sm text-foreground">{bed.patient.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {bed.patient.age} yrs • {bed.patient.diagnosis || 'No diagnosis'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <BedStatusBadge status={bed.status} size="sm" />
                                {bed.status === 'available' && (
                                    <Button
                                        size="sm"
                                        onClick={() => onAssign(bed)}
                                        className="gradient-primary text-primary-foreground"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                )}
                                {bed.status === 'occupied' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onDischarge(bed.id)}
                                        className="border-orange-500/30 text-status-occupied hover:bg-orange-500/10"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
