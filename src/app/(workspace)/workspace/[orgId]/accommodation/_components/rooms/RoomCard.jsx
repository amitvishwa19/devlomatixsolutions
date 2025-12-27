
import { cn } from '@/lib/utils';
import { DoorOpen, BedDouble, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';



const roomTypeColors = {
    general: 'bg-muted text-muted-foreground',
    icu: 'bg-status-occupied/10 text-status-occupied',
    private: 'bg-status-reserved/10 text-status-reserved',
    'semi-private': 'bg-primary/10 text-primary',
    emergency: 'bg-status-maintenance/10 text-status-maintenance',
    pediatric: 'bg-accent/10 text-accent',
    maternity: 'bg-pink-100 text-pink-600',
};

export const RoomCard = ({ room, onViewBeds }) => {
    const occupiedBeds = room.beds.filter(b => b.status === 'occupied').length;
    const availableBeds = room.beds.filter(b => b.status === 'available').length;
    const occupancyPercent = room.capacity > 0 ? (occupiedBeds / room.capacity) * 100 : 0;

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-card transition-all duration-300 hover:shadow-lg animate-scale-in">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Room {room.number}</h3>
                        <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                    </div>
                </div>
                <Badge className={cn("capitalize", roomTypeColors[room.type])}>
                    {room.type.replace('-', ' ')}
                </Badge>
            </div>

            <div className="space-y-4 mb-5">
                <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium text-foreground">{room.department}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium text-foreground">{room.capacity} beds</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Occupancy:</span>
                    <span className="font-medium text-foreground">{occupiedBeds}/{room.capacity}</span>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Bed Status</span>
                        <span className="text-muted-foreground">{Math.round(occupancyPercent)}% occupied</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full gradient-primary transition-all duration-500"
                            style={{ width: `${occupancyPercent}%` }}
                        />
                    </div>
                </div>

                {/* Features */}
                {room.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {room.features.map((feature) => (
                            <span
                                key={feature}
                                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex gap-3">
                    <div className="text-center">
                        <p className="text-lg font-bold text-status-available">{availableBeds}</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-status-occupied">{occupiedBeds}</p>
                        <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewBeds(room)}
                >
                    View Beds
                </Button>
            </div>
        </div>
    );
};
