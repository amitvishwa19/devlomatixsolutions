import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2,
    Bed,
    User,
    MoreVertical,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const roomTypeLabels = {
    general: 'General Ward',
    icu: 'ICU',
    private: 'Private',
    'semi-private': 'Semi-Private',
    emergency: 'Emergency',
    maternity: 'Maternity',
    pediatric: 'Pediatric',
};

const roomTypeColors = {
    general: 'bg-secondary text-secondary-foreground',
    icu: 'bg-destructive/10 text-destructive',
    private: 'bg-primary/10 text-primary',
    'semi-private': 'bg-accent/20 text-accent-foreground',
    emergency: 'bg-warning/10 text-warning',
    maternity: 'bg-success/10 text-success',
    pediatric: 'bg-primary/10 text-primary',
};

const statusColors = {
    available: 'available',
    occupied: 'occupied',
    reserved: 'reserved',
    maintenance: 'maintenance',
};

export function RoomCard({ room, onView, onEdit, onDelete }) {
    const availableBeds = room.beds.filter(b => b.status === 'available').length;
    const occupiedBeds = room.beds.filter(b => b.status === 'occupied').length;
    const maintenanceBeds = room.beds.filter(b => b.status === 'maintenance').length;

    return (
        <div className="room-card">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-lg">Room {room.roomNumber}</h3>
                            <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(room)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(room)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Room
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(room)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Room
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roomTypeColors[room.roomType]}`}>
                        {roomTypeLabels[room.roomType]}
                    </span>
                </div>

                {room.doctor && (
                    <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-muted/50">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{room.doctor.name}</span>
                        <span className="text-xs text-muted-foreground">• {room.doctor.specialization}</span>
                    </div>
                )}

                <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {room.beds.length} / {room.capacity} Beds
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {availableBeds > 0 && (
                            <Badge variant={statusColors.available}>
                                {availableBeds} Available
                            </Badge>
                        )}
                        {occupiedBeds > 0 && (
                            <Badge variant={statusColors.occupied}>
                                {occupiedBeds} Occupied
                            </Badge>
                        )}
                        {maintenanceBeds > 0 && (
                            <Badge variant={statusColors.maintenance}>
                                {maintenanceBeds} Maintenance
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
